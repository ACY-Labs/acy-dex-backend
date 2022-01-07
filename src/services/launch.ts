import { parseJsonSourceFileConfigFileContent } from "typescript";
import Web3 from "web3";
import { Logger, loggers } from "winston";
import { ERC20_ABI, FARM_ADDRESS} from "../constants";
import TokenListSelector from "../constants/tokenAddress"
import { sleep,getTokensPrice  } from "../util";

export default class LaunchService {
  launchModel: any;
  userLaunchModel: any;
  web3: any;
  chainId: any;
  logger: Logger;

  constructor(
    models,
    constants,
    logger
  ) { 
    this.launchModel = models.launchModel;
    this.userLaunchModel = models.userLaunchModel;
    this.web3 = constants.web3;
    this.chainId = constants.chainId;
    this.logger = logger;
  }

  public async getProjects() {
    this.logger.info(`Retrieve project from db`);
    let data = await this.launchModel.find().exec();
    if (!data)
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

      let temp1 = new Date(obj.saleEnd)
      let temp2 = new Date(obj.saleStart)
      let dateTime1 = temp1.toLocaleDateString() + ' ' + temp1.toTimeString().substring(0, temp1.toTimeString().indexOf("GMT"));
      let dateTime2 = temp2.toLocaleDateString() + ' ' + temp2.toTimeString().substring(0, temp2.toTimeString().indexOf("GMT"));
      tempRes["saleStart"] = dateTime1;
      tempRes["saleEnd"] = dateTime2;
      result.push(tempRes);
    });
    this.logger.debug("end getProjects");
    return result;
  }

  public async getProjectsByID(projectsId: Number) {
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
    if (!user) {
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
      while (block) {
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

    // TODO (Gary 2021.1.6): float with time and total pool size
    console.log("allBalance:");
    // TODO (Gary 2021.1.5: the getBalance should be called only once a day, update the amount in database)
    let allBalance = await this.getBalance(walletId);
    console.log("allBalance:", allBalance);
    console.log(allBalance);
    
    let allocationAmount = Math.round(
      50 + Math.random() * 200
    )
    userProject.allocationAmount = allocationAmount;
    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
      } else {
        this.logger.info(`Allocation made, amount: ${allocationAmount}`)
      }
    })
    return userProject;
  }



  public async getBalance(addr: String) {
    console.log(`getBalance`, addr);
    const web3 = new Web3(this.web3);
    const logger = this.logger
    

    var plist = [];
    var tokenlist = TokenListSelector('56')
    console.log("tokenlist" ,tokenlist)
    var tokenPrice = await getTokensPrice(tokenlist).then((res)=>{
      console.log("the token price list is ",res)


    })
    


    
    tokenlist.map(function(n){
      plist.push(new Promise(function(resolve, reject) {
        let contract = new web3.eth.Contract(ERC20_ABI, n.address);
        let balance =  contract.methods.balanceOf(addr).call();
        // console.log("the contract is :",contract)
        resolve(balance);
      }))
    })
    this.logger.info("Promise all in");
    
    let allBalance = await Promise.all(plist).then(function(res){
      console.log(res,'Promise then');
      let format_list = [];
      res.map(function(b:string){
        format_list.push(web3.utils.fromWei(b));
      })
      return format_list;
    }).catch((err)=>{
      console.log("Errrrrrrrrrrrrrrrr", err);
    });
    console.log("Promise all out", allBalance);
    return allBalance;
  }

  private calcAllocationLeft(userProject: any) {
    let bonusAmount = 0;
    if(userProject.allocationBonus.length !== 0) {
      const reduceAddBonus = (prevValue, currentValue) => prevValue + currentValue.bonusAmount;
      bonusAmount = userProject.allocationBonus.reduce(reduceAddBonus);
    }
    let totalAllocationAmount = userProject.allocationAmount + bonusAmount;
    let allocationLeft = totalAllocationAmount - userProject.allocationUsed;
    return allocationLeft;
  } 

  public async useAllocation(walletId: String, projectToken: String, amount: number) {
    this.logger.info(`useAllocation ${walletId} - ${projectToken} - ${amount}`);
    // only allow integer amount
    amount = Math.floor(amount);
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
    let projectIndex = user.projects.findIndex(item => item.projectToken === projectToken);
    let userProject = user.projects[projectIndex];

    this.logger.info(`userProject ${userProject}`);

    let allocationLeft = this.calcAllocationLeft(userProject);
    if(amount > allocationLeft) {
      throw new Error("not enough allocation");
    }

    userProject.allocationUsed = Math.round(Number(userProject.allocationUsed) + Number(amount));
    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
        throw new Error("error when saving allocation")
      }
    })
    return userProject;
  }

  public async bonusAllocation(walletId: String, projectToken: String, bonusName: String) {
    this.logger.info(`bonusAllocation ${walletId} - ${projectToken} - ${bonusName}`);
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
    let projectIndex = user.projects.findIndex(item => item.projectToken === projectToken);
    let userProject = user.projects[projectIndex];
  }

  public async purchaseRecord(walletId: String, projectToken: String, amount: Number) {
    this.logger.info(`useAllocation ${walletId} - ${projectToken} - ${amount}`);
    // TODO: finish this function
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
    let allocationRemainder = user.allocationAmount - user.allocationUsed
    // token
  }

  public async vestingRecord(walletId: String, projectToken: String, amount: Number) {
    this.logger.info(`useAllocation ${walletId} - ${projectToken} - ${amount}`);
    // TODO: finish this function
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
    let allocationRemainder = user.allocationAmount - user.allocationUsed
    // token
  }

  public async getAllocationInfo(walletId: String, projectToken: String) {
    this.logger.info(`getAllocationInfo ${walletId} - ${projectToken}`);

    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec();

    if (!user) {
      this.logger.warn(`Retrieve data failed`)
      return {};
    } else {
      let projectIndex = user.projects.findIndex(item => item.projectToken === item.projectToken);
      if (projectIndex === -1) {
        return {};
      } else {
        let userProject = user.projects[projectIndex];
        return userProject;
      }
    }
  }

}