## ACY DEX backend

**Swap history data service provider**

### Run database

```
docker compose up
```

### Run server

```
npm run debug
```

### Development

1. Install nodemon by `npm install -g nodemon`.
2. Make sure you have `.env` in the root directory. (retrieve from project owner)
3. Add the following codes to connect to the remote database (so please work with caution):
```
# config\index.ts
databaseName: process.env.MONGO_AUTHENTICATION_DATABASE,
databaseUser: process.env.MONGO_NON_ROOT_USERNAME,
databasePass: process.env.MONGO_NON_ROOT_PASSWORD,

# src\loaders\mongoose.ts
dbName: config.databaseName,
user: config.databaseUser,
pass: config.databasePass,
```
4. Start development with `npm run debug`
5. Optional tools for debugging:
    - MongoDB Compass: list data
    - Postman: test api endpoints


### Output

#### WETH-USDC

`localhost:3000/api/chart/swap?token0=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&token1=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&range=1H`

```

{
  "data": {
    "token0": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "token1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "range": "1H",
    "swaps": [
      {
        "rate": 2013.8968014791587,
        "time": "2021-07-14T14:57:05.000Z"
      },
      {
        "rate": 2014.2756993286173,
        "time": "2021-07-14T15:02:05.000Z"
      },
      {
        "rate": 1996.9296541749918,
        "time": "2021-07-14T15:07:05.000Z"
      },
      {
        "rate": 2015.7258259140917,
        "time": "2021-07-14T15:11:57.000Z"
      },
      {
        "rate": 2019.5685794840097,
        "time": "2021-07-14T15:17:05.000Z"
      },
      {
        "rate": 2016.6089091921733,
        "time": "2021-07-14T15:21:56.000Z"
      },
      {
        "rate": 2000.72855,
        "time": "2021-07-14T15:27:00.000Z"
      },
      {
        "rate": 2001.251208481726,
        "time": "2021-07-14T15:32:05.000Z"
      },
      {
        "rate": 2015.5327473229408,
        "time": "2021-07-14T15:37:05.000Z"
      },
      {
        "rate": 2005.8991397575212,
        "time": "2021-07-14T15:42:05.000Z"
      },
      {
        "rate": 1999.9592624640088,
        "time": "2021-07-14T15:46:46.000Z"
      },
      {
        "rate": 1998.5083884011722,
        "time": "2021-07-14T15:52:05.000Z"
      },
      {
        "rate": 1998.2888710055352,
        "time": "2021-07-14T15:56:23.000Z"
      }
    ]
  }
}
```
