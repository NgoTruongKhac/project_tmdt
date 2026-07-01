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
        listingType: order.servicePackage.listingType,
        revisions: order.servicePackage.revisions,
        deliveryTime: order.servicePackage.deliveryTime ?? 3,
        status: order.servicePackage.status,
        isActive: order.servicePackage.isActive,
      }
    : order.service
    ? {
        id: order.service._id,
        name: order.service.title,
        description: order.service.description,
        price: order.service.price,
        discountPrice: null,
        thumbnail: order.service.images?.[0] || "",
        category: order.service.category,
        listingType: "product",
        revisions: order.service.revisions,
        deliveryTime: 3,
        status: order.service.status,
        isActive: true,
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

  const customer = order.customer
    ? {
        id: order.customer._id,
        fullName: order.customer.fullName,
        profilePicture: order.customer.profilePicture,
        email: order.customer.email,
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
    customerImage: order.customerImage,
    package: servicePackage,
    designer,
    customer,
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

const ORDER_POPULATE = [
  { path: "designer", select: "fullName profilePicture role bio rating" },
  { path: "customer", select: "fullName profilePicture email" },
  {
    path: "servicePackage",
    select:
      "name description price discountPrice thumbnail category revisions deliveryTime status isActive",
  },
  {
    path: "service",
    select: "title description price images category revisions status",
  },
];

// Lấy lịch sử đơn hàng của khách hàng (customer)
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
      .populate(ORDER_POPULATE)
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

// Khách hàng hủy đơn hàng của chính mình
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

  const order = await Order.findById(orderId).populate(ORDER_POPULATE);

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

// Lấy danh sách đơn hàng dành cho Designer quản lý
export const getDesignerOrders = asyncHandler(async (req, res) => {
  const userId = req.userId; // ID của Designer (lấy từ auth middleware)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || "all";

  // Lọc theo trường designer thay vì customer
  const query = { designer: userId };

  if (status !== "all") {
    query.status = status;
  }

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .populate("customer", "fullName profilePicture email") // Lấy thông tin người mua
      .populate({
        path: "servicePackage",
        select:
          "name description price discountPrice thumbnail category revisions deliveryTime status isActive",
      })
      .populate("service", "title description price images category revisions status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  const formattedOrders = orders.map((order) => formatOrderResponse(order));

  res.status(200).json({
    success: true,
    message: "Lấy danh sách đơn hàng của designer thành công",
    data: {
      orders: formattedOrders,
      pagination: getPagination(page, limit, totalItems),
    },
  });
});

// Quy tắc chuyển trạng thái hợp lệ mà Designer được phép thực hiện
const DESIGNER_ALLOWED_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

// Designer cập nhật trạng thái đơn hàng (pending -> processing -> completed, hoặc hủy đơn)
// Tách riêng khỏi cancelOrder vì cancelOrder chỉ dành cho khách hàng (kiểm tra order.customer).
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.userId; // ID của Designer
  const { status, reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      message: "ID đơn hàng không hợp lệ",
    });
  }

  const VALID_STATUSES = ["pending", "processing", "completed", "cancelled"];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Trạng thái đơn hàng không hợp lệ",
    });
  }

  const order = await Order.findById(orderId).populate(ORDER_POPULATE);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy đơn hàng",
    });
  }

  if (order.designer.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền cập nhật đơn hàng này",
    });
  }

  const allowedNextStatuses = DESIGNER_ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowedNextStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Không thể chuyển đơn hàng từ trạng thái "${order.status}" sang "${status}"`,
    });
  }

  order.status = status;

  if (status === "cancelled") {
    order.cancelledAt = new Date();
    order.cancellationReason = reason?.trim() || "Designer hủy đơn";
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Cập nhật trạng thái đơn hàng thành công",
    data: {
      order: formatOrderResponse(order),
    },
  });
});
