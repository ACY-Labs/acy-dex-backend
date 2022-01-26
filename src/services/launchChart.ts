
import { Service, Inject, Container } from "typedi";
import { Logger } from "winston";
import axios from 'axios';
import Web3 from "web3";

@Service()
export default class LaunchChartService {
    launchChartModel: any;
    chainId: any;
    logger: Logger;
    web3: Web3;
    constructor(models,constants) {
      this.launchChartModel = models.launchChartModel;
      this.chainId =  constants.chainId;
      this.logger = constants.logger;
      this.web3 = new Web3(constants.web3);
    }
      public async addAllocationData() {

      }


      // method to check chart data
      public async getData(poolId : Number)
      {
        this.logger.debug("AllocationChart Data Check---------------------------------");
        let data = await this.launchChartModel.findOne({poolId}).exec();
        return data;

      }

      public async addData(poolId,allocation,time){
        let chartData = await this.launchChartModel.findOne({poolId}).exec();
        let tempTime = ((time/(1000*60*5) | 0)*5);
        this.logger.debug(chartData)   
      
          if(!chartData){
            let dataArray = [{AllocationSum:allocation,time:tempTime}];
            await this.launchChartModel.create({
              poolId,
              History:dataArray,
            });
          }
      
      
      
      
      
      }
}