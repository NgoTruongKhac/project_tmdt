import mongoose from "mongoose";
import { ServicePackage } from "../models/servicePackage.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Service } from "../models/service.model.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import cloudinary from "../configs/cloudinary.config.js";

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
    soldCount: plainService.soldCount ?? 0,
    views: plainService.views ?? 0,
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
    "_id fullName profilePicture bio role rating",
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

export const getServiceByIdentifier = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return getServiceDetail(req, res);
  }

  req.params.slug = identifier;
  return getServiceBySlug(req, res);
});

// Lấy thông tin chi tiết và dịch vụ tương tự trong Trang chi tiết dịch vụ
export const getServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const service = await Service.findById(id).populate({
      path: "designerId",
      select: "fullName profilePicture rating bio",
    });

    if (!service)
      return res.status(404).json({ message: "Dịch vụ không tồn tại" });

    // Tìm dịch vụ tương tự dựa trên category
    const relatedServices = await Service.find({
      _id: { $ne: id },
      category: { $in: service.category },
    })
      .limit(4)
      .select("title price images");

    res.status(200).json({ service, relatedServices });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// Xử lý đóng dấu Watermark mật độ cao
export const getProtectedImage = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "Không tìm thấy ảnh" });

    // Cấu hình chữ "creatify" mờ lặp lại trên ảnh
    const svgWatermark = `
            <svg width="150" height="100">
                <style>.mark { fill: white; fill-opacity: 0.25; font-weight: bold; font-size: 24px; }</style>
                <text x="50%" y="50%" class="mark" text-anchor="middle" transform="rotate(-30, 75, 50)">creatify</text>
            </svg>`;

    const processedImage = await sharp(filePath)
      .resize(1200)
      .webp({ quality: 70 })
      .composite([
        {
          input: Buffer.from(svgWatermark),
          tile: true, // Kích hoạt chế độ lặp lại mật độ cao [cite: 248]
          gravity: "northwest",
        },
      ])
      .toBuffer();

    res.set("Content-Type", "image/webp");
    res.send(processedImage);
  } catch (error) {
    res.status(500).send("Lỗi xử lý ảnh");
  }
};
export const createServicePackage = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      listingType,
      deliveryTime,
      revisions,
      designer,
    } = req.body;

    const files = req.files || [];

    // 1. Kiểm tra các trường bắt buộc
    if (!name || !price || !category || !designer) {
      return res.status(400).json({
        success: false,
        message: "Thiếu các trường bắt buộc (name, price, category, designer)",
      });
    }

    // 2. Đồng bộ category chữ thường giống Enum Model để tránh lỗi sập 500
    const formattedCategory = category.trim().toLowerCase();

    // 3. Tự động tạo slug từ name + timestamp
    const generatedSlug = `${slugify(name, { lower: true, locale: "vi" })}-${Date.now()}`;

    // 4. XỬ LÝ UPLOAD LÊN CLOUDINARY QUA BUFFER STREAM
    let thumbnailPath =
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"; // Link ảnh mặc định phòng hờ

    if (files.length > 0) {
      const file = files[0];

      // Khởi tạo Promise để đợi luồng Stream upload xong lên Cloudinary
      const cloudinaryUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "creatify/services", // Thư mục lưu trên Cloudinary Cloud của bạn
              resource_type: "image",
              allowed_formats: ["jpg", "jpeg", "png", "webp"],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url); // Trả về link URL dạng https của ảnh
            },
          );

          // Ghi dữ liệu từ buffer vào luồng stream để đẩy đi
          stream.end(file.buffer);
        });
      };

      // Thực thi upload và gán lại link URL nhận được
      thumbnailPath = await cloudinaryUpload();
    }

    // 5. Tiến hành lưu vào database MongoDB với link URL mới
    const newPackage = await ServicePackage.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description || "",
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      category: formattedCategory,
      listingType: listingType || "package",
      deliveryTime: deliveryTime ? Number(deliveryTime) : 3,
      revisions: revisions ? Number(revisions) : 0,
      designer,
      thumbnail: thumbnailPath, // Lưu URL trực tiếp từ Cloudinary (Ví dụ: https://res.cloudinary.com/...)
      status: "pending",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo gói dịch vụ thành công và đã tải ảnh lên Cloudinary",
      data: newPackage,
    });
  } catch (error) {
    console.error("🔥 LỖI TẠI CREATE_SERVICE_PACKAGE:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi tạo dịch vụ",
      error: error.message,
    });
  }
});

export const updateServicePackage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID dịch vụ không hợp lệ" });
    }

    // Sao chép req.body ra một object riêng để xử lý chỉnh sửa dữ liệu dữ phòng
    const updateData = { ...req.body };

    // 1. Nếu thay đổi tên dịch vụ, cập nhật tự động lại cả slug tương ứng
    if (updateData.name) {
      updateData.slug = `${slugify(updateData.name, { lower: true, locale: "vi" })}-${Date.now()}`;
      updateData.name = updateData.name.trim();
    }

    // 2. Nếu có chỉnh sửa category, chuẩn hóa về chữ thường để khớp với Enum của Schema
    if (updateData.category) {
      updateData.category = updateData.category.trim().toLowerCase();
    }

    // 3. Ép các kiểu dữ liệu dạng số từ FormData truyền lên (Tránh lỗi Mongoose Validation)
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.discountPrice) {
      updateData.discountPrice = Number(updateData.discountPrice);
    } else if (updateData.discountPrice === "") {
      updateData.discountPrice = null; // Nếu xoá giá khuyến mãi đi
    }
    if (updateData.deliveryTime)
      updateData.deliveryTime = Number(updateData.deliveryTime);
    if (updateData.revisions)
      updateData.revisions = Number(updateData.revisions);

    // 4. XỬ LÝ UPLOAD ẢNH MỚI LÊN CLOUDINARY (Nếu Frontend có truyền file)
    if (files.length > 0) {
      const file = files[0];

      // Khởi tạo Promise upload luồng stream từ Buffer bộ nhớ RAM
      const cloudinaryUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "creatify/services",
              resource_type: "image",
              allowed_formats: ["jpg", "jpeg", "png", "webp"],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url); // Trả về link URL ảnh bảo mật (https://...)
            },
          );
          stream.end(file.buffer);
        });
      };

      // Đợi upload hoàn tất và gán URL vào trường thumbnail để lưu db
      updateData.thumbnail = await cloudinaryUpload();
    }

    // 5. Đưa trạng thái dịch vụ về 'pending' để admin duyệt lại sau khi chỉnh sửa
    updateData.status = "pending";

    // Tiến hành cập nhật vào MongoDB
    const updatedPackage = await ServicePackage.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }, // Thực thi kiểm tra cấu trúc schema nghiêm ngặt
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ để cập nhật",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật dịch vụ thành công và đang chờ duyệt lại",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("🔥 LỖI TẠI UPDATE_SERVICE_PACKAGE:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật dịch vụ",
      error: error.message,
    });
  }
});

// 3. XÓA DỊCH VỤ THEO ID (Viết mới)
export const deleteServicePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "ID dịch vụ không hợp lệ" });
  }

  const deletedPackage = await ServicePackage.findByIdAndDelete(id);

  if (!deletedPackage) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy dịch vụ để xóa" });
  }

  res.status(200).json({
    success: true,
    message: "Xóa dịch vụ thành công",
  });
});

export const getMyServicePackages = asyncHandler(async (req, res) => {
  const { designerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(designerId)) {
    return res.status(400).json({
      success: false,
      message: "ID designer không hợp lệ",
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status; // "pending" | "approved" | "rejected" | undefined/"all"

  const query = { designer: designerId };
  if (status && status !== "all") {
    query.status = status;
  }

  const services = await ServicePackage.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");

  const total = await ServicePackage.countDocuments(query);
  const normalizedServices = services.map(normalizeServicePackage);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách dịch vụ của bạn thành công",
    data: {
      services: normalizedServices,
      pagination: getPagination(page, limit, total),
    },
  });
});

// Lấy chi tiết 1 gói dịch vụ theo ID (dùng cho modal Xem chi tiết / Chỉnh sửa)
export const getServicePackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "ID dịch vụ không hợp lệ",
    });
  }

  const service = await ServicePackage.findById(id)
    .populate("designer", "fullName profilePicture")
    .select("-__v");

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy dịch vụ",
    });
  }

  res.status(200).json({
    success: true,
    message: "Lấy chi tiết dịch vụ thành công",
    data: normalizeServicePackage(service),
  });
});
