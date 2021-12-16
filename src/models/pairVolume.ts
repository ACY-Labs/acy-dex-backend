import mongoose from "mongoose";

const PairVolume = new mongoose.Schema(
  {
    token0 : {
      type: String,
      required: [true],
    },
    token1 : {
      type: String,
      required: [true],
    },
    pairAddr: {
      type: String,
      required: [true],
      index: true,
    },
    lastBlockNumber: {
      type: Number,
    },
    lastVolume: {
      token0: Number,
      token1: Number,
    },
    lastReserves : {
      token0: Number,
      token1: Number,
    },
    historicalData: [ 
      {
        date : String,
        volume24h : 
        {
          token0: Number,
          token1: Number,
        }
        ,
        reserves : 
        {
          token0: Number,
          token1: Number,
        }
      }
      
    ],
    // range: {
    //   type: String,
    //   required: [true, "15M"],
    // },
    history: [
      {
        time: Date,
        blockNumber: Number,
        amount0In: Number,
        amount1In: Number,
        amount0Out: Number,
        amount1Out: Number,
      },
    ],
  },
  { timestamps: true }  // we will utilize updatedAt to check its validity
);

// convert to model
export default mongoose.model("PairVolume", PairVolume);
