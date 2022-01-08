import mongoose from "mongoose";

const TokenPrice = new mongoose.Schema(
  {
    chainId:{
        index:true,
        type:Number,
    },
    tokenList:
    [
        {
            name: String,
            symbol: String,   
            price: Number
        }
        ]
    },{ timestamps: true }
);

export default TokenPrice;
