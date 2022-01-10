import mongoose from "mongoose";

const Launch = new mongoose.Schema(
  {
    projectStatus: {
      type: String,
      default: "Ongoing"
    },
    projectID: {
      type: Number,
      required: true,
    },
    basicInfo: {
      projectName: {
        type: String,
        required: true,
        index: true,
      },
      poolID: {
        type: Number,
        required: true,
      },
      projectToken: {
        type: String,
        required: true,
        index: true,
      },
      projectTokenUrl: {
        type: String,
        required: true
      },
    },
    saleInfo: {
      tokenPrice: {
        type: Number,
        required: true,
      },
      totalRaise: {
        type: Number,
        required: true,
      },
      totalSale: {
        type: Number,
        required: true,
      },
    },
    scheduleInfo: {
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
      }
    },
    allocationInfo: {
      parameters: {
        minAlloc: { type: Number },
        maxAlloc: { type: Number },
        rateBalance: { type: Number },
        rateSwap: { type: Number },
        rateLiquidity: { type: Number },
        rateAcy: { type: Number },
        alertProportion: { type: Number },
        T: { type: Number }
      },
      processRecords: [{
        startTime: { type: Date },
        endTime: { type: Date },
        w: { type: Number }
      }]
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
    contextData: { type: String },
  },
  { timestamps: true }
);

// export Schema only
export default Launch;