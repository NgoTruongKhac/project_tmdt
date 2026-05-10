import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    designerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);