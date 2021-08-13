import { Router } from "express";
import chart from "./routes/chart";
import mev from "./routes/mev";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  chart(app);
  mev(app);

  return app;
};
