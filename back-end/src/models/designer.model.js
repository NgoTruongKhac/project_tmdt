import mongoose from "mongoose";

const DesignerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectReason: {
      type: String,
      default: "",
    },

    age: { type: Number, min: 0 },
    degree: { type: String },
    major: { type: String },
    experienceYears: { type: Number, min: 0 },
    portfolioUrl: { type: String },
    skills: [{ type: String }],
    certificateImages: [{ type: String }],
  },
  { timestamps: true },
);

export const Designer = mongoose.model("Designer", DesignerSchema);
