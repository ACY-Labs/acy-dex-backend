import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import UserService from "../../services/user";
import { Logger } from "winston";

const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/userInfo", route);

  const logger: Logger = Container.get("logger");

  app.get(
    "/users",
    // async (req: Request, res: Response, next: NextFunction) => {
    // //   logger.debug(
    // //     "Calling chart GET endpoint /launch with query: %o",
    // //     req.query
    // //   );
    // //   try {
    // //     const launchServiceInstance = Container.get(LaunchService);
    // //     const data = await launchServiceInstance.getProjects();
    // //     return res.status(201).json(data);
    // //   } catch (e) {
    // //     logger.error("🔥 error: %o", e);
    // //     return next(e);
    //   }
    // }
  );
};