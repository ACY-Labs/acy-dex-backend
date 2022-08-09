import mongoose from "mongoose";

const Vote = new mongoose.Schema(
  {
    walletId: {
        type: String,
        index: true,
    },
    lpToken: {
        type: Number,
    },
    acyToken: {
        type: Number,
    },
    voteWeight: [
      {
        tokenName : String,
        weight : Number,
      }
    ],
  },

  { timestamps: true}
);

export default Vote;
