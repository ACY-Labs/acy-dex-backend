import { parseJsonSourceFileConfigFileContent } from "typescript";
import Web3 from "web3";
import { Logger, loggers } from "winston";
import { ERC20_ABI, FARM_ADDRESS, GAS_TOKEN} from "../constants";
import TokenListSelector from "../constants/tokenAddress"
import { sleep, getTokensPrice } from "../util";
import moment from "moment";

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
    const plist = tokenlist.map(function(n) {
        let contract = new web3.eth.Contract(ERC20_ABI, n.address);
        if(GAS_TOKEN[chainId] == n.symbol)
          return web3.eth.getBalance(addr).then(res => tokenPrice[n.symbol]/ 10**n.decimals * res);
        return contract.methods.balanceOf(addr).call().then(res => tokenPrice[n.symbol]/ 10**n.decimals * res);
        // .then(
        //   res => tokenPrice[n.symbol]/ 10**n.decimals* res);
    })
    // console.log("Promise all in", plist);
    
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
      return res.reduce((total, a) => total + a, 0)
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
      projectID: 2,
      basicInfo: {
        projectName: 'Paycer',
        poolID: 9,
        projectToken: 'PCR',
        projectTokenUrl: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1.5,format=auto/https%3A%2F%2Fpaycer.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MhxXu45T290Q1xsWzti%252Ficon%252FaSZLRb7nNeee5FXyaNmq%252FPaycer%2520Logo%2520Icon.png%3Falt%3Dmedia%26token%3D2ba11bfa-6fd0-4a15-a004-7f474267d3db'
      },
      saleInfo: {
        tokenPrice: 0.055,
        totalRaise: 100000,
        totalSale: 1818181
      },
      scheduleInfo: {
        regStart: '2021-12-15T16:00:00Z',
        regEnd: "2022-01-09T16:00:00Z",
        saleStart: "2022-01-09T20:00:00Z",
        saleEnd: "2022-01-20T20:00:00Z"
      },
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
      contextData: "{\"tokenLabels\": [\"DeFi\",\"BSC\", \"Polygon\", \"No.1\"], \"projectDescription\": [\"Paycer is building a bridge protocol to connect traditional and decentralized finance. This will support the mass market adoption of decentralized finance (DeFi) to fix the broken low interest banking system.\", \"The Paycer protocol is the core engine and includes a solid smart contract architecture to consume different DeFi services. The smart-contract-based protocol will include Paycer's decentralized business logic, including staking, liquidity mining, yield farming, investment strategies, lending, and more. It will be able to interact with DeFi protocols from different blockchains and will also implement automated risk checks. In this chapter, the Paycer protocol is discussed in more detail, including its technical aspects and architecture.\", \"The Paycer platform is a web application that will be accessible via a website and, later, via an app. The platform will offer numerous functions and financial services and will be primarily a B2C platform targeting mainstream customers. The Paycer protocol will act as a second blockchain-based backend for the Paycer platform and will connect it with the DeFi and blockchain space. The Paycer platform will link the Paycer protocol to the existing banking system, enabling a bridge between traditional and decentralized banking.\" ], \"posterUrl\": \"https://miro.medium.com/max/1050/1*dNe1pHMlsKqVdTYOulVnVw.jpeg\", \"tokenLogoUrl\": \"https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1.5,format=auto/https%3A%2F%2Fpaycer.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MhxXu45T290Q1xsWzti%252Ficon%252FaSZLRb7nNeee5FXyaNmq%252FPaycer%2520Logo%2520Icon.png%3Falt%3Dmedia%26token%3D2ba11bfa-6fd0-4a15-a004-7f474267d3db\"}"
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
}