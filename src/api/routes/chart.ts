import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import ChartService from "../../services/chart";
import RateService from "../../services/rate";
import { Logger } from "winston";

const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/chart", route);

  const logger: Logger = Container.get("logger");

  route.post(
    "/swap",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart POST endpoint /swap with query: %o",
        req.query
      );
      try {
        const chartServiceInstance = Container.get(ChartService);
        const data = await chartServiceInstance.getSwapRate(
          req.query.token0,
          req.query.token1,
          req.query.range
        );
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.post(
    "/add",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart POST endpoint /add with query: %o",
        req.query
      );
      try {
        const rateServiceInstance = Container.get(RateService);
        let reqTemp = {
          token0 : req.query.token0,
          token1 : req.query.token1,
          rate : req.query.rate,
          time : req.query.time,
        }
        rateServiceInstance.addRate(reqTemp);
        return res.status(201);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/getRate",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /getRate with query: %o",
        req.query
      );
      try {
        const rateServiceInstance = Container.get(RateService);
        const data = await rateServiceInstance.processSwapData(req.query.token0,req.query.token1,req.query.range);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
