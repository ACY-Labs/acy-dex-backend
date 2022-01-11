import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import PoolService from "../../services/pool";

const route = Router();

export default (app: Router) => {
  const logger: Logger = Container.get("logger");
  
  // // no longer in use
  // app.get(
  //   "/pool",
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     logger.debug(
  //       "Calling pool GET endpoint /pool with query: %o",
  //       req.query
  //     );
  //     try {
  //       // const poolServiceInstance = Container.get(PoolService);
  //       const chainId = req.query.chainId;
  //       const data = await poolServiceInstance.getValidPools(chainId);
  //       return res.status(201).json(data);
  //     } catch (e) {
  //       logger.error("🔥 error: %o", e);
  //       return next(e);
  //     }
  //   }
  // );

  // liquidity page: list out all pools a user currently has a position.
  app.get(
    "/userpool",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling pool GET endpoint /userpool with query: %o",
        req.query
      );
      try {
        const poolServiceInstance = new PoolService(req.constants, req.models)
        const walletId = req.query.walletId;
        const data = await poolServiceInstance.getUserPools(walletId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
  // liquidity page: update database about the latest liquidity position a user has by adding a new entry or removing an existing entry.
  app.post(
    "/pool/update",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling pool GET endpoint /pool/update with query: %o",
        req.query
      );
      try {
        const poolServiceInstance = new PoolService(req.constants, req.models)
        const { walletId, action, txHash, token0, token1} = req.query;
        // const { token0, token1 } = req.body;
        const statusOK = await poolServiceInstance.updateUserPools(walletId, action, txHash, token0, token1);
        return res.status(201).send(statusOK);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
  
  // // no longer in use
  // app.get(
  //   "/pool/info",
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     logger.debug(
  //       "Calling pool GET endpoint /pool/general with query: %o",
  //       req.query
  //     );
  //     try {
  //       const { token0Symbol, token1Symbol } = req.query;
  //       // const { token0, token1 } = req.body;
  //       const data = await poolServiceInstance.getPoolInfo(token0Symbol, token1Symbol);
  //       return res.status(201).send(data);
  //     } catch (e) {
  //       logger.error("🔥 error: %o", e);
  //       return next(e);
  //     }
  //   }
  // );
};
