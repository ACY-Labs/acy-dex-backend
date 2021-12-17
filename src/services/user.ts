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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            lastTransactionHash : ''
=======
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
            lastTransactionHash : ''
>>>>>>> 3401f56817e94faeb741c095b66c36e5bf210629
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======

>>>>>>> 57eb6823a8165e5ea936d014ce5670df8b692d2b
>>>>>>> 3401f56817e94faeb741c095b66c36e5bf210629
        if(userRecord.lastTransactionHash == data.hash) return;

        let newTotalSwappedValue =  new BigNumber(data.valueSwapped).plus(userRecord.totalSwappedValue);
        let newTotalFeesPaid = new BigNumber(data.feesPaid).plus(userRecord.totalFeesPaid) ;
<<<<<<< HEAD
=======
=======
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
        let usdToken = tokenList.find(item => item.symbol == 'USDC');
        let decimal = usdToken.decimals;

        let newTotalSwappedValue =  new BigNumber(data.valueSwapped).div(new BigNumber(`1e+${decimal}`)).plus(userRecord.totalSwappedValue);
        let newTotalFeesPaid = new BigNumber(data.feesPaid).div(new BigNumber(`1e+${decimal}`)).plus(userRecord.totalFeesPaid) ;
<<<<<<< HEAD
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
<<<<<<< HEAD
=======

        let usdToken = tokenList.find(item => item.symbol == 'USDC');
        let decimal = usdToken.decimals;
>>>>>>> 57eb6823a8165e5ea936d014ce5670df8b692d2b
>>>>>>> 3401f56817e94faeb741c095b66c36e5bf210629
        let newTotalTransactions = userRecord.totalTransactions + 1;

        await this.userInfoModel.updateOne(
            {
                walletId
            },
            { 
                totalSwappedValue: newTotalSwappedValue,
                totalFeesPaid: newTotalFeesPaid,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                totalTransactions: newTotalTransactions,
                lastTransactionHash : data.hash
            }
=======
                totalTransactions: newTotalTransactions, }
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
                totalTransactions: newTotalTransactions, }
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
                totalTransactions: newTotalTransactions,
                lastTransactionHash : data.hash
            }
<<<<<<< HEAD
=======

>>>>>>> 57eb6823a8165e5ea936d014ce5670df8b692d2b
>>>>>>> 3401f56817e94faeb741c095b66c36e5bf210629
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