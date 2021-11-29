import { Service, Inject, Container } from "typedi";
import LiquidityService from "./liquidity";
import SwapService from "./swap";
import { eventHashList, eventList, methodHashList } from "./utils";

@Service()
export default class IndexService {
    count: number;
    lastBlockNum: number | null;
    subscriber: any;
    routerAddr: string;
    scanEventsArr: string[];

    constructor(
        @Inject("web3") private web3,
        public swapService: SwapService,
        public liquidityService: LiquidityService
    ) {
        this.routerAddr = '0x9c040CC3CE4B2C135452370Eed152A72ce5d5b18';
        this.count = 0;
        this.scanEventsArr = ["flashArbitrageSwapPath", "Transfer", "Mint", "Burn"];    // events that will be decoded and processed
    }

    // add processing logic here!
    private async execTasks(txPack) {
        const methodName = txPack.tx.methodName;
        console.log("method name: ", methodName);

        // switch case with methodName
        if (methodName.startsWith("swap")) {
            this.swapService.decodeMultiPath(txPack);   // transaction table
            this.liquidityService.updatePoolVolume(txPack);
        }

    }

    private decodeTx(tx) {
        const methodSignature = tx.input.slice(0, 10);
        const methodName = methodHashList[methodSignature];
        const { from, to } = tx;
        // [optional] we can add tx.input to the return data
        const decodedTx = { from, to, methodName };
        return decodedTx;
    }

    private async decodeLog(txHash) {
        // Fetch logs
        const receipt = await this.web3.eth.getTransactionReceipt(txHash);
        const logs = receipt.logs;

        // decode events
        let decodedLogs = [];
        for (let [idx, log] of logs.entries()) {
            const eventName = eventHashList[log.topics[0]];

            // skip decoding of unimportant events
            if (this.scanEventsArr.indexOf(eventName) == -1) {
                continue;
            }

            let decoded;
            if (eventName == "flashArbitrageSwapPath") {
                // to intermediate
                decoded = this.web3.eth.abi.decodeLog(eventList[eventName], log.data, log.topics);
                // to final
            } else {
                decoded = this.web3.eth.abi.decodeLog(eventList[eventName], log.data, log.topics.slice(1))
            }
            decodedLogs.push({eventName, address: log.address, ...decoded});
        }
        return decodedLogs;
    }

    private async filterAcyTx(blockNum) {
        // filter out only ACY transaction
        const block = await this.web3.eth.getBlock(blockNum, true);
        const acyTx = block.transactions.filter(tx => tx.to == this.routerAddr);

        // decode one and dispatch task
        for (let tx of acyTx) {
            (async () => {
                console.log("tx hash", tx.hash);
                // decode log
                const decodedTx = this.decodeTx(tx);
                const decodedLogs = await this.decodeLog(tx.hash);
                // pack decodedTx and decodedLogs
                const txPack = { tx: decodedTx, logs: decodedLogs };
                // dispatch task
                this.execTasks(txPack);
            })();
        }
    }

    public async subscribe() {
        console.log("start subscription")

        this.subscriber = this.web3.eth.subscribe('newBlockHeaders')
            .on("connected", function (subscriptionId) {
                console.log("connected", subscriptionId);
            })
            .on("data", async (blockHeader) => {
                const { hash, number: blockNum } = blockHeader;
                console.log("currentBlock: ", blockNum);

                this.filterAcyTx(blockNum);

            })
            .on("error", (error) => {
                console.log("error", error);
                this.subscriber.unsubscribe(function (error, success) {
                    if (success) {
                        console.log('Successfully unsubscribed!');
                    }
                });
            });

        // const subscription = this.web3.eth.subscribe('pendingTransaction', {
        //     address: '0x9c040CC3CE4B2C135452370Eed152A72ce5d5b18',
        //     // address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
        // }, function(error, result){
        //     if (!error)
        //         console.log(result);
        // })
        // .on("connected", function(subscriptionId){
        //     console.log(subscriptionId);
        // })
        // .on("data", function(log){
        //     console.log(log);
        // })
        // .on("changed", function(log){
        // });
    }

    private async test() {
        const txHash = '0x04ab11ea081416f9535dd7c5339acc4567708fa24de438fca396fc609885c611';
        const tx = await this.web3.eth.getTransaction(txHash);
        // decode log
        const decodedTx = this.decodeTx(tx);
        const decodedLogs = await this.decodeLog(tx.hash);
        // pack decodedTx and decodedLogs
        const txPack = { tx: decodedTx, logs: decodedLogs };
        // dispatch task
        this.execTasks(txPack);
    }

    public async main() {
        // this.liquidityService.updateDB("0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5", new Date())
        // await this.test();
        this.subscribe();
        // this.count++;
        // console.log(this.count)
        // setTimeout(() => { this.main() }, 15000);
    }
}