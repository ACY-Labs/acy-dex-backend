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

// convert to model
export default mongoose.model("UserPool", UserPool);
