import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import PoolVolumeService from "../../services/poolVolume";

const route = Router();

export default (app: Router) => {
  app.use("/poolchart", route);
const poolVolumeService = Container.get(PoolVolumeService);
  const logger: Logger = Container.get("logger");

  route.get(
    "/all",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling pool GET endpoint /poolchart/all with query: %o",
        req.query
      );
      try {
        // const token0 = req.query.token0;
        // const token1 = req.query.token1;
        // const data = await poolVolumeService.getVolumeOfTokens(token0,token1);
        const data = await poolVolumeService.getAllPairs();
        return res.status(201).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );



//   route.post(
//     "/pair",
//     async (req: Request, res: Response, next: NextFunction) => {
//       logger.debug(
//         "Calling chart POST endpoint /swap with query: %o",
//         req.query
//       );
//       try {
//         const chartServiceInstance = Container.get(ChartService);
//         const data = await chartServiceInstance.getSwapRate(
//           req.query.token0,
//           req.query.token1,
//           req.query.range
//         );
//         return res.status(201).json(data);
//       } catch (e) {
//         logger.error("🔥 error: %o", e);
//         return next(e);
//       }
//     }
//   );
};
