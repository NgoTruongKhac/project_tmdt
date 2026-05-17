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
      ref: "ServicePackage",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo unique index để chống lưu trùng
FavoriteSchema.index({ user: 1, service: 1 }, { unique: true });

// Index để tối ưu query
FavoriteSchema.index({ user: 1 });
FavoriteSchema.index({ service: 1 });

export const Favorite = mongoose.model("Favorite", FavoriteSchema);