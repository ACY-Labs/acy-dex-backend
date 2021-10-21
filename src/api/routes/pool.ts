import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import PoolService from "../../services/pool";

const route = Router();

export default (app: Router) => {
  const logger: Logger = Container.get("logger");
  const poolServiceInstance = Container.get(PoolService);

  app.get(
    "/pool",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling pool GET endpoint /pool with query: %o",
        req.query
      );
      try {
        // const poolServiceInstance = Container.get(PoolService);
        const chainId = req.query.chainId;
        const data = await poolServiceInstance.getValidPools(chainId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  app.get(
    "/userpool",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling pool GET endpoint /userpool with query: %o",
        req.query
      );
      try {
        const walletId = req.query.walletId;
        const data = await poolServiceInstance.getUserPools(walletId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
  app.post(
    "/pool/update",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling pool GET endpoint /userpool with query: %o",
        req.query
      );
      try {
        const { walletId, action, token0, token1} = req.query;
        // const { token0, token1 } = req.body;
        const statusOK = await poolServiceInstance.updateUserPools(walletId, action, token0, token1);
        return res.status(201).send(statusOK);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
