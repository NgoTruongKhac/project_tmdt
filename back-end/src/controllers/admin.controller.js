import { User } from "../models/user.model.js";
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
