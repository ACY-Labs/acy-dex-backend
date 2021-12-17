import mongoose from "mongoose";

const Launch = new mongoose.Schema(
  {
    projectID:{
      type: Number,
      required: [true],
    },
    projectName: {
      type: String,
      required: [true],
      index: true,
    },
    projectToken: {
      type: String,
      required: [true],
      index: true,
    },
    tokenPrice: {
      type: Number,
      required: [true],
    },
    regStart: {
      type: Date,
      default: Date.now,
    },
    regEnd: {
      type: Date,
      default: Date.now,
    },
    saleStart: {
      type: Date,
      default: Date.now,
    },
    saleEnd: {
      type: Date,
      default: Date.now,
    },
    social: [
      {
        website: String,
        whitepaper: String,
        deck: String,
        twitter: String,
        telegram: String,
        linkedin: String,
        medium: String,
        github: String,
        forum: String,
        youtube: String,
        etheraddress: String,
        polyaddress: String,
        confluxaddress: String,
      },
    ],
    totalRaise: {
      type: Number,
      required: [true],
    },
    totalSale: {
      type: Number,
      required: [true],
    },
    contextData: {
      type: String,
    },
  },
  { timestamps: true }
);

// convert to model
export default mongoose.model("Launch", Launch);
