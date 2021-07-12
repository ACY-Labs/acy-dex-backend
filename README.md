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

### Usage

#### WETH-USDC

`/api/chart/swap/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/15M`

```

{
  "data": {
    "_id": "60ec7ef53f78858ab8dc04c8",
    "token0": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "token1": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "interval": "15M",
    "swaps": [
      {
        "_id": "60ec7ef53f78858ab8dc04c9",
        "rate": 2.0867689956219157e-9,
        "time": "2021-07-12T15:11:33.000Z"
      },
      {
        "_id": "60ec7ef53f78858ab8dc04ca",
        "rate": 2.0988811006641615e-9,
        "time": "2021-07-12T15:13:27.000Z"
      },
      ...
    ]
  }
}
```
