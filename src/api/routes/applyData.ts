import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
// import ChartService from "../../services/chart";
import { Logger } from "winston";
import ApplyDataService from "../../services/applyData";

import ApplyData from "../../models/applyData";

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

const route = Router();


export default (app: Router) =>  {
    app.use("/applyForm", route);
    const logger: Logger = Container.get("logger");

    route.post("/createForm",async (req: Request, res: Response, next: NextFunction)=>{
        logger.debug(
          "Calling POST endpoint /applyForm/createForm with query: %o",
          req.query
        );
        try {
          const applyServiceInstance = new ApplyDataService(req.models, req.constants, logger);
          let data = await applyServiceInstance.createForm(req.query.walletId,req.body);


          return res.status(201).json(data);
        }catch (e) {
          logger.error("🔥 error: %o", e);
          return next(e);
        }
      });

    route.get("/checkUser", async  (req: Request, res: Response, next: NextFunction)=>{
      logger.debug(
        "Calling GET endpoint /applyForm/checkUser with query: %o",
        req.query
      );
      try{
        const applyServiceInstance = new ApplyDataService(req.models, req.constants, logger);
        let data = await applyServiceInstance.checkForm(req.query.walletId);


        return res.status(201).json(data);

      
      } catch(e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    })

    route.get("/getForm", async  (req: Request, res: Response, next: NextFunction)=>{
      logger.debug(
        "Calling GET endpoint /applyForm/checkUser with query: %o",
        req.query
      );
      try{
        const applyServiceInstance = new ApplyDataService(req.models, req.constants, logger);
        let data = await applyServiceInstance.getForm();

        

        return res.status(201).json(data);
      } catch(e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    })

}