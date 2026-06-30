import { User } from "../models/user.model.js";
import { Designer } from "../models/designer.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import Order from "../models/order.model.js";
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

export const getAdminOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("customer", "fullName email profilePicture")
        .populate("designer", "fullName email")
        .populate("servicePackage", "name price thumbnail")
        .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => {
        const plainOrder = order.toObject({ virtuals: true });

        return {
            ...plainOrder,
            user: plainOrder.customer,
            services: plainOrder.servicePackage
                ? [
                    {
                        service: plainOrder.servicePackage,
                        quantity: 1,
                    },
                ]
                : [],
            totalPrice: plainOrder.totalAmount,
        };
    });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách đơn hàng thành công",
        data: formattedOrders,
    });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "processing", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
        throw new ErrorHandler("Trạng thái không hợp lệ", 400);
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new ErrorHandler("Không tìm thấy đơn hàng", 404);
    }

    order.status = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        data: {
            id: order._id,
            status: order.status,
        },
    });
});

export const getAdminDesigners = asyncHandler(async (req, res) => {
    const designers = await Designer.find()
        .populate("userId", "fullName email profilePicture isActive bio")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Lấy danh sách designer thành công",
        data: designers,
    });
});

export const updateDesignerStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        throw new ErrorHandler("Trạng thái không hợp lệ", 400);
    }

    const designer = await Designer.findById(id);

    if (!designer) {
        throw new ErrorHandler("Không tìm thấy designer", 404);
    }

    designer.status = status;
    designer.rejectReason = status === "rejected" ? (rejectReason || "") : "";
    await designer.save();

    if (status === "approved") {
        await User.findByIdAndUpdate(designer.userId, { role: "DESIGNER" });
    }

    res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái designer thành công",
        data: {
            id: designer._id,
            status: designer.status,
            rejectReason: designer.rejectReason,
        },
    });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalServices,
        pendingServices,
        totalSalesAggregation,
        revenueByMonthAggregation,
        revenueByCategoryAggregation,
        roleAggregation,
        categoryAggregation,
        topServices,
    ] = await Promise.all([
        User.countDocuments(),
        ServicePackage.countDocuments(),
        ServicePackage.countDocuments({ status: "pending" }),
        Order.aggregate([
            {
                $match: {
                    status: "completed",
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" },
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    status: "completed",
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    value: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $concat: ["Tháng ", { $toString: "$_id.month" }],
                    },
                    value: 1,
                },
            },
        ]),
        Order.aggregate([
            {
                $match: {
                    status: "completed",
                },
            },
            {
                $lookup: {
                    from: "servicepackages",
                    localField: "servicePackage",
                    foreignField: "_id",
                    as: "servicePackage",
                },
            },
            {
                $unwind: "$servicePackage",
            },
            {
                $group: {
                    _id: "$servicePackage.category",
                    value: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: {
                    value: -1,
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: 1,
                },
            },
        ]),
        User.aggregate([
            {
                $group: {
                    _id: "$role",
                    value: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: 1,
                },
            },
            {
                $sort: { name: 1 },
            },
        ]),
        ServicePackage.aggregate([
            {
                $group: {
                    _id: "$category",
                    value: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: 1,
                },
            },
            {
                $sort: { name: 1 },
            },
        ]),
        ServicePackage.find()
            .sort({ soldCount: -1, createdAt: -1 })
            .limit(5)
            .select("name soldCount -_id"),
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalServices,
            pendingServices,
            totalSales: totalSalesAggregation[0]?.totalSales || 0,
            revenueByMonth: revenueByMonthAggregation,
            revenueByCategory: revenueByCategoryAggregation,
            roleDistribution: roleAggregation,
            categoryDistribution: categoryAggregation,
            topServices,
        },
    });
});
