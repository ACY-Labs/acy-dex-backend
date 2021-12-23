import "reflect-metadata";

import config from "./config";

import express from "express";

import Logger from "./loaders/logger";

import { Container } from "typedi";
import indexService from "./indexer";
import poolVolumeService from "./services/poolVolume"
import FarmService from "./services/farm"

async function startServer() {
  const app = express();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/
  await require("./loaders").default({ expressApp: app });
  const poolService = Container.get(poolVolumeService);
  const farmService = Container.get(FarmService);
  setInterval(() => poolService.updateVolumeData(), 300000);
  setInterval(() => farmService.massUpdateFarm(), 600000);

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