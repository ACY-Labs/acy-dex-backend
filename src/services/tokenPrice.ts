

import { Service, Inject, Container } from "typedi";
import Web3 from "web3";
import { Logger } from "winston";
import TokenListSelector from "../constants/tokenAddress";
import axios from 'axios';

@Service()
export default class TokenPriceService {
    tokenPriceModel: any;
    chainId: any;
    logger: Logger;
    constructor(models,logger,chainId) {
      this.tokenPriceModel = models.tokenPriceModel;
      this.chainId =  chainId;
      this.logger = logger;
      }
      public async updateTokensPriceList(chainId) {
        console.log("Fetching TokenPriceList data--------------------ChainID is " + this.chainId)
        const tokenlist = TokenListSelector(this.chainId);
        const searchIdsArray = tokenlist.map(token => token.idOnCoingecko);
        if( await this.tokenPriceModel.findOne({chainId : chainId}) == null){
          let res = 
          await this.tokenPriceModel.create(
            {
             chainId:chainId,
             symbol:[]
            }
          )
          console.log("create new collection",res)
          ;}
          const modelinstance = await this.tokenPriceModel.findOne({chainId : chainId})
          console.log(modelinstance)

        const searchIds = searchIdsArray.join('%2C');
        console.log(`https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`)
        const tokensPrice = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`
        ).then(async (result) =>{
          const data = result.data;
          console.log(data);
          const tokensPrice = {};
          await tokenlist.forEach(token =>{
            console.log("addingdata",token.symbol,data[token.idOnCoingecko]['usd'])
            tokensPrice[token.symbol] = data[token.idOnCoingecko]['usd'];
            modelinstance.symbol.set(token.symbol, data[token.idOnCoingecko]['usd'].toString() )
          })
          return tokensPrice;
        }).catch((e) => {
          console.log("get price err",e)
        });
        await modelinstance.save();
        this.logger.debug("Fetching TokenPriceList data--------------------ChainID is " + this.chainId,tokensPrice);
        console.log(modelinstance)
        return [201, "Fetch TokenPrice List success"];
      }
}