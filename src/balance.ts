import "reflect-metadata";
import { Container } from "typedi";
import { createTask } from "./util/crontils";

async function startTasks() {
  await require("./loaders").default({}, false);
  const logger = Container.get('logger');
  
}

startTasks();