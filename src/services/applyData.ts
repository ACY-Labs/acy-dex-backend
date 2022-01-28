

import { Service, Inject, Container } from "typedi";
import { Logger } from "winston";
import axios from 'axios';


@Service()
export default class ApplyDataService {
    applyDataModel: any;
    chainId: any;
    logger: Logger;
    constructor(models,constants,logger) {
      this.applyDataModel = models.applyDataModel;
      this.logger = logger;
      this.chainId = constants.chainId;
      }
      public async createForm(walletId,form) {
        console.log(walletId,form)
        let createRes = await this.applyDataModel.create({
          walletId: walletId,
          form: form
        },(err,data)=>{
          console.log("MongoData Create Error",err);
          return err;
        })

        return ("TEST SUCCESS");
      }
}