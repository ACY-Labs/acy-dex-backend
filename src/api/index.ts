import { Router } from "express";
import pool from "./routes/pool";
import chart from "./routes/chart";
import mev from "./routes/mev";
import subscribe from "./routes/subscribe";
<<<<<<< HEAD
=======
import launchpad from "./routes/launchpad";
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
import poolVolume from "./routes/poolVolume";
import farm from "./routes/farm";
import userInfo from "./routes/user";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  pool(app);
  chart(app);
  mev(app);
  subscribe(app);
<<<<<<< HEAD
=======
  launchpad(app);
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
  poolVolume(app);
  farm(app);
  userInfo(app);


  return app;
};
