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
        SaleAmount: Number,
        time: Number,
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
