import "reflect-metadata";
import { Container } from "typedi";
import { createTask } from "./util/crontils";

import poolVolumeService from "./services/poolVolume";
import TxService from "./services/tx";
import FarmService from "./services/farm";
import TokenPriceService from "./services/tokenPrice"

async function startTasks() {
  await require("./loaders").default({}, false);

  const logger = Container.get('logger');

  const constantsBscMain = Container.get("constantLoader")['bsc-main'];
  const modelsBscMain    = Container.get('connections')['bsc-main'];

  const constantsPolaygonMain = Container.get("constantLoader")['polygon-main'];
  const modelsPolaygonMain    = Container.get('connections')['polygon-main'];

  // Pool service
  const poolServiceBscMain = new poolVolumeService(modelsBscMain, constantsBscMain.chainId);
  const updateVolumeTaskBscMain = createTask("* * * * *", () => poolServiceBscMain.updateVolumeData());

  const poolServicePolygonMain = new poolVolumeService(modelsPolaygonMain, constantsPolaygonMain.chainId);
  const updateVolumeTaskPolygonMain = createTask("* * * * *", () => poolServicePolygonMain.updateVolumeData());

  // TX service
  const txServiceBscMain = new TxService(modelsBscMain, constantsBscMain.chainId);
  const updateTxListBscMain = createTask("* * * * *", () => txServiceBscMain.updateTxList());

  const txServicePolygonMain = new TxService(modelsPolaygonMain, constantsPolaygonMain.chainId);
  const updateTxListPolygonMain = createTask("* * * * *", () => txServicePolygonMain.updateTxList());

  // Farm Service
  const farmServiceBscMain = new FarmService(modelsBscMain, logger, constantsBscMain.chainId);
  const massUpdateFarmBscMain = createTask("* * * * *", () => farmServiceBscMain.massUpdateFarm());
  
  const farmServicePolygonMain = new FarmService(modelsPolaygonMain, logger, constantsPolaygonMain.chainId);
  const massUpdatePolygonBscMain = createTask("* * * * *", () => farmServicePolygonMain.massUpdateFarm());

  //Token Price Service
  const tokenPriceServiceBscMain = new TokenPriceService(modelsBscMain,logger,constantsBscMain.chainId);
  const updateTokenPriceListBscMain = createTask("* * * * *",() => tokenPriceServiceBscMain.updateTokensPriceList(constantsBscMain.chainId))

  

  updateVolumeTaskBscMain.start()
  updateVolumeTaskPolygonMain.start()
  updateTxListBscMain.start()
  updateTxListPolygonMain.start()
  massUpdateFarmBscMain.start()
  massUpdatePolygonBscMain.start()

  // updateTokenPriceListBscMain.start()

  this.logger.debug("111111111111")
}

startTasks();