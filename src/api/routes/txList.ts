import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import TxService from "../../services/tx";

const route = Router();

export default (app: Router) => {
  app.use("/txlist", route);
const txService = Container.get(TxService);
  const logger: Logger = Container.get("logger");
  
  route.get(
    "/all",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling txlist GET endpoint /all with query: %o",
        req.query
      );
      try {
        let data = await txService.getAllTx(req.query);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/token",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling txlist GET endpoint /token with query: %o",
        req.query
      );
      try {
        let data = await txService.getTxListForToken(req.query);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/pair",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling txlist GET endpoint /pair with query: %o",
        req.query
      );
      try {
        let data = await txService.getTxListForPair(req.query);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );


};
