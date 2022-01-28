import "reflect-metadata";
import config from "./config";
import express from "express";
import Logger from "./loaders/logger";
import TokenPriceService from "./services/tokenPrice";
import { Container } from "typedi";
import formidable from "express-formidable"

async function startServer() {
  const app = express();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/
  await require("./loaders").default({ expressApp: app });

  //write here just for testing , u should write the service function in crontab.ts
  // const logger = Container.get("logger");
  // const constantsBscMain = Container.get("constantLoader")['bsc-main'];
  // const modelsBscMain    = Container.get('connections')['bsc-main'];
  // const tokenPriceServiceBscMain = new TokenPriceService(modelsBscMain,logger,constantsBscMain.chainId);
  // setInterval(() => tokenPriceServiceBscMain.updateTokensPriceList(constantsBscMain.chainId), 30000);
  app.use(formidable());

  app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
    })
    .on("error", (err) => {
      Logger.error(err);
      process.exit(1);
    });
}


startServer();