import { Service, Inject } from "typedi";
import { request } from "graphql-request";
import gql from "graphql-tag";

@Service()
export default class ChartService {
  constructor(
    @Inject("rateModel") private rateModel,
    @Inject("logger") private logger,
    @Inject("blockClient") private blockClient,
    @Inject("client") private client
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
    let data = await this.rateModel
      .findOne({ token0, token1, interval })
      .exec();

    // TODO: check if timestamp is within accepted range

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

  public async updateSwapData(
    token0: string,
    token1: string,
    interval: string
  ) {
    this.logger.debug(`Updating swap rates`);

    let str = `
    {
      pairs {
        id
      }
    }
    `;

    const query = gql(str);

    await this.client.query(query).then((data) => console.log(data));

    await this.rateModel.create({
      token0,
      token1,
      interval,
      swaps: [
        {
          time: new Date(2018, 11, 24, 10, 33, 30, 0),
          token0: 1,
          token1: 2,
        },
        {
          time: new Date(2019, 10, 24, 10, 33, 30, 0),
          token0: 3,
          token1: 1,
        },
        {
          time: new Date(2020, 11, 24, 10, 33, 30, 0),
          token0: 10,
          token1: 5,
        },
      ],
    });
  }
}
