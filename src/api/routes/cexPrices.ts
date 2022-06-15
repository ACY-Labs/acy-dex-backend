import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import Binance from "binance-api-node";

const route = Router();

const client = Binance();
const formatOHLC = datas => {
    if (!Array.isArray(datas))
        datas = [datas]
    return datas.map(data => ({
        time: (data.openTime || data.startTime) / 1000,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
    }))
}

// CACHING
const cache = {}
const intervalMapping = {
    "1m": 60, 
    "5m": 60 * 5,
    "15m": 60 * 15,
    "1h": 60 * 60,
    "4h": 60 * 60 * 4,
    "1d": 60 * 60 * 24,
    "1w": 60 * 60 * 24 * 7
  };
const interval2Sec = interval => {
    return intervalMapping[interval];
}
//

export default (app: Router) => {
    // route prefix
    app.use("/cexPrices", route);

    const logger: Logger = Container.get("logger");

    route.get(
        "/binanceHistoricalPrice",
        async (req: Request, res: Response, next: NextFunction) => {
            logger.debug(
                "Calling chart GET endpoint /add with query: %o",
                req.query
            );
            try {
                const {symbol, interval} = req.query;
                const now = Date.now()
                const cacheKey = `binance:${symbol}:${interval}`
                // check data availability in cache
                if (cache[cacheKey] && now / 1000 < cache[cacheKey].lastCandleTime + interval2Sec(interval)) {
                    return res.status(201).json(cache[cacheKey].data);
                }

                let prevData = await client.candles({
                    symbol,
                    interval,
                    limit: 1000,
                    endTime: now
                })
                prevData = formatOHLC(prevData)
                cache[cacheKey] = {
                    lastCandleTime: prevData[prevData.length-1].openTime,
                    data: prevData
                }
                // console.log("cache keys: ", Object.keys(cache));
                return res.status(201).json(prevData);
            } catch (e) {
                logger.error("🔥 error: %o", e);
                return next(e);
            }
        }
    );
};
