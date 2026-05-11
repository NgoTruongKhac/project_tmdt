import { User } from "../models/user.model.js";
import { ServicePackage } from "../models/ServicePackage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";

export const getAllUsers = asyncHandler(async (req, res) => {
    const { keyword, role } = req.query;

    let query = {};

    if (keyword) {
        query.$or = [
            { email: { $regex: keyword, $options: "i" } },
            { fullName: { $regex: keyword, $options: "i" } },
        ];
    }

    if (role) {
        query.role = role;
    }

    const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách người dùng thành công",
        data: users,
    });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        throw new ErrorHandler("Không tìm thấy người dùng", 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    const statusMessage = user.isActive ? "mở khóa" : "khóa";

    res.status(200).json({
        success: true,
        message: `${statusMessage.charAt(0).toUpperCase() + statusMessage.slice(1)} tài khoản người dùng thành công`,
        data: {
            userId: user._id,
            email: user.email,
            fullName: user.fullName,
            isActive: user.isActive,
        },
    });
});

export const getAdminServices = asyncHandler(async (req, res) => {
    const { status, keyword } = req.query;

    const query = {};

    if (status) {
        query.status = status;
    }

    if (keyword) {
        query.name = { $regex: keyword, $options: "i" };
    }

    const services = await ServicePackage.find(query)
        .populate("designer", "fullName email")
        .sort({ createdAt: -1 })
        .select("-__v");

    const sortedServices = services.sort((a, b) => {
        const aPending = a.status === "pending" ? 0 : 1;
        const bPending = b.status === "pending" ? 0 : 1;

        if (aPending !== bPending) {
            return aPending - bPending;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách gói dịch vụ thành công",
        data: sortedServices,
    });
});

export const updateServiceStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        throw new ErrorHandler("Trạng thái không hợp lệ", 400);
    }

    const servicePackage = await ServicePackage.findById(id);

    if (!servicePackage) {
        throw new ErrorHandler("Không tìm thấy gói dịch vụ", 404);
    }

    servicePackage.status = status;
    servicePackage.rejectReason = status === "rejected" ? (rejectReason || "") : "";
    await servicePackage.save();

    res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái gói dịch vụ thành công",
        data: {
            id: servicePackage._id,
            name: servicePackage.name,
            status: servicePackage.status,
            rejectReason: servicePackage.rejectReason,
        },
    });
});
