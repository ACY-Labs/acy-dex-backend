import mongoose from "mongoose";

const Config = new mongoose.Schema(
    {
        attr : {
            type : String,
            required : true
        },
        value : {
            type : Array || String,
            required : true
        }
    },
    { timestamps: true }
)

export default Config;