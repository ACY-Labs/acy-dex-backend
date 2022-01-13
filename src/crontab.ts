import "reflect-metadata";
import { Container } from "typedi";
import { createTask } from "./util/crontils";

import poolVolumeService from "./services/poolVolume";
import TxService from "./services/tx";
import FarmService from "./services/farm";
import TokenPriceService from "./services/tokenPrice"
import LaunchService from "./services/launch"

async function startTasks() {
  await require("./loaders").default({}, false);

  const logger = Container.get('logger');

  const constantsBscMain = Container.get("constantLoader")['bsc-main'];
  const modelsBscMain    = Container.get('connections')['bsc-main'];
  const constantsBscTest = Container.get("constantLoader")['bsc-test'];
  const modelsBscTest    = Container.get('connections')['bsc-test'];

  const constantsPolaygonMain = Container.get("constantLoader")['polygon-main'];
  const modelsPolaygonMain    = Container.get('connections')['polygon-main'];

  // Pool service
  const poolServiceBscMain = new poolVolumeService(modelsBscMain, constantsBscMain.chainId);
  const updateVolumeTaskBscMain = createTask("0,15,30,45 * * * *", () => poolServiceBscMain.updateVolumeData());

  const poolServicePolygonMain = new poolVolumeService(modelsPolaygonMain, constantsPolaygonMain.chainId);
  const updateVolumeTaskPolygonMain = createTask("0,15,30,45 * * * *", () => poolServicePolygonMain.updateVolumeData());

  // TX service
  const txServiceBscMain = new TxService(modelsBscMain, constantsBscMain.chainId);
  const updateTxListBscMain = createTask("* * * * *", () => txServiceBscMain.updateTxList());

  const txServicePolygonMain = new TxService(modelsPolaygonMain, constantsPolaygonMain.chainId);
  const updateTxListPolygonMain = createTask("* * * * *", () => txServicePolygonMain.updateTxList());

  // Farm Service
  const farmServiceBscMain = new FarmService(modelsBscMain, logger, constantsBscMain.chainId);
  const massUpdateFarmBscMain = createTask("0,10,20,30,40,50 * * * *", () => farmServiceBscMain.massUpdateFarm());
  
  const farmServicePolygonMain = new FarmService(modelsPolaygonMain, logger, constantsPolaygonMain.chainId);
  const massUpdatePolygonBscMain = createTask("0,10,20,30,40,50 * * * *", () => farmServicePolygonMain.massUpdateFarm());

  //Token Price Service
  const tokenPriceServiceBscMain = new TokenPriceService(modelsBscMain,logger,constantsBscMain.chainId);
  const updateTokenPriceListBscMain = createTask("* * * * *",() => tokenPriceServiceBscMain.updateTokensPriceList(constantsBscMain.chainId))
  const tokenPriceServiceBscTest = new TokenPriceService(modelsBscMain,logger,constantsBscTest.chainId);
  const updateTokenPriceListBscTest = createTask("* * * * *",() => tokenPriceServiceBscTest.updateTokensPriceList(constantsBscTest.chainId))

  // allocation parameter service
  const launchServiceBscMain = new LaunchService(modelsBscMain, {web3: "", chainId: 56}, logger)
  const allocationParameterBscMain = createTask("0,10,20,30,40,50 * * * *", () => launchServiceBscMain.updateAllAllocationParameters())
  const launchServicePolygonMain = new LaunchService(modelsPolaygonMain, {web3: "", chainId: 137}, logger)
  const allocationParameterPolygonMain = createTask("0,10,20,30,40,50 * * * *", () => launchServicePolygonMain.updateAllAllocationParameters())

  // ***** mean every minute 

  console.log("start services")

  updateVolumeTaskBscMain.start()
  updateVolumeTaskPolygonMain.start()
  updateTxListBscMain.start()
  updateTxListPolygonMain.start()
  massUpdateFarmBscMain.start()
  massUpdatePolygonBscMain.start()

  updateTokenPriceListBscMain.start()
  updateTokenPriceListBscTest.start()

  allocationParameterBscMain.start()
  allocationParameterPolygonMain.start()
}

startTasks();