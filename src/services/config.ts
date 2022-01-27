import { Service } from "typedi";


@Service()
export default class ConfigService {

    config: any;
    chainId: any;

  constructor(
    models,
    chainId
  ) { 
    this.config = models.configModel;
    this.chainId = chainId;
  }
    
    public async getTokenList(){
        
        const attrReq = await this.config.findOne({attr:"tokenList"}).exec();
        return {
            data : attrReq.value
        }
    }
}