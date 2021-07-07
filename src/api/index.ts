import { Router } from "express";
import chart from "./routes/chart";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  chart(app);

  return app;
};
