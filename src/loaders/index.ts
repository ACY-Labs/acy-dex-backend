import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import dependencyInjectorLoader from "./dependencyInjector";
import Logger from "./logger";
import userLaunch from "../models/userLaunch";

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

  const rateModel = {
    name: "rateModel",
    // Notice the require syntax and the '.default'
    model: require("../models/rate").default,
  };

  const subscriberModel = {
    name: "subscriberModel",
    // Notice the require syntax and the '.default'
    model: require("../models/subscriber").default,
  };

  const userPoolModel = {
    name: "userPoolModel",
    model: require("../models/userPool").default,
  };

  const pairVolumeModel = {
    name: "pairVolumeModel",
    model: require("../models/pairVolume").default,
  };

  const launchModel = {
    name: "launchModel",
    model: require("../models/launch").default,
  };

  const userLaunchModel = {
    name: "userLaunchModel",
    model: require("../models/userLaunch").default,
  }

  const userModel = {
    name:"userModel",
    model:require("../models/userInfo").default,
  }
  
  const farmModel = {
    name: "farmModel",
    model: require("../models/farm").default,
  };


  await dependencyInjectorLoader({

    mongoConnection,
    models: [
      pairModel,
      rateModel,
      subscriberModel,
      userPoolModel,
      pairVolumeModel,
      launchModel,
      userLaunchModel,
      userModel,
      farmModel
      // salaryModel,
      // whateverModel
    ],
  });
  Logger.info("✌️ Dependency Injector loaded");

  expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
