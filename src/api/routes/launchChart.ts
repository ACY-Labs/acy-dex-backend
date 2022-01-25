import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
// import ChartService from "../../services/chart";
import { Logger } from "winston";

import LaunchChart from "../../models/launchChart";

const route = Router();


export default (app: Router) =>  {
    app.use("/launchChart", route);
    const logger: Logger = Container.get("logger");

    route.post("./createForm",async (req: Request, res: Response, next: NextFunction)=>{
        return ("Nothing")
    })

}