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

API endpoint: `/api/chart/swap/ETH/WBTC/15M`

```

{
  "data": {
    "_id": "60eae504f53d14223cad0f2f",
    "token0": "ETH",
    "token1": "WBTC",
    "interval": "15M",
    "swaps": [
      {
        "_id": "60eae504f53d14223cad0f30",
        "time": "2018-12-24T02:33:30.000Z",
        "token0": "1",
        "token1": "2"
      },
      {
        "_id": "60eae504f53d14223cad0f31",
        "time": "2019-11-24T02:33:30.000Z",
        "token0": "3",
        "token1": "1"
      },
      {
        "_id": "60eae504f53d14223cad0f32",
        "time": "2020-12-24T02:33:30.000Z",
        "token0": "10",
        "token1": "5"
      }
    ],
    "createdAt": "2021-07-11T12:33:08.802Z",
    "updatedAt": "2021-07-11T12:33:08.802Z",
    "__v": 0
  }
}
```

