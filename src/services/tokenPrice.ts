

import { Service, Inject, Container } from "typedi";
import Web3 from "web3";
import { Logger } from "winston";
import TokenListSelector from "../constants/tokenAddress";
import axios from 'axios';



@Service()
export default class TokenPriceService {


    tokenPriceModel: any;
    logger: Logger;
    web3: Web3;
    chainId: any;



    constructor(constants, models,chainId) {
        this.tokenPriceModel = models.tokenPriceModel;
        this.logger = constants.logger;
        this.web3 = constants.web3;
        this.chainId = chainId
      }

      public async fetchTokensPrice() {
  
        const tokenlist = TokenListSelector('97');
        const searchIdsArray = tokenlist.map(token => token.idOnCoingecko);
      
        const searchIds = searchIdsArray.join('%2C');
        console.log(`https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`)
        const tokensPrice = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`
        ).then(async (result) =>{
          const data = result.data;
          console.log(data);
          const tokensPrice = {};
          tokenlist.forEach(token =>{
            tokensPrice[token.symbol] = data[token.idOnCoingecko]['usd'];
          })
          return tokensPrice;
        }).catch((e) => {
      
          console.log("get price err",e)
        });
      
        return [201, "Fetch TokenPrice List success"];
      }
      
}