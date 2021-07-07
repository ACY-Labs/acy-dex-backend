import { Service, Inject } from "typedi";

@Service()
export default class ChartService {
  constructor(
    @Inject("rateModel") private rateModel,
    @Inject("logger") private logger
  ) {}

  public async someGetter(interval: string) {
    this.logger.debug(`Chart data interval ${interval} getter called`);

    let data = await this.rateModel.findOne({ interval }).exec();

    return { [interval]: data };
  }

  public async someSetter(interval: string) {
    this.logger.debug(`Chart data interval ${interval} setter called`);

    await this.rateModel.create({
      end_date: new Date(),
      interval,
      data: [2, 5, 4, 6, 2, 1, 6, 4, 2, 3, 6, 7, 4],
    });
  }
}
