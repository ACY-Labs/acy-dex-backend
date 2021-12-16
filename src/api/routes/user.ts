import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import UserService from "../../services/user";

const route = Router();

export default (app: Router) => {
  app.use("/users", route);
const userService = Container.get(UserService);
  const logger: Logger = Container.get("logger");

<<<<<<< HEAD
  route.post(
=======
  route.get(
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
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
