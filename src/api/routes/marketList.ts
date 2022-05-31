import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import axios from 'axios';

const route = Router();

class TtlCache {
    _cache: {};
    _ttl: number;
    _maxKeys: number;

    constructor(ttl = 60, maxKeys: number) {
      this._cache = {}
      this._ttl = ttl
      this._maxKeys = maxKeys
    }
  
    get(key: string) {
      return this._cache[key]
    }
  
    set(key: string, value: any) {
      this._cache[key] = value
  
      const keys = Object.keys(this._cache)
      if (this._maxKeys && keys.length >= this._maxKeys) {
        for (let i = 0; i <= keys.length - this._maxKeys; i++) {
          delete this._cache[keys[i]]
        }
      }
  
      setTimeout(() => {
        delete this._cache[key]
      }, this._ttl * 1000)
  
    }
  }
  const ttlCache = new TtlCache(60, 100)
  

export default (app: Router) =>  {
    app.use("/marketList", route);
    const logger: Logger = Container.get("logger");

    route.get("/coins/:market",async (req: Request, res: Response, next: NextFunction)=>{
        const vs_currency = req.query.vs_currency;
        const order = req.query.order;
        const per_page = req.query.per_page;
        const page = req.query.page;
        const sparkline = req.query.sparkline;
        const apiUrlPrefix = "https://api.coingecko.com/api/v3";

        const cacheKey = `${vs_currency}:${order}:${per_page}:${page}:${sparkline}`;
        const fromCache = ttlCache.get(cacheKey);
        if (fromCache) {
            logger.debug("Fetch from cache...");
            return res.status(200).send(fromCache);
        }

        const coins = await axios.get(
            `${apiUrlPrefix}/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}`
          ).then(async (result) =>{
            ttlCache.set(cacheKey, result.data);
            return result.data;
          }).catch((e) => {        
            console.log("[ERROR] Failed to fetch marketList from coingecko",e);
          });

        return res.status(200).send(coins);
    })

}