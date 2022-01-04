import "reflect-metadata";

import config from "./config";

import express from "express";

import Logger from "./loaders/logger";

import { Container } from "typedi";
// import indexService from "./indexer";
import poolVolumeService from "./services/poolVolume";
import TxService from "./services/tx"
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

  const constantsBscMain = Container.get("constantLoader")['bsc-main'];
  const modelsBscMain    = Container.get('connections')['bsc-main'];

  const constantsBscTest = Container.get("constantLoader")['bsc-test'];
  const modelsBscTest   = Container.get('connections')['bsc-test'];

  const constantsPolaygonMain = Container.get("constantLoader")['polygon-main'];
  const modelsPolaygonMain    = Container.get('connections')['polygon-main'];

  const constantsPolaygonTest = Container.get("constantLoader")['polygon-test'];
  const modelsPolaygonTest    = Container.get('connections')['polygon-test'];

  const logger = Container.get("logger");

  //bsc-main service
  const poolServiceBscMain = new poolVolumeService(modelsBscMain, constantsBscMain.chainId);
  setInterval(() => poolServiceBscMain.updateVolumeData(), 300000);
  const txServiceBscMain = new TxService(modelsBscMain, constantsBscMain.chainId);
  setInterval(() => txServiceBscMain.updateTxList(), 60000);
  const farmServiceBscMain = new FarmService(modelsBscMain, logger, constantsBscMain.chainId);
  setInterval(() => farmServiceBscMain.massUpdateFarm(), 600000);

  //bsc-test service
  const poolServiceBscTest = new poolVolumeService(modelsBscTest, constantsBscTest.chainId);
  setInterval(() => poolServiceBscTest.updateVolumeData(), 300000);
  const txServiceBscTest = new TxService(modelsBscTest, constantsBscTest.chainId);
  setInterval(() => txServiceBscTest.updateTxList(), 60000);
  const farmServiceBscTest = new FarmService(modelsBscTest, logger, constantsBscTest.chainId);
  setInterval(() => farmServiceBscTest.massUpdateFarm(), 600000);

  //polygon-main service
  const poolServicePolygonMain = new poolVolumeService(modelsPolaygonMain, constantsPolaygonMain.chainId);
  setInterval(() => poolServicePolygonMain.updateVolumeData(), 300000);
  const txServicePolygonMain = new TxService(modelsPolaygonMain, constantsPolaygonMain.chainId);
  setInterval(() => txServicePolygonMain.updateTxList(), 60000);
  const farmServicePolygonMain = new FarmService(modelsPolaygonMain, logger, constantsPolaygonMain.chainId);
  setInterval(() => farmServicePolygonMain.massUpdateFarm(), 600000);

  //polygon-test service
  const poolServicePolygonTest = new poolVolumeService(modelsPolaygonTest, constantsPolaygonTest.chainId);
  setInterval(() => poolServicePolygonMain.updateVolumeData(), 300000);
  const txServicePolygonTest = new TxService(modelsPolaygonTest, constantsPolaygonTest.chainId);
  setInterval(() => txServicePolygonMain.updateTxList(), 60000);
  const farmServicePolygonTest = new FarmService(modelsPolaygonTest, logger, constantsPolaygonTest.chainId);
  setInterval(() => farmServicePolygonMain.massUpdateFarm(), 600000);

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