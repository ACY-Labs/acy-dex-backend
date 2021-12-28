import { Container } from "typedi";
import LoggerInstance from "./logger";
import config from "../config";
import Web3 from "web3";

export default ({
  mongoConnection, // for agenda
  models,
}: {
  mongoConnection;
  models: { name: string; model: any }[];
}) => {
  try {
    models.forEach((m) => {
      Container.set(m.name, m.model);
    });

    let Web3Instance: Web3 = new Web3(config.rpcURL);
    Container.set("cache", {});
    Container.set("web3", Web3Instance);
    Container.set("logger", LoggerInstance);
    Container.set("runningFlag", {});
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
