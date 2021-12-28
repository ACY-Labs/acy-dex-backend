import { Service, Inject, Container } from "typedi";
import {
    BSCSCAN_API,
    TX_LIST_GLOBAL_START_BLOCK,
    TX_LIST_MAX_BLOCK_NUMBER,
    BSCSCAN_API_KEY,
    TX_LIST_REFRESH_TIME,
    OFFSET,
    ACY_ROUTER

} from "../constants";
import supportedTokens from "../constants/uniqueTokens";
import {getPairAddress} from "../util/index"
import { Logger } from "winston";
import axios from 'axios';
import {parseTxData} from '../util/txData';
import { JsonRpcProvider } from "@ethersproject/providers";
import txList from "../api/routes/txList";
@Service()
export default class TxService {

    constructor(
        @Inject("web3") private web3,
        @Inject("txListModel") private txListModel,
    ) {}

    public libraryOut = new JsonRpcProvider('https://bsc-dataseed1.defibit.io/');

    private logger: Logger = Container.get("logger");
    
    //function finds the bottom of new list in currlist and deletes the remaining if already passed

    public async findNewTxList(currList, newList){

        // this.logger.debug("got a current list of %d items and new list with %d transactions",currList.length,newList.length);
        // this.logger.debug(currList[currList.length-1],newList[newList.length-1].hash);

        let currLength = currList.length;

        let index_bottom = currLength-1;
        
        while(index_bottom>=0 && currList[index_bottom].hash.toLowerCase()!=newList[newList.length-1].hash.toLowerCase()) index_bottom --;

        if(index_bottom==-1) return [[],newList];

        // this.logger.debug(index_bottom);

        let _currList = currList.slice(0,index_bottom+1);
        
        let index_top = 0;

        while(index_top<newList.length && newList[index_top].hash.toLowerCase() != _currList[0].hash.toLowerCase()) index_top++;

        if(index_top==0) return [_currList,[]];
        
        else return [_currList,newList.slice(0,index_top)];

    }

    public async updateUnique(address,blockNum){

        let user_tx: any = await this.txListModel.findOne({Router : address}).exec();
            
        let currTxList = user_tx ? user_tx.txList : [];

        let startBlock = user_tx ? user_tx.lastBlockNumber+1 : 0;
        let request = BSCSCAN_API+'?module=account&action=txlist&address='+address+'&startblock=13548140&endblock='+blockNum+'&page=1&offset='+OFFSET+'&sort=desc&apikey='+BSCSCAN_API_KEY;
        let response = await axios.get(request);
        let data = await response.data.result;

        let [_currList,_toAdd] = await this.findNewTxList(currTxList,data);
        this.logger.debug("currently data list having %d and adding %d txs", _currList.length,_toAdd.length);
        // this.logger.debug(_currList.slice(-2),_toAdd);
        for(let i=0;i<_toAdd.length;i++){
            _toAdd[i] = await parseTxData(_toAdd[i].hash, _toAdd[i].timeStamp, _toAdd[i].input.substring(0,10),this.libraryOut)
        }

        _toAdd.push(..._currList);
        _currList = _toAdd;


        if (user_tx) {
            this.logger.debug("updating in db");
            await this.txListModel.updateOne(
            {
                 Router : address,
            },
            { 
                lastBlockNumber : blockNum,
                txList : _currList
            }
            )
            this.logger.debug("UPDATED!");
        } else {
            this.logger.debug("created in db");
            await this.txListModel.create({
                Router : address,
                lastBlockNumber : blockNum,
                txList : _currList
            });
            this.logger.debug("wrote in Dd");
        }        
    }

    public async updateTxList() {
        
        let runningFlag = Container.get('runningFlag');
        if(runningFlag['isUpdatingTxList']) {
            this.logger.warn('TxList already updating.');
            return;
        }

        runningFlag['isUpdatingTxList'] = true;
        Container.set('runningFlag', runningFlag);
        this.logger.debug("updating tx list......");

        let now = new Date().getTime();
        // these looks like  a naive approach but its very stable after testing, if we
        // update the interval of blocks we are fetching from, some transactions might be skipped.
        //if records dont exist, start recording slowly bcs of a limit of data for request
        try {
            let blockNum = await this.web3.eth.getBlockNumber();
            await this.updateUnique(ACY_ROUTER,blockNum);
            this.logger.debug("SUCCESSFULLY fetched data for 1 ROUTER");
        } catch (e){
            this.logger.debug("FETCH DATA UNSUCCESSFUL with error -- > ",e);
        }

        runningFlag['isUpdatingTxList'] = false;
        Container.set('runningFlag', runningFlag);
    }

    //GETTER FUNCTIONS ....

    public async getAllTx(data){

        let range = data.range;
        let txList: any = await this.txListModel.find();

        if(!txList) return {data : 'no data'};
        else txList = txList[0].txList;

        if(txList.length <= range) return {data : txList};
        else return {data : txList.slice(0,range)};

    }
    public async getTxListForToken(data){

        let range = data.range;
        let txList: any = await this.txListModel.find();
        if(!txList) return {data : 'no data'};
        else txList = txList[0];

        let _txList = txList.txList.filter(item => item.token1Symbol == data.symbol || item.token2Symbol == data.symbol );


        if(_txList.length <= range) return {data : _txList};
        else return {data : _txList.slice(0,range)};


    }
    public async getTxListForPair(data){

        let range = data.range;
        let txList: any = await this.txListModel.find();

        if(!txList) return {data : 'no data'};
        else txList = txList[0];


        let _txList = txList.txList.filter(item => (item.token1Symbol == data.token1 && item.token2Symbol == data.token2) || (item.token2Symbol == data.token1 && item.token1Symbol == data.token2) );


        if(_txList.length <= range) return {data : _txList};
        else return {data : _txList.slice(0,range)};
    }
}