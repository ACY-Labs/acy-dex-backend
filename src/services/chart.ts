import { Service, Inject, Container } from "typedi";
import { getCreate2Address } from "@ethersproject/address";
import { pack, keccak256 } from "@ethersproject/solidity";
import {
  FACTORY_ADDRESS,
  INIT_CODE_HASH,
  PAIR_CONTRACT_ABI,
  DEFAULT_INTERVAL_COUNT,
  DEFAULT_CACHE_TIMEOUT_SECONDS,
  ERC20_ABI,
  DEFAULT_CONSECUTIVE_BLOCK_COUNT,
} from "../constants";
import { getBlockByTime, getAsyncTasksValidResults } from "../util";
import BigNumber from "bignumber.js";

@Service()
export default class ChartService {
  constructor(
    @Inject("pairModel") private pairModel,
    @Inject("logger") private logger,
    @Inject("web3") private web3
  ) {}

  public format(data) {
    let _data = {
      token0: data.token0,
      token1: data.token1,
      interval: data.interval,
      swaps: data.swaps,
    };

    _data["swaps"] = _data["swaps"].map((item) => {
      return {
        rate: item["rate"],
        time: item["time"],
      };
    });

    return _data;
  }

  public async checkCachedAndIsValid(
    token0: string,
    token1: string,
    interval: string
  ) {
    let need_update = false;
    let data = await this.pairModel
      .findOne({ token0, token1, interval })
      .exec();

    if (!data) {
      // swap and recheck
      data = await this.pairModel
        .findOne({ token0: token1, token1: token0, interval })
        .exec();
    }
    if (data) {
      let last_updated_time: any = new Date(data.updatedAt);
      let now: any = new Date();
      let seconds_elapsed: any = (now - last_updated_time) / 1000;

      console.log(
        `updated at = ${last_updated_time}, now = ${now}, diff = ${seconds_elapsed}s`
      );

      if (seconds_elapsed > DEFAULT_CACHE_TIMEOUT_SECONDS) {
        data = null;
        need_update = true;
      }
    }

    return [data, need_update];
  }

  public async getSwapRate(token0: string, token1: string, interval: string) {
    this.logger.debug(`Chart data interval ${interval} getter called`);

    // if data is cached
    let [data, need_update] = await this.checkCachedAndIsValid(
      token0,
      token1,
      interval
    );
    if (data) {
      return {
        data: this.format(data),
      };
    }
    // make query
    await this.updateSwapData(token0, token1, interval, need_update);

    // re-get the data
    [data, need_update] = await this.checkCachedAndIsValid(
      token0,
      token1,
      interval
    );

    return {
      data: this.format(data),
    };
  }

  public getTimestampsWithInterval(now, interval_length) {
    let intervals = new Array(DEFAULT_INTERVAL_COUNT);
    let step = 15 * 60;
    switch (interval_length) {
      case "15M":
        step = 15 * 60;
        break;
      case "1H":
        step = 60 * 60;
        break;
      case "4H":
        step = 4 * 60 * 60;
        break;
      case "1D":
        step = 24 * 60 * 60;
        break;
      case "1M":
        step = 30 * 24 * 60 * 60;
        break;
    }

    for (let i = DEFAULT_INTERVAL_COUNT - 1; i >= 0; i--) {
      intervals[DEFAULT_INTERVAL_COUNT - i - 1] = now - step * i;
    }

    return intervals;
  }

  public async processSwaps(swaps, [decimal0, decimal1]) {
    let total_swaps = swaps.length;
    let block_number_to_timestamp_tasks = [];

    let cache = Container.get("cache");
    let swap_timestamps = new Array(total_swaps);
    for (let i = 0; i < total_swaps; i++) {
      let cachedValue = cache[`b_${swaps[i].blockNumber}`];
      if (cachedValue) swap_timestamps[i] = cachedValue;
      else {
        block_number_to_timestamp_tasks.push(
          this.web3.eth.getBlock(swaps[i].blockNumber).then((res) => {
            return { index: i, timestamp: res.timestamp };
          })
        );
      }
    }

    let delayed_timestamps: any = await getAsyncTasksValidResults(
      block_number_to_timestamp_tasks
    );
    delayed_timestamps.forEach((item) => {
      swap_timestamps[item["index"]] = item["timestamp"];
    });

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
      // Division of actual amounts to get the rate

      let actualAmount0: BigNumber = new BigNumber(swapAmounts[0]).div(
        new BigNumber(`1e+${decimal0}`)
      );

      let actualAmount1: BigNumber = new BigNumber(swapAmounts[1]).div(
        new BigNumber(`1e+${decimal1}`)
      );

      temp["rate"] = actualAmount0.div(actualAmount1).toNumber();

      // JS Date requires timestamp accurate to millisecond
      temp["time"] = new Date(Number(swap_timestamps[i]) * 1000);

      swaps[i] = temp;
    }

    return swaps;
  }

  public async updateSwapData(
    token0: string,
    token1: string,
    interval: string,
    updateExisting = false
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

    // get array of timestamp in seconds
    const timestamps = this.getTimestampsWithInterval(now, interval);

    // find nearest blocks to list of timestamps
    let find_block_tasks = [];
    for (let i = 0; i < DEFAULT_INTERVAL_COUNT; i++) {
      find_block_tasks.push(getBlockByTime(timestamps[i]));
    }
    let blocks: any = await getAsyncTasksValidResults(find_block_tasks);

    // console.log("---------- BLOCKS ----------");
    // for (let i = 0; i < blocks.length; i++) {
    //   console.log(`
    //   Now: ${timestampToDate(now)}
    //   Start: ${timestampToDate(timestamps[i])}
    //   Difference: ${Math.floor(
    //     (now - blocks[i].timestamp) / 3600
    //   )} hours ${Math.floor(
    //     (((now - blocks[i].timestamp) / 3600) % 1) * 60
    //   )} minutes
    //   Block time: ${timestampToDate(blocks[i].timestamp)}
    // `);
    // }
    // parallelize block queries
    let get_events_tasks = [];
    let blocks_count = blocks.length;

    for (let i = 0; i < blocks_count; i++) {
      let option = {
        fromBlock: blocks[i].number - DEFAULT_CONSECUTIVE_BLOCK_COUNT,
        toBlock: i === blocks_count - 1 ? "latest" : blocks[i].number,
      };
      // console.log(`option for block ${i}`);
      // console.log(option);

      get_events_tasks.push(contract.getPastEvents("Swap", option));
    }

    let swaps: any = await Promise.allSettled(get_events_tasks);
    swaps = swaps
      .filter((item) => {
        return item.status === "fulfilled";
      })
      .map((item) => {
        // item is an array of swaps, last one has the largest swap, which means is the latest
        return item.value.pop();
      })
      .filter((item) => {
        return item !== undefined;
      })
      .flat(1);

    let extracted_swaps = [];
    let total_swaps = swaps.length;

    // iterate through returned array and save blockNumber & .returnValues (contains amountIn amountOut)
    for (let i = 0; i < total_swaps; i++) {
      let { amount0In, amount0Out, amount1In, amount1Out } =
        swaps[i].returnValues;
      let _swap = {
        blockNumber: swaps[i].blockNumber,
        amount0In,
        amount0Out,
        amount1In,
        amount1Out,
      };

      extracted_swaps.push(_swap);
    }

    let token0Contract = new this.web3.eth.Contract(ERC20_ABI, _token0);
    let token1Contract = new this.web3.eth.Contract(ERC20_ABI, _token1);
    let decimal0 = await token0Contract.methods.decimals().call();
    let decimal1 = await token1Contract.methods.decimals().call();

    // get the rate & time using in and out amounts
    let processed_swaps = await this.processSwaps(extracted_swaps, [
      decimal0,
      decimal1,
    ]);

    if (updateExisting) {
      await this.pairModel.updateOne(
        {
          token0,
          token1,
          interval,
        },
        { swaps: processed_swaps }
      );
    } else {
      await this.pairModel.create({
        token0,
        token1,
        interval,
        swaps: processed_swaps,
      });
    }
  }
}
