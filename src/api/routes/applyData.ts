import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
// import ChartService from "../../services/chart";
import { Logger } from "winston";

import ApplyData from "../../models/applyData";

const route = Router();


export default (app: Router) =>  {
    app.use("/applyForm", route);
    const logger: Logger = Container.get("logger");

    route.post("./createForm",async (req: Request, res: Response, next: NextFunction)=>{
        return ("Nothing")
    })

}