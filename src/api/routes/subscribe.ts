import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import SubscribeService from "../../services/subscribe";
import { Logger } from "winston";
const { check, validationResult } = require("express-validator");
const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/subscribe", route);

  const logger: Logger = Container.get("logger");

  route.post(
    "/add",
    check("email").exists(),
    check("email").normalizeEmail().isEmail(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const subscribeServiceInstance = Container.get(SubscribeService);
        var err = validationResult(req);
        let status: Number = 200;
        let message: String = "Default message";
        if (!err.isEmpty()) {
          console.log(err.mapped());
          status = 400;
          message = "Email format error";
        } else {
          [status, message] = await subscribeServiceInstance.subscribe(
            req.body,
            req.ip
          );
          console.log(status, message);
        }

        return res.status(status).json(message);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
