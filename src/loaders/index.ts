import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import dependencyInjectorLoader from "./dependencyInjector";
import Logger from "./logger";

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  /**
   * We are injecting the mongoose models into the DI container.
   * I know this is controversial but will provide a lot of flexibility at the time
   * of writing unit tests, just go and check how beautiful they are!
   */
  const pairModel = {
    name: "pairModel",
    // Notice the require syntax and the '.default'
    model: require("../models/pair").default,
  };

  const subscriberModel = {
    name: "subscriberModel",
    // Notice the require syntax and the '.default'
    model: require("../models/subscriber").default,
  };

  const userPoolModel = {
    name: "userPoolModel",
    model: require("../models/userPool").default
  };

  await dependencyInjectorLoader({
    mongoConnection,
    models: [
      pairModel,
      subscriberModel,
      userPoolModel,
      // salaryModel,
      // whateverModel
    ],
  });
  Logger.info("✌️ Dependency Injector loaded");

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
