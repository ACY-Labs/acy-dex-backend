

import { Service, Inject, Container } from "typedi";
import { Logger } from "winston";
import axios from 'axios';

@Service()
export default class ApplyDataService {
    applyDataModel: any;
    chainId: any;
    logger: Logger;
    constructor(models,logger,chainId) {
      this.applyDataModel = models.applyDataModel;
      this.chainId =  chainId;
      this.logger = logger;
      }
      public async createForm() {

      }
}