import { Service, Inject, Container } from "typedi";
import supportedTokens from "../constants/supportedTokens";
import { InfuraProvider } from "@ethersproject/providers"
import { Fetcher, Token, Pair } from '@acyswap/sdk';
import cache from "memory-cache";
import { PAIR_CONTRACT_ABI } from "../constants";

// used by computing pair address on Mainnet
import { getCreate2Address, getAddress } from "@ethersproject/address";
import { pack, keccak256 } from "@ethersproject/solidity";
import { FACTORY_ADDRESS, INIT_CODE_HASH } from "../constants";
import pair from "../models/pair";
import BigNumber from "bignumber.js";
import { Date as mongooseDate } from "mongoose";


@Service()
export default class PoolService {
  constructor(
    @Inject("logger") private logger,
    @Inject("userPoolModel") private userPoolModel,
    @Inject("pairVolumeModel") private pairVolumeModel,
    @Inject("web3") private web3
  ) { }

  public format(data) {
    const _data = data.map((pairIdx) => ({
      token0Idx: pairIdx[0],
      token1Idx: pairIdx[1]
    }));
    return _data;
  }

  // TODO: schedule to update automatically
  public async getValidPools(chainId) {
    // take note of the last requested chainId
    if (cache.get("chainId") !== chainId)
      cache.put("chainId", chainId);
    this.logger.info(`Fetching pools on chainId: ${cache.get("chainId")}`);

    if (cache.get("pool")) {
      this.logger.info("CACHED DATA FOUND: Last updated s ago");
      return cache.get("pool");
    } else {
      this.logger.info("CACHED DATA OUTDATED / NULL!");
      const data = await this.updateValidPools(chainId);
      cache.put("pool", data, 3600 * 1000, async (key, value) => {
        this.logger.info("CACHED DATA UPDATING")
        await this.getValidPools(cache.get("chainId"));
      });
      this.logger.info("CACHED DATA UP-TO-DATE");
      return data;
    }
  }

  // TODO: Is chainId=4 when we use rinkeby?
  public async updateValidPools(chainId = 56) {
    this.logger.debug("getValidPairs() is called.");

    const provider = new InfuraProvider("rinkeby", process.env.INFURA_API_KEY);

    // we only want WETH
    let tokens = supportedTokens.filter(token => token.symbol !== 'ETH');

    const totalTokenCount = tokens.length;

    if (totalTokenCount === 1) return;

    const tokenIndexPairs = [];
    const checkLiquidityPositionTasks = [];
    // get all possible pairs
    for (let i = 0; i < totalTokenCount; i++) {
      for (let j = i + 1; j < totalTokenCount; j++) {
        const { address: token0Address, symbol: token0Symbol, decimal: token0Decimal } = tokens[i];
        const { address: token1Address, symbol: token1Symbol, decimal: token1Decimal } = tokens[j];
        const token0 = new Token(chainId, token0Address, token0Decimal, token0Symbol);
        const token1 = new Token(chainId, token1Address, token1Decimal, token1Symbol);

        // quit if the two tokens are equivalent, i.e. have the same chainId and address
        if (token0.equals(token1)) continue;

        // queue get pair task
        const pairTask = Fetcher.fetchPairData(token0, token1, provider, chainId);
        checkLiquidityPositionTasks.push(pairTask);
        tokenIndexPairs.push([i, j]);
      }
    }

    const pairs = await Promise.allSettled(checkLiquidityPositionTasks);
    this.logger.debug(`Length of pairs fetched: ${checkLiquidityPositionTasks.length}`);

    // // filter out invalid pairs
    const ret = tokenIndexPairs.filter((_, idx) => { return pairs[idx].status !== "rejected" })

    // debug code
    // const validPairs = pairs.filter(pair => (pair.status !== "rejected"));
    // console.log(JSON.stringify(validPairs, null, 2));

    this.logger.debug(`Length of valid pairs: ${ret.length}`);

    return this.format(ret);
  }


  ///// Fetch user's list of positions

  public async getUserPools(walletId) {
    this.logger.info("getUserPools called");
    const data = await this.userPoolModel.findOne({ walletId }).exec();
    if (!data) {
      return { "pools": [] };
    } else {
      return data;
    }
  }

  // FIXME: prevent duplicate adding, use set (token0 and token1 are interchangable)
  public async updateUserPools(walletId, action, token0, token1) {
    this.logger.debug("updateUserPools called");
    console.log("received param in function ", walletId, action, token0, token1);
    const record = await this.userPoolModel.findOne({ walletId }).exec();
    console.log(record);

    if (!record) {
      this.logger.debug(`Mongo could not found the specific walletId`);
      if (action !== "add") {
        this.logger.debug(`Mongo could not remove non-exist record`);
        return false;
      }

      const created = await this.userPoolModel.create({
        walletId,
        pools: [{
          token0, token1
        }]
      }, (err, data) => {
        if (err) {
          this.logger.debug(`Mongo create new record error ${err}`);
          return false;
        }
        this.logger.debug(`Mongo created a new user pool record`);
        return data;
      });
      return true;
    }

    // locate the pair
    let removeIdx = record.pools.findIndex(item => item.token0 === token0 && item.token1 === token1);
    if (removeIdx === -1)
      removeIdx = record.pools.findIndex(item => item.token0 === token1 && item.token1 === token0);

    switch (action) {
      case "add":
        if (removeIdx !== -1) {
          this.logger.debug("Mongo tries to add a new record, but found one. Abort");
          return false;
        }
        record.pools.push({ token0, token1 });
        await record.save();
        this.logger.info(`Mongo added to user pool`);
        break;

      case "remove":
        if (removeIdx === -1) {
          this.logger.debug("Mongo tries to remove a record, could not find one. Abort");
          return false;
        }
        record.pools.splice(removeIdx, 1);
        await record.save();
        this.logger.info(`Mongo removed from user pool`);
        break;
    }

    return true;
  }

  ///// Fetch pool's general info

  public async getPoolInfo(token0Symbol, token1Symbol, chainId = 56) {
    // FIXME: use pool address as input
    // FIXME: ACY token adressOnEth is changed to a very uncommon token addr for avoiding confliction with ETH
    // if this collides with other token addr, the generated pairAddr will also collide.
    // in a concurrent request, mongo will throw error "No matching document found for id" indicating a race condition happens.
    const token0AddrOnMain = supportedTokens.find(item => item.symbol === token0Symbol).addressOnEth;
    const token1AddrOnMain = supportedTokens.find(item => item.symbol === token1Symbol).addressOnEth;

    const [_token0, _token1] =
    token0AddrOnMain.toLowerCase() < token1AddrOnMain.toLowerCase()
        ? [token0AddrOnMain, token1AddrOnMain]
        : [token1AddrOnMain, token0AddrOnMain];
    const pairAddress = getCreate2Address(
      FACTORY_ADDRESS[chainId],
      keccak256(["bytes"], [pack(["address", "address"], [_token0, _token1])]),
      INIT_CODE_HASH[chainId]
    );
    console.log("onMainnet token0", token0AddrOnMain);
    console.log("onMainnet token1", token1AddrOnMain);
    console.log("pairAddress", pairAddress);

    console.log("inside getPoolInfo function now");
    // await this.readPoolInfo(pairAddress);
    const pairVolume = await this.updatePoolInfo(_token0, _token1, pairAddress);
    console.log("end of getPoolInfo");;
    return pairVolume;
  }

  private async readPoolInfo(pairAddr) {
    let pairRecord = await this.pairVolumeModel.findOne({pairAddr}).exec();
    console.log(pairRecord.history[0]);
    let latestValidTimestamp = pairRecord.history[pairRecord.history.length-1].time;
    latestValidTimestamp.setHours(latestValidTimestamp.getHours() - 3);

    console.log(latestValidTimestamp);

    for (let item of pairRecord.history) {
      const ts = item.time;
      if (ts <= latestValidTimestamp) {
        console.log("remove time", ts);
      } else {
        console.log("found valid time", ts);
        break;
      }
    }
  }

  private async updatePoolInfo(token0, token1, pairAddr) {
    const timeDurationToTraceBack = 24*3600*1000; // miliseconds
    // get pool address
    // get lastBlockNumber, pairHistory from DB
    let lastBlockNumber, latestValidTimestamp;
    
    let pairRecord = await this.pairVolumeModel.findOne({pairAddr}).exec();
    if (!pairRecord) {
      pairRecord = await this.pairVolumeModel.create({pairAddr, lastVolume: {token0: 0, token1: 0}});
      this.logger.debug("creating new record in db");
      console.log("logging out created pairRecord", pairRecord);
      
      lastBlockNumber = null;
      latestValidTimestamp = null;
    } else {
      lastBlockNumber = pairRecord.lastBlockNumber;
      latestValidTimestamp = new Date(Date.now() - timeDurationToTraceBack);
    }

    // construct contract for this pool
    const contract = new this.web3.eth.Contract(PAIR_CONTRACT_ABI, pairAddr);

    // get current block
    const currentBlockNumber = await this.web3.eth.getBlockNumber();
    // const currentBlock = await this.web3.eth.getBlock(currentBlockNumber);

    // find past swap events with specific contract
    const daysToTrace = 1;

    const averageBlockTime = 15*1000; // 15 seconds = 15000 ms
    const option = {
      fromBlock: lastBlockNumber ? lastBlockNumber + 1 : currentBlockNumber - timeDurationToTraceBack / averageBlockTime,
      toBlock: currentBlockNumber
    };
    console.log("lastBlockNumber", lastBlockNumber);
    const swaps = await contract.getPastEvents("Swap", option);
    console.log("fetched swaps length", swaps.length)

    // remove obsoleted volume, and add new volume
    const token0Contract = new this.web3.eth.Contract(PAIR_CONTRACT_ABI, token0);
    const token1Contract = new this.web3.eth.Contract(PAIR_CONTRACT_ABI, token1);
    const decimal0 = await token0Contract.methods.decimals().call();
    const decimal1 = await token1Contract.methods.decimals().call();
    
    //// remove obsolete data from record
    let filteredHistory = [...pairRecord.history];
    let subtractedVolume = {
      amount0In:0, 
      amount1In:0, 
    };
    if (latestValidTimestamp) {

      for (let [idx, item] of filteredHistory.entries()) {
        const ts = item.time;
        if (ts > latestValidTimestamp) {
          filteredHistory.splice(0, idx);
          console.log("filteredHistory length", filteredHistory.length)
          break;
        } else {
          console.log("remove data", ts);
          subtractedVolume.amount0In += item.amount0In;
          subtractedVolume.amount1In += item.amount1In;
        }
      }
    }
    //// push new data to record
    interface DBSwapEntry {
      time: mongooseDate,
      amount0In: number,
      amount1In: number,
    }
    const extracted_swaps: (DBSwapEntry[] | DBSwapEntry) = await Promise.all(swaps.map(async (swap) => {
      // https://docs.mongodb.com/manual/reference/method/Date/#date--
      let blockTimestamp = await this.web3.eth.getBlock(swap.blockNumber);
      blockTimestamp = blockTimestamp.timestamp * 1000;  // unix timestamp in ms
      console.log("push data", new Date(blockTimestamp));

      let {amount0In, amount1In, amount0Out, amount1Out} = swap.returnValues;
      amount0In = this.getFloat(amount0In, decimal0);
      amount1In = this.getFloat(amount1In, decimal1);
      amount0Out = this.getFloat(amount0Out, decimal0);
      amount1Out = this.getFloat(amount1Out, decimal1);

      return {
        time: blockTimestamp, 
        amount0In, 
        amount1In, 
      };
    }));

    console.log("debugg", extracted_swaps)
    let addedVolume = {
      amount0In:0, 
      amount1In:0, 
    };

    // for (let i=0; i<extracted_swaps.length; i++) {
    for (let newSwap of extracted_swaps) {
      // let newSwap: DBSwapEntry = extracted_swaps[i];
      console.log("debug", newSwap)
      addedVolume.amount0In += newSwap.amount0In;
      addedVolume.amount1In += newSwap.amount1In;
    }
    

    // calculate new volume
    const newToken0Vol = pairRecord.lastVolume.token0 + addedVolume.amount0In - subtractedVolume.amount0In;
    const newToken1Vol = pairRecord.lastVolume.token1 + addedVolume.amount1In - subtractedVolume.amount1In;
    console.log("newVol, pairRecord.lastVolume.token0 + addedVolume.amount0In - subtractedVolume.amount0In", newToken0Vol, pairRecord.lastVolume.token0, addedVolume.amount0In, subtractedVolume.amount0In);
    console.log("newVol, pairRecord.lastVolume.token1 + addedVolume.amount1In - subtractedVolume.amount1In", newToken1Vol, pairRecord.lastVolume.token1, addedVolume.amount1In, subtractedVolume.amount1In);

    // // store swap records
    pairRecord.history = [...filteredHistory, ...extracted_swaps];
    pairRecord.lastVolume = {token0: newToken0Vol, token1: newToken1Vol};
    pairRecord.lastBlockNumber = currentBlockNumber;
    const savedRecord = await pairRecord.save();

    console.log("latest length", pairRecord.history.length);

    return pairRecord.lastVolume;
  }

  // helper functions
  private getFloat(bigNum, decimals) {
    return (new BigNumber(bigNum).div(new BigNumber(`1e+${decimals}`))).toNumber();
  }
}
