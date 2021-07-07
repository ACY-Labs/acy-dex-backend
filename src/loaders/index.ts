import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import dependencyInjectorLoader from "./dependencyInjector";
import clients from "./clients";
import Logger from "./logger";

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  /**
   * We are injecting the mongoose models into the DI container.
   * I know this is controversial but will provide a lot of flexibility at the time
   * of writing unit tests, just go and check how beautiful they are!
   */
  const rateModel = {
    name: "rateModel",
    // Notice the require syntax and the '.default'
    model: require("../models/rate").default,
  };

  await dependencyInjectorLoader({
    mongoConnection,
    models: [
      rateModel,
      // salaryModel,
      // whateverModel
    ],
    clients,
  });
  Logger.info("✌️ Dependency Injector loaded");

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
