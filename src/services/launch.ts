import { Service, Inject, Container } from "typedi";
import Web3 from "web3";
import { ERC20_ABI, FARM_ADDRESS} from "../constants";
import {TESTNET_RINKEBY_TOKENADDR} from "../constants/tokenAddress"
import { sleep } from "../util";


@Service()
export default class LaunchService {
  constructor(
    @Inject("launchModel") private launchModel,
    @Inject("userLaunchModel") private userLaunchModel,
    @Inject("logger") private logger
  ) { }

  public async getProjects() {
    this.logger.info(`Retrieve project from db`);
    let data = await this.launchModel.find().exec();
    if (!data)
      this.logger.info(`Retrieve data failed`);
    // store into array
    let result = []
    data.map(obj => {
      // get specific properties
      let tempRes = {}
      tempRes = {
        projectID: obj.projectID,
        projectName: obj.projectName,
        projectToken: obj.projectToken,
        projectStatus: obj.projectStatus,
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

  public async getProjectsByID(projectsId: Number) {
    this.logger.info(`Retrieve project from db`);
    // find using key and value
    let data = await this.launchModel.findOne({ projectID: projectsId }).exec();
    if (!data)
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
    // if(userProject.allocationAmount !== 0) return userProject;

    // TODO: a concrete allocation method
    // use simple random right now

    // Ymj add
    const web3 = new Web3("https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2");
    //const web3 = new Web3("web3");
    //const tokenAddress = TESTNET_RINKEBY_TOKENADDR;
    //const addr = "0xa04d7588Ddcc9dc6Bd24A948E0C918Fb7136f44E"
    const addr = walletId;

    var plist = [];
    TESTNET_RINKEBY_TOKENADDR.map(function(n){
      plist.push(new Promise(function(resolve, reject){
        let contract = new web3.eth.Contract(ERC20_ABI, n.address);
        let balance = contract.methods.balanceOf(addr).call(); // 余额
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
      console.log(err);
      //this.logger.console.error("in Promise for erc20"); 
    });
    this.logger.info("Promise all out");
    console.log("allBalance:", allBalance);

    // 贡献值

    /*
    主流币
      比特币（BTC）
      以太币（ETH）
      瑞波币（XRP）
      比特币现金（BCH）
      艾达币（ADA）
      莱特币（LTC）
      新经币（XEM）
      恒星币（XLM）
      达世币（DASH）
      EOS等数字货币
    */
    /*
    稳定币
     泰达币（USDT）
     TUSD
     USDC
     GUSD
     HUSD
    */


    // Ymj add end
    let allocationAmount = Math.round(
      10 + Math.random() * 200
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

  public async useAllocation(walletId: String, projectToken: String, amount: Number) {
    this.logger.info(`useAllocation ${walletId} - ${projectToken} - ${amount}`);
    // TODO: finish this function
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