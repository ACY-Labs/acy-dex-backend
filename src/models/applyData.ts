import mongoose from "mongoose";

const ApplyData = new mongoose.Schema(
    {
        id:{
            index:true,
            type:Number,
        },
        walletId:{
            type:Number
        },
        //symbol -> price
        form:
        {
           type:Object,
    
        }
        },{ timestamps: true }
);

export default ApplyData;
