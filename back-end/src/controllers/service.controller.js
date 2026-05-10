import { ServicePackage } from "../models/ServicePackage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách gói dịch vụ thành công",
    data: {
      services,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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
    data: services,
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
    data: services,
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
    data: services,
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
    data: service,
  });
});