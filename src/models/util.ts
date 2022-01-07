import mongoose from "mongoose";

const Util = new mongoose.Schema(
  {
    chainId:{
        index:true,
        type:Number,
    }
    tokenList:
    [
            name: String,
            symbol: String,
            address: String,
            decimals: Number,
            logoURI: String,
            idOnCoingecko: String,        
        ]
    },{ timestamps: true }
);

export default Util;
