import { Service, Inject, Container } from "typedi";

@Service()
export default class LaunchService {
  constructor(
    @Inject("launchModel") private launchModel,
    @Inject("logger") private logger
  ) {}

  public async getProjects() {
    this.logger.info(`Retrieve project from db`);
    let data = await this.launchModel.find().exec();
    if(!data) 
        this.logger.info(`Retrieve data failed`);
    // store into array
    let result = []
    data.map(obj => { 
      // get specific properties
      let tempRes = {}
      tempRes = {
        projectID: obj.projectID, 
        projectName: obj.projectName, 
        tokenPrice: obj.tokenPrice,
        totalRaise: obj.totalRaise,
        totalSale: obj.totalSale,
        saleStart: obj.saleStart,
      }
      result.push(tempRes);
    });
    this.logger.debug("end getProjects");
    return result;
  }

  public async getProjectsByID(projectsId: Number){
    this.logger.info(`Retrieve project from db`);
    // find using key and value
    let data = await this.launchModel.find({projectID: projectsId}).exec();
    if(!data) 
        this.logger.info(`Retrieve data failed`);
    this.logger.debug("end getProjectsByID");
    return data;
  }
}