import mongoose from "mongoose";

const rewardPointHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: String,
      default: "", // ID của đơn hàng hoặc mã đơn
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["earn", "redeem"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const RewardPointHistory = mongoose.model("RewardPointHistory", rewardPointHistorySchema);
