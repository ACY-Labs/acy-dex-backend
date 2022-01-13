import { parseJsonSourceFileConfigFileContent } from "typescript";
import Web3 from "web3";
import { Logger, loggers } from "winston";
import { ERC20_ABI, FARM_ADDRESS, GAS_TOKEN} from "../constants";
import TokenListSelector from "../constants/tokenAddress"
import { sleep, getTokensPrice } from "../util";
import moment from "moment";
import { Container } from "typedi"; 
import UserService from "./user";

export default class LaunchService {
  launchModel: any;
  userLaunchModel: any;
  web3: any;
  chainId: any;
  logger: Logger;
  tokenPriceModel: any

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
    this.tokenPriceModel = models.tokenPriceModel;
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
        projectTokenUrl: obj.basicInfo.projectTokenUrl,
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

    console.log("allBalance:");
    // TODO (Gary 2021.1.5): the getBalance should be called only once a day, update the amount in database
    let allBalance = await this.getBalance(walletId);
    // let allBalance = 100;
    console.log("allBalance:", allBalance);
    console.log(allBalance);

    let bonus = await this.getBonus(userProject)
    
    // TODO: actual allocation method
    let launchProject = await this.getLaunchProjectByToken(projectToken);
    let allocationInfo = launchProject.allocationInfo
    console.log("allocation parameters: ", launchProject.allocationInfo.maxAlloc, projectToken, launchProject)
    // balance
    let balanceAllocation = allBalance * launchProject.allocationInfo.parameters.rateBalance * Math.random() * 2
    if (balanceAllocation > launchProject.allocationInfo.parameters.maxAlloc) {
      balanceAllocation = launchProject.allocationInfo.parameters.maxAlloc
    }
    if (balanceAllocation < launchProject.allocationInfo.parameters.minAlloc) {
      balanceAllocation = launchProject.allocationInfo.parameters.minAlloc
    }
    // bonus
    let bonusAllocation = bonus.swapBonus * launchProject.allocationInfo.parameters.rateSwap + bonus.liquidityBonus * launchProject.allocationInfo.parameters.rateLiquidity + bonus.acyBonus * launchProject.allocationInfo.parameters.rateAcy
    // total
    let allocationAmount = Math.round(balanceAllocation + bonusAllocation)
    if (allocationAmount > launchProject.allocationInfo.parameters.maxTotalAlloc) {
      allocationAmount = launchProject.allocationInfo.parameters.maxTotalAlloc
    }

    // if (Date.now > launchProject.scheduleInfo.saleStart && Date.now < launchProject.scheduleInfo.saleEnd) {
    //   // TODO: dynamic update
    //   let w_list = allocationInfo.processRecords.w
    // } else if (Date.now <= launchProject.scheduleInfo.saleStart) {
    //   // TODO: update w0
    // }

    // TODO: update user allocation info
    user.projects[projectIndex].allocationAmount = allocationAmount;
    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
      } else {
        this.logger.info(`Allocation made, amount: ${allocationAmount}`)
      }
    })
    // TODO: update total allocation info
    // launchProject.allocationInfo.states.allocatedAmount += allocationAmount;
    await launchProject.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving record error: ${err}`);
        throw new Error("error when saving launch project")
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
    
    // var tokenPrice = await getTokensPrice(tokenlist);
    // (2022-01-12 Austin)this is fetching tokenlist data directly from the website now we get the list directly from our db

    const tokenPriceModelInstance = await this.tokenPriceModel.findOne({chainId : chainId})


    const plist = tokenlist.map(async function(n) {

      const tokenPrice = Number(tokenPriceModelInstance.symbol.get(n.symbol))
      console.log(tokenPrice)

        let contract = new web3.eth.Contract(ERC20_ABI, n.address);
        if(GAS_TOKEN[chainId] == n.symbol){
          
          return await web3.eth.getBalance(addr).then(res => {
            
            return tokenPrice/ 10**n.decimals * res
          })
        }
        else {
        return await contract.methods.balanceOf(addr).call().then(res => 
          { 
          return tokenPrice/ 10**n.decimals * res
          }
          );
        }
    })
    console.log("Promise all in", plist);

    let allBalance = await Promise.all(plist).then((res) => {
      console.log("HERE:", res)
      return res.reduce((total, a) => total + a, 0)
    });
    console.log("Promise all out", allBalance);
    return allBalance;
  }

  public async getBonus(userProject) {
    const swapBonusList: any[] = userProject.allocationBonus.filter(item => item.bonusName == "swap")
    const liquidityBonusList: any[] = userProject.allocationBonus.filter(item => item.bonusName == "liquidity")
    const acyBonusList: any[] = userProject.allocationBonus.filter(item => item.bonusName == "acy")

    let swapBonus = 0
    let liquidityBonus = 0
    let acyBonus = 0
    for (var item in swapBonusList) {
      swapBonus += swapBonusList[item].bonusAmount
    }
    for (var item in liquidityBonusList) {
      liquidityBonus += liquidityBonusList[item].bonusAmount
    }
    for (var item in acyBonusList) {
      acyBonus += acyBonusList[item].bonusAmount
    }
    console.log("bonus made:", swapBonus, liquidityBonus, acyBonus)
    return {
      swapBonus: swapBonus,
      liquidityBonus: liquidityBonus,
      acyBonus: acyBonus
    }
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

    // TODO (Gary): add amount to soldAmount in allocation info (check me!)
    let launchProject = await this.getLaunchProjectByToken(projectToken);
    launchProject.allocationInfo.states.soldAmount += amount;
    await launchProject.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving record error: ${err}`);
        throw new Error("error when saving launch project")
      }
    })

    return userProject;
  }

  public async bonusAllocation(walletId: String, bonusName: String, T: Number) {
    this.logger.info(`bonusAllocation ${walletId} - ${bonusName} - ${T}`);
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
    let allBonus = []

    for (var i in user.projects) {
      let userProject = user.projects[i]
      let launchProject = await this.getLaunchProjectByToken(userProject.projectToken);

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
      userProject.allocationBonus.push({
        bonusName: bonusName,
        bonusAmount: bonusAmount,
        achieveTime: new Date()
      })
      allBonus.push({projectToken: userProject.projectToken, bonusAmount: bonusAmount})
    }

    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
        throw new Error("error when saving allocation")
      }
    })
    return allBonus;
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
    // bsc-test contract, for test only
    await this.launchModel.create({
      projectID: 20,
      basicInfo: {
        projectName: 'Paycer',
        poolID: 9,
        projectToken: 'PCR',
        projectTokenUrl: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1.5,format=auto/https%3A%2F%2Fpaycer.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MhxXu45T290Q1xsWzti%252Ficon%252FaSZLRb7nNeee5FXyaNmq%252FPaycer%2520Logo%2520Icon.png%3Falt%3Dmedia%26token%3D2ba11bfa-6fd0-4a15-a004-7f474267d3db',
        contractAddress: '0x6e0EC29eA8afaD2348C6795Afb9f82e25F196436'
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
        states: {
          allocatedAmount: 0,
          soldAmount: 0
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

  private async updateAllocationParameters(projectToken: String) {
    let launchProject = await this.getLaunchProjectByToken(projectToken);
    let allocationInfo = launchProject.allocationInfo

    // retrieve parametes needed
    const allocatedAmount = allocationInfo.states.allocatedAmount;
    const soldAmount = allocationInfo.states.soldAmount; // TODO: update using soldAmount, since everyone can buy ONLY ONCE
    const processRecords = allocationInfo.processRecords // [{time, w}]
    const T = allocationInfo.parameters.T
    const alertProportion = allocationInfo.parameters.alertProportion
    const totalRaise = launchProject.saleInfo.totalRaise

    // TODO: actual update algo
    if (totalRaise <= soldAmount) return launchProject; // if already sold out, no need to update
    let lastAllocationAmount = 0
    let w_last = 0
    for (var item in processRecords) {
      lastAllocationAmount += processRecords[item].w
      if (Number(item) == processRecords.length - 1) {
        w_last = processRecords[item].w
      }
    }
    let w_new = allocatedAmount - lastAllocationAmount
    let beta = w_new / w_last
    let remainingT = T - processRecords.length
    let tmp = w_last
    let estimatedSell = 0
    for (var i = 0; i < remainingT; i++) {
      tmp *= beta
      estimatedSell += tmp
    }

    let eta = estimatedSell / (totalRaise - allocatedAmount) // the **ratio**
    console.assert(eta > 0, "error: eta should be greater than 0!")

    // update
    if (eta <= alertProportion) { // update
      launchProject.allocationInfo.parameters.maxAlloc /= eta
      launchProject.allocationInfo.parameters.minAlloc /= eta
      launchProject.allocationInfo.parameters.rate_balance /= eta
    }
    launchProject.allocationInfo.processRecords.push({ w: w_new, endTime: new Date() })


    let allocationCache = Container.get("allocationCache");
    // NOTE (Gary): please check if the cache is needed HERE
    // let w_latest = allocationCache[projectToken.toString()];
    // if (!w_latest) {
    //   w_latest = 0;
    // }
    // launchProject.allocationInfo.processRecords.push({
    //   w: w_latest
    // })

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