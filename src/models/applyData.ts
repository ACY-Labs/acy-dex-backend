import mongoose from "mongoose";

const ApplyData = new mongoose.Schema(
    {
        id:
            {type: mongoose.Schema.Types.ObjectId,
                index: true,
                required: true,
                auto: true}
        ,
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
