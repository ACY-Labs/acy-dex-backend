import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import VoteService from "../../services/vote";

const route = Router();

export default (app: Router) => {
  app.use("/vote",route);
  const logger: Logger = Container.get("logger");
  route.post(
    "/addvote",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling vote POST endpoint /vote"
      );
      try {
        const voteService = new VoteService(req.constants, req.models, logger)
        const walletId = req.query.walletId;
        const result = await voteService.createVote(walletId, req.body);
        if(result) {
          return res.status(201).json({'msg': 'vote success'});
        } else {
          return res.status(400).json({'msg': 'vote failed, user had already voted this week'});
        }
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
        "Calling vote GET endpoint /all"
      );
      try {
        const voteService = new VoteService(req.constants, req.models, logger)
        let data = await voteService.getAllVotes();
        return res.status(200).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
  route.get(
    "/result",
    async (req: Request, res: Response, next: NextFunction) => {
      logger.debug(
        "Calling vote GET endpoint /result"
      );
      try {
        const voteService = new VoteService(req.constants, req.models, logger)
        const {from,to} = req.query;
        let data = await voteService.getVotes(from,to);
        return res.status(200).json(data);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  )
}