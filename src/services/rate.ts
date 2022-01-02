import { Service, Inject, Container } from "typedi";
import { resolveModuleName } from "typescript";
import Web3 from "web3";
import { Logger } from "winston";

@Service()
export default class Rate {
  rateModel: any;
  logger: Logger;
  web3: Web3;

  constructor(constants, models) {
    this.rateModel = models.rateModel;
    this.logger = constants.logger;
    this.web3 = constants.web3;
  }

  public async processSwapData(
    token0: string,
    token1: string,
  ) {
    this.logger.debug(`start processing SwapData`);
    
    let data = await this.rateModel.findOne({ token0, token1 }).exec();
    return data;
  }
  // http://localhost:3001/api/chart/add?token0=A&token1=B&rate=4&time=1639732724916
  // http://localhost:3001/api/chart/getRate?token0=A&token1=B
  public async addRate(token0, token1, rate, time){
    let swapData = await this.rateModel.findOne({ token0, token1 }).exec();
    let tempTime = ((time/(1000*60*5) | 0)*5);
    this.logger.debug(swapData)
    // return;
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
        this.logger.debug("1")
        this.logger.debug(historyData)
        const res = await this.rateModel.updateOne(
          {
            token0: token0,
            token1: token1,
          },
          { History: historyData }
        );
        return (res);
      }
      else{
        let newCount = historyData[historyData.length - 1].count + 1;
        let newRate = (((((historyData[historyData.length - 1].exchangeRate)*(newCount-1))) + parseInt(rate)) / newCount)
        historyData[historyData.length - 1].exchangeRate = newRate;
        historyData[historyData.length - 1].count = newCount;
        this.logger.debug("2")
        this.logger.debug(historyData)
        const res = await this.rateModel.updateOne(
          {
            token0: token0,
            token1: token1,
          },
          { History: historyData }
        );
        return res;
      }
    }
    
    
  }
}
