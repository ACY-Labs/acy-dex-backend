

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
        try{
        let createRes = await this.applyDataModel.create({
          walletId: walletId,
          form: form
        });

        const modelInstance = await this.applyDataModel.findOne({walletId}).exec();
        return (modelInstance._id);
      }
      catch(err){
        console.log("MongoData Create Error",err);
        return err;
      };
        
      }
}