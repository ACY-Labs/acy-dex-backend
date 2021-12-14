import { Router } from "express";
import pool from "./routes/pool";
import chart from "./routes/chart";
import mev from "./routes/mev";
import subscribe from "./routes/subscribe";
import launchpad from "./routes/launchpad";
import poolVolume from "./routes/poolVolume";
import userInfo from "./routes/user";
import farm from "./routes/farm";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  pool(app);
  chart(app);
  mev(app);
  subscribe(app);
  launchpad(app);
  poolVolume(app);
  userInfo(app);
  farm(app);

  return app;
};
