import { Service } from "typedi";
import { getAddress } from "@ethersproject/address";
import BigNumber from "bignumber.js";
import {
    PAIR_CONTRACT_ABI,
    AVERAGE_BLOCK_COUNT_PER_DAY,
    GLOBAL_VOLUME_TIME_RANGE,
    AVERAGE_BLOCK_GEN_TIME,
    HISTORICAL_DATA_UPDATE_COUNT,
    RPC_URL
  } from "../constants";
import {getPairAddress} from "../util/index";
import Web3 from "web3";
import TokenListSelector from "../constants/tokenAddress";
@Service()
export default class PoolVolumeService {

    pairVolumeModel: any;
    chainId: any;
    web3: any;
    config : any;
    supportedTokens : any;

  constructor(
    models,
    chainId
  ) { 
    this.pairVolumeModel = models.pairVolumeModel;
    this.chainId = chainId;
    this.web3 = new Web3(RPC_URL[this.chainId]);
    this.config = models.configModel;
  }

    // constructor(
    //     @Inject("web3") private web3,
    //     @Inject("pairVolumeModel") private pairVolumeModel
    // ) {
    // }

    private async getEventsFromInterval (contract,lb,rb) {

        // console.log("getting events from interval",lb,rb);

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
            let { sender, amount0In, amount0Out, amount1In, amount1Out } =
            swapLogs[i].returnValues;
            let log_time = new Date(now);
            let log_time_msec = ((rb-swapLogs[i].blockNumber)*AVERAGE_BLOCK_GEN_TIME[this.chainId]);
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
        // console.log(updatedReserves.token0,updatedReserves.token1);
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
    public async deleteOutOfDateHistorical(data){
        if(!data.historicalData) return null;
        else{
            if(data.historicalData.length < HISTORICAL_DATA_UPDATE_COUNT) return data.historicalData;
            else return data.historicalData.slice(data.historicalData.length - HISTORICAL_DATA_UPDATE_COUNT,data.historicalData.length);
        }
    }
    public async updateSinglePair(token0,token1,decimal0,decimal1,blockNum){

            // console.log("looking for tokenss... -- > " , token0, token1);

            token0 = getAddress(token0);
            token1 = getAddress(token1);

            let [_token0, _token1,_decimal0,_decimal1] =
            token0.toLowerCase() < token1.toLowerCase()
                ? [token0, token1, decimal0, decimal1]
                : [token1, token0, decimal1, decimal0];

            token0 = _token0;
            token1 = _token1;

            //UNISWAP DATA .... 
            // let pairAddress = getCreate2Address(
            // FACTORY_ADDRESS,
            // keccak256(["bytes"], [pack(["address", "address"], [_token0, _token1])]),
            // INIT_CODE_HASH
            // );
            //ACY DATA ....
            let pairAddress = getPairAddress(token0,token1,this.chainId);
        
            let contract = new this.web3.eth.Contract(PAIR_CONTRACT_ABI, pairAddress);


            let startBlock = blockNum - AVERAGE_BLOCK_COUNT_PER_DAY;

            let [data, inDatabase] = await this.checkIfExist(pairAddress);
            

            if(!inDatabase){
                data = await this.initRecord(_token0,_token1,pairAddress,contract,blockNum,_decimal0,_decimal1);
                // console.log("didnt find this liquidity pool", data);
            }

            //  COMMENT OUT FOLLOWING LINES TO SKIP FETCHING DATA FROM NO_VOLUUME PAIRS
            // first check ..... if exists in database & lastvolume ... return if not reached interval
            // if(inDatabase && data.lastVolume.token0 + data.lastVolume.token1 == 0 && (blockNum - data.lastBlockNumber) < NO_VOLUME_UPDATE_INTERVAL) {
            //     return;
            // }

            startBlock = Math.max(startBlock,data.lastBlockNumber) + 1;

            // we have either outdated data or new data
            let processed_logs = await this.deleteOutOfDate(data);
            let swapLogs = [];
            let syncLogs = [];
            if(startBlock<blockNum) [swapLogs,syncLogs] = await this.getEventsFromInterval(contract,startBlock,blockNum);
            // console.log(swapLogs,syncLogs);

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

            let historicalData = await this.deleteOutOfDateHistorical(data);

            let today = new Date();
            let todaysrt = today.toISOString().substring(0, 10);;

            if(historicalData){

                let newLog = {
                    date : todaysrt,
                    volume24h : updated_volume,
                    reserves : updatedReserves
                };

                if(historicalData[historicalData.length - 1].date == todaysrt) {
                    historicalData[historicalData.length - 1] = newLog;
                }else{
                    historicalData.push(newLog);
                }

            }else{
                historicalData = [
                    {
                        date : todaysrt,
                        volume24h : updated_volume,
                        reserves : updatedReserves

                    }
                ]
            }

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
                    historicalData : historicalData,
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
                    historicalData :historicalData,
                    history: processed_logs
                });
            }

    }
    public async updateVolumeData(){

        // only update every 4 blocks i.e. 1 minute
        // get Volumes for all pairs of available tokens
        // if(blockNum % SUBSCRIPTION_INTERVAL) return;
        //just for testing
        // let blockNum = await this.web3.eth.getBlockNumber();
        // let token0 = '0x55d398326f99059ff775485246999027b3197955';
        // let token1 = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
        // let decimal0 = this.supportedTokens.find(item => item.address.toLowerCase() == token0.toLowerCase()).decimals;
        // let decimal1 = this.supportedTokens.find(item => item.address.toLowerCase() == token1.toLowerCase()).decimals;
        // await this.updateSinglePair(token0,token1,decimal0,decimal1,blockNum);

        try{

            let blockNum = await this.web3.eth.getBlockNumber();
            let modelRequest = await this.config.findOne({attr : "tokenList"}).exec();
            this.supportedTokens = modelRequest.value;

            let all_tasks = [];

            for(let i=0;i<this.supportedTokens.length-1;i++){
                for(let j=i+1;j<this.supportedTokens.length;j++){

                    all_tasks.push(this.updateSinglePair(this.supportedTokens[i].address,
                        this.supportedTokens[j].address,this.supportedTokens[i].decimals,
                        this.supportedTokens[j].decimals,blockNum));
                    
                }
            }
            let solved = await Promise.allSettled(all_tasks);
            console.log("fetched data successfully for %d pairs out of",solved.filter(item => item.status == 'fulfilled').length, all_tasks.length);
            // console.log('solving for %d',all_tasks.length);
            
        }catch (e){
            console.log("failed to fetch transactions with error : ", e);
        }

        return true;
        

    }

    public formatSingle (data){
        if(!data) return null;
        let _data = {
            pairAddr : data.pairAddr,
            token0: data.token0,
            token1: data.token1,
            lastReserves: data.lastReserves,
            lastVolume: data.lastVolume,
          };
      
        return _data;
    }

    public async getAllPairs(){
        let data: any = await this.pairVolumeModel.find();
        if(!data) return [];
        let _data = data.map((item)=>{
            return this.formatSingle(item)
        })
        return {data : _data};
    }

    public async getPair(query){

        //query might have pairAddress or token1 and tokenn 2 address

        if(query.pairAddr){
            let data : any = await this.pairVolumeModel.findOne({pairAddr:
                { $regex: new RegExp("^" + query.pairAddr.toLowerCase(), "i") }}).exec();
            
            let _data = this.formatSingle(data);

            return {data : _data};
        }else{

            let token0 = query.token0;
            let token1 = query.token1;

            let data : any = await this.pairVolumeModel.findOne({token0:
                { $regex: new RegExp("^" + token0.toLowerCase(), "i") } ,token1:
                { $regex: new RegExp("^" + token1.toLowerCase(), "i") } }).exec();
            if(!data){
                data = await this.pairVolumeModel.findOne({token0:
                    { $regex: new RegExp("^" + token1.toLowerCase(), "i") } ,token1:
                    { $regex: new RegExp("^" + token0.toLowerCase(), "i") } }).exec();
            }
            let _data = this.formatSingle(data);
    
            return { data : _data};

        }

    }

    public async getHistoricalData(){

        let data: any = await this.pairVolumeModel.find();
        if(!data) return [];
        
        let _data = data.map((item) => {
            return {
                token0 : item.token0,
                token1 : item.token1,
                historicalData : item.historicalData
            }
        })
        return {data : _data};

    }
    public async getPairHistorical(query){

        let data: any = await this.pairVolumeModel.find({pairAddr:
            { $regex: new RegExp("^" + query.pairAddr.toLowerCase(), "i") }}).exec();
        
        if(!data) return [];

        let _data = data.map((item) => {
            return {
                token0 : item.token0,
                token1 : item.token1,
                historicalData : item.historicalData
            }
        })
        
        return {data : _data[0]};
    }
}