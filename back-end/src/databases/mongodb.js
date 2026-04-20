import mongoose from "mongoose";
import { MONGODB_URI } from "../configs/env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {});
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
