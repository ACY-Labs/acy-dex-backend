import { Container } from "typedi";
import LoggerInstance from "./logger";
import config from "../config";
import Web3 from "web3";

export default ({
  mongoConnections
}: {
  mongoConnections: Object
}) => {
  try {
    Container.set('connections', mongoConnections);

    const modelList = [
      'pairModel',
      'rateModel',
      'subscriberModel',
      'userPoolModel',
      'pairVolumeModel',
      'txListModel',
      'launchModel',
      'userLaunchModel',
      'userInfoModel',
      'farmModel',
      'tokenPriceModel',
    ]

    // TODO: to be removed
    for(var connection in mongoConnections) {
      modelList.forEach(modelName => {
        Container.set(modelName, connection[modelName])
      })
    }

    Container.set("cache", {});
    let Web3Instances: Web3[] = Object.keys(config.rpcURL).map(network => new Web3(config.rpcURL[network]))
    Container.set("web3", Web3Instances);
    Container.set("logger", LoggerInstance);
    Container.set("tasks", {});
    Container.set("allocationCache", {});

    Container.set(`net${56}runningFlag`, {});
    Container.set(`net${97}runningFlag`, {});
    Container.set(`net${137}runningFlag`, {});

    const constantLoader = {
      'bsc-main': {
        chainId: 56,
        web3: config.rpcURL["bsc-main"],
        logger: Container.get("logger")
      },
      'bsc-test': {
        chainId: 97,
        web3: config.rpcURL["bsc-test"],
        logger: Container.get("logger")
      },
      'polygon-main': {
        chainId: 137,
        web3: config.rpcURL["polygon-main"],
        logger: Container.get("logger")
      },
      'polygon-test': {
        chainId: 80001,
        web3: Web3Instances["polygon-test"],
        logger: Container.get("logger")
      }
    }
    Container.set("constantLoader", constantLoader);

  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
