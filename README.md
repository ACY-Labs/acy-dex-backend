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

`/api/chart/swap?token0=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&token1=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&interval=15M`

```

{
  "data": {
    "token0": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "token1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "interval": "15M",
    "swaps": [
      {
        "rate": 1992.5656142948876,
        "time": "2021-07-13T06:08:20.000Z"
      },
      {
        "rate": 1982.3249017791115,
        "time": "2021-07-13T06:09:07.000Z"
      },
      ...
    ]
  }
}
```
