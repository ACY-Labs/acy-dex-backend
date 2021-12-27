import mongoose from "mongoose";

const TxList = new mongoose.Schema(
    {
        Router: {
            type: String,
            index: true,
        },
        lastBlockNumber: {
            type: Number,
        },
        txList : []
    },
    { timestamps: true }
);

// convert to model
export default mongoose.model("TxList", TxList);
