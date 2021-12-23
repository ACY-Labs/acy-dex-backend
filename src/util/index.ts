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
export const getPairAddress = (token0Addr, token1Addr) => {
    const [_token0, _token1] =
    token0Addr.toLowerCase() < token1Addr.toLowerCase()
        ? [token0Addr, token1Addr]
        : [token1Addr, token0Addr];
    const pairAddress = getCreate2Address(
      FACTORY_ADDRESS,
      keccak256(["bytes"], [pack(["address", "address"], [_token0, _token1])]),
      INIT_CODE_HASH
    );
    return pairAddress;
}

export async function getAllSuportedTokensPrice() {
  const library = new JsonRpcProvider(RPC_URL, 56);
  const searchIdsArray = uniqueTokens.map(token => token.idOnCoingecko);
  const searchIds = searchIdsArray.join('%2C');
  const tokensPrice = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${searchIds}&vs_currencies=usd`
  ).then(async (result) =>{
    const data = result.data;
    console.log(data);
    const tokensPrice = {};
    uniqueTokens.forEach(token =>{
      tokensPrice[token.symbol] = data[token.idOnCoingecko]['usd'];
    })
    try {
      tokensPrice['ACY'] = await getACYPrice(library);
    } catch(e) {
      tokensPrice['ACY'] = 0.2
    }
    
    return tokensPrice;
  });
  return tokensPrice;
}
export function getPairContract(pair_address, library) {
  return new Contract(pair_address, PAIR_CONTRACT_ABI, library);
}
export async function getACYPrice(library){
  const ACY  = uniqueTokens.find(token => token.symbol == "ACY");
  const USDT = uniqueTokens.find(token => token.symbol == "USDT");
  const BUSD = uniqueTokens.find(token => token.symbol == "BUSD");
  
  const acyToken  = new Token(CHAINID, ACY.address, 18, ACY.symbol);
  const usdToken  = new Token(CHAINID, USDT.address, 18, USDT.symbol);
  const busdToken = new Token(CHAINID, BUSD.address, 18, BUSD.symbol);
  const acyUsdtPair = await Fetcher.fetchPairData(acyToken, usdToken, library).catch(e => {
    return false
  });
  const acyBusdPair = await Fetcher.fetchPairData(acyToken, busdToken, library).catch(e => {
    return false
  });
  if(!acyUsdtPair && !acyBusdPair) {
    return 0.2;
  } else if(!acyUsdtPair) {
    const result = await getTokenPriceByPair(acyBusdPair, ACY.symbol, library);
    return result;
  } else if(!acyBusdPair) {
    const result = await getTokenPriceByPair(acyUsdtPair, ACY.symbol, library);
    return result;
  } else {
    const acyToUsdtPrice =  getTokenPriceByPair(acyUsdtPair, ACY.symbol, library);
    const acyToBusdPrice =  getTokenPriceByPair(acyBusdPair, ACY.symbol, library);
    let [result1, result2] = await Promise.all([acyToUsdtPrice, acyToBusdPrice]);
    const result = (result1+result2)/2;
    return result;
  }
}

export async function getTokenPriceByPair(pair, symbol, library) {
  const pair_contract = getPairContract(pair.liquidityToken.address, library)
  const totalSupply = await pair_contract.totalSupply();
  const totalAmount = new TokenAmount(pair.liquidityToken, totalSupply.toString());
  const allToken0 = pair.getLiquidityValue(
    pair.token0,
    totalAmount,
    totalAmount,
    false
  );
  const allToken1 = pair.getLiquidityValue(
    pair.token1,
    totalAmount,
    totalAmount,
    false
  );
  const allToken0Amount = parseFloat(allToken0.toExact());
  const allToken1Amount = parseFloat(allToken1.toExact());
  if(pair.token0.symbol == symbol) {
    return allToken1Amount / allToken0Amount ;
  } else {
    return allToken0Amount / allToken1Amount ;
  }
  return 0;
}

