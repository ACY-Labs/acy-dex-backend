import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import FarmService from "../../services/farm";
import { Logger } from "winston";

const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/farm", route);

  const logger: Logger = Container.get("logger");

  route.get(
    "/massUpdateFarm",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /farm/massUpdateFarm with query: %o",
        req.query
      );
      try {
        const farmServiceInstance = Container.get(FarmService);
        const data = await farmServiceInstance.massUpdateFarm();
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/getAllPools",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /farm/getAllPools with query: %o",
      );
      try {
        const farmServiceInstance = Container.get(FarmService);
        const data = await farmServiceInstance.getAllPools();
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
  route.get(
    "/getPool",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /farm/getPool with query: %o",
        req.query
      );
      try {
        const farmServiceInstance = Container.get(FarmService);
        // 0x1954F985F1086caBDc0Ea5FCC2a55732e7e43DD5
        // 0x0000000000000000000000000000000000000000
        const data = await farmServiceInstance.getPool(req.query.poolId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
  route.get(
    "/updatePool",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /farm/updatePool with query: %o",
        req.query
      );
      try {
        const farmServiceInstance = Container.get(FarmService);
        const data = await farmServiceInstance.updatePool(req.query.poolId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};