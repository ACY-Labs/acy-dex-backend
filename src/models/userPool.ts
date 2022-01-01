import mongoose from "mongoose";

const UserPool = new mongoose.Schema(
  {
    walletId: {
      type: String,
      index: true,
    },
    pools: [
      {
        token0: { type: String},
        token1: { type: String}
      }
    ]
  },
  { timestamps: true }
);

export default UserPool;
