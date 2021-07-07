import { Container } from "typedi";
import LoggerInstance from "./logger";
import config from "../config";
import GQLClient from "../clients/GQLclients";

export default ({
  mongoConnection, // for agenda
  models,
  clients,
}: {
  mongoConnection;
  models: { name: string; model: any }[];
  clients: Array<GQLClient>;
}) => {
  try {
    models.forEach((m) => {
      Container.set(m.name, m.model);
    });
    clients.forEach((c) => {
      Container.set(c.name, c);
    });

    Container.set("logger", LoggerInstance);
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
