import mongoose from "mongoose";

const UserCheSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: "" },
    rewardPoints: { type: Number, default: 0 },
    membershipLevel: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserCheSchema);
