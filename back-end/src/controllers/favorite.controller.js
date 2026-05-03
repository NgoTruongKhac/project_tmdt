import { Favorite } from "../models/Favorite.js";
import { ServicePackage } from "../models/ServicePackage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Thêm gói dịch vụ vào yêu thích
export const addToFavorites = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;
  const userId = req.userId;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID gói dịch vụ không hợp lệ",
    });
  }

  // Kiểm tra gói dịch vụ có tồn tại và đang hoạt động không
  const service = await ServicePackage.findOne({
    _id: serviceId,
    isActive: true,
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy gói dịch vụ",
    });
  }

  // Kiểm tra đã yêu thích chưa
  const existingFavorite = await Favorite.findOne({
    user: userId,
    service: serviceId,
  });

  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: "Gói dịch vụ đã có trong danh sách yêu thích",
    });
  }

  // Thêm vào yêu thích
  const favorite = await Favorite.create({
    user: userId,
    service: serviceId,
  });

  res.status(201).json({
    success: true,
    message: "Đã thêm vào danh sách yêu thích",
    data: favorite,
  });
});

// Lấy danh sách yêu thích của user
export const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: "service",
      select: "name slug description price discountPrice category thumbnail isBestSeller isFeatured soldCount createdAt",
      match: { isActive: true }, // Chỉ lấy service đang hoạt động
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Lọc bỏ những favorite có service null (service đã bị xóa hoặc không active)
  const validFavorites = favorites.filter(fav => fav.service !== null);

  const total = await Favorite.countDocuments({ user: userId });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách yêu thích thành công",
    data: {
      favorites: validFavorites,
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

// Xóa khỏi yêu thích
export const removeFromFavorites = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.userId;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID gói dịch vụ không hợp lệ",
    });
  }

  const favorite = await Favorite.findOneAndDelete({
    user: userId,
    service: serviceId,
  });

  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy gói dịch vụ trong danh sách yêu thích",
    });
  }

  res.status(200).json({
    success: true,
    message: "Đã xóa khỏi danh sách yêu thích",
  });
});

// Kiểm tra gói dịch vụ đã yêu thích chưa
export const checkFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.userId;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID gói dịch vụ không hợp lệ",
    });
  }

  const favorite = await Favorite.findOne({
    user: userId,
    service: serviceId,
  });

  res.status(200).json({
    success: true,
    message: "Kiểm tra trạng thái yêu thích thành công",
    data: {
      isFavorite: !!favorite,
    },
  });
});

// Toggle yêu thích (Bonus)
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.userId;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID gói dịch vụ không hợp lệ",
    });
  }

  // Kiểm tra gói dịch vụ có tồn tại và đang hoạt động không
  const service = await ServicePackage.findOne({
    _id: serviceId,
    isActive: true,
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy gói dịch vụ",
    });
  }

  // Kiểm tra đã yêu thích chưa
  const existingFavorite = await Favorite.findOne({
    user: userId,
    service: serviceId,
  });

  if (existingFavorite) {
    // Đã yêu thích -> Xóa
    await Favorite.findOneAndDelete({
      user: userId,
      service: serviceId,
    });

    res.status(200).json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
      data: {
        isFavorite: false,
        action: "removed",
      },
    });
  } else {
    // Chưa yêu thích -> Thêm
    const favorite = await Favorite.create({
      user: userId,
      service: serviceId,
    });

    res.status(201).json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích",
      data: {
        isFavorite: true,
        action: "added",
        favorite,
      },
    });
  }
});

// Lấy số lượng yêu thích của user
export const getFavoriteCount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const count = await Favorite.countDocuments({ user: userId });

  res.status(200).json({
    success: true,
    message: "Lấy số lượng yêu thích thành công",
    data: {
      count,
    },
  });
});