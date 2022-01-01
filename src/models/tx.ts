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

export default TxList;
