import { Service, Inject } from "typedi";
import { getCreate2Address } from "@ethersproject/address";
import { pack, keccak256 } from "@ethersproject/solidity";
import {
  FACTORY_ADDRESS,
  INIT_CODE_HASH,
  PAIR_CONTRACT_ABI,
  DEFAULT_INTERVAL_COUNT,
  DEFAULT_DATAPOINT_COUNT,
} from "../constants";
import { getBlockByTime, timestampToDate } from "../util";

@Service()
export default class ChartService {
  constructor(
    @Inject("pairModel") private pairModel,
    @Inject("logger") private logger,
    @Inject("web3") private web3
  ) {}

  public format(data) {
    // do nothing for now
    // TODO: format accordingly to frontend requirement
    return data;
  }

  public async checkCachedAndIsValid(
    token0: string,
    token1: string,
    interval: string
  ) {
    let data = await this.pairModel
      .findOne({ token0, token1, interval })
      .exec();

    if (!data) {
      // swap and recheck
      let _token0 = token1;
      let _token1 = token0;
      data = await this.pairModel
        .findOne({ token0: _token0, token1: _token1, interval })
        .exec();
    }

    // TODO: check if last updated_at is within accepted range

    return data;
  }

  public async getSwapRate(token0: string, token1: string, interval: string) {
    this.logger.debug(`Chart data interval ${interval} getter called`);

    // if data is cached
    let data = await this.checkCachedAndIsValid(token0, token1, interval);
    if (data) {
      return {
        data: this.format(data),
      };
    }

    // make query
    await this.updateSwapData(token0, token1, interval);

    // re-get the data
    data = await this.checkCachedAndIsValid(token0, token1, interval);

    return {
      data: this.format(data),
    };
  }

  public getStartingTimestamp(now, interval_length) {
    switch (interval_length) {
      case "15M":
        now -= 15 * 60 * DEFAULT_INTERVAL_COUNT;
    }

    return now;
  }

  public async processSwaps(swaps) {
    let total_swaps = swaps.length;
    let block_number_to_timestamp_tasks = [];

    for (let i = 0; i < total_swaps; i++) {
      block_number_to_timestamp_tasks.push(
        this.web3.eth
          .getBlock(swaps[i].blockNumber)
          .then((res) => {
            return res.timestamp;
          })
          .catch((e) => {
            console.log(swaps[i]);
            console.log("Failed");
            return 0;
          })
      );
    }

    // wait for parallel async tasks to join
    let res = await Promise.allSettled(block_number_to_timestamp_tasks);

    // The key order here guarantees non-zero amount by agent 0 will come before agent 1's
    let keys = ["amount0In", "amount0Out", "amount1In", "amount1Out"];

    for (let i = 0; i < total_swaps; i++) {
      let temp = {};
      let swapAmounts = [];
      for (let key of keys) {
        if (swaps[i][key] !== "0") {
          swapAmounts.push(swaps[i][key]);
        }
      }
      // Division of raw amounts to get the rate
      temp["rate"] = parseFloat(swapAmounts[0]) / parseFloat(swapAmounts[1]);

      // JS Date requires timestamp accurate to millisecond
      temp["time"] = new Date(res[i].value * 1000);

      swaps[i] = temp;
    }

    return swaps;
  }

  public async updateSwapData(
    token0: string,
    token1: string,
    interval: string
  ) {
    this.logger.debug(`Updating swap rates for pair ${token0}/${token1}`);

    let [_token0, _token1] =
      token0.toLowerCase() < token1.toLowerCase()
        ? [token0, token1]
        : [token1, token0];

    let pairAddress = getCreate2Address(
      FACTORY_ADDRESS,
      keccak256(["bytes"], [pack(["address", "address"], [_token0, _token1])]),
      INIT_CODE_HASH
    );

    let contract = new this.web3.eth.Contract(PAIR_CONTRACT_ABI, pairAddress);

    // timestamp now in seconds
    const now = Math.floor(new Date().getTime() / 1000);

    // get starting timestamp in seconds
    const start = this.getStartingTimestamp(now, interval);

    // find nearest block to the timestamp
    let block = await getBlockByTime(start);

    console.log(`
      Now: ${timestampToDate(now)}
      Start: ${timestampToDate(start)}
      Difference: ${Math.floor((now - start) / 3600)} hours ${Math.floor(
      (((now - start) / 3600) % 1) * 60
    )} minutes
      Block time: ${timestampToDate(block.timestamp)}
    `);

    // start from the block and look for all swap events
    let option = {
      fromBlock: block.number,
      toBlock: "latest",
    };

    // TODO optimization: get events parallely using different options with different block ranges
    // TODO join the async operations
    let swaps = await contract.getPastEvents("Swap", option);

    // stores 100 data points to be served to frontend
    let extracted_swaps = new Array(DEFAULT_DATAPOINT_COUNT);
    let total_swaps = swaps.length;

    let step = 1;
    if (total_swaps > DEFAULT_DATAPOINT_COUNT) {
      step = Math.floor(total_swaps / DEFAULT_DATAPOINT_COUNT);
    }

    // iterate through returned array and save blockNumber & .returnValues (contains amountIn amountOut)
    for (let i = 0; i < total_swaps; i += step) {
      let { amount0In, amount0Out, amount1In, amount1Out } =
        swaps[i].returnValues;
      let _swap = {
        blockNumber: swaps[i].blockNumber,
        amount0In,
        amount0Out,
        amount1In,
        amount1Out,
      };

      extracted_swaps[Math.floor(i / step)] = _swap;
    }

    // get the rate & time using in and out amounts
    let processed_swaps = await this.processSwaps(extracted_swaps);

    await this.pairModel.create({
      token0,
      token1,
      interval,
      swaps: processed_swaps,
    });
  }
}
