import { Service, Inject, Container } from "typedi";

@Service()
export default class Rate {
  constructor(
    @Inject("rateModel") private rateModel,
    @Inject("logger") private logger,
    @Inject("web3") private web3
  ) {}

  public async processSwapData(
    token0: string,
    token1: string,
    range: string
  ) {
    this.logger.debug(`start processing SwapData`);
    
    let data = await this.rateModel.find({ token0, token1 }).exec();
    return data;
  }

  public async addRate(data){
    await this.rateModel.create(data);
  }
}
