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
    History: [
      {
        exchangeRate : Number,
        date : String,
      }
    ],
  },
  { timestamps: true }
);

// convert to model
export default mongoose.model("Rate", Rate);

