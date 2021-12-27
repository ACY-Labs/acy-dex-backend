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
    positions: [{
        positionId: {type: Number},
        address: {type: String},
        lpAmount: {type: Number},
        stakeTimestamp: {type: Number},
        lockDuration: {type: Number}
    }]
  },
  { timestamps: true }
);

// convert to model
export default mongoose.model("Farm", Farm);
