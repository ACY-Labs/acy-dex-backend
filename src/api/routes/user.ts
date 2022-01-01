import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import UserService from "../../services/user";

const route = Router();

export default (app: Router) => {
  app.use("/users", route);
// const userService = Container.get(UserService);
  const logger: Logger = Container.get("logger");
  
 
  route.post(

    "/swap",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling user POST endpoint /swap with query: %o",
        req.query
      );
      try {
        const userService = new UserService(req.models, req.constants.chainId);
        await userService.performTx(req.query);
        return res.status(201).json({response : "Success!"});
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.post(

    "/adduser",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling user POST endpoint /liquidity with query: %o",
        req.query
      );
      try {
        const userService = new UserService(req.models, req.constants.chainId);
        await userService.addUser(req.query);
        return res.status(201).json({response : "Success!"});
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(

    "/all",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling user POST endpoint /all with query: %o",
        req.query
      );
      try {
        const userService = new UserService(req.models, req.constants.chainId);
        let data = await userService.getAllUsers();
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
  
  route.get(
    "/stats",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling user POST endpoint /stats with query: %o",
        req.query
      );
      try {
        const userService = new UserService(req.models, req.constants.chainId);
        let data = await userService.getUserStats(req.query);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

};
