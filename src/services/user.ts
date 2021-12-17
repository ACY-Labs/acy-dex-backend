import { Service, Inject, Container } from "typedi";
import tokenList from "../constants/supportedTokens";
import BigNumber from "bignumber.js";


@Service()
export default class UserService {

    constructor(
        @Inject("userModel") private userInfoModel,
    ) {
    }
    public async initUser(account){
        await this.userInfoModel.create({
            walletId : account,
            pairs : [],
            totalSwappedValue: 0,
            totalFeesPaid: 0,
            totalTransactions: 0,
            lastTransactionHash : ''
        });
    }
    public async performTx (data){

        console.log(data);

        let walletId = data.address;
        let userRecord = await this.userInfoModel.findOne({ walletId }).exec();

        if(!userRecord) {
            console.log("record not found, creating one")
            await this.initUser(walletId);
            userRecord = await this.userInfoModel.findOne({ walletId }).exec();
        }

<<<<<<< HEAD
=======

>>>>>>> 57eb6823a8165e5ea936d014ce5670df8b692d2b
        if(userRecord.lastTransactionHash == data.hash) return;

        let newTotalSwappedValue =  new BigNumber(data.valueSwapped).plus(userRecord.totalSwappedValue);
        let newTotalFeesPaid = new BigNumber(data.feesPaid).plus(userRecord.totalFeesPaid) ;
<<<<<<< HEAD
=======

        let usdToken = tokenList.find(item => item.symbol == 'USDC');
        let decimal = usdToken.decimals;
>>>>>>> 57eb6823a8165e5ea936d014ce5670df8b692d2b
        let newTotalTransactions = userRecord.totalTransactions + 1;

        await this.userInfoModel.updateOne(
            {
                walletId
            },
            { 
                totalSwappedValue: newTotalSwappedValue,
                totalFeesPaid: newTotalFeesPaid,
                totalTransactions: newTotalTransactions,
                lastTransactionHash : data.hash
            }
<<<<<<< HEAD
=======

>>>>>>> 57eb6823a8165e5ea936d014ce5670df8b692d2b
            )
    }

    public async getAllUsers(){
        let data: any = await this.userInfoModel.find();
        if(!data) return [];
        
        let _data = data.map((item) => {
            return item.walletId;
        })
        return {data : _data};
    }
}