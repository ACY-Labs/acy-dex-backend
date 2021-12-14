import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
<<<<<<< HEAD
<<<<<<< HEAD
import { Logger } from "winston";
import UserService from "../../services/user";
=======
import UserService from "../../services/user";
import { Logger } from "winston";
>>>>>>> 00c14da (UserInfo data base added)
=======
import { Logger } from "winston";
import UserService from "../../services/user";
>>>>>>> 56d4b13 ((userInfo) : swapAmount, TotalFee and # of transactions)

const route = Router();

export default (app: Router) => {
<<<<<<< HEAD
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

=======
  app.use("/users", route);
const userService = Container.get(UserService);
>>>>>>> 56d4b13 ((userInfo) : swapAmount, TotalFee and # of transactions)
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
<<<<<<< HEAD
};
>>>>>>> 00c14da (UserInfo data base added)
=======

};
>>>>>>> 56d4b13 ((userInfo) : swapAmount, TotalFee and # of transactions)
