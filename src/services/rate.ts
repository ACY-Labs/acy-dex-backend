import { Service, Inject, Container } from "typedi";

@Service()
export default class Rate {
  constructor(
    @Inject("rateModel") private rateModel,
    @Inject("logger") private logger,
    @Inject("web3") private web3
  ) {}

  public async processSwapData(
    token0: string,
    token1: string,
  ) {
    this.logger.debug(`start processing SwapData`);
    
    let data = await this.rateModel.findOne({ token0, token1 }).exec();
    // 24*60/5
    // 30*24*60/5
    return data;
  }

  public async addRate(token0, token1, rate, time){
    let swapData = await this.rateModel.find({ token0, token1 }).exec();
    if(!swapData){
      await this.rateModel.create();
    }
    else{
      
      // (30*24*60/5)
    }
    
  }
}
