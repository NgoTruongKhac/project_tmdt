import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true }, // Mã đơn hàng gửi sang VNPay (vnp_TxnRef)
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
        serviceType: {
            type: String,
            enum: ["Service", "ServicePackage"],
            default: "Service",
        },
        designerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        originalAmount: { type: Number, required: true },
        rewardPointsUsed: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        notes: { type: String, default: "" },
        customerImage: { type: String, default: "" },
        vnpayTranNo: { type: String }, // Mã giao dịch của VNPay trả về
        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        paymentDate: { type: Date },
    },
    { timestamps: true }
);

export const Payment = mongoose.model("Payment", PaymentSchema);
