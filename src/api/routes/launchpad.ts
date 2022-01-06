import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import LaunchService from "../../services/launch";
import { Logger } from "winston";
import { InvalidatedProjectKind } from "typescript";

const route = Router();

export default (app: Router) => {
  // route prefix
  app.use("/launch", route);

  const logger: Logger = Container.get("logger");
  route.get(
    "/projects",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /launch/projects with query: %o",
        req.query
      );
      try {
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.getProjects();
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/projects/:projectsId",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /launch/projectbyID with query: %o",
        req.query
      );
      try {
        const {projectsId} = req.params;
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.getProjectsByID(projectsId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/allocation/require",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /launch/test with query: %o",
        req.query
      );

      try {
        const { walletId, projectToken } = req.query;
        if (!walletId || !projectToken) {
          throw new Error("lack of request parameters");
        }
        logger.debug("req", req)
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.requireAllocation(walletId, projectToken);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/allocation/use",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { walletId, projectToken, amount } = req.query;
        if (!walletId || !projectToken || !amount) {
          throw new Error("lack of request parameters");
        }

        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.useAllocation(walletId, projectToken, amount);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/allocation/bonus",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { walletId, projectToken, bonusName } = req.query;
        if (!walletId || !projectToken || !bonusName) {
          throw new Error("lack of request parameters");
        }

        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.bonusAllocation(walletId, projectToken, bonusName);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/allocation",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /launch/test with query: %o",
        req.query
      );

      try {
        const { walletId, projectToken } = req.query;
        if (!walletId || !projectToken) {
          throw new Error("lack of request parameters");
        }
        console.log("constants", req)
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.getAllocationInfo(walletId, projectToken);
        console.log("allocation data", data)
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/purchase/record",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { walletId, projectToken, amount } = req.query;
        if (!walletId || !projectToken || !amount) {
          throw new Error("lack of request parameters");
        }

        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.purchaseRecord(walletId, projectToken, amount);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/vesting/record",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { walletId, projectToken, amount } = req.query;
        if (!walletId || !projectToken || !amount) {
          throw new Error("lack of request parameters");
        }

        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.vestingRecord(walletId, projectToken, amount);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

};