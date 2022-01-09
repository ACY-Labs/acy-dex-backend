import { parseJsonSourceFileConfigFileContent } from "typescript";
import Web3 from "web3";
import { Logger, loggers } from "winston";
import { ERC20_ABI, FARM_ADDRESS, GAS_TOKEN} from "../constants";
import TokenListSelector from "../constants/tokenAddress"
import { sleep, getTokensPrice } from "../util";
import moment from "moment";
import { Container } from "typedi"; 

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
        projectName: obj.basicInfo.projectName,
        projectToken: obj.basicInfo.projectToken,
        tokenPrice: obj.saleInfo.tokenPrice,
        totalRaise: obj.saleInfo.totalRaise,
        totalSale: obj.saleInfo.totalSale,
      }
      // categorized project into Ongoing/Upcoming/Ended
      let saleStart = obj.scheduleInfo.saleStart;
      let saleEnd = obj.scheduleInfo.saleEnd;
      let current = new Date();
      if(current < saleStart) {
        tempRes["projectStatus"] = "Upcoming"
      } else if (current > saleEnd){
        tempRes["projectStatus"] = "Ended"
      } else{
        tempRes["projectStatus"] = "Ongoing"
      }

      let temp1 = new Date(obj.scheduleInfo.saleEnd)
      let temp2 = new Date(obj.scheduleInfo.saleStart)
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
    
    // TODO: actual allocation method
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
    
    // var plist = [];
    var tokenlist = TokenListSelector(this.chainId)
    console.log("tokenlist" ,tokenlist, this.chainId)
    const chainId = this.chainId;
    var tokenPrice = await getTokensPrice(tokenlist);
    const plist = tokenlist.map(function(n){
        let contract = new web3.eth.Contract(ERC20_ABI, n.address);
        if(GAS_TOKEN[chainId] == n.symbol)
          return web3.eth.getBalance(addr).then(res => tokenPrice[n.symbol]/ 10**n.decimals* res);
        return contract.methods.balanceOf(addr).call().then(res => tokenPrice[n.symbol]/ 10**n.decimals* res);
        // .then(
        //   res => tokenPrice[n.symbol]/ 10**n.decimals* res);
    })
    console.log("Promise all in", plist);
    
    // let allBalance = await Promise.all(plist).then(function(res){
    //   console.log('Promise then',res);
    //   let format_list = [];
    //   res.map(function(b:string){
    //     format_list.push(web3.utils.fromWei(b));
    //   })
    //   return format_list;
    // }).catch((err)=>{
    //   console.log("Errrrrrrrrrrrrrrrr", err);
    // });

    let allBalance = await Promise.all(plist).then((res) => {
      console.log("HERE:", res)
      return res.reduce((total,a) => total+a,0)
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

    // only allow allocation less than limitation
    let allocationLeft = this.calcAllocationLeft(userProject);
    if(amount > allocationLeft) {
      throw new Error("not enough allocation");
    }

    // actual record allocation used
    userProject.allocationUsed = Math.round(Number(userProject.allocationUsed) + Number(amount));
    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
        throw new Error("error when saving allocation")
      }
    })

    // store allocation in cache, in order to calc allocation using during period
    let allocationCache: Object = Container.get("allocationCache");
    let projectAllocationCache = allocationCache[projectToken.toString()];
    if (!projectAllocationCache) {
      projectAllocationCache = 0;
    }
    projectAllocationCache += amount;
    Container.set("allocationCache", allocationCache);

    return userProject;
  }

  public async bonusAllocation(walletId: String, projectToken: String, bonusName: String, T: Number) {
    this.logger.info(`bonusAllocation ${walletId} - ${projectToken} - ${bonusName} - ${T}`);
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
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

    // if project not exists, create first
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
    let allocationBonus = userProject.allocationBonus;

    let launchProject = await this.getLaunchProjectByToken(projectToken);
    if (!launchProject) {
      throw new Error("No such projectToken")
    }

    // add specific bonus type
    let bonusAmount = 0;
    switch (bonusName) {
      case "swap":
        let rateSwap = launchProject.allocationInfo.parameters.rateSwap;
        bonusAmount = Number(T) * Number(rateSwap);
        break;
      
      case "liquidity":
        let rateLiquidity = launchProject.allocationInfo.parameters.rateLiquidity;
        bonusAmount = Number(T) * Number(rateLiquidity);
        break;

      case "acy":
        let rateAcy = launchProject.allocationInfo.parameters.rateAcy;
        bonusAmount = Number(T) * Number(rateAcy);
        break;
      
      default:
        return false;
    }

    // take care of allocationBonus data structure
    let bonusIndex = allocationBonus.findIndex(item => item.bonusName === bonusName);
    if (bonusIndex === -1) {
      allocationBonus.push({
        bonusName: bonusName,
        bonusAmount: bonusAmount
      })
    } else {
      allocationBonus[bonusIndex].bonusAmount = bonusAmount;
      allocationBonus[bonusIndex].achieveTime = new Date();
    }

    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
        throw new Error("error when saving allocation")
      }
    })
    return bonusAmount;
  }

  public async purchaseRecord(walletId: String, projectToken: String, amount: Number) {
    this.logger.info(`useAllocation ${walletId} - ${projectToken} - ${amount}`);
    // TODO: finish this function
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
  }

  public async vestingRecord(walletId: String, projectToken: String, amount: Number) {
    this.logger.info(`useAllocation ${walletId} - ${projectToken} - ${amount}`);
    // TODO: finish this function
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()
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

  public async createProjects() {
    
    await this.launchModel.create({
      projectID: 1,
      basicInfo: {
        projectName: 'test project',
        poolID: 2,
        projectToken: 'TEST',
        projectTokenUrl: 'http://www.baidu.com'
      },
      saleInfo: {
        tokenPrice: 1,
        totalRaise: 10,
        totalSale: 10
      },
      // scheduleInfo: {
      //   regStart: {
      //     type: Date,
      //     default: Date.now,
      //   },
      //   regEnd: {
      //     type: Date,
      //     default: Date.now,
      //   },
      //   saleStart: {
      //     type: Date,
      //     default: Date.now,
      //   },
      //   saleEnd: {
      //     type: Date,
      //     default: Date.now,
      //   }
      // },
      allocationInfo: {
        parameters: {
          minAlloc: 0,
          maxAlloc: 100,
          rateBalance: 1,
          rateSwap: 1,
          rateLiquidity: 1,
          rateAcy: 1,
          alertProportion: 0.5,
          T: 10
        },
        processRecords: []
      },
      contextData: "{}"
    }, (err, data) => {
      if (err) {
        this.logger.error(`Mongo create new record error ${err}`);
        throw new Error("Create launch project Error.");
      }
      this.logger.info(`Mongo created a new launch project record`);
    })
  }

  private async getLaunchProjectByToken(projectToken: String) {
    let data = await this.launchModel.findOne({
      'basicInfo.projectToken': projectToken
    }).exec();
    return data;
  }

  private async updateAllocationParameters(projectToken: String) {
    let launchProject = await this.getLaunchProjectByToken(projectToken);

    // Example retrieve: 
    let rateBalance = launchProject.allocationInfo.parameters.rateBalance;
    // ... retrieve other parametes needed


    // TODO for gary:
    // actual update algo

    // Example update:
    launchProject.allocationInfo.parameters.minAlloc = 50;



    let allocationCache = Container.get("allocationCache");
    let w_latest = allocationCache[projectToken.toString()];
    if (!w_latest) {
      w_latest = 0;
    }
    launchProject.allocationInfo.processRecords.push({
      w: w_latest
    })

    // reset allocation cache
    allocationCache[projectToken.toString()] = 0;
    Container.set("allocationCache", allocationCache);

    // update launch project to db
    await launchProject.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving record error: ${err}`);
        throw new Error("error when saving launch project")
      }
    })
    return launchProject;

  }
}