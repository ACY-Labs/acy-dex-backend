import mongoose from "mongoose";

const Launch = new mongoose.Schema(
  {
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
    idoDate:{
      type: Date,
      default: Date.now,
    },
    social:[
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
        Youtube: String,
        etheraddress: String,
        polyaddress: String,
        confluxaddress: String,
      }
    ],
    raiseSize:{
      type: Number,
      required: [true],
    },
    amount:{
      type: Number,
      required: [true],
    },
    marketCap:{
      type: Number,
      required: [true],
    },
    allocation:{
      type: Number,
    },
    ticketDeposited:{
      type: Number,
    },
    maxAllocation:{
      type: Number,
    },
    maxWinners:{
      type: Number,
    },
    ticketValue:{
      type: Number,
    }
  },
  { timestamps: true }
);

// convert to model
export default mongoose.model("Launch", Launch);
