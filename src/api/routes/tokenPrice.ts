import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
// import ChartService from "../../services/chart";
import { Logger } from "winston";

import TokenPrice from "../../models/tokenPrice";

const route = Router();


export default (app: Router) =>  {
    app.use("/tokenPrice", route);
    const logger: Logger = Container.get("logger");

    route.get("./getList",async (req: Request, res: Response, next: NextFunction)=>{
        return ("Nothing")
    })

}