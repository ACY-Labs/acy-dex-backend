import mongoose from "mongoose";

const TokenPrice = new mongoose.Schema(
  {
    chainId:{
        index:true,
        type:Number,
    },
    //symbol -> price
    symbol:
    {
       type: Map,
        of: String

    }
    },{ timestamps: true }
);

export default TokenPrice;
