import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "serviceType",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["ServicePackage", "Service"],
      default: "ServicePackage",
    },
  },
  {
    timestamps: true,
  }
);

// Tạo unique index để chống lưu trùng
FavoriteSchema.index({ user: 1, service: 1, serviceType: 1 }, { unique: true });

// Index để tối ưu query
FavoriteSchema.index({ user: 1 });
FavoriteSchema.index({ service: 1 });

export const Favorite = mongoose.model("Favorite", FavoriteSchema);
