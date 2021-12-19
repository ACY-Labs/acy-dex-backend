import { Service, Inject, Container } from "typedi";
import FARM_ABI from "../constants/farm_abi";
import { FARM_ADDRESS, PAIR_CONTRACT_ABI, ERC20_ABI, RPC_URL} from "../constants";
import supportedTokens from "../constants/uniqueTokens";
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Fetcher, Token, Pair, TokenAmount, JSBI, BigintIsh } from '@acyswap/sdk';
import { InfuraProvider } from "@ethersproject/providers"
import { getAllSuportedTokensPrice } from "../util"
import Web3 from "web3";
@Service()
export default class FarmService {
  constructor(
    @Inject("farmModel") private farmModel,
    @Inject("logger") private logger,
  ) {}

//   public async getProjects() {
//     this.logger.info(`Retrieve project from db`);
//     let data = await this.launchModel.find().exec();
//     if(!data) 
//         this.logger.info(`Retrieve data failed`);
//     this.logger.debug("end getProjects");
//     return data;
//   }
  public getTokenSymbol(address) {
      return supportedTokens.find(token => token.address.toLowerCase() == address.toLowerCase()).symbol;
  }

  public async updatePool(poolId) {
    const web3 = new Web3(RPC_URL);
    const contract = new web3.eth.Contract(FARM_ABI, FARM_ADDRESS);
    const poolInfo = await contract.methods.poolInfo(poolId).call();
    const rewardTokens123 = await contract.methods.getPoolRewardTokens(poolId).call();
    const rewardTokensAddresses = await contract.methods.getPoolRewardTokenAddresses(poolId).call();
    // const rewardTokensSymbols = [];
    const rewardTokensSymbols = rewardTokensAddresses.map(address => 
        supportedTokens.find(token => token.address.toLowerCase() == address.toLowerCase()).symbol
    );
    let token0;
    let token1;
    let lpDecimals = 18;
    const pairTokens = [];
    try {
        const lpTokenContract =  new web3.eth.Contract(PAIR_CONTRACT_ABI, poolInfo[0]);
        token1 = await lpTokenContract.methods.token1().call();
        token0 = await lpTokenContract.methods.token0().call();
        lpDecimals = await lpTokenContract.methods.decimals().call();
        pairTokens.push(token0);
        pairTokens.push(token1);
    } catch (e) {
        // not a lp token, maybe a single token?
        token0 = poolInfo[0];
        token1 = null;
        pairTokens.push(token0);
    }

    const poolPositons = await contract.methods.getPoolPositions(poolId).call();

    const lpToken = {
        address: poolInfo[0],
        decimals: lpDecimals,
        lpBalance: poolInfo[1],
        lpScore: poolInfo[2],
    }
    const startBlock = poolInfo[4];
    const endBlock = poolInfo[5];
    const  rewardTokens = rewardTokensSymbols.map((token,i) => {
        return {
            symbol: token.symbol,
            logoURI: token.logoURI,
            address: token.address,
            decimals: token.decimals,
            farmToken: rewardTokens123[i]
        };
    });
    const tokens = pairTokens.map(address => {
        let token =  supportedTokens.find(token => token.address.toLowerCase() == address.toLowerCase());
        return {
            symbol: token.symbol,
            logoURI: token.logoURI,
            address: token.address,
            decimals: token.decimals
        }
    })
    const positions = [];

    for(var i=0; i<poolPositons.length ; i++) {
        let data = await contract.methods.stakingPosition(poolId,poolPositons[i]).call();
        positions.push({
            positionId: poolPositons[i],
            address: data[0],
            lpAmount: data[1],
            stakeTimestamp: data[2],
            lockDuration: data[3]
        })
    }
    const find = await this.farmModel.findOne({poolId}).exec();
    if(find) {
        const created = await this.farmModel.updateOne(
            {
                poolId
            },
            {
                poolId,
                lpToken,
                tokens,
                rewardTokens,
                startBlock,
                endBlock,
                positions
            }, (err, data) => {
        if (err) {
            this.logger.debug(`Mongo update new farm error ${err}`);
            return false;
        }
            this.logger.debug(`Mongo update a new farm record`);
            return data;
        });
    } else {
        const created = await this.farmModel.create(
            {
                poolId,
                lpToken,
                tokens,
                rewardTokens,
                startBlock,
                endBlock,
                positions
            }, (err, data) => {
        if (err) {
            this.logger.debug(`Mongo update new farm error ${err}`);
            return false;
        }
            this.logger.debug(`Mongo update a new farm record`);
            return data;
        });
    }
    
    return true;
  }
  public async massUpdateFarm() {

    const web3 = new Web3(RPC_URL);
    const contract = new web3.eth.Contract(FARM_ABI, FARM_ADDRESS);
    const numPools = await contract.methods.numPools().call();
    this.logger.debug(numPools);
    for(var poolId = 0 ; poolId < numPools ; poolId++) {
        this.updatePool(poolId)
    }
    return true;
  }
  public async getAllPools() {
    let farms = await this.farmModel.find();
    if(farms) return farms; 
    return [];
  }

  public async getPool(poolId) {
    let farm = await this.farmModel.findOne({poolId:poolId});
    if(farm) return farm;
    return null;
  }

  public async updateUserData() { 
    
    let farms = await this.farmModel.find();
    farms.forEach(farm => {
        this.updateUserFarmData(farm);
    });
    return true;
  };

  public async updateUserFarmData(farm){
    const web3 = new Web3(RPC_URL);
    const contract = new web3.eth.Contract(FARM_ABI, FARM_ADDRESS);
  }
}