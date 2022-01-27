import { JsonRpcProvider } from "@ethersproject/providers";
import moment from 'moment';
import { findTokenInList,findTokenWithSymbol } from "./TokenUtils";
import {methodList, actionList} from '../constants/MethodList';
import {GAS_TOKEN} from '../constants/index';

var supportedTokens;
function failedTransaction(hash){
    return {
    "address" : null,
    "hash": hash,
    "status":0,
    "action":'Failed',
    // "totalToken": totalAmount,
    "token1Number": null,
    "token1Symbol": null,
    "token2Number": null,
    "token2Symbol": null,
    "transactionTime": null
    }
}
async function fetchUniqueETHToToken (hash, timestamp, libraryOut,chainID){
    console.log("fetchUniqueETHToToken",hash);

    try{

        let response = await libraryOut.getTransactionReceipt(hash);
        
        if(!response.status) return {};
        let FROM_HASH = response.from.toLowerCase().slice(2);
        let TO_HASH = response.to.toLowerCase().slice(2);
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(TO_HASH));
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        // console.log("pringting data of tx::::::",response,inLogs,outLogs);
        let inToken = findTokenInList(inLogs[0],supportedTokens);
        let outToken =  findTokenInList(outLogs[0],supportedTokens);

        inLogs = inLogs.filter(log => log.address.toLowerCase() == inToken.address.toLowerCase());
        outLogs = outLogs.filter(log => log.address.toLowerCase() == outToken.address.toLowerCase());

        
        // console.log(inToken,outToken);
        // console.log("debug finished");

        let inTokenNumber = 0;
        let outTokenNumber = 0;

        for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
        // inTokenNumber = inTokenNumber.toString();
        for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
        // outTokenNumber = outTokenNumber.toString();         

        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = timestamp;
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');


        // let totalAmount = totalInUSD([
        //     {
        //         token : inToken.symbol,
        //         amount : parseFloat(inTokenNumber)
        //     },
        // ],tokenPriceUSD);

        // console.log(response);

        return {
            "address" : response.from,
            "hash": hash,
            "action" : 'Swap',
            // "totalToken": totalAmount,
            "token1Number": inTokenNumber,
            "token1Symbol": inToken.symbol,
            "token2Number": outTokenNumber,
            "token2Symbol": outToken.symbol,
            "transactionTime": transactionTime,
        };

    }catch(e){
        return failedTransaction(hash);
    }

        
}

async function fetchUniqueTokenToETH(hash, timestamp, libraryOut,chainID){

    console.log("fetchUniqueTokenToETH",hash);

    try {

        let response = await libraryOut.getTransactionReceipt(hash);
        
        if(!response.status) return {};
        let FROM_HASH = response.from.toLowerCase().slice(2);
        let TO_HASH = response.to.toLowerCase().slice(2);
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));
        let inToken = findTokenInList(inLogs[0],supportedTokens);
        let outToken =  findTokenInList(outLogs[0],supportedTokens);
        let inTokenNumber = 0;
        let outTokenNumber = 0;

        inLogs = inLogs.filter(log => log.address.toLowerCase() == inToken.address.toLowerCase());
        outLogs = outLogs.filter(log => log.address.toLowerCase() == outToken.address.toLowerCase());

        for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
        // inTokenNumber = inTokenNumber.toString();
        for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
        // outTokenNumber = outTokenNumber.toString();
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = timestamp;
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        // let totalAmount = totalInUSD([
        //     {
        //         token : inToken.symbol,
        //         amount : parseFloat(inTokenNumber)
        //     },
        // ],tokenPriceUSD);

        return  {
            "address" : response.from,
            "action" : 'Swap',
            "hash": hash,
            // "totalToken": totalAmount,
            "token1Number": inTokenNumber,
            "token1Symbol": inToken.symbol,
            "token2Number": outTokenNumber,
            "token2Symbol": outToken.symbol,
            "transactionTime": transactionTime,
        };

    }catch(e){
        return failedTransaction(hash);

    }

    
}

async function fetchUniqueTokenToToken(hash, timestamp, libraryOut,chainID){

    console.log("fetchUniqueTokenToToken",hash);

    try{
        let response = await libraryOut.getTransactionReceipt(hash);
        // console.log(response);
        let FROM_HASH = response.from.toLowerCase().slice(2);
        if(!response.status) return {};
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
    
        let inToken = findTokenInList(inLogs[0],supportedTokens);
        let outToken =  findTokenInList(outLogs[0],supportedTokens);
    
        let inTokenNumber = 0;
        let outTokenNumber = 0;

        inLogs = inLogs.filter(log => log.address.toLowerCase() == inToken.address.toLowerCase());
        outLogs = outLogs.filter(log => log.address.toLowerCase() == outToken.address.toLowerCase());
    
        for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
        // inTokenNumber = inTokenNumber.toString();
        for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
        // outTokenNumber = outTokenNumber.toString();
    
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = timestamp;
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');
    
    
        // let totalAmount = totalInUSD([
        //     {
        //         token : inToken.symbol,
        //         amount : parseFloat(inTokenNumber)
        //     },
        // ],tokenPriceUSD);
    
        return {
            "address" : response.from,
            "hash": hash,
            "action" : 'Swap',
            // "totalToken": totalAmount,
            "token1Number": inTokenNumber,
            "token1Symbol": inToken.symbol,
            "token2Number": outTokenNumber,
            "token2Symbol": outToken.symbol,
            "transactionTime": transactionTime,
            // "gasFee" : gasFee
        }

    }catch(e){
        console.log(e)
        return failedTransaction(hash);
    }
    
}

async function fetchUniqueAddLiquidity(hash, timestamp, libraryOut,chainID){

    console.log("fetchUniqueAddLiquidity",hash);

    try {

        let response = await libraryOut.getTransactionReceipt(hash);
        let FROM_HASH = response.from.toLowerCase().slice(2);
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let tokensOut = new Set();
        for(let log of outLogs){
            tokensOut.add(log.address);
        }
         
        tokensOut = Array.from(tokensOut);

        let logsToken1 = outLogs.filter(log => log.address==tokensOut[0]);
        let logsToken2 = outLogs.filter(log => log.address==tokensOut[1]);

        let token1 = findTokenInList(logsToken1[0],supportedTokens);
        let token2 =  findTokenInList(logsToken2[0],supportedTokens);

        let token1Number = 0;
        for(let log of logsToken1){
            if(log.address.toLowerCase() == token1.address.toLowerCase()) token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))
        };
        // console.log(token1Number);
        // token1Number = token1Number.toString();
        let token2Number = 0;
        for(let log of logsToken2){
            if(log.address.toLowerCase() == token2.address.toLowerCase()) token2Number += (log.data / Math.pow(10, token2.decimals))
        };
        // token2Number = token2Number.toString();
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = timestamp;
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        // let totalAmount = totalInUSD([
        //     {
        //         token : token1.symbol,
        //         amount : parseFloat(token1Number)
        //     },
        //     {
        //         token : token2.symbol,
        //         amount : parseFloat(token2Number)
        //     }
        // ],tokenPriceUSD);

        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Add',
        // "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })

    }catch (e){
        console.log("entered here 2");
        console.log(e);
        return failedTransaction(hash);
    }
    

            
}
        
export async function fetchUniqueRemoveLiquidity(hash, timestamp, libraryOut,chainID){

    console.log("fetchUniqueRemoveLiquidity",hash);

    try {

        let response = await libraryOut.getTransactionReceipt(hash);
        let FROM_HASH = response.from.toLowerCase().slice(2);
        // console.log('filtered data',response);
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        // console.log('filtered logs',outLogs);
        let tokensIn = new Set();
        for(let log of inLogs){
            tokensIn.add(log.address);
        }
        // console.log(tokensIn);
        tokensIn = Array.from(tokensIn);
        // console.log('set',tokensIn);

        let logsToken1 = inLogs.filter(log => log.address==tokensIn[0]);
        let logsToken2 = inLogs.filter(log => log.address==tokensIn[1]);

        let token1 = findTokenInList(logsToken1[0],supportedTokens);
        let token2 =  findTokenInList(logsToken2[0],supportedTokens);

        let token1Number = 0;
        for(let log of logsToken1){token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))};
        // token1Number = token1Number.toString();
        let token2Number = 0;
        for(let log of logsToken2){token2Number += (log.data / Math.pow(10, token2.decimals))};
        // token2Number = token2Number.toString();

        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = timestamp;
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        // let totalAmount = totalInUSD([
        //     {
        //         token : token1.symbol,
        //         amount : parseFloat(token1Number)
        //     },
        //     {
        //         token : token2.symbol,
        //         amount : parseFloat(token2Number)
        //     }
        // ],tokenPriceUSD);

        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Remove',
        // "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })
    }catch (e){
        console.log(e)
        return failedTransaction(hash);
    }
    
}

export async function fetchUniqueAddLiquidityEth(hash, timestamp, libraryOut,chainID){
    console.log("fetchUniqueAddLiquidityEth",hash);

    try{

        let response = await libraryOut.getTransactionReceipt(hash);
        let TO_HASH = response.to.toLowerCase().slice(2);
        let FROM_HASH = response.from.toLowerCase().slice(2);
        let logsToken1 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let logsToken2 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(TO_HASH));
    
        let token1 = findTokenInList(logsToken1[0],supportedTokens);
        let token2 =  findTokenInList(logsToken2[0],supportedTokens);
    
        let token1Number = 0;
        for(let log of logsToken1){token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))};
        // token1Number = token1Number.toString();
        let token2Number = 0;
        for(let log of logsToken2){token2Number += (log.data / Math.pow(10, token2.decimals))};
        // token2Number = token2Number.toString();
    
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = timestamp;
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');
    
        // let totalAmount = totalInUSD([
        //     {
        //         token : token1.symbol,
        //         amount : parseFloat(token1Number)
        //     },
        //     {
        //         token : token2.symbol,
        //         amount : parseFloat(token2Number)
        //     }
        // ],tokenPriceUSD);
    
        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Add',
        // "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })

    }catch (e){
        console.log(e);
        return failedTransaction(hash);
    }

}

export async function fetchUniqueRemoveLiquidityEth(hash, timestamp, libraryOut,chainID){

    console.log("fetchUniqueRemoveLiquidityEth",hash);

    try {

        let response = await libraryOut.getTransactionReceipt(hash);
        let TO_HASH = response.to.toLowerCase().slice(2);
        let FROM_HASH = response.from.toLowerCase().slice(2);
        let logsToken1 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        let logsToken2 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));

        let token1 = findTokenInList(logsToken1[0],supportedTokens);
        let token2 =  findTokenWithSymbol(GAS_TOKEN[chainID],supportedTokens);


        let token1Number = 0;
        for(let log of logsToken1){
            if(log.address.toLowerCase() == token1.address.toLowerCase()) token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))
        };

        let token2Number = 0;
        for(let log of logsToken2){
            if(log.address.toLowerCase() == token2.address.toLowerCase()) token2Number += (log.data / Math.pow(10, token2.decimals))
        };

        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = timestamp;
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        // let totalAmount = totalInUSD([
        //     {
        //         token : token1.symbol,
        //         amount : parseFloat(token1Number)
        //     },
        //     {
        //         token : token2.symbol,
        //         amount : parseFloat(token2Number)
        //     }
        // ],tokenPriceUSD);

        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Remove',
        // "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })        
    }catch(e){
        console.log(e);
        return failedTransaction(hash);
    }

}

export async function parseTxData(status, receiptHash,timestamp,input, libraryOut, chainID, tokenList){

    supportedTokens = tokenList;

    // console.log(libraryOut);
    let newData = {};

    if(status!=1) return failedTransaction(receiptHash);

    // console.log("fetching data for this tx",receiptHash);
    // console.log(input);

    if(input == methodList.ethToToken.id || input==methodList.ethToExactToken.id || input==methodList.ethToTokenAbr.id || input==methodList.ethToExactTokenAbr.id){

        newData = await fetchUniqueETHToToken(receiptHash,timestamp, libraryOut,chainID);      

    }
    else if(input==methodList.tokenToEth.id || input==methodList.tokenToEthAbr.id || input==methodList.tokenToExactEth.id || input==methodList.tokenToExactEthAbr.id){
        
        newData  = await fetchUniqueTokenToETH(receiptHash,timestamp, libraryOut, chainID);
        
    }
    else if(input==methodList.tokenToToken.id || input==methodList.tokenToTokenAbr.id || input==methodList.tokenToExactTokenAbr.id || input==methodList.tokenToExactToken.id){
        
        newData = await fetchUniqueTokenToToken(receiptHash,timestamp, libraryOut, chainID);
    }
    else if(input==methodList.addLiquidity.id){

        newData = await fetchUniqueAddLiquidity(receiptHash,timestamp, libraryOut, chainID);
        
    }else if(input==methodList.removeLiquidity.id || input==methodList.removeLiquidityWithPermit.id){

        newData = await fetchUniqueRemoveLiquidity(receiptHash,timestamp, libraryOut, chainID);
        
    }else if(input==methodList.removeLiquidityETH.id || input==methodList.removeLiquidityETHwithPermit.id){

        newData = await fetchUniqueRemoveLiquidityEth(receiptHash,timestamp, libraryOut, chainID);

    }else if(input==methodList.addLiquidityEth.id) {
        newData = await fetchUniqueAddLiquidityEth(receiptHash,timestamp, libraryOut, chainID);
    }else {
        newData = failedTransaction(receiptHash);
    }
    
    return newData;

}