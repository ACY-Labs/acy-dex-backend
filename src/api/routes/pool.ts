import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import PoolService from "../../services/pool";

const route = Router();

export default (app: Router) => {
  const logger: Logger = Container.get("logger");

  app.get(
    "/pool",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling pool GET endpoint /check pool with query: %o",
        req.query
      );
      try {
        const poolServiceInstance = Container.get(PoolService);
        const chainId = req.query.chainId;
        const data = await poolServiceInstance.getValidPools(chainId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
