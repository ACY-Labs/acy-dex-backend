import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
// import ChartService from "../../services/chart";
import { Logger } from "winston";
import LaunchChartService from "../../services/launchChart";

import LaunchChart from "../../models/launchChart";

const route = Router();

// http://localhost:3001/bsc-test/api/launchChart/getAllocationSum
export default (app: Router) =>  {
    app.use("/launchChart", route);
    const logger: Logger = Container.get("logger");

    route.get("/getChartData",async (req: Request, res: Response, next: NextFunction)=>{

        logger.debug(
            "fetching allocation Chart Data ",
            req.query
        );

        try{
            const LaunchChartServiceInstance = new LaunchChartService(req.models,req.constants);
            const data = await LaunchChartServiceInstance.getData(req.query.poolId);
            return res.status(201).json(data);
        }
        catch(e) {
            logger.error("🔥 error: %o", e);
            return next(e);        }
    })

    route.post("/addChartData",async (req:Request, res: Response, next:NextFunction)=> {

        try{
            const LaunchChartServiceInstance = new LaunchChartService(req.models,req.constants);
            const data = await LaunchChartServiceInstance.addSaleData(req.query.poolId,req.query.token,req.query.sale,req.query.time);
            return res.status(201).json(data)
        }
        catch(e){

        }
    })

}