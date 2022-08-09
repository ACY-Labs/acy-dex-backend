import expressLoader from "./express";
import mongooseConnector from "./mongoose";
import dependencyInjectorLoader from "./dependencyInjector";
import Logger from "./logger";
import config from "../config";
import { Connection } from "mongoose";

export default async ({ expressApp }, isExpress=true) => {

  // 连接所有DB，并加载所有Schema，因为await的原因所以暂时没法用for
  // TODO: async Foreach
  const mongoConnections = {
    'bsc-main': {},
    'bsc-test': {},
    'polygon-main': {},
    'polygon-test': {}
  };

  mongoConnections['bsc-main'] = {
    'conn': await mongooseConnector(config.databases['bsc-main'])
  }
  mongoConnections['bsc-test'] = {
    'conn': await mongooseConnector(config.databases['bsc-test'])
  }
  mongoConnections['polygon-main'] = {
    'conn': await mongooseConnector(config.databases['polygon-main'])
  }
  mongoConnections['polygon-test'] = {
    'conn': await mongooseConnector(config.databases['polygon-test'])
  }
  
  Logger.info("✌️ DB loaded and connected!");
  Logger.info(Object.keys(mongoConnections));
  Object.keys(mongoConnections).forEach(network => {
    let conn: Connection = mongoConnections[network]['conn'];
    const networkName = network;
    Logger.info(`Loading network:: ${networkName}`);
    mongoConnections[network]['pairModel'] = conn.model('pair', require("../models/pair").default);
    mongoConnections[network]['rateModel'] = conn.model('rate', require("../models/rate").default);
    mongoConnections[network]['subscriberModel'] = conn.model('subscriber', require("../models/subscriber").default);
    mongoConnections[network]['userPoolModel'] = conn.model('userPool', require("../models/userPool").default);
    mongoConnections[network]['pairVolumeModel'] = conn.model('pairVolume', require("../models/pairVolume").default);
    mongoConnections[network]['txListModel'] = conn.model('txList', require("../models/tx").default);
    mongoConnections[network]['launchModel'] = conn.model('launch', require("../models/launch").default);
    mongoConnections[network]['userLaunchModel'] = conn.model('userLaunch', require("../models/userLaunch").default);
    mongoConnections[network]['userInfoModel'] = conn.model('user', require("../models/userInfo").default);
    mongoConnections[network]['farmModel'] = conn.model('farm', require("../models/farm").default);
    mongoConnections[network]['tokenPriceModel'] = conn.model('tokenPrice',require("../models/tokenPrice").default);
    mongoConnections[network]['voteModel'] = conn.model('vote',require("../models/vote").default);

  })
  Logger.info("✌️ DB Models establised");

  await dependencyInjectorLoader({mongoConnections});
  Logger.info("✌️ Dependency Injector loaded");

  if(isExpress) {
    expressLoader({ app: expressApp });
    Logger.info("✌️ Express loaded");
  }
};
