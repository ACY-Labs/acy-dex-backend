import mongoose from "mongoose";

const UserLaunch = new mongoose.Schema(
    {
        walletId: {
            type: String,
            index: true,
            require: true
        },
        projects: [
            {
                projectToken: { type: String },
                allocationAmount: { type: Number},
                allocationUsed: { type: Number }
            }
        ],
    },
    { timestamps: true }
);

export default UserLaunch;
