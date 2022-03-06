import moment = require("moment");
import { Container } from "typedi";
import Web3 from "web3";
import supportedTokens from "../constants/supportedTokens";
import axios from 'axios';
import { FACTORY_ADDRESS, INIT_CODE_HASH, RPC_URL, PAIR_CONTRACT_ABI, CHAINID } from "../constants";
import { JsonRpcProvider } from "@ethersproject/providers"
import { Token, TokenAmount, Fetcher } from '@acyswap/sdk';
import { Contract } from '@ethersproject/contracts';
import uniqueTokens from "../constants/uniqueTokens";
import TokenListSelector from "../constants/tokenAddress"


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

/////
import TokenList from "../constants/supportedTokens";

export function decodeTokenAmount(tokenAddr, amount) {
  const token = TokenList.find(token => token.address == tokenAddr);
  const tokenSymbol = token.symbol;
  const amountFloat = amount / Math.pow(10, token.decimals);
  return { symbol: tokenSymbol, amount: amountFloat }
}

import { getCreate2Address } from "@ethersproject/address";
import { pack, keccak256 } from "@ethersproject/solidity";
export const getPairAddress = (token0Addr, token1Addr, chainId) => {
    const [_token0, _token1] =
    token0Addr.toLowerCase() < token1Addr.toLowerCase()
        ? [token0Addr, token1Addr]
        : [token1Addr, token0Addr];
    const pairAddress = getCreate2Address(
      FACTORY_ADDRESS[chainId],
      keccak256(["bytes"], [pack(["address", "address"], [_token0, _token1])]),
      INIT_CODE_HASH[chainId]
    );
    return pairAddress;
}

export async function getAllSuportedTokensPrice(chainId) {
  const tokenList = TokenListSelector(chainId.toString());
  const searchIdsArray = tokenList.map(token => token.idOnCoingecko);
  const searchIds = searchIdsArray.join('%2C');
  const tokensPrice = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`
  ).then(async (result) =>{
    const data = result.data;
    console.log(data);
    const tokensPrice = {};
    tokenList.forEach(token =>{
      tokensPrice[token.symbol] = data[token.idOnCoingecko]['usd'];
    })
    return tokensPrice;
  });
  console.log("TOKEN PRICE:", tokensPrice);
  return tokensPrice;
}
export function getPairContract(pair_address, library) {
  return new Contract(pair_address, PAIR_CONTRACT_ABI, library);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getTokensPrice(tokenlist) {
  
  const searchIdsArray = tokenlist.map(token => token.idOnCoingecko);

  const searchIds = searchIdsArray.join('%2C');
  console.log(`https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`)
  const tokensPrice = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`
  ).then(async (result) =>{
    const data = result.data;
    console.log(data);
    const tokensPrice = {};
    tokenlist.forEach(token =>{
      tokensPrice[token.symbol] = data[token.idOnCoingecko]['usd'];
    })
    return tokensPrice;
  }).catch((e) => {

    console.log("get price err",e)
  });

  return tokensPrice;
}

export function recursiveUpdateObject(obj1, obj2) {
  for(var key in obj1) {
    if (key in obj2) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        recursiveUpdateObject(obj1[key], obj2[key])
      }
      if (typeof obj1[key] !== "object" && typeof obj2[key] !== "object") {
        if (obj1[key] !== obj2[key]) {
          obj1[key] = obj2[key];
        }
      }
    }
  }
}