import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
<<<<<<< HEAD
import { Logger } from "winston";
import UserService from "../../services/user";
=======
import UserService from "../../services/user";
import { Logger } from "winston";
>>>>>>> 00c14da (UserInfo data base added)

const route = Router();

export default (app: Router) => {
<<<<<<< HEAD
  app.use("/users", route);
const userService = Container.get(UserService);
  const logger: Logger = Container.get("logger");

  route.get(
    "/swap",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart POST endpoint /swap with query: %o",
        req.query
      );
      try {
        await userService.performTx(req.query);
        return res.status(201).json({response : "Success!"});
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

};
=======
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
>>>>>>> 00c14da (UserInfo data base added)
