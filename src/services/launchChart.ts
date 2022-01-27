
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

  public async addSaleData(poolId, token, sale, time) {
    let chartData = await this.launchChartModel.findOne({ poolId }).exec();
    let tempTime = ((time / (1000 * 60 * 5) | 0) * 5);
    this.logger.debug(chartData)

    if (!chartData) {
      let dataArray = [{ saleAmount: sale, nodeTime: tempTime, count: 1 }];
      this.logger.debug("New Pool Id adding -----0chart-----", poolId)
      const res = await this.launchChartModel.create({
        poolId: poolId,
        token: token,
        saleHistory: dataArray,
      });
      this.logger.debug("Success");

      return res;
    }
    else {
      let historyData = chartData.saleHistory;
      if (tempTime != (historyData[historyData.length - 1].nodeTime)) {
        historyData.push({
          saleAmount: sale, nodeTime: tempTime, count: 1
        });
        console.log("Time is",tempTime)
        this.logger.debug("new AllocationData record inserting PooL id is ---1111-----", poolId);
        const res = await this.launchChartModel.updateOne(
          {
            poolId: poolId
          },
          {
            saleHistory: historyData
          }
        );
        this.logger.debug("Success");
        return res;
      }
      else {
        let newCount = historyData[historyData.length - 1].count + 1;
        let newAllocation = (historyData[historyData.length - 1].saleAmount + parseInt(sale))
        historyData[historyData.length - 1].saleAmount = newAllocation;
        historyData[historyData.length - 1].count = newCount;

        this.logger.debug("AllocationDataSum add PooL id is -----2-----", poolId);

        const res = await this.launchChartModel.updateOne({
          poolId: poolId,
        },
          {
            saleHistory: historyData
          });
        this.logger.debug("Success");

        return res;

      }
    }






  }

  public async addUserPerchasedData(poolId, token, walletId, userPerchased, purchasedTime) {
    let tableData = await this.launchChartModel.findOne({ poolId }).exec();
    this.logger.debug(tableData);

    if (!tableData) {
      let dataArray = [{ walletId: walletId, token: token, userPerchasedAmount: userPerchased, purchasedTime: purchasedTime }];
      this.logger.debug("New Pool Id adding -----0table-----", poolId)
      const res = await this.launchChartModel.create({
        poolId: poolId,
        token: token,
        userHistory: dataArray,
      });
      this.logger.debug("Success");

      return res;
    }
    else {
      let historyData = tableData.userHistory;
      historyData.push({
        walletId: walletId,
        userPerchasedAmount: userPerchased,
        purchasedTime: purchasedTime
      });
      this.logger.debug("new AllocationData record inserting PooL id is ---1111-----", poolId);
      const res = await this.launchChartModel.updateOne(
        {
          userHistory: historyData
        }
      );
      this.logger.debug("Success");
      return res;


    }
  }
}