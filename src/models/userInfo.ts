import mongoose from "mongoose";

const UserInfo = new mongoose.Schema(
    {
        walletId: {
            type: String,
            index: true,
        },
        pairs: [
            {
                id: { type: String },
                token0: { type: String },
                token1: { type: String },
                token0deposited: {type: Number},
                token1deposited: {type: Number},
                earned: {type:Number},
                
                // holdingPercentage: { type: Number } // should be calculated on front end , because this changes every seconds
            }
        ],
        totalSwappedValue: { type: Number },
        totalFeesPaid: { type: Number },
        totalTransactions: { type: Number },

        lastTransactionHash : { type : String}
    },
    { timestamps: true }
);

export default UserInfo;
