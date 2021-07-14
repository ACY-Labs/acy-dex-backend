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

### Output

#### WETH-USDC

`localhost:3000/api/chart/swap?token0=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&token1=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&interval=1H`

```

{
  "data": {
    "token0": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "token1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "interval": "1H",
    "swaps": [
      {
        "rate": 1998.5723384037876,
        "time": "2021-07-14T14:46:36.000Z"
      },
      {
        "rate": 2012.8825291401797,
        "time": "2021-07-14T14:51:36.000Z"
      },
      {
        "rate": 2001.8412747783236,
        "time": "2021-07-14T14:56:36.000Z"
      },
      {
        "rate": 2002.230949,
        "time": "2021-07-14T15:01:36.000Z"
      },
      {
        "rate": 2008.9441877190013,
        "time": "2021-07-14T15:06:12.000Z"
      },
      {
        "rate": 2014.4834816776302,
        "time": "2021-07-14T15:11:33.000Z"
      },
      {
        "rate": 2019.5123324540148,
        "time": "2021-07-14T15:16:36.000Z"
      },
      {
        "rate": 2016.405429976353,
        "time": "2021-07-14T15:21:21.000Z"
      },
      {
        "rate": 2012.794208767392,
        "time": "2021-07-14T15:25:55.000Z"
      },
      {
        "rate": 2013.1268463958743,
        "time": "2021-07-14T15:31:36.000Z"
      },
      {
        "rate": 2002.0786971219572,
        "time": "2021-07-14T15:36:36.000Z"
      },
      {
        "rate": 2001.70944243602,
        "time": "2021-07-14T15:41:13.000Z"
      }
    ]
  }
}
```
