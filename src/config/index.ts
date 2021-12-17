import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  databaseURL: process.env.MONGODB_URI,
  databaseName: process.env.MONGO_AUTHENTICATION_DATABASE,
  databaseUser: process.env.MONGO_NON_ROOT_USERNAME,
  databasePass: process.env.MONGO_NON_ROOT_PASSWORD,
  

  
  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },
  rpcURL: process.env.WEB3_RPC_URL,
  /**
   * API configs
   */
  api: {
    prefix: "/api",
  },
};
