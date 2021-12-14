import { Service, Inject, Container } from "typedi";

@Service()
export default class UserService {
  constructor(
    @Inject("userModel") private userModel,
    @Inject("logger") private logger
  ) {}

  public async getPair() {
    this.logger.info(`Return Pair Infomation`);
    // let data = await this.launchModel.find().exec();
    // if(!data) 
    //     this.logger.info(`Retrieve data failed`);
    // this.logger.debug("end getProjects");
    // return data;
  }
}