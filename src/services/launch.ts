import { parseJsonSourceFileConfigFileContent } from "typescript";
import Web3 from "web3";
import { Logger, loggers } from "winston";
import { ERC20_ABI, FARM_ADDRESS, GAS_TOKEN } from "../constants";
import TokenListSelector from "../constants/tokenAddress"
import { sleep, getTokensPrice, recursiveUpdateObject } from "../util";
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
    let result1 = [];
    let result2 = [];

    let ongoing_cnt = 0;


    data.forEach(obj => {
      // get specific properties
      let tempRes = {};
      tempRes = {
        projectID: obj.projectID,
        projectName: obj.basicInfo.projectName,
        projectToken: obj.basicInfo.projectToken,
        projectTokenUrl: obj.basicInfo.projectTokenUrl,
        tokenPrice: obj.saleInfo.tokenPrice,
        totalRaise: obj.saleInfo.totalRaise,
        totalSale: obj.saleInfo.totalSale,
      }
      let temp1 = new Date(obj.scheduleInfo.saleStart);
      let temp2 = new Date(obj.scheduleInfo.saleEnd);
      let dateTime1 = temp1.toLocaleDateString() + ' ' + temp1.toTimeString().substring(0, temp1.toTimeString().indexOf("GMT"));
      let dateTime2 = temp2.toLocaleDateString() + ' ' + temp2.toTimeString().substring(0, temp2.toTimeString().indexOf("GMT"));
      tempRes["saleStart"] = dateTime1;
      tempRes["saleEnd"] = dateTime2;

      // categorized project into Ongoing/Upcoming/Ended
      const current = moment();

      const saleStart = moment(obj.scheduleInfo.saleStart);
      const saleEnd = moment(obj.scheduleInfo.saleEnd);
      const two_day_ago = saleStart.subtract(2, 'days');
      const one_day_ago = saleStart.subtract(1, 'days');

      let tempRes2 = Object.assign({}, tempRes);
      if (current > saleEnd) {
        tempRes["projectStatus"] = "Ended";
        tempRes2["projectStatus"] = "Ended";
      }

      if (current < saleEnd) {
        if (one_day_ago < current) {
          tempRes["projectStatus"] = "Ongoing";
          tempRes2["projectStatus"] = "Ongoing";
        } else if (two_day_ago < current) {
          tempRes["projectStatus"] = "Upcoming";
          tempRes2["projectStatus"] = "Ongoing";
          ongoing_cnt += 1;
        } else if (two_day_ago > current) {
          tempRes["projectStatus"] = "Upcoming";
          tempRes2["projectStatus"] = "Upcoming";
        }
      }

      result1.push(tempRes);
      result2.push(tempRes2);
    });
    this.logger.debug("end getProjects");
    if (ongoing_cnt > 3) {
      result1 = result1.sort(function (a, b) {
        return a.saleStart < b.saleStart ? -1 : 1
      })
      return result1;
    } else {
      result2 = result2.sort(function (a, b) {
        return a.saleStart < b.saleStart ? -1 : 1
      })
      return result2;
    }
  }

  public async getProjectsByID(projectsId: Number) {
    this.logger.info(`Retrieve project from db`);
    let data = await this.launchModel.findOne({ projectID: projectsId }).exec();
    if (!data)
      this.logger.info(`Retrieve data failed`);

    // remove unused key
    data.allocationInfo.processRecords = [];

    this.logger.debug("end getProjectsByID"); 
    return data;
  }

  public async getProjectsByPoolID(poolID: Number) {
    this.logger.info(`Retrieve project from db`);
    let data = await this.launchModel.findOne({ "basicInfo.poolID": Number(poolID) }).exec();
    if (!data)
      this.logger.info(`Retrieve data failed`);

    // remove unused key
    data.allocationInfo.processRecords = [];

    this.logger.debug("end getProjectsByID"); 
    return data;
  }

  public async getAllAllocationInfo(projectToken: String) {
    this.logger.info(`getAllAllocationInfo ${projectToken}`);
    let data = await this.userLaunchModel.find().exec();

    let allocationInfo = []
    let total_allocation = 0;

    for (var index in data) {
      let user = data[index]
      let projectIndex = user.projects.findIndex(item => item.projectToken === projectToken);
      if (projectIndex === -1) continue;
      let userProject = user.projects[projectIndex]
      allocationInfo.push({ 
        walletId: user.walletId, 
        projectToken: projectToken, 
        allocationAmount: userProject.allocationAmount,
        recordWalletId: userProject.recordWalletId
      })
      total_allocation += userProject.allocationAmount;
    }

    return {
      total_participants: allocationInfo.length,
      total_allocation: total_allocation,
      projectToken: projectToken,
      data: allocationInfo
    }
  }

  public async updateOneAllocationInfo(walletId: String, projectToken: String, amount: Number) {
    this.logger.info(`updateOneAllocationInfo ${walletId} - ${projectToken} - ${amount}`);

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

    userProject.allocationAmount = amount
    userProject.allocationLeft = await this.calcAllocationLeft(userProject);
    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
      } else {
        this.logger.info(`Allocation updated, amount: ${amount}`)
      }
    })
    return userProject
  }

  public async updateProjectsByID(projectID: Number, body: Object) {
    let project = await this.launchModel.findOne({
      projectID: projectID
    }).exec();

    recursiveUpdateObject(project, body);
    console.log(JSON.stringify(project));
    let block = true;
    await project.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
        return false;
      } else {
        this.logger.info(`Project updated, body: ${JSON.stringify(body)}`);
        block = false;
      }
    })

    while (block) {
      await sleep(10);
    }

    return true;
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
    if (userProject.allocationAmount !== 0) return userProject;

    // TODO (Gary 2021.1.5): the getBalance should be called only once a day, update the amount in database
    let allBalance = await this.getBalance(walletId);
    // let allBalance = 100;

    let bonus = await this.getBonus(userProject)

    // TODO: actual allocation method
    let launchProject = await this.getLaunchProjectByToken(projectToken);
    let allocationInfo = launchProject.allocationInfo
    // balance
    let balanceAllocation
    if (allBalance * launchProject.allocationInfo.parameters.rateBalance <= 2 * launchProject.allocationInfo.parameters.minAlloc) {
      balanceAllocation = launchProject.allocationInfo.parameters.minAlloc * (1 + Math.random())
    } else if (allBalance * launchProject.allocationInfo.parameters.rateBalance >= 2 * launchProject.allocationInfo.parameters.maxTotalAlloc) {
      balanceAllocation = launchProject.allocationInfo.parameters.maxTotalAlloc * Math.random() * 2
    } else {
      balanceAllocation = allBalance * launchProject.allocationInfo.parameters.rateBalance * Math.random() * 2
    }
    console.log("balanceAllocation", balanceAllocation)
    // normalize balance
    if (balanceAllocation > launchProject.allocationInfo.parameters.maxAlloc) {
      balanceAllocation = launchProject.allocationInfo.parameters.maxAlloc
    }
    if (balanceAllocation < launchProject.allocationInfo.parameters.minAlloc) {
      balanceAllocation = launchProject.allocationInfo.parameters.minAlloc
    }
    // bonus
    let bonusAllocation = bonus.swapBonus + bonus.liquidityBonus + bonus.acyBonus
    // total
    // let allocationAmount = Math.round(balanceAllocation + bonusAllocation)
    let allocationAmount = Math.round(balanceAllocation)
    if (allocationAmount > launchProject.allocationInfo.parameters.maxTotalAlloc) {
      allocationAmount = launchProject.allocationInfo.parameters.maxTotalAlloc
    }

    // TODO: update user allocation info
    userProject.allocationAmount = allocationAmount;
    userProject.allocationLeft = await this.calcAllocationLeft(userProject);
    await user.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving user record error: ${err}`);
      } else {
        this.logger.info(`Allocation made, amount: ${allocationAmount}`)
      }
    })
    // TODO: update total allocation info
    launchProject.allocationInfo.states.allocatedAmount += allocationAmount;
    await launchProject.save((err) => {
      if (err) {
        this.logger.error(`Mongo saving record error: ${err}`);
        throw new Error("error when saving launch project")
      }
    })
    return userProject;
  }

  public async getBalance(addr: String) {
    const web3 = new Web3(this.web3);
    const logger = this.logger

    // var plist = [];
    var tokenlist = TokenListSelector(this.chainId)
    const chainId = this.chainId;

    // var tokenPrice = await getTokensPrice(tokenlist);
    // (2022-01-12 Austin)this is fetching tokenlist data directly from the website now we get the list directly from our db

    const tokenPriceModelInstance = await this.tokenPriceModel.findOne({ chainId: chainId })


    const plist = tokenlist.map(async function (n) {

      let tokenPrice = Number(tokenPriceModelInstance.symbol.get(n.symbol))
      console.log(tokenPrice)
      if (isNaN(tokenPrice)) tokenPrice = 0

      let contract = new web3.eth.Contract(ERC20_ABI, n.address);
      if (GAS_TOKEN[chainId] == n.symbol) {

        return await web3.eth.getBalance(addr).then(res => {

          return tokenPrice / 10 ** n.decimals * res
        })
      }
      else {
        return await contract.methods.balanceOf(addr).call().then(res => {
          return tokenPrice / 10 ** n.decimals * res
        }
        );
      }
    })
    console.log("Promise all in");

    let allBalance = await Promise.all(plist).then((res) => {
      console.log("HERE:", res)
      let total = 0
      for (var i in res) {
        if (!isNaN(res[i])) {
          total += res[i]
        }
      }
      console.log("total", total)
      return total
    });
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
    return {
      swapBonus: swapBonus,
      liquidityBonus: liquidityBonus,
      acyBonus: acyBonus
    }
  }

  private async calcAllocationLeft(userProject: any) {
    let bonus = await this.getBonus(userProject)
    let launchProject = await this.getLaunchProjectByToken(userProject.projectToken);
    const bonusAmount = bonus.swapBonus + bonus.liquidityBonus + bonus.acyBonus
    // Note (GARY): total allocation amount includes bonus!
    let totalAllocationAmount = userProject.allocationAmount + bonusAmount;
    console.log("allocation left:", totalAllocationAmount, userProject.allocationUsed)
    let allocationLeft = Math.round(totalAllocationAmount - userProject.allocationUsed);
    if (allocationLeft > launchProject.allocationInfo.parameters.maxTotalAlloc) {
      allocationLeft = launchProject.allocationInfo.parameters.maxTotalAlloc
    }
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
    let allocationLeft = await this.calcAllocationLeft(userProject);
    if (amount > allocationLeft) {
      userProject.allocationLeft = await this.calcAllocationLeft(userProject);
      await user.save((err) => {
        if (err) {
          this.logger.error(`Mongo saving user record error: ${err}`);
          throw new Error("error when saving allocation")
        }
      })
      throw new Error("not enough allocation");
    }

    // actual record allocation used
    userProject.allocationUsed = Math.round(Number(userProject.allocationUsed) + Number(amount));
    userProject.allocationLeft = await this.calcAllocationLeft(userProject);
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

  public async verifyValidWallet(projectToken: String, walletId: String) {
    console.log('not implemented yet.')
  }

  public async recordWallet(walletId: String, projectToken: String, recordWalletId: String) {
    this.logger.info(`recordWallet ${walletId} - ${projectToken} - ${recordWalletId}`);
    // only allow integer amount
    let user = await this.userLaunchModel.findOne({
      walletId: walletId
    }).exec()

    if (user === null) {
      throw new Error("No such user.")
    }

    let projectIndex = user.projects.findIndex(item => item.projectToken === projectToken);
    let userProject = user.projects[projectIndex];
    

    userProject.recordWalletId = recordWalletId;
    this.logger.info(`userProject ${userProject}`);
    const res = await user.save();
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
      allBonus.push({ projectToken: userProject.projectToken, bonusAmount: bonusAmount });
      userProject.allocationLeft = await this.calcAllocationLeft(userProject);
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
      walletId: walletId,
    }).exec();

    if (!user) {
      this.logger.warn(`Retrieve data failed`)
      return {};
    } else {
      let projectIndex = user.projects.findIndex(item => item.projectToken === projectToken);
      if (projectIndex === -1) {
        return {};
      } else {
        let userProject = user.projects[projectIndex];
        userProject.allocationLeft = await this.calcAllocationLeft(userProject);
        await user.save((err) => {
          if (err) {
            this.logger.error(`Mongo saving user record error: ${err}`);
          }
        })
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

  public async updateAllAllocationParameters() {
    let data = await this.launchModel.find().exec();
    console.log("Fetching projects, total: ", data.length)
    const date_ = new Date()
    console.log(date_, data[0].scheduleInfo.saleStart)
    for (var item in data) {
      console.log("date info: ", data[item].scheduleInfo.saleStart <= date_, data[item].scheduleInfo.saleEnd >= date_)
      if (data[item].scheduleInfo.saleStart <= date_ && data[item].scheduleInfo.saleEnd >= date_) {
        this.updateAllocationParameters(data[item].basicInfo.projectToken)
      }
    }
  }

  private async updateAllocationParameters(projectToken: String) {
    console.log("updating allocation parameters for project with token: ", projectToken)
    let launchProject = await this.getLaunchProjectByToken(projectToken);
    let allocationInfo = launchProject.allocationInfo

    // retrieve parametes needed
    const allocatedAmount = allocationInfo.states.allocatedAmount;
    const soldAmount = allocationInfo.states.soldAmount; // TODO: update using soldAmount, since everyone can buy ONLY ONCE
    const processRecords = allocationInfo.processRecords // [{time, w, s}]
    const T = Number((launchProject.scheduleInfo.saleEnd - launchProject.scheduleInfo.saleStart) / (Number(allocationInfo.parameters.T) * 1000 * 60))
    const alertProportion = allocationInfo.parameters.alertProportion
    const totalRaise = launchProject.saleInfo.totalRaise

    // TODO: actual update algo
    if (totalRaise <= soldAmount) return launchProject; // if already sold out, no need to update

    let lastAllocationAmount = 0
    let lastSoldAmount = 0

    let w_last = 0
    let w_second_last = -1
    let s_last = 0
    let s_second_last = -1
    for (var item in processRecords) {
      lastAllocationAmount += processRecords[item].w
      lastSoldAmount += processRecords[item].s
      if (Number(item) == processRecords.length - 1) {
        w_last = processRecords[item].w
        s_last = processRecords[item].s
      } else if (Number(item) == processRecords.length - 2) {
        w_second_last = processRecords[item].w
        s_second_last = processRecords[item].s
      }
    }
    let w_new = allocatedAmount - lastAllocationAmount
    let s_new = soldAmount - lastSoldAmount

    let beta, beta_last
    if (w_last == 0 && w_new == 0) beta = 0
    else if (w_last == 0) beta = 1
    else beta = w_new / w_last
    if (w_second_last != -1) {
      if (w_second_last == 0 && w_last == 0) beta_last = 0
      else if (w_second_last == 0) beta_last = 1
      else beta_last = w_last / w_second_last
      beta = 0.5 * (beta + beta_last)
    }

    let gamma, gamma_last
    if (s_last == 0 && s_new == 0) gamma = 0
    else if (s_last == 0) gamma = 1
    else gamma = s_new / s_last
    if (s_second_last != -1) {
      if (s_second_last == 0 && s_last == 0) gamma_last = 0
      else if (s_second_last == 0) gamma_last = 1
      else gamma_last = s_last / s_second_last
      gamma = 0.5 * (gamma + gamma_last)
    }

    let remainingT = T - processRecords.length
    let tmp_1 = w_last, tmp_2 = s_last
    let estimatedSell = 0
    for (var i = 0; i < remainingT; i++) {
      tmp_1 *= beta
      tmp_2 *= gamma
      estimatedSell += (tmp_1 + tmp_2)
    }
    estimatedSell /= 2.0

    let eta = estimatedSell / (totalRaise - allocatedAmount) // the **ratio**
    eta = eta / alertProportion
    // console.assert(eta > 0, "error: eta should be greater than 0!")
    console.log("eta", eta)
    if (eta < 0.85) eta = 0.85

    // update
    if (eta <= 1) { // update
      launchProject.allocationInfo.parameters.maxAlloc = launchProject.allocationInfo.parameters.maxAlloc / eta
      launchProject.allocationInfo.parameters.minAlloc = launchProject.allocationInfo.parameters.minAlloc / eta
    }
    // to avoid overflow of parameters
    if (launchProject.allocationInfo.parameters.minAlloc > launchProject.allocationInfo.parameters.maxTotalAlloc / 5) {
      let ratio = launchProject.allocationInfo.parameters.minAlloc / (launchProject.allocationInfo.parameters.maxTotalAlloc / 5)
      launchProject.allocationInfo.parameters.maxAlloc = launchProject.allocationInfo.parameters.maxAlloc / ratio
      launchProject.allocationInfo.parameters.minAlloc = launchProject.allocationInfo.parameters.minAlloc / ratio
    }

    console.log("after update:", launchProject.allocationInfo.parameters.maxAlloc)
    launchProject.allocationInfo.processRecords.push({ w: w_new, s: s_new, endTime: new Date() })

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