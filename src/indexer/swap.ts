import { Service, Inject, Container } from "typedi";
import { decodeTokenAmount, getPairAddress } from "../util";


@Service()
export default class SwapService {
    constructor(
        @Inject("web3") private web3
    ) { }

    public async decodeMultiPath(txPack) {
        const {logs} = txPack;

        const flashSwapLog = logs[logs.length - 1];
        const inToken = flashSwapLog.inToken;
        const outToken = flashSwapLog.outToken;

        const intermediateTokens = flashSwapLog.allPath.filter((path, idx) => flashSwapLog.XiArr[idx] > 0 && path != outToken); // remove direct path
        const directPool = getPairAddress(inToken, outToken);
        const pools1 = intermediateTokens.reduce((prev, imToken) => ({ ...prev, [getPairAddress(inToken, imToken)]: imToken }), {});
        const pools2 = intermediateTokens.reduce((prev, imToken) => ({ ...prev, [getPairAddress(outToken, imToken)]: imToken }), {});


        const allocAs = {};
        const allocBs = {};
        const allocCs = {};
        for (let log of logs) {
            if (log.eventName == "Transfer") {
                const decodedTransfer = log;
                // check both direct and indirect swap
                if (pools1[decodedTransfer.to] || decodedTransfer.to == directPool) {
                    const imToken = pools1[decodedTransfer.to];
                    allocAs[imToken] = decodeTokenAmount(inToken, decodedTransfer.value);
                } else if (pools2[decodedTransfer.from] || decodedTransfer.from == directPool) {
                    const imToken = pools2[decodedTransfer.from];
                    allocCs[imToken] = decodeTokenAmount(outToken, decodedTransfer.value);
                } else if (intermediateTokens.indexOf(log.address) > -1) {
                    const imToken = log.address;
                    allocBs[imToken] = decodeTokenAmount(imToken, decodedTransfer.value);
                }
            }
        }
        console.log(allocAs, allocBs, allocCs);
    }
}
