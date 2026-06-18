import mongoose from "mongoose";
import { ServicePackage } from "../models/servicePackage.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

const normalizeServicePackage = (service) => {
  const plainService = service.toObject ? service.toObject() : service;

  return {
    ...plainService,
    deliveryTime: plainService.deliveryTime ?? 3,
  };
};

export const getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await ServicePackage.distinct("category", {
    isActive: true,
    status: "approved",
  });

  res.status(200).json({
    success: true,
    message: "Lấy danh mục dịch vụ thành công",
    data: categories.filter(Boolean).sort(),
  });
});

// Lấy tất cả gói dịch vụ với phân trang
export const getAllServices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const skip = (page - 1) * limit;

  const services = await ServicePackage.find({
    isActive: true,
    status: "approved",
  })
    .populate("designer", "fullName profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  const total = await ServicePackage.countDocuments({
    isActive: true,
    status: "approved",
  });
  const normalizedServices = services.map(normalizeServicePackage);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách gói dịch vụ thành công",
    data: {
      services: normalizedServices,
      pagination: getPagination(page, limit, total),
    },
  });
});

// Lấy gói bán chạy
export const getBestSellers = asyncHandler(async (req, res) => {
  const services = await ServicePackage.find({
    isActive: true,
    isBestSeller: true,
    status: "approved",
  })
    .populate("designer", "fullName profilePicture")
    .sort({ soldCount: -1 })
    .limit(8)
    .select("-__v");

  res.status(200).json({
    success: true,
    message: "Lấy danh sách gói bán chạy thành công",
    data: services.map(normalizeServicePackage),
  });
});

// Lấy gói mới nhất
export const getNewestServices = asyncHandler(async (req, res) => {
  const services = await ServicePackage.find({
    isActive: true,
    status: "approved",
  })
    .populate("designer", "fullName profilePicture")
    .sort({ createdAt: -1 })
    .limit(8)
    .select("-__v");

  res.status(200).json({
    success: true,
    message: "Lấy danh sách gói mới nhất thành công",
    data: services.map(normalizeServicePackage),
  });
});

// Lấy gói nổi bật / đề xuất
export const getFeaturedServices = asyncHandler(async (req, res) => {
  const services = await ServicePackage.find({
    isActive: true,
    isFeatured: true,
    status: "approved",
  })
    .populate("designer", "fullName profilePicture")
    .sort({ createdAt: -1 })
    .limit(8)
    .select("-__v");

  res.status(200).json({
    success: true,
    message: "Lấy danh sách gói nổi bật thành công",
    data: services.map(normalizeServicePackage),
  });
});

export const getHireServices = asyncHandler(async (req, res) => {
  const services = await ServicePackage.find({
    isActive: true,
    status: "approved",
    listingType: "hire",
  })
    .populate("designer", "fullName profilePicture")
    .sort({ soldCount: -1 })
    .limit(6)
    .select("-__v");

  res.status(200).json({
    success: true,
    message: "Lấy danh sách dịch vụ thuê designer thành công",
    data: services.map(normalizeServicePackage),
  });
});

export const getPackageServices = asyncHandler(async (req, res) => {
  const services = await ServicePackage.find({
    isActive: true,
    status: "approved",
    listingType: "package",
  })
    .populate("designer", "fullName profilePicture")
    .sort({ soldCount: -1 })
    .limit(8)
    .select("-__v");

  res.status(200).json({
    success: true,
    message: "Lấy danh sách gói thiết kế có sẵn thành công",
    data: services.map(normalizeServicePackage),
  });
});

export const getProductServices = asyncHandler(async (req, res) => {
  const services = await ServicePackage.find({
    isActive: true,
    status: "approved",
    listingType: "product",
  })
    .populate("designer", "fullName profilePicture")
    .sort({ soldCount: -1 })
    .limit(6)
    .select("-__v");

  res.status(200).json({
    success: true,
    message: "Lấy danh sách sản phẩm thiết kế thành công",
    data: services.map(normalizeServicePackage),
  });
});

export const getDesignerPackages = asyncHandler(async (req, res) => {
  const { designerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(designerId)) {
    return res.status(400).json({
      success: false,
      message: "ID designer không hợp lệ",
    });
  }

  const designer = await User.findById(designerId).select(
    "_id fullName profilePicture bio role rating"
  );

  if (!designer) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy designer",
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const skip = (page - 1) * limit;
  const status = req.query.status || "approved";

  const query = { designer: designerId };

  if (req.query.isActive === "all") {
    // Không lọc trạng thái active
  } else if (req.query.isActive === "true" || req.query.isActive === "false") {
    query.isActive = req.query.isActive === "true";
  } else {
    query.isActive = true;
  }

  if (status !== "all") {
    query.status = status;
  }

  const packages = await ServicePackage.find(query)
    .populate("designer", "fullName profilePicture bio role rating")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  const total = await ServicePackage.countDocuments(query);
  const normalizedPackages = packages.map(normalizeServicePackage);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách gói dịch vụ của designer thành công",
    data: {
      designer: {
        id: designer._id,
        fullName: designer.fullName,
        profilePicture: designer.profilePicture,
        bio: designer.bio,
        role: designer.role,
        rating: designer.rating,
      },
      packages: normalizedPackages,
      pagination: getPagination(page, limit, total),
    },
  });
});

// Lấy chi tiết gói dịch vụ theo slug
export const getServiceBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const service = await ServicePackage.findOne({
    slug,
    isActive: true,
    status: "approved",
  })
    .populate("designer", "fullName profilePicture")
    .select("-__v");

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy gói dịch vụ",
    });
  }

  res.status(200).json({
    success: true,
    message: "Lấy chi tiết gói dịch vụ thành công",
    data: normalizeServicePackage(service),
  });
});
