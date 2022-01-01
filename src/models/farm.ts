import mongoose from "mongoose";

const Farm = new mongoose.Schema(
  {
    poolId: {
      type: Number,
      index: true,
    },
    lpToken: {
      address: { type: String},
      decimals: {type: Number},
      lpBalance:  {type: Number},
      lpScore:  {type: Number},
    },
    tokens: [{
      symbol: { type: String},
      logoURI: { type: String},
      address: { type: String},
      decimals: { type: Number}
    }],
    rewardTokens: [{
        symbol: { type: String},
        logoURI: { type: String},
        address: { type: String},
        decimals: { type: Number},
        farmToken: { type: String},
        accumulateReward: {type: Number},
        rewardPerYear: {type: Number}
    }],
    startBlock: {type: Number},
    endBlock: {type: Number},
  },
  { timestamps: true }
);

// export Schema only
export default Farm;
