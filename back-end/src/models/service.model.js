import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        designerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        images: { type: [String], default: [] },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        revisions: { type: Number, default: 0 },
        rejectReason: { type: String, default: "" },
    },
    { timestamps: true },
);

export const Service = mongoose.model("Service", ServiceSchema);
