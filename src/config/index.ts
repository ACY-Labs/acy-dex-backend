import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export interface DatabaseUser {
  databaseURI: string,
  databaseName: string,
  databaseUser: string,
  databasePass: string
}

export default {
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT, 10),

  NetworkMap: {
    'bsc-main': 'bsc-main',
    'bsc-test': 'bsc-test',
    'polygon-main': 'polygon-main',
    'polygon-test': 'polygon-test'
  },

  databases: {
    'bsc-main': {
      'databaseURI': process.env.MONGO_BSCMAIN_URI,
      'databaseName': process.env.MONGO_BSCMAIN_DATABASE,
      'databaseUser': process.env.MONGO_BSCMAIN_ADMIN_USERNAME,
      'databasePass': process.env.MONGO_BSCMAIN_ADMIN_PASSWORD
    },
    'bsc-test': {
      'databaseURI': process.env.MONGO_BSCTEST_URI,
      'databaseName': process.env.MONGO_BSCTEST_DATABASE,
      'databaseUser': process.env.MONGO_BSCTEST_ADMIN_USERNAME,
      'databasePass': process.env.MONGO_BSCTEST_ADMIN_PASSWORD
    },
    'polygon-main': {
      'databaseURI': process.env.MONGO_POLYGONMAIN_URI,
      'databaseName': process.env.MONGO_POLYGONMAIN_DATABASE,
      'databaseUser': process.env.MONGO_POLYGONMAIN_ADMIN_USERNAME,
      'databasePass': process.env.MONGO_POLYGONMAIN_ADMIN_PASSWORD
    },
    'polygon-test': {
      'databaseURI': process.env.MONGO_POLYGONTEST_URI,
      'databaseName': process.env.MONGO_POLYGONTEST_DATABASE,
      'databaseUser': process.env.MONGO_POLYGONTEST_ADMIN_USERNAME,
      'databasePass': process.env.MONGO_POLYGONTEST_ADMIN_PASSWORD
    }
  },
  
  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },
  rpcURL: {
    'bsc-main': 'https://bsc-dataseed.binance.org/',
    'bsc-test': "https://data-seed-prebsc-1-s1.binance.org:8545/",
    'polygon-main': 'https://polygon-rpc.com',
    'polygon-test': 'https://matic-testnet-archive-rpc.bwarelabs.com',
  },
  /**
   * API configs
   */
  api: {
    prefix: "/api",
  },
};
