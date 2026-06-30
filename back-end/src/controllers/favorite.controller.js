import mongoose from "mongoose";
import { Favorite } from "../models/favorite.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import { Service } from "../models/service.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const findFavoriteService = async (serviceId) => {
  const servicePackage = await ServicePackage.findOne({
    _id: serviceId,
    isActive: true,
  });

  if (servicePackage) {
    return { service: servicePackage, serviceType: "ServicePackage" };
  }

  const service = await Service.findOne({
    _id: serviceId,
    status: "approved",
  });

  if (service) {
    return { service, serviceType: "Service" };
  }

  return null;
};

const normalizeFavoriteService = (favorite) => {
  const service = favorite.service;
  if (!service) return null;

  if ((favorite.serviceType || "ServicePackage") === "Service") {
    return {
      _id: service._id,
      name: service.title,
      slug: String(service._id),
      description: service.description || "",
      price: service.price,
      discountPrice: null,
      category: service.category,
      thumbnail: service.images?.[0] || "",
      isBestSeller: false,
      isFeatured: false,
      soldCount: 0,
      createdAt: service.createdAt,
      sourceType: "service",
    };
  }

  return {
    _id: service._id,
    name: service.name,
    slug: service.slug,
    description: service.description,
    price: service.price,
    discountPrice: service.discountPrice,
    category: service.category,
    thumbnail: service.thumbnail,
    isBestSeller: service.isBestSeller,
    isFeatured: service.isFeatured,
    soldCount: service.soldCount,
    createdAt: service.createdAt,
    sourceType: "servicePackage",
  };
};

const normalizeFavorite = (favorite) => {
  const service = normalizeFavoriteService(favorite);
  if (!service) return null;

  return {
    _id: favorite._id,
    user: favorite.user,
    service,
    serviceType: favorite.serviceType || "ServicePackage",
    createdAt: favorite.createdAt,
    updatedAt: favorite.updatedAt,
  };
};

export const addToFavorites = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID dịch vụ không hợp lệ",
    });
  }

  const found = await findFavoriteService(serviceId);
  if (!found) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy dịch vụ",
    });
  }

  const existingFavorite = await Favorite.findOne({
    user: userId,
    service: serviceId,
    serviceType: found.serviceType,
  });

  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: "Dịch vụ đã có trong danh sách yêu thích",
    });
  }

  const favorite = await Favorite.create({
    user: userId,
    service: serviceId,
    serviceType: found.serviceType,
  });

  res.status(201).json({
    success: true,
    message: "Đã thêm vào danh sách yêu thích",
    data: favorite,
  });
});

export const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: "service",
      select:
        "name slug title description price discountPrice category thumbnail images isBestSeller isFeatured soldCount createdAt status isActive",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const validFavorites = favorites
    .map(normalizeFavorite)
    .filter((favorite) => favorite !== null);

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

export const removeFromFavorites = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID dịch vụ không hợp lệ",
    });
  }

  const favorite = await Favorite.findOneAndDelete({
    user: userId,
    service: serviceId,
  });

  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy dịch vụ trong danh sách yêu thích",
    });
  }

  res.status(200).json({
    success: true,
    message: "Đã xóa khỏi danh sách yêu thích",
  });
});

export const checkFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID dịch vụ không hợp lệ",
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

export const toggleFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "ID dịch vụ không hợp lệ",
    });
  }

  const found = await findFavoriteService(serviceId);
  if (!found) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy dịch vụ",
    });
  }

  const existingFavorite = await Favorite.findOne({
    user: userId,
    service: serviceId,
    serviceType: found.serviceType,
  });

  if (existingFavorite) {
    await Favorite.findOneAndDelete({
      user: userId,
      service: serviceId,
      serviceType: found.serviceType,
    });

    return res.status(200).json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
      data: {
        isFavorite: false,
        action: "removed",
      },
    });
  }

  const favorite = await Favorite.create({
    user: userId,
    service: serviceId,
    serviceType: found.serviceType,
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
});

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
