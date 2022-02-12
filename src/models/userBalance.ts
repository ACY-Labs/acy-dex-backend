import mongoose from "mongoose";

const UserBalance = new mongoose.Schema(
  {
    walletId: {
      type: String,
      index: true,
    },
    chainId: {
      type: Number,
      index: true,
      default: 56
    },
    balance: [
      {
        tokenName: { type: String },
        tokenAddress: { type: String },
        tokenAmount: { type: String }
      }
    ],
    transactions: [
      {
        side: { type: String },
        amount: { type: String },
        time: { type: Date }
      }
    ]
  },
  { timestamps: true }
);

export default UserBalance;
