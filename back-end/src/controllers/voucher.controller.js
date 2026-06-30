import { Voucher } from "../models/voucher.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";

export const getAdminVouchers = asyncHandler(async (req, res) => {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: vouchers });
});

export const createVoucher = asyncHandler(async (req, res) => {
    const { code, discountPercentage, maxUsage, expiresAt } = req.body;
    
    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) throw new ErrorHandler("Mã Voucher này đã tồn tại!", 400);

    const voucher = await Voucher.create({
        code: code.toUpperCase(),
        discountPercentage,
        maxUsage,
        expiresAt,
    });

    res.status(201).json({ success: true, message: "Tạo Voucher thành công", data: voucher });
});

export const toggleVoucherStatus = asyncHandler(async (req, res) => {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) throw new ErrorHandler("Không tìm thấy Voucher", 404);
    
    voucher.isActive = !voucher.isActive;
    await voucher.save();
    
    res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công" });
});

export const deleteVoucher = asyncHandler(async (req, res) => {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) throw new ErrorHandler("Không tìm thấy Voucher", 404);
    
    res.status(200).json({ success: true, message: "Đã xóa Voucher" });
});

export const updateVoucher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, discountPercentage, maxUsage, expiresAt } = req.body;

    const voucher = await Voucher.findById(id);
    if (!voucher) throw new ErrorHandler("Không tìm thấy Voucher", 404);

    if (code && code.toUpperCase() !== voucher.code) {
        const existing = await Voucher.findOne({ code: code.toUpperCase() });
        if (existing) throw new ErrorHandler("Mã Voucher này đã tồn tại!", 400);
        voucher.code = code.toUpperCase();
    }

    if (discountPercentage) voucher.discountPercentage = discountPercentage;
    if (maxUsage) voucher.maxUsage = maxUsage;
    if (expiresAt) voucher.expiresAt = expiresAt;

    await voucher.save();

    res.status(200).json({ success: true, message: "Cập nhật Voucher thành công", data: voucher });
});