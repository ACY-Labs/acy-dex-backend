import moment = require("moment");
import { Container } from "typedi";
import Web3 from "web3";

export function timestampToDate(timestamp) {
  const date = moment.unix(timestamp);

  return date.utc().format();
}

export async function getBlockByTime(targetTimestamp) {
  let web3: Web3 = Container.get("web3");

  let cache = Container.get("cache");

  // seems not making an impact
  // if (cache[`t_${targetTimestamp}`]) {
  //   console.log("CACHE USED IN getBlockByTime");
  //   return cache[`t_${targetTimestamp}`];
  // }

  // decreasing average block size will decrease precision and also
  // decrease the amount of requests made in order to find the closest
  // block
  let averageBlockTime = 15;

  // get current block number
  const currentBlockNumber = await web3.eth.getBlockNumber();
  let block: any = await web3.eth.getBlock(currentBlockNumber);

  let requestsMade = 0;

  let blockNumber = currentBlockNumber;

  while (block.timestamp > targetTimestamp) {
    let decreaseBlocks: number =
      (block.timestamp - targetTimestamp) / averageBlockTime;
    decreaseBlocks = Math.floor(decreaseBlocks);

    if (decreaseBlocks < 1) {
      break;
    }

    blockNumber -= decreaseBlocks;

    block = await web3.eth.getBlock(blockNumber);
    requestsMade += 1;
  }

  cache[`t_${targetTimestamp}`] = block.number;
  cache[`b_${block.number}`] = targetTimestamp;
  Container.set("cache", cache);

  // debug info for discrepancy between requested timeframe and block timeframe
  // console.log("tgt timestamp   ->", targetTimestamp);
  // console.log("tgt date        ->", timestampToDate(targetTimestamp));
  // console.log("block timestamp ->", block.timestamp);
  // console.log("block date      ->", timestampToDate(block.timestamp));
  // console.log("requests made   ->", requestsMade);

  return block;
}

export async function getAsyncTasksValidResults(tasks) {
  let results: any = await Promise.allSettled(tasks);
  results = results
    .filter((item) => {
      return item.status === "fulfilled";
    })
    .map((item) => {
      return item.value;
    });

  return results;
}
