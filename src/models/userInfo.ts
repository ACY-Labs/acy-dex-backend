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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        lastTransactionHash : { type : String}
=======
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
>>>>>>> 890647a14108276ea95025fb9ac9f5cb5d0964d3
=======
        lastTransactionHash : { type : String}
>>>>>>> 3401f56817e94faeb741c095b66c36e5bf210629
    },
    { timestamps: true }
);

// convert to model
export default mongoose.model("UserInfo", UserInfo);
