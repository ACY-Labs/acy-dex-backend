import { Service, Inject, Container } from "typedi";

@Service()
export default class UserService {
  constructor(
    @Inject("userModel") private launchModel,
    @Inject("logger") private logger
  ) {}

//   public async getProjects() {
//     this.logger.info(`Retrieve project from db`);
//     let data = await this.launchModel.find().exec();
//     if(!data) 
//         this.logger.info(`Retrieve data failed`);
//     this.logger.debug("end getProjects");
//     return data;
//   }
}