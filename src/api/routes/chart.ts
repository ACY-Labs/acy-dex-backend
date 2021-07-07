import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import ChartService from "../../services/chart";
import { Logger } from "winston";

const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/chart", route);

  const logger: Logger = Container.get("logger");

  route.get(
    "/:interval",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug("Calling chart GET endpoint with param: %o", req.params);
      try {
        const chartServiceInstance = Container.get(ChartService);
        const data = await chartServiceInstance.someGetter(
          req.params["interval"]
        );
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.post(
    "/:interval",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug("Calling chart POST endpoint with param: %o", req.params);
      try {
        const chartServiceInstance = Container.get(ChartService);
        await chartServiceInstance.someSetter(req.params["interval"]);
        return res.status(201).json({ status: "OK" });
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
