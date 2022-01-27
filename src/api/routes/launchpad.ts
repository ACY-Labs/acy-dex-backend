import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import LaunchService from "../../services/launch";
import { Logger } from "winston";
import { InvalidatedProjectKind } from "typescript";

const route = Router();
const testForm = {
  "username": "Austinbaba",
  "projectname": "Austin",
  "email": "2001beijing@163.com",
  "websiteURL": "http://localhost:8000/#/launchpad/applyProject",
  "logoURL": "http://localhost:8000/#/launchpad/applyProject",
  "description": "I am super maN",
  "category": "None",
  "projectIn": "None",
  "whitepaperLINK": "http://localhost:8000/#/launchpad/applyProject",
  "githubLINK": "http://localhost:8000/#/launchpad/applyProject",
  "telegramLINK": "http://localhost:8000/#/launchpad/applyProject",
  "twitterLINK": "http://localhost:8000/#/launchpad/applyProject",
  "linkedinLINK": "http://localhost:8000/#/launchpad/applyProject",
  "discordLINK": "http://localhost:8000/#/launchpad/applyProject",
  "symbol": "ABA",
  "address": "http://localhost:8000/#/launchpad/applyProject",
  "supply": "1000000",
  "ecolink": "http://localhost:8000/#/launchpad/applyProject",
  "idoDate": "101",
  "start": "102",
  "ended": "103",
  "vestingStart": "50",
  "vestingMonth": "50",
  "vestingDate": "10",
  "idoPrice": "10000",
  "raise": "10000",
  "marketcap": "10000",
  "sale": "10"
}

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

  // This route only used while developing
  route.get(
    "/projects/add",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.createProjects();
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
        const { projectsId } = req.params;
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.getProjectsByID(projectsId);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.post(
    "/projects/apply",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /launch/projectbyID with query: %o",
        req.query
      );
      try {
        console.log("Hello",req.body);
        return res.status(201);
      }
      catch (e) {
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
        const { walletId, bonusName, T } = req.query;
        if (!walletId || !bonusName || !T) {
          throw new Error("lack of request parameters");
        }

        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.bonusAllocation(walletId, bonusName, T);
        return res.status(201).json({
          code: 0,
          msg: data
        });
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
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.getAllocationInfo(walletId, projectToken);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/allocation/getAll",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /allocation/getAll with query: %o",
        req.query
      );

      try {
        const { projectToken } = req.query;
        if (!projectToken) {
          throw new Error("lack of request parameters");
        }
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.getAllAllocationInfo(projectToken);
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.get(
    "/allocation/updateOne",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling chart GET endpoint /allocation/updateOne with query: %o",
        req.query
      );

      try {
        const { walletId, projectToken, amount } = req.query;
        if (!projectToken || !projectToken) {
          throw new Error("lack of request parameters");
        }
        let amount_ = amount
        if (!amount) amount_ = 0
        const launchServiceInstance = new LaunchService(req.models, req.constants, logger);
        const data = await launchServiceInstance.updateOneAllocationInfo(walletId, projectToken, amount_);
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