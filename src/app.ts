import "reflect-metadata";

import config from "./config";

import express from "express";

import Logger from "./loaders/logger";

import { Container } from "typedi";
// import indexService from "./indexer";
// import poolVolumeService from "./services/poolVolume";
// import TxService from "./services/tx"
// import FarmService from "./services/farm"

async function startServer() {
  const app = express();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/
  await require("./loaders").default({ expressApp: app });
  // const poolService = Container.get(poolVolumeService);
  // setInterval(() => poolService.updateVolumeData(), 300000);

  // const txService = Container.get(TxService);
  // setInterval(() => txService.updateTxList(), 60000);

  // const farmService = Container.get(FarmService);
  // setInterval(() => farmService.massUpdateFarm(97), 30000);

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