import { Service, Inject, Container } from "typedi";
import { sleep } from "../util";
import format from 'date-fns/format'

@Service()
export default class LaunchService {
  constructor(
    @Inject("launchModel") private launchModel,
    @Inject("userLaunchModel") private userLaunchModel,
    @Inject("logger") private logger
  ) {}

  public async getProjects() {
    this.logger.info(`Retrieve project from db`);
    let data = await this.launchModel.find().exec();
    if(!data) 
        this.logger.info(`Retrieve data failed`);
    // store into array
    let result = []
    data.forEach(obj => { 
      // get specific properties
      let tempRes = {}
      tempRes = {
        projectID: obj.projectID, 
        projectName: obj.projectName, 
        projectToken: obj.projectToken,
        // projectStatus: obj.projectStatus,
        tokenPrice: obj.tokenPrice,
        totalRaise: obj.totalRaise,
        totalSale: obj.totalSale,
      }
      // categorized project into Ongoing/Upcoming/Ended
      let saleStart = obj.saleStart;
      let saleEnd = obj.saleEnd;
      let current = new Date();
      if(current < saleStart) {
        tempRes["projectStatus"] = "Upcoming"
      } else if (current > saleEnd){
        tempRes["projectStatus"] = "Ended"
      } else{
        tempRes["projectStatus"] = "Ongoing"
      }

      let temp = new Date(obj.saleEnd)
      let dateTime = temp.toLocaleDateString() + ' ' + temp.toTimeString().substring(0, temp.toTimeString().indexOf("GMT"));
      tempRes["saleEnd"] = dateTime;
      result.push(tempRes);
    });
    this.logger.debug("end getProjects");
    return result;
  }

  public async getProjectsByID(projectsId: Number){
    this.logger.info(`Retrieve project from db`);
    let data = await this.launchModel.findOne({projectID: projectsId}).exec();
    if(!data)
      this.logger.info(`Retrieve data failed`);
    this.logger.debug("end getProjectsByID");
    return data;
  }

  public async requireAllocation(walletId: String, projectToken: String) {
    this.logger.info(`requireAllocation ${walletId} - ${projectToken}`);
    
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
    // if user not exist before, create user data
    if(!user) {
      this.logger.info(`new user, start creation`);
      let block = true;
      await this.userLaunchModel.create({
        walletId
      }, (err, data) => {
        if (err) {
          this.logger.error(`Mongo create new record error ${err}`);
          throw new Error("Create user Error.");
        }
        block = false;
        this.logger.info(`Mongo created a new user launch record`);
      })

      // wait for user creation ready
      while(block) {
        await sleep(10);
      }
      user = await this.userLaunchModel.findOne({
        walletId: walletId
      }).exec()
    }
    // if project is not contained in user launch info, then push it in
    // 0 allocation amount means not allocated yet
    let projectIndex = user.projects.findIndex(item => item.projectToken === projectToken);
    if (projectIndex === -1) {
      user.projects.push({
        projectToken: projectToken,
        allocationAmount: 0,
        allocationUsed: 0
      });
      projectIndex = user.projects.length - 1;
    }

    let userProject = user.projects[projectIndex];
    // already allocated, cannot allocate again, return old allocation amount
    if(userProject.allocationAmount !== 0) return userProject;

    // TODO: a concrete allocation method
    // use simple random right now
    let allocationAmount = Math.round(
      10 + Math.random() * 200
    )
    userProject.allocationAmount = allocationAmount;
    await user.save((err) => {
      if(err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
      } else {
        this.logger.info(`Allocation made, amount: ${allocationAmount}`)
      }
    })
    return userProject;
  }

  public async useAllocation(walletId: String, projectToken: String, amount: Number) {
    this.logger.info(`useAllocation ${walletId} - ${projectToken} - ${amount}`);
    // TODO: finish this function
  }

  public async getAllocationInfo(walletId: String, projectToken: String) {
    this.logger.info(`getAllocationInfo ${walletId} - ${projectToken}`);
    
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec();

    if(!user) {
      this.logger.warn(`Retrieve data failed`)
      return {};
    } else {
      let projectIndex = user.projects.findIndex(item => item.projectToken === item.projectToken)
      if (projectIndex === -1) {
        return {};
      } else {
        let userProject = user.projects[projectIndex];
        return userProject;
      }
    }
  }
}