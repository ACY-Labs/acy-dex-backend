

import { Service, Inject, Container } from "typedi";
import { Logger } from "winston";
import axios from 'axios';


@Service()
export default class ApplyDataService {
  applyDataModel: any;
  chainId: any;
  logger: Logger;
  constructor(models, constants, logger) {
    this.applyDataModel = models.applyDataModel;
    this.logger = logger;
    this.chainId = constants.chainId;
  }
  public async createForm(walletId, form) {
    console.log(walletId, form)
    try {
      let createRes = await this.applyDataModel.create({
        walletId: walletId,
        form: form
      });

      const modelInstance = await this.applyDataModel.findOne({ walletId }).exec();
      return (modelInstance._id);
    }
    catch (err) {
      console.log("MongoData Create Error", err);
      return err;
    };

  }
  public async checkForm(walletId) {
    console.log(walletId);
    try {
      let findRes = await this.applyDataModel.findOne({ walletId }).exec();
      if (findRes) return true;
      else return false;
    }
    catch (err) {
      console.log("MongoData Find Error", err);
      return err;
    }
  }

  public async getForm() {
    try {
      let data = await this.applyDataModel.find().exec();
      if (!data) this.logger.info("No Form Data store in DB!");
      return data;
    }
    catch (err) {
      console.log("MongoData Find Error", err);
      return err;
    }
  }

  public async updateForm(projectID,form) {
    console.log(projectID);

    try {
      const modelInstance = await this.applyDataModel.findOne({ _id: projectID }).exec();
      if (!modelInstance) return ("Form Not exist");

      const updateRes = await this.applyDataModel.updateOne(
        { _id: projectID },
        {
          form:form
        },(err,data)=>{
          if (err) {
            this.logger.debug(`Mongo update Form error ${err}`);
          return false;
        }
        });
        this.logger.debug(`Mongo update Form record success`);
        return true;
    }
    catch (err) {
      console.log("MongoData update Error", err);
      return err;
    }
  }
}