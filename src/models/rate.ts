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
        time : Number, 
        count: Number,
      }
    ],
  },

  { timestamps: true }
);

export default Rate;

