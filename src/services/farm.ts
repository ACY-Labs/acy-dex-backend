import { Service } from "typedi";
import FARM_ABI from "../constants/farm_abi";
import { Logger } from "winston";
import { FARM_ADDRESS, PAIR_CONTRACT_ABI, RPC_URL, BLOCKS_PER_YEAR} from "../constants";
import TokenListSelector from "../constants/tokenAddress";

import Web3 from "web3";
@Service()
export default class FarmService {

    farmModel: any;
    chainId: any;
    logger: Logger;
    supportedTokens: any;
    config : any;

  constructor(
    models,
    logger,
    chainId
  ) { 
    this.config = models.configModel;
    this.farmModel = models.farmModel;
    this.chainId = chainId;
    this.logger = logger;
    console.log(this.supportedTokens);
  }
  public getTokenSymbol(address) {
      return this.supportedTokens.find(token => token.address.toLowerCase() == address.toLowerCase()).symbol;
  }

  public async massUpdateFarm() {

    try {

        //read current token list
        let modelRequest = await this.config.findOne({attr : "tokenList"}).exec();
        this.supportedTokens = modelRequest.value;

        this.logger.debug("updating in massUdpdateFarm...");
        const web3 = new Web3(RPC_URL[this.chainId]);
        const contract = new web3.eth.Contract(FARM_ABI, FARM_ADDRESS[this.chainId]);
        const numPools = await contract.methods.numPools().call();
        for(var poolId = 0 ; poolId < numPools ; poolId++) {
            this.updatePoolNew(poolId)
        }
        return true;

    }catch (e){
        console.log("FARM UPDATE FAILED with error",e);

    }
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



  public async testFarm(){
    const testPrice = this.updatePoolNew(0);
    return testPrice
  }
  public async updatePoolNew(poolId) {
    const web3 = new Web3(RPC_URL[this.chainId]);
    const contract = new web3.eth.Contract(FARM_ABI, FARM_ADDRESS[this.chainId]);

    const [poolInfo, poolRewardTokens, rewardTokensAddresses, poolPositons] = await Promise.all([
        contract.methods.poolInfo(poolId).call(),
        contract.methods.getPoolRewardTokens(poolId).call(),
        contract.methods.getPoolRewardTokenAddresses(poolId).call(),
        contract.methods.getPoolPositions(poolId).call()
    ]);
    const rewardTokensSymbols = rewardTokensAddresses.map(address => 
        this.supportedTokens.find(token => token.address.toLowerCase() == address.toLowerCase())
    );
    let token0;
    let token1;
    let lpDecimals = 18;
    const pairTokens = [];
    try {
        const lpTokenContract =  new web3.eth.Contract(PAIR_CONTRACT_ABI, poolInfo[0]);
        [token1, token0, lpDecimals] = await Promise.all([
            lpTokenContract.methods.token1().call(),
            lpTokenContract.methods.token0().call(),
            lpTokenContract.methods.decimals().call()
        ]);
        pairTokens.push(token0);
        pairTokens.push(token1);
    } catch (e) {
        // not a lp token, maybe a single token?
        token0 = poolInfo[0];
        token1 = null;
        pairTokens.push(token0);
    }
    const lpToken = {
        address: poolInfo[0],
        decimals: lpDecimals,
        lpBalance: poolInfo[1],
        lpScore: poolInfo[2],
    }
    const startBlock = poolInfo[4];
    const endBlock = poolInfo[5];
    const tokens = pairTokens.map(address => {
        let token =  this.supportedTokens.find(token => token.address.toLowerCase() == address.toLowerCase());
        return {
            symbol: token.symbol,
            logoURI: token.logoURI,
            address: token.address,
            decimals: token.decimals
        }
    })

    const [allTokenAmount, poolRewardsPerYear] = await Promise.all([
        // this.getPoolPositionInfo(poolId, poolPositons, contract),
        this.getPoolAccumulateRewards(poolId, poolRewardTokens, poolPositons, contract),
        this.getPoolRewardsPerYear(poolId, poolRewardTokens, contract)
    ]);
    const  rewardTokens = rewardTokensSymbols.map((token,i) => {
        return {
            symbol: token.symbol,
            logoURI: token.logoURI,
            address: token.address,
            decimals: token.decimals,
            farmToken: poolRewardTokens[i],
            rewardPerYear: poolRewardsPerYear[i],
            accumulateReward: allTokenAmount[i]
        };
    });

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
                endBlock
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
                endBlock
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

    public async getPoolAccumulateRewards(poolId, poolRewardTokens, poolPositons, contract){
        const totalRewards = poolRewardTokens.map(rewardToken => {
            return poolPositons.map(position => contract.methods.getTotalRewards(poolId, position, rewardToken).call());
        });
        const allTokenAmountPromise = totalRewards.map(reward => Promise.all(reward))
        return Promise.all(allTokenAmountPromise).then(rewards => {
            return rewards.map(reward => reward.reduce((total, currentAmount) => total += parseInt(currentAmount),0));
        });
    }
    public async getPoolRewardsPerYear(poolId, poolRewardTokens, contract) {
        const poolTokenRewardInfoPromise = poolRewardTokens.map(rewardToken => 
            contract.methods.getPoolTokenRewardInfo(poolId,rewardToken).call()
        );
        return Promise.all(poolTokenRewardInfoPromise).then(result => {
            return result.map(info => info[3] * BLOCKS_PER_YEAR[this.chainId])
        })
    }

    public async getPoolPositionInfo(poolId, poolPositons, contract) {
        const position = poolPositons.map(positionId =>
            contract.methods.stakingPosition(poolId,positionId).call()
        );
        return Promise.all(position).then( stakesData => 
            stakesData.map((data,i) => {
                return {
                positionId: poolPositons[i],
                address: data[0],
                lpAmount: data[1],
                stakeTimestamp: data[2],
                lockDuration: data[3]
            }})
        );
    }
}