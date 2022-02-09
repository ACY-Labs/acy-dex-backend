import { Router } from "express";
import pool from "./routes/pool";
import chart from "./routes/chart";
import mev from "./routes/mev";
import subscribe from "./routes/subscribe";
import launchpad from "./routes/launchpad";
import poolVolume from "./routes/poolVolume";
import farm from "./routes/farm";
import userInfo from "./routes/user";
import txList from "./routes/txList";
import tokenPrice from "./routes/tokenPrice";
import applyData from "./routes/applyData";
import launchChart from "./routes/launchChart";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  pool(app);
  chart(app);
  mev(app);
  subscribe(app);
  launchpad(app);
  poolVolume(app);
  farm(app);
  userInfo(app);
  txList(app);
  tokenPrice(app);
  applyData(app);
  launchChart(app);

  return app;
};
