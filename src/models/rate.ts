import mongoose from "mongoose";

const Rate = new mongoose.Schema(
  {
    end_date: {
      type: String,
      required: [true, new Date().toString()],
      index: true,
    },
    interval: {
      type: String,
      required: [true, "15M"],
    },
    rates: [Number],
  },
  { timestamps: true }
);

// convert to model
export default mongoose.model("Rate", Rate);
