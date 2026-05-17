import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: "" },

    role: {
      type: String,
      enum: ["CUSTOMER", "DESIGNER", "ADMIN"],
      default: "CUSTOMER",
    },
  },
  { timestamps: true },
);
export const User = mongoose.model("User", UserSchema);
