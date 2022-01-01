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
      'userModel',
      'farmModel'
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
    Container.set("runningFlag", {});

    const constantLoader = {
      'bsc-main': {
        chainId: 56,
        web3: Web3Instances["bsc-main"],
        logger: Container.get("logger")
      },
      'bsc-test': {
        chainId: 97,
        web3: Web3Instances["bsc-test"],
        logger: Container.get("logger")
      }
    }
    Container.set("constantLoader", constantLoader);

  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
