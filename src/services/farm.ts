import { Service, Inject, Container } from "typedi";
import FARM_ABI from "../constants/farm_abi";
import { FARM_ADDRESS, PAIR_CONTRACT_ABI, ERC20_ABI} from "../constants";
import supportedTokens from "../constants/supportedTokens";
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Fetcher, Token, Pair, TokenAmount } from '@acyswap/sdk';
import { InfuraProvider } from "@ethersproject/providers"
import { getAllSuportedTokensPrice } from "../util"

@Service()
export default class FarmService {
  constructor(
    @Inject("farmModel") private farmModel,
    @Inject("logger") private logger,
    @Inject("web3") private web3
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
      return supportedTokens.find(token => token.address == address).symbol;
  }
  public async massUpdateFarm() {

    // const contract = getFarmsContract(library, account);
    const contract = new this.web3.eth.Contract(FARM_ABI, FARM_ADDRESS);
    const numPools = await contract.methods.numPools().call();
    for(var poolId = 0 ; poolId < numPools ; poolId++) {
        const poolInfo = await contract.methods.poolInfo(poolId).call();
    const rewardTokens123 = await contract.methods.getPoolRewardTokens(poolId).call();;
    const rewardTokensAddresses = await contract.methods.getPoolRewardTokenAddresses(poolId).call();;
    const rewardTokensSymbols = [];
    rewardTokensAddresses.forEach((address,i) => {
        rewardTokensSymbols.push(supportedTokens.find(token => token.address == address))
    });
    let token0;
    let token1;
    let lpDecimals = 18;
    const pairTokens = [];
    try {
        const lpTokenContract =  new this.web3.eth.Contract(PAIR_CONTRACT_ABI, poolInfo[0]);
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
    const rewardTokens = [];
    rewardTokensSymbols.forEach((token,i) => {
        rewardTokens.push({
            symbol: token.symbol,
            logoURI: token.logoURI,
            address: token.address,
            decimals: token.decimals,
            farmToken: rewardTokens123[i]
        })
    });
    const tokens = [];
    pairTokens.forEach(address => {
        let token =  supportedTokens.find(token => token.address == address);
        tokens.push({
            symbol: token.symbol,
            logoURI: token.logoURI,
            address: token.address,
            decimals: token.decimals
        })
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
    const created = await this.farmModel.create({
        poolId,
        lpToken,
        tokens,
        rewardTokens,
        startBlock,
        endBlock,
        positions
      }, (err, data) => {
        if (err) {
          this.logger.debug(`Mongo create new record error ${err}`);
          return false;
        }
        this.logger.debug(`Mongo created a new user pool record`);
        return data;
      });
    }
    return true;
  }
  public async getAllPools(account) {
    let farms = await this.farmModel.find();
    const farmPromise = [];
    const pools = await this.getPool(1,account);
    // return "TEST in getAllPools ";
    // farms.forEach(farm => {
    //     farmPromise.push(this.getPool(farm.poolId,account));
    // });
    // const pools = await Promise.all(farmPromise);
    return [pools];
  }

  public async getPool(poolId, account) {
    let farm = await this.farmModel.findOne({poolId: poolId});
    const poolPositons = farm.positions;
    const rewardTokens = farm.rewardTokens;
    const farmContract = new this.web3.eth.Contract(FARM_ABI, FARM_ADDRESS);
    const BLOCK_PER_SEC = 14;
    const tokenPrice = await getAllSuportedTokensPrice();
    // return "HERE 1";
    // if(farm.positions.length === 0 ){
    // const totalPendingRewards = [];
    // for (let tX = 0; tX < rewardTokens.length; tX++) {
    //     totalPendingRewards.push(0);
    // }
    // return [totalPendingRewards, totalPendingRewards, 0];
    // }
    const poolTokenRewardInfoPromise = []; 

    const amountCol = [];
    for(var i=0; i< rewardTokens.length ; i++){
        const amountRow = [];
        for(var j=0; j< poolPositons.length; j++){
            amountRow.push(farmContract.methods.getTotalRewards(poolId, poolPositons[j].positionId, rewardTokens[i].farmToken).call());
        }
        // poolTokenRewardInfoPromise.push(await farmContract.methods.getPoolTokenRewardInfo(poolId,rewardTokens[i].farmToken).call());
        amountCol.push(amountRow)
    }
    const BLOCKS_PER_YEAR = 60*60*24*365/BLOCK_PER_SEC;
    //HERE
    // const poolRewardsPerYear = await Promise.allSettled(poolTokenRewardInfoPromise)
    // .then(result => {
    //     return result;
    //     return result.map((info,index) => info[3]/(10**rewardTokens[index].decimals) * BLOCKS_PER_YEAR);
    // });0x0100000000000000000000000000000000000000000000000000000000000000
    const test = await farmContract.methods.getPoolTokenRewardInfo(poolId,"0x0100000000000000000000000000000000000000000000000000000000000000").call();
    return test;

    const totalRewardPerYear = poolRewardsPerYear.reduce((total,reward,index) =>
        total += tokenPrice[rewardTokens[index].symbol] * reward
    );
    // return "HERE 2";
    let allTokenAmount = [];
    for(var i=0; i<rewardTokens.length ; i++){
        const amountHex = await Promise.all(amountCol[i]);
        // allTokenAmount.push(amountHex);
        allTokenAmount.push(
            amountHex.reduce((total, currentAmount) => total += parseInt(currentAmount),0 )
            // 100
        );
    }

    const allTokenRewardPromises = [];
    const stakingPromise = [];
    for (let rewardIndex = 0; rewardIndex < rewardTokens.length; rewardIndex++) {
        const tokenRewardPromise = [];
        for (let positionIndex = 0; positionIndex < poolPositons.length; positionIndex++) {
            if(poolPositons[positionIndex].address == account){
                tokenRewardPromise.push(
                    farmContract.methods.pending(poolId, poolPositons[positionIndex].positionId, rewardTokens[rewardIndex].farmToken).call()
                );
                stakingPromise.push(
                    farmContract.methods.stakingPosition(poolId, poolPositons[positionIndex].positionId).call()
                );
            }  
        }
        allTokenRewardPromises.push(tokenRewardPromise);
    }

    const allTokenRewardList = [];
    for (let promiseIndex = 0; promiseIndex < allTokenRewardPromises.length; promiseIndex++) {
        allTokenRewardList.push(Promise.all(allTokenRewardPromises[promiseIndex]));
    }

    const allTokenRewardAmountHex = await Promise.all(allTokenRewardList);
    // allTokenAmount = allTokenAmount.map((reward, index) =>
    //     formatUnits(reward, rewardTokens[index].decimals)
    // );
    const rewards = [];
    allTokenRewardAmountHex.forEach((rewardList,index) => {
        rewardList.forEach((reward,id)=> {
        if(index == 0) {
            rewards.push([formatUnits(reward, rewardTokens[index].decimals)]);
        } else {
            rewards[id].push(formatUnits(reward, rewardTokens[index].decimals));
        }
        });
    });
    const stakeData = await Promise.all(stakingPromise).then(x =>{
        const stakeDataPromise = [];
        var counter = 0;
        for(var j=0; j != poolPositons.length; j++){
            if(poolPositons[j].address == account ) {
                
                const expiredTime = parseInt(x[counter].stakeTimestamp)+parseInt(x[counter].lockDuration);
                const dueDate = new Date(expiredTime * 1000).toLocaleDateString("en-US")
                const nowDate = Date.now()/1000;
                var diff = expiredTime - nowDate;
                var days = 0, hrs = 0, min = 0, leftSec = 0;

                if(diff>0) {
                    diff = Math.floor(diff);
                    days = Math.floor(diff/(24*60*60));
                    leftSec = diff - days * 24*60*60;
                    hrs = Math.floor(leftSec/(60*60));
                    leftSec = leftSec - hrs * 60*60;
                    min = Math.floor(leftSec/(60));
                }
                const result = {
                    lpAmount: formatUnits(x[counter].lpAmount,18),
                    dueDate: dueDate,
                    positionId: poolPositons[j].positionId,
                    reward: rewardTokens.map((token, index) => ({
                        token: token.symbol,
                        amount: rewards[counter][index],
                })),
                remaining: days.toString() + 'd:' + hrs.toString() + 'h:' + min.toString() +'m',
                locked: diff>0
                }
                const total = rewards[counter].reduce((total, currentAmount) => total.add(parseInt(currentAmount),0));
                if(total != 0 || parseInt(result.lpAmount) != 0 ){
                    stakeDataPromise.push(result);
                }
                counter++;
            }
            
        }
        return stakeDataPromise;
    });
    const tokens = farm.tokens;
    let token0Amount = farm.lpToken.lpBalance;
    let token1Amount = 0;
    if(tokens.length > 1) {
        const token0 = new Token(null, tokens[0].address, tokens[0].decimals, tokens[0].symbol);
        const token1 = new Token(null, tokens[1].address, tokens[1].decimals, tokens[1].symbol);
        const provider = new InfuraProvider("rinkeby", process.env.INFURA_API_KEY);
        const pair = await Fetcher.fetchPairData(token0, token1, provider);

        const pair_contract = new this.web3.eth.Contract(ERC20_ABI, pair.liquidityToken.address); 
        const totalSupply = await pair_contract.methods.totalSupply().call();
        const totalAmount = new TokenAmount(pair.liquidityToken, totalSupply.toString());

        const token0Deposited = pair.getLiquidityValue(
            pair.token0,
            totalAmount,
            new TokenAmount(pair.liquidityToken, farm.lpToken.lpBalance),
            false
        );
        const token1Deposited = pair.getLiquidityValue(
            pair.token1,
            totalAmount,
            new TokenAmount(pair.liquidityToken, farm.lpToken.lpBalance),
            false
        );
        token0Amount = parseFloat(token0Deposited.toSignificant(4));
        token1Amount = parseFloat(token1Deposited.toSignificant(4));
    }
    const tvl = tokens.length > 1 ? token0Amount * tokenPrice[tokens[0].symbol] + token1Amount * tokenPrice[tokens[1].symbol]
          : farm.lpToken.lpBalance/10**farm.lpToken.decimals * tokenPrice[tokens[0].symbol];
    return {
        poolId: poolId,
        lpTokenAddress: farm.lpToken.address,
        token0Symbol: tokens[0].symbol,
        token1Symbol: tokens[1]? tokens[1].symbol: "",
        lpScore: farm.lpToken.lpScore,
        lpBalance: farm.lpToken.lpBalance/10**farm.lpToken.decimals,
        lastUpdateBlock: 0,
        rewardTokens: rewardTokens.map(token => token.farmToken),
        rewardTokensAddresses: rewardTokens.map(token => token.address),
        rewardTokensSymbols: rewardTokens.map(token => token.symbol),
        rewardTokensAmount: allTokenAmount.map((reward,index) => reward / 10**rewardTokens[index].decimals),
        hasUserPosition: stakeData.length !== 0,
        rewards: rewards,
        stakeData: stakeData,
        startBlock: farm.startBlock,
        endBlock: farm.endBlock,
        tvl: tvl,
        apr: (totalRewardPerYear/tvl)*100, 
    };
  }

//   public async getTokenTotalSupply(token, library, account)
}