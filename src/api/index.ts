import { Router } from "express";
import pool from "./routes/pool";
import chart from "./routes/chart";
import mev from "./routes/mev";
import subscribe from "./routes/subscribe";
import poolVolume from "./routes/poolVolume";
import launchpad from "./routes/launchpad";
import farm from "./routes/farm";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  pool(app);
  chart(app);
  mev(app);
  subscribe(app);
  poolVolume(app);
  launchpad(app);
  farm(app);


  return app;
};
