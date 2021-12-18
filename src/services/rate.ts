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
    return data;
  }

  public async addRate(token0, token1, rate, time){
    let swapData = await this.rateModel.findOne({ token0, token1 }).exec();
    let tempTime = ((time/(1000*60*5) | 0)*5);
    if(!swapData){
      let dataArray = [{exchangeRate: rate, time: tempTime, count: 1}]
      await this.rateModel.create({
        token0,
        token1,
        History : dataArray,
      });
    }
    else{
      let historyData = swapData.History;
      if( tempTime != (historyData[historyData.length - 1].time)){
        historyData.push({exchangeRate: rate, time: tempTime, count: 1})
        await this.rateModel.updateOne(
          {
            token0: token1,
            token1: token0,
          },
          { History: historyData }
        );
      }
      else{
        let newCount = historyData[historyData.length - 1].count + 1;
        let newRate = ((((historyData[historyData.length - 1].exchanegRate)*(newCount-1)) + rate) / newCount)
        historyData[historyData.length - 1].exchanegRate = newRate;
        historyData[historyData.length - 1].count = newCount;
        historyData[historyData.length - 1].time = tempTime;
        await this.rateModel.updateOne(
          {
            token0: token1,
            token1: token0,
          },
          { History: historyData }
        );
      }
    }
    
  }
}
