import { Service, Inject, Container } from "typedi";
import supportedTokens from "../constants/supportedTokens";
import {InfuraProvider} from "@ethersproject/providers"
import { Fetcher, Token, Pair } from '@acyswap/sdk';
import cache from "memory-cache";

@Service()
export default class PoolService {
  constructor(
    // @Inject("subscriberModel") private subscriberModel,
    @Inject("logger") private logger
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
    if (cache.get("pool")) {
      this.logger.info("CACHED DATA FOUND: Last updated s ago");
      return cache.get("pool");
    } else {
      this.logger.info("CACHED DATA OUTDATED / NULL!");
      const data = this.updateValidPools(chainId);
      cache.put("pool", data);
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
        
        this.logger.debug(`chainID ${chainId}`);
        this.logger.debug(`${token0Symbol} ${token1Symbol}`);
        this.logger.debug(`${token0Address} ${token1Address}`);

        this.logger.debug(Pair.getAddress(token0, token1))

        // queue get pair task
        const pairTask = Fetcher.fetchPairData(token0, token1, provider);
        checkLiquidityPositionTasks.push(pairTask);
        tokenIndexPairs.push([i,j]);
      }
    }
    
    const pairs = await Promise.allSettled(checkLiquidityPositionTasks);
    this.logger.debug(`Length of pairs fetched: ${checkLiquidityPositionTasks.length}`);

    // for (let p of pairs) {
    //   // this.logger.debug(p.status)
    //   if (p.status === "rejected")
    //     this.logger.debug(p.reason)
    // }
    // // filter out invalid pairs
    const ret = tokenIndexPairs.filter((_, idx) => { return pairs[idx].status !== "rejected" })
    
    // // another correct logic
    // for (let i=pairLength-1; i>=0; i--) {
    //   if (pairs[i].status === "rejected") 
    //     tokenIndexPairs.splice(i, 1);
    // }
    
    this.logger.debug(`Length of valid pairs: ${ret.length}`);

    return this.format(ret);
  }
}
