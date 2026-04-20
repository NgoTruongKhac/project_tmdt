import mongoose from "mongoose";

const UserCheSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserCheSchema);
