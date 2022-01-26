
import { Service, Inject, Container } from "typedi";
import { Logger } from "winston";
import axios from 'axios';
import Web3 from "web3";
import pool from "../api/routes/pool";

@Service()
export default class LaunchChartService {
  launchChartModel: any;
  chainId: any;
  logger: Logger;
  web3: Web3;
  constructor(models, constants) {
    this.launchChartModel = models.launchChartModel;
    this.chainId = constants.chainId;
    this.logger = constants.logger;
    this.web3 = new Web3(constants.web3);
  }
  public async addAllocationData() {

  }


  // method to check chart data
  public async getData(poolId: Number) {
    this.logger.debug("AllocationChart Data Check---------------------------------");
    let data = await this.launchChartModel.findOne({ poolId }).exec();
    return data;

  }

  public async addSaleData(poolId, sale, time) {
    let chartData = await this.launchChartModel.findOne({ poolId }).exec();
    let tempTime = ((time / (1000 * 60 * 5) | 0) * 5);
    this.logger.debug(chartData)

    if (!chartData) {
      let dataArray = [{ saleAmount: sale, nodeTime: tempTime, count: 1 }];
      this.logger.debug("New Pool Id adding -----0-----", poolId)
      await this.launchChartModel.create({
        poolId,
        saleHistory: dataArray,
      });
    }
    else {
      let historyData = chartData.saleHistory;
      if (tempTime != (historyData[historyData.length - 1].time)) {
        historyData.push({
          saleAmount: sale, nodeTime: tempTime, count: 1
        });
        this.logger.debug("new AllocationData record inserting PooL id is ---1111-----", poolId);
        const res = await this.launchChartModel.updateOne(
          {
            poolId: poolId
          },
          {
            saleHistory: historyData
          }
        );
        return res;
      }
      else {
        let newCount = historyData[historyData.length - 1].count + 1;
        let newAllocation = (historyData[historyData.length - 1].saleAmount + parseInt(sale))
        historyData[historyData.length - 1].AllocationSum = newAllocation;
        historyData[historyData.length - 1].count = newCount;

        this.logger.debug("AllocationDataSum add PooL id is -----2-----", poolId);

        const res = await this.launchChartModel.updateOne({
          poolId: poolId,
        },
          {
            saleHistory: historyData
          });
        return res;

      }
    }






  }
}