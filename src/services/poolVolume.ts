import { Service, Inject, Container } from "typedi";
import { getCreate2Address, getAddress } from "@ethersproject/address";
import { pack, keccak256 } from "@ethersproject/solidity";
import BigNumber from "bignumber.js";
import {
    FACTORY_ADDRESS,
    INIT_CODE_HASH,
    PAIR_CONTRACT_ABI,
    ERC20_ABI,
    AVERAGE_BLOCK_COUNT_PER_DAY,
    GLOBAL_VOLUME_TIME_RANGE,
    AVERAGE_BLOCK_GEN_TIME,
    SUBSCRIPTION_INTERVAL,
    NO_VOLUME_UPDATE_INTERVAL
  } from "../constants";
import supportedTokens from "../constants/uniqueTokens";
import {getPairAddress} from "../util/index"
@Service()
export default class PoolVolumeService {

    constructor(
        @Inject("web3") private web3,
        @Inject("pairVolumeModel") private pairVolumeModel
    ) {
    }

    private async getEventsFromInterval (contract,lb,rb) {
        let options = {
            fromBlock: lb,
            toBlock: rb,
          };
        
        let allEvents =  await contract.getPastEvents("allEvents",options);
        let swapLogs = allEvents.filter(item=>item.event == 'Swap');
        let syncLogs = allEvents.filter(item=>item.event == 'Sync');

        let reduced_swap_logs = [];
        let total_swap_logs = swapLogs.length;
        let now:any = new Date();

        for (let i = 0; i < total_swap_logs; i++) {
            let { amount0In, amount0Out, amount1In, amount1Out } =
            swapLogs[i].returnValues;
            let log_time = new Date(now);
            let log_time_msec = ((rb-swapLogs[i].blockNumber)*AVERAGE_BLOCK_GEN_TIME);
            log_time.setMilliseconds(now.getMilliseconds() - log_time_msec);
            let _swap = {
                time : log_time,
                blockNumber: swapLogs[i].blockNumber,
                amount0In,
                amount0Out,
                amount1In,
                amount1Out,
            };
            reduced_swap_logs.push(_swap);
        }
        let reduced_sync_logs = [];
        if (syncLogs.length) {
            reduced_sync_logs = syncLogs.map((item) => {
                return {
                    reserve0 : item.returnValues.reserve0,
                    reserve1 : item.returnValues.reserve1
                }
            })
        }
        return [reduced_swap_logs,reduced_sync_logs];
    }
    //checks if passed argument exists in dataBase
    private async checkIfExist(pairAddr){
        let data = await this.pairVolumeModel.findOne({ pairAddr }).exec();
        if(data) return [data,true];
        else return [null,false];
    }
    //init record for PairVolume will count all blocks that are < 1day old
    private async initRecord(token0,token1,pairAddress,contract,blockNum,decimal0,decimal1){

        let [swapLogs,syncLogs] = await this.getEventsFromInterval(contract,blockNum-AVERAGE_BLOCK_COUNT_PER_DAY,blockNum);
        let updatedReserves = await this.getReserves(contract,decimal0,decimal1);
        return {
            token0 : token0,
            token1 : token1,
            pairAddr : pairAddress,
            lastBlockNumber : blockNum,
            lastVolume : {
                token0 : 0,
                token1 : 0
            },
            lastReserves : updatedReserves,
            history : swapLogs
        }

    }
    //deletes logs that are out of the time frame
    private async deleteOutOfDate(data){
        let now: any = new Date();
        let updatedHistory = data.history.filter(item=>item.time > (now - GLOBAL_VOLUME_TIME_RANGE));
        return updatedHistory;
    }
    private async addNewLogs(currLogs,newLogs){
        currLogs.push(...newLogs);
        return currLogs;
    }
    private calcNewVolume(currLogs,decimal0,decimal1){

        let token0In = new BigNumber(0);
        let token1In = new BigNumber(0);

        currLogs.forEach(element => {
            
            token0In = token0In.plus(new BigNumber(element.amount0In).div(new BigNumber(`1e+${decimal0}`)));
            // token0Out = token0Out.plus(new BigNumber(element.amount0Out).div(new BigNumber(`1e+${decimal0}`)));
            token1In = token1In.plus(new BigNumber(element.amount1In).div(new BigNumber(`1e+${decimal1}`)));
            // token1Out = token1Out.plus(new BigNumber(element.amount1Out).div(new BigNumber(`1e+${decimal1}`)));
        });

        let lastVolume = {
            token0 : token0In,
            token1 : token1In
        }

        return lastVolume;

    }
    public async getReserves(contract,decimal0,decimal1){
        try {
            let reserves = await contract.methods.getReserves().call();
            return {
                token0: new BigNumber(reserves[0]).div(new BigNumber(`1e+${decimal0}`)),
                token1: new BigNumber(reserves[1]).div(new BigNumber(`1e+${decimal1}`))
            }
        } catch (e){
            return {
                token0 : 0,
                token1 : 0
            }
        }
    }
    public async updateSinglePair(token0,token1,decimal0,decimal1,blockNum){

            token0 = getAddress(token0);
            token1 = getAddress(token1);

            let [_token0, _token1,_decimal0,_decimal1] =
            token0.toLowerCase() < token1.toLowerCase()
                ? [token0, token1, decimal0, decimal1]
                : [token1, token0, decimal1, decimal0];

            //UNISWAP DATA .... 
            let pairAddress = getCreate2Address(
            FACTORY_ADDRESS,
            keccak256(["bytes"], [pack(["address", "address"], [_token0, _token1])]),
            INIT_CODE_HASH
            );
            //ACY DATA ....
            // let pairAddress = getPairAddress(token0,token1);
        
            let contract = new this.web3.eth.Contract(PAIR_CONTRACT_ABI, pairAddress);


            let startBlock = blockNum - AVERAGE_BLOCK_COUNT_PER_DAY;

            let [data, inDatabase] = await this.checkIfExist(pairAddress);

            if(!inDatabase){
                data = await this.initRecord(_token0,_token1,pairAddress,contract,blockNum,_decimal0,_decimal1);
            }

            // first check ..... if exists in database & lastvolume ... return if not reached interval

            if(inDatabase && data.lastVolume.token0 + data.lastVolume.token1 == 0 && blockNum % NO_VOLUME_UPDATE_INTERVAL != 0) {
                return;
            }

            startBlock = Math.max(startBlock,data.lastBlockNumber) + 1;

            // we have either outdated data or new data
            let processed_logs = await this.deleteOutOfDate(data);
            let swapLogs = [];
            let syncLogs = [];
            if(startBlock<blockNum) [swapLogs,syncLogs] = await this.getEventsFromInterval(contract,startBlock,blockNum);

            processed_logs = await this.addNewLogs(processed_logs,swapLogs);

            let updatedReserves = data.lastReserves;

            if(syncLogs.length){
                let reserves0 = syncLogs[syncLogs.length-1].reserve0;
                let reserves1 = syncLogs[syncLogs.length-1].reserve1;
                updatedReserves = {
                    token0 : new BigNumber(reserves0).div(new BigNumber(`1e+${_decimal0}`)),
                    token1 : new BigNumber(reserves1).div(new BigNumber(`1e+${_decimal1}`))
                }
            }

            let updated_volume = await this.calcNewVolume(processed_logs,_decimal0,_decimal1);

            if (inDatabase) {
                await this.pairVolumeModel.updateOne(
                {
                    token0,
                    token1,
                    pairAddr : pairAddress,
                },
                { 
                    lastBlockNumber : blockNum,
                    lastVolume: updated_volume,
                    lastReserves: updatedReserves,
                    history: processed_logs }
                )
            } else {
                await this.pairVolumeModel.create({
                    token0,
                    token1,
                    pairAddr : pairAddress,
                    lastBlockNumber : blockNum,
                    lastVolume: updated_volume,
                    lastReserves: updatedReserves,
                    history: processed_logs
                });
            }

    }
    public async updateVolumeData(blockNum){

        // only update every 4 blocks i.e. 1 minute
        // get Volumes for all pairs of available tokens
        // if(blockNum % SUBSCRIPTION_INTERVAL) return;
        // //just for testing
        // let token0 = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
        // let token1 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
        // let decimal0 = supportedTokens.find(item => item.addressOnEth.toLowerCase() == token0.toLowerCase()).decimals;
        // let decimal1 = supportedTokens.find(item => item.addressOnEth.toLowerCase() == token1.toLowerCase()).decimals;
        // await this.updateSinglePair(token0,token1,decimal0,decimal1,blockNum);
        
        if(blockNum % SUBSCRIPTION_INTERVAL == 0){

            let all_tasks = [];

            for(let i=0;i<supportedTokens.length-1;i++){
                for(let j=i+1;j<supportedTokens.length;j++){

                    all_tasks.push(this.updateSinglePair(supportedTokens[i].addressOnEth,
                        supportedTokens[j].addressOnEth,supportedTokens[i].decimals,
                        supportedTokens[j].decimals,blockNum));
                    
                }
            }
            await Promise.allSettled(all_tasks);
            console.log('solving for %d',all_tasks.length);
        }

    }

    public formatSingle (data){
        if(!data) return null;
        let _data = {
            token0: data.token0,
            token1: data.token1,
            lastReserves: data.lastReserves,
            lastVolume: data.lastVolume,
          };
      
        return _data;
    }

    public async getAllPairs(){
        let data: any = await this.pairVolumeModel.find();
        if(!data) return null
        let _data = data.map((item)=>{
            return this.formatSingle(item)
        })
        return {data : _data};
    }

    public async getPair(token0, token1){

        token0 = getAddress(token0);
        token1 = getAddress(token1);

        let data : any = await this.pairVolumeModel.findOne({ token0 : token0,token1 : token1 }).exec();
        if(!data){
            data = await this.pairVolumeModel.findOne({ token0 : token1,token1 : token0 }).exec();
        }
        let _data = this.formatSingle(data);

        return { data : _data};
    }
}