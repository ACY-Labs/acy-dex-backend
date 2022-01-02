import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
// import ChartService from "../../services/chart";
import RateService from "../../services/rate";
import { Logger } from "winston";

const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/chart", route);

  const logger: Logger = Container.get("logger");

  // route.post(
  //   "/swap",
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     logger.debug(
  //       "Calling chart POST endpoint /swap with query: %o",
  //       req.query
  //     );
  //     try {
  //       const chartServiceInstance = Container.get(ChartService);
  //       const data = await chartServiceInstance.getSwapRate(
  //         req.query.token0,
  //         req.query.token1,
  //         req.query.range
  //       );
  //       return res.status(201).json(data);
  //     } catch (e) {
  //       logger.error("🔥 error: %o", e);
  //       return next(e);
  //     }
  //   }
  // );

  route.post(
    "/add",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart POST endpoint /add with query: %o",
        req.query
      );
      try {
        const rateServiceInstance = new RateService(req.constants, req.models);
        await rateServiceInstance.addRate(
          req.query.token0,
          req.query.token1,
          req.query.rate,
          req.query.time,
        );
        return res.status(201).json({'msg': 'addRate success'});
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
        const rateServiceInstance = new RateService(req.constants, req.models);
        const data = await rateServiceInstance.processSwapData(req.query.token0,req.query.token1);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
