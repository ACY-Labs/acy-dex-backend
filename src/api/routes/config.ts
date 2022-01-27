import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import ConfigService from "../../services/config";

const route = Router();

export default (app: Router) => {
  app.use("/configs", route);
// const userService = Container.get(UserService);
  const logger: Logger = Container.get("logger");
  

  route.get(

    "/tokenlist",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling user POST endpoint /tokenlist with query: %o",
        req.query
      );
      try {
        const configService = new ConfigService(req.models, req.constants.chainId);
        let data = await configService.getTokenList();
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

};
