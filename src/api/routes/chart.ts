import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import ChartService from "../../services/chart";
import { Logger } from "winston";

const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/chart", route);

  const logger: Logger = Container.get("logger");

  route.post(
    "/swap/:token0/:token1/:interval",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart POST endpoint /swap/:token0/:token1/:interval with param: %o",
        req.params
      );
      try {
        const chartServiceInstance = Container.get(ChartService);
        const data = await chartServiceInstance.getSwapRate(
          req.params["token0"],
          req.params["token1"],
          req.params["interval"]
        );
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
