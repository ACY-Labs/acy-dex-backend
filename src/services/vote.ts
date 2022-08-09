import { Service, Inject, Container } from "typedi";
import { isTemplateExpression, OuterExpressionKinds, resolveModuleName } from "typescript";
import Web3 from "web3";
import { Logger } from "winston";
import { getLPTokenRatio,getLPTokenInUsda,getAcyToken, getAcyTokenInUsda } from "../util";

export default class VoteService {
    walletId: string
    logger: Logger;
    voteModel: any;

    constructor(constants, models, logger) {
        this.walletId = constants.walletId;
        this.logger = logger
        this.voteModel = models.voteModel
    }

    private getDayUnix(day:number){
        const today = new Date();
        const first = today.getDate() - today.getDay() + day;

        const monday = new Date(today.setDate(first));
        monday.setHours(0,0,0,0)
        return Math.floor(monday.getTime());
    }

    public async createVote(_walletId:String, body: any) {
        let LPTokenRatio = await getLPTokenRatio(_walletId)
        console.log("lpTokenValue",LPTokenRatio)
        let AcyToken = await getAcyToken(_walletId)
        console.log("acyTokenValue", AcyToken)

        let data:any = await this.voteModel.find({createdAt:{$gte: this.getDayUnix(1),$lte: this.getDayUnix(8)},walletId:_walletId});
        // console.log(data)
        if (data.length==0){
            await this.voteModel.create({
                walletId: _walletId,
                lpToken: LPTokenRatio,
                acyToken: AcyToken,
                voteWeight: body.voteWeight
            });
            return true
        }else{
            console.log("user already vote!")
            return false
        }
    }

    public async getAllVotes() {
        let data:any = await this.voteModel.find();
        if(!data) return [];

        let _data = await Promise.all(data.map(async (item)=>{
            const date = new Date(item.createdAt)
            return {
                "walletId": item.walletId,
                "lpToken": item.lpToken,
                "lpTokenValue": await getLPTokenInUsda(item.lpToken),
                "acyToken": item.acyToken,
                "acyTokenValue": await getAcyTokenInUsda(item.acyToken),
                "voteWeight": item.voteWeight.map((weight)=>{
                    return {"tokenName":weight.tokenName,"weight":weight.weight}
                }),
                "createdAt": item.createdAt,
                "createdAtUnix": Math.floor(date.getTime() / 1000)
            }
        }))

        return {data: _data};
    }

    public async getVotes(from:any, to:any) {
        let fromUnix = from*1000
        let toUnix = to*1000
        let data:any = await this.voteModel.find({createdAt:{$gte: fromUnix,$lte: toUnix},walletId:"0x0754f7fC90F842a6AcE8B6Ec89e4eDadeb2A9bA5"});
        if(!data) return [];

        let _data = await Promise.all(data.map(async (item)=>{
            const date = new Date(item.createdAt)
            return {
                "walletId": item.walletId,
                "lpToken": item.lpToken,
                "lpTokenValue": await getLPTokenInUsda(item.lpToken),
                "acyToken": item.acyToken,
                "acyTokenValue": await getAcyTokenInUsda(item.acyToken),
                "voteWeight": item.voteWeight.map((weight)=>{
                    return {"tokenName":weight.tokenName,"weight":weight.weight}
                }),
                "createdAt": item.createdAt,
                "createdAtUnix": Math.floor(date.getTime() / 1000)
            }
        }))
        let totalTokenValue = 0
        let _resultData = await Promise.all(data.map(async (item)=>{
            const tokenValue = await getLPTokenInUsda(item.lpToken) + await getAcyTokenInUsda(item.acyToken)
            let voteWeight = item.voteWeight.map((weight)=>{
                return {"tokenName":weight.tokenName,"weight":weight.weight*tokenValue}
            })
            totalTokenValue += tokenValue
            return {
                "totalValue": tokenValue,
                "voteWeight": voteWeight,
            }
        }))
        let voteResult = {}
        _resultData.map((item)=>{
            item.voteWeight.map((weight)=>{
                if (voteResult[weight.tokenName]){
                    voteResult[weight.tokenName] += weight.weight / totalTokenValue
                }else{
                    voteResult[weight.tokenName] = weight.weight / totalTokenValue
                }
            })
        })

        return {data: _data, result: voteResult};
    }

}