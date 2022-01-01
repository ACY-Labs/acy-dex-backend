import mongoose from "mongoose";

const Pair = new mongoose.Schema(
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
    range: {
      type: String,
      required: [true, "15M"],
    },
    swaps: [
      {
        time: Date,
        rate: Number,
      },
    ],
  },
  { timestamps: true }
);

// export Schema only
export default Pair;
