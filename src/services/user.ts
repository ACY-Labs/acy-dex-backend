import { Service, Inject } from "typedi";
import BigNumber from "bignumber.js";


@Service()
export default class UserService {

    userInfoModel: any;
    chainId: any;

  constructor(
    models,
    chainId
  ) { 
    this.userInfoModel = models.userInfoModel;
    this.chainId = chainId;
  }
    // constructor(
    //     @Inject("userModel") private userInfoModel,
    // ) {
    // }
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
        let userRecord = await this.userInfoModel.findOne({walletId:
            { $regex: new RegExp("^" + walletId.toLowerCase(), "i") } }).exec();

        if(!userRecord) {
            console.log("record not found, creating one")
            await this.initUser(walletId);
            userRecord = await this.userInfoModel.findOne({ walletId }).exec();
        }

        if(userRecord.lastTransactionHash == data.hash) return;

        let newTotalSwappedValue =  new BigNumber(data.valueSwapped).plus(userRecord.totalSwappedValue);
        let newTotalFeesPaid = new BigNumber(data.feesPaid).plus(userRecord.totalFeesPaid) ;

        let newTotalTransactions = userRecord.totalTransactions + 1;

        await this.userInfoModel.updateOne(
            {
                walletId:
                { $regex: new RegExp("^" + walletId.toLowerCase(), "i") } 
            },
            { 
                totalSwappedValue: newTotalSwappedValue,
                totalFeesPaid: newTotalFeesPaid,
                totalTransactions: newTotalTransactions,
                lastTransactionHash : data.hash
            }

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

    public async addUser(data){

        console.log(data);

        let walletId = data.address;
        let userRecord = await this.userInfoModel.findOne({walletId:
            { $regex: new RegExp("^" + walletId.toLowerCase(), "i") } }).exec();

        if(!userRecord) {
            console.log("record not found, creating one")
            await this.initUser(walletId);
        }
    }

    public async getUserStats(data){
        console.log(data);
        let walletId = data.address;

        let userRecord = await this.userInfoModel.findOne({walletId:
        { $regex: new RegExp("^" + walletId.toLowerCase(), "i") } }).exec();
        if(!userRecord) return {data : 'null'};
        else{
            return{
                data : userRecord
            }
        }
    }
}