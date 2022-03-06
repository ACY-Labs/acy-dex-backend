import mongoose from "mongoose";

const Launch = new mongoose.Schema(
  {
    projectStatus: {
      type: String,
      default: "Ongoing"
    },
    projectID: {
      type: Number,
      required: true
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
      // totalSold: { // in USDT
      //   type: Number,
      //   default: 0
      // }
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
        maxTotalAlloc: { type: Number },
        minAlloc: { type: Number },
        maxAlloc: { type: Number },
        rateBalance: { type: Number },
        rateSwap: { type: Number },
        rateLiquidity: { type: Number },
        rateAcy: { type: Number },
        alertProportion: { type: Number },
        T: { type: Number },
        minInvest: {type: Number}
      },
      states: {
        allocatedAmount: { type: Number },
        soldAmount: { type: Number }
      },
      processRecords: [
        {
          endTime: { type: Date, default: Date.now },
          w: { type: Number }, // total allocated
          s: { type: Number }
        }
      ]
    },
    social: [
      {
        Website: String,
        Whitepaper: String,
        Deck: String,
        Twitter: String,
        Telegram: String,
        Linkedin: String,
        Medium: String,
        Github: String,
        Forum: String,
        Youtube: String,
        Etheraddress: String,
        Polyaddress: String,
        Confluxaddress: String,
      },
    ],
    contextData: { type: String },
  },
  { timestamps: true }
);

// export Schema only
export default Launch;