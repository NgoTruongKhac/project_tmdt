import mongoose from "mongoose";

const ServicePackageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPrice: {
            type: Number,
            min: 0,
            default: null,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "poster",
                "banner",
                "social-media",
                "business",
                "event",
                "combo",
                "other",

                "beauty",
                "fashion",
                "food",
                "real-estate",
                "tech",
                "ecommerce",
                "branding",
            ],
        },
        thumbnail: {
            type: String,
            required: true,
        },
        designer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        isBestSeller: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        revisions: {
            type: Number,
            default: 0,
        },
        deliveryTime: {
            type: Number,
            default: 3,
            min: 1,
        },
        rejectReason: {
            type: String,
            default: "",
        },
        soldCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index để tối ưu query
ServicePackageSchema.index({isActive: 1});
ServicePackageSchema.index({isBestSeller: 1, soldCount: -1});
ServicePackageSchema.index({isFeatured: 1, isActive: 1});
ServicePackageSchema.index({createdAt: -1});
// Không cần index riêng cho slug vì đã có unique: true

export const ServicePackage = mongoose.model("ServicePackage", ServicePackageSchema);