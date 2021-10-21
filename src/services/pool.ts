import { Service, Inject, Container } from "typedi";
import supportedTokens from "../constants/supportedTokens";
import {InfuraProvider} from "@ethersproject/providers"
import { Fetcher, Token, Pair } from '@acyswap/sdk';
import cache from "memory-cache";

@Service()
export default class PoolService {
  constructor(
    @Inject("logger") private logger,
    @Inject("userPoolModel") private userPoolModel,
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
      cache.put("pool", data, 3600*1000, async (key, value) => {
        this.logger.info("CACHED DATA UPDATING")
        await this.getValidPools(cache.get("chainId"));
      });
      this.logger.info("CACHED DATA UP-TO-DATE");
      return data;
    }
  }
  
  // TODO: Is chainId=4 when we use rinkeby?
  public async updateValidPools(chainId) {
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
        const pairTask = Fetcher.fetchPairData(token0, token1, provider);
        checkLiquidityPositionTasks.push(pairTask);
        tokenIndexPairs.push([i,j]);
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

  public async getUserPools(walletId) {
    this.logger.info("getUserPools called");
    const record = this.userPoolModel.findOne({walletId}, (err, data) =>{
      if (err) {
        this.logger.debug(`Mongo error ${err}`); 
        return false;
      }
      return data;
    });
    return record;
  }

  // FIXME: prevent duplicate adding, use set (token0 and token1 are interchangable)
  public async updateUserPools(walletId, action, token0, token1) {
    this.logger.debug("updateUserPools called");
    console.log("received param in function ", walletId, action, token0, token1);
    const record = await this.userPoolModel.findOne({walletId}).exec();
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
        record.pools.push({token0, token1}); 
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
}
