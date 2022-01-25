import mongoose from "mongoose";

const LaunchChart = new mongoose.Schema(
    {
        poolId:{
            index:true,
            required:true,
            type:Number,
        },
        History: [
            {
              AllocationSum : Number,
              time : Number, 
            }
          ],
        },{ timestamps: true }
);

export default LaunchChart;
