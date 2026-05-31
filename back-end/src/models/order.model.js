import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    services: [
        {
            service: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ServicePackage"
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "paid", "completed", "cancelled"],
        default: "pending"
    }
}, { timestamps: true });

export default mongoose.model("order", orderSchema);