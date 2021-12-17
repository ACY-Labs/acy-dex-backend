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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  route.post(
=======
  route.get(
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
  route.get(
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
=======
  route.post(
>>>>>>> 57eb6823a8165e5ea936d014ce5670df8b692d2b
>>>>>>> 3401f56817e94faeb741c095b66c36e5bf210629
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

  route.get(

    "/all",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart POST endpoint /swap with query: %o",
        req.query
      );
      try {
        let data = await userService.getAllUsers(req.query);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

};
