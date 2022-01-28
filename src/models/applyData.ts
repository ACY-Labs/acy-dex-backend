import mongoose from "mongoose";

const ApplyData = new mongoose.Schema(
    {
        walletId:{
            type:Number,
            index:true,
            required:true,
        },
        //symbol -> price
        form:
        {
           type:Object,
    
        }
        },{ timestamps: true }
);

export default ApplyData;
