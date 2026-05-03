import mongoose from "mongoose";

const UserCheSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["customer", "designer", "admin"],
      default: "customer",
    },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: "" },
    skills: { type: [String], default: [] },
    bio: { type: String, default: "" },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserCheSchema);
