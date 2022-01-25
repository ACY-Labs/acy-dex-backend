
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
    constructor(models,logger,chainId,web3) {
      this.launchChartModel = models.launchChartModel;
      this.chainId =  chainId;
      this.logger = logger;
      this.web3 = web3;
      }
      public async addAllocationData() {

      }


      // method to check chart data
      public async checkData(poolId)
      {
        this.logger.debug("AllocationChart Data Check---------------------------------");
        let data = this.launchChartModel
      }
}