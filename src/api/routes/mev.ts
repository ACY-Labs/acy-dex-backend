import { Router, Request, Response, NextFunction } from "express";
import { Container } from "typedi";
import { Logger } from "winston";
import { cacheMiddleware } from "../../middleware";
const { createProxyMiddleware } = require("http-proxy-middleware");
import apicache from "apicache";

let cache = apicache.middleware;

const route = Router();

const API_SERVICE_URL = "https://data.flashbots.net/";

export default (app: Router) => {
  // route prefix
  app.use(
    "/mev",
    cache("5 minutes"),
    createProxyMiddleware({
      target: API_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        [`^/api/mev`]: "",
      },
    })
  );
};
