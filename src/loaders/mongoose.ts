import mongoose from "mongoose";
import { Db } from "mongodb";
import config from "../config";

export default async (): Promise<Db> => {
  const connection = await mongoose.connect(config.databaseURL, {
    // dbName: config.databaseName,
    // user: config.databaseUser,
    // pass: config.databasePass,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  return connection.connection.db;
};
