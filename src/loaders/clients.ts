import GQLClient from "../clients/GQLclients";

let client: GQLClient = new GQLClient(
  "https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2",
  "client"
);
let blockClient: GQLClient = new GQLClient(
  "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
  "blockClient"
);

export default [client, blockClient];
