import { Router } from "express";
import chart from "./routes/chart";
import mev from "./routes/mev";
import subscribe from "./routes/subscribe";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  chart(app);
  mev(app);
  subscribe(app);

  return app;
};
