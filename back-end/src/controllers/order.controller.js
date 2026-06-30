import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";

const formatOrderResponse = (order) => {
  const servicePackage = order.servicePackage
    ? {
        id: order.servicePackage._id,
        name: order.servicePackage.name,
        description: order.servicePackage.description,
        price: order.servicePackage.price,
        discountPrice: order.servicePackage.discountPrice,
        thumbnail: order.servicePackage.thumbnail,
        category: order.servicePackage.category,
        revisions: order.servicePackage.revisions,
        deliveryTime: order.servicePackage.deliveryTime ?? 3,
        status: order.servicePackage.status,
        isActive: order.servicePackage.isActive,
      }
    : null;

  const designer = order.designer
    ? {
        id: order.designer._id,
        fullName: order.designer.fullName,
        profilePicture: order.designer.profilePicture,
        role: order.designer.role,
        bio: order.designer.bio,
      }
    : null;

  return {
    orderId: order._id,
    orderCode: order.orderCode,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    cancelledAt: order.cancelledAt,
    cancellationReason: order.cancellationReason,
    notes: order.notes,
    package: servicePackage,
    designer,
  };
};

const getPagination = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || "all";

  const query = { customer: userId };

  if (status !== "all") {
    query.status = status;
  }

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .populate("designer", "fullName profilePicture role bio rating")
      .populate({
        path: "servicePackage",
        select:
          "name description price discountPrice thumbnail category revisions deliveryTime status isActive",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  const formattedOrders = orders.map((order) => formatOrderResponse(order));

  res.status(200).json({
    success: true,
    message: "Lấy lịch sử đơn hàng thành công",
    data: {
      orders: formattedOrders,
      pagination: getPagination(page, limit, totalItems),
    },
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.userId;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      message: "ID đơn hàng không hợp lệ",
    });
  }

  const order = await Order.findById(orderId)
    .populate("designer", "fullName profilePicture role bio rating")
    .populate({
      path: "servicePackage",
      select:
        "name description price discountPrice thumbnail category revisions deliveryTime status isActive",
    });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy đơn hàng",
    });
  }

  if (order.customer.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền hủy đơn hàng này",
    });
  }

  if (order.status === "completed") {
    return res.status(400).json({
      success: false,
      message: "Không thể hủy đơn hàng đã hoàn thành",
    });
  }

  if (order.status === "cancelled") {
    return res.status(400).json({
      success: false,
      message: "Đơn hàng đã được hủy trước đó",
    });
  }

  if (!["pending", "processing"].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: "Trạng thái đơn hàng hiện tại không cho phép hủy",
    });
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancellationReason = reason?.trim() || "Khách hàng hủy đơn";

  if (order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Hủy đơn hàng thành công",
    data: {
      order: formatOrderResponse(order),
    },
  });
});
