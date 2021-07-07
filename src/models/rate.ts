import mongoose from "mongoose";

const Rate = new mongoose.Schema(
  {
    token0: {
      type: String,
      required: [true],
      index: true,
    },
    token1: {
      type: String,
      required: [true],
      index: true,
    },
    interval: {
      type: String,
      required: [true, "15M"],
    },
    swaps: [
      {
        time: Date,
        token0: String,
        token1: String,
      },
    ],
  },
  { timestamps: true }
);

// convert to model
export default mongoose.model("Rate", Rate);
