import mongoose from "mongoose";

const LaunchChart = new mongoose.Schema(
  {
    poolId: {
      index: true,
      required: true,
      type: Number,
    },
    token:{
      type: String,
    },
    saleHistory: [
      {
        saleAmount: Number,
        nodeTime: Number,
        count: Number,
      }
    ],
    userHistory: [
      {
        walletId: Number,
        userPurchasedAmount:Number,
        purchasedTime:Number
      }
    ]
  }, { timestamps: true }
);

export default LaunchChart;
