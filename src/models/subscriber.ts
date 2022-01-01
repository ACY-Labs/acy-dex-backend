import mongoose from "mongoose";

const Subscriber = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "No name"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "No email"],
      index: true,
    },
    ip: {
      type: String,
      required: [true, "No IP"],
    },
  },
  { timestamps: true }
);

export default Subscriber;
