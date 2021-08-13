import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import ChartService from "../../services/chart";
import { Logger } from "winston";
const { createProxyMiddleware } = require("http-proxy-middleware");

const route = Router();

const API_SERVICE_URL = "https://data.flashbots.net/";

export default (app: Router) => {
  // route prefix
  app.use(
    "/mev",
    createProxyMiddleware({
      target: API_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        [`^/api/mev`]: "",
      },
    })
  );
};
