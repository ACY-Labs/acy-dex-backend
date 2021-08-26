import { Service, Inject, Container } from "typedi";

@Service()
export default class SubscribeService {
  constructor(
    @Inject("subscriberModel") private subscriberModel,
    @Inject("logger") private logger
  ) {}
  public async isSubscribed(email: string) {
    let subscriber = await this.subscriberModel.findOne({ email }).exec();
    let found = false;
    if (subscriber) found = true;

    return found;
  }

  public async subscribe(body, ip): Promise<[Number, String]> {
    if (!body["email"]) return [401, "No email"];

    let subscribed = await this.isSubscribed(body.email);

    if (subscribed) return [409, "Already subscribed!"];

    // create subscriber record
    await this.subscriberModel.create({
      name: body.name || "Anonymous",
      email: body.email,
      ip,
    });

    return [201, "Thanks for subscribing"];
  }
}
