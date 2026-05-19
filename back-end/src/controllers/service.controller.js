import { ServicePackage } from "../models/servicePackage.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Service } from "../models/service.model.js";
import mongoose from "mongoose";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import axios from "axios";
import cloudinary from "../configs/cloudinary.config.js";

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

// Lấy thông tin chi tiết và dịch vụ tương tự trong Trang chi tiết dịch vụ
export const getServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID không hợp lệ" });

    const service = await Service.findById(id).populate({
      path: "designerId",
      select: "fullName profilePicture rating bio",
    });

    if (!service) return res.status(404).json({ message: "Dịch vụ không tồn tại" });

    // Tìm dịch vụ tương tự dựa trên category
    let relatedServices = await Service.find({
      _id: { $ne: id },
      category: { $in: service.category}
    }).limit(4).select("title price images");

    res.status(200).json({ service, relatedServices });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// Lấy ảnh và đóng dấu watermark
export const getProtectedImage = async (req, res) => {
  try {
    const { fileName } = req.params;

    // Vì trong DB lưu URL đầy đủ, nên tìm lại URL đó dựa vào fileName
    // fileName chính là phần cuối của URL
    // Giả sử URL: https://res.cloudinary.com/.../creatify_products/abcxyz.jpg
    const service = await Service.findOne({ images: { $regex: fileName } });
    if (!service) return res.status(404).send("Không tìm thấy ảnh");

    // Lấy URL ảnh gốc từ Cloudinary
    const originalUrl = service.images.find(img => img.includes(fileName));

    // Tải ảnh từ Cloudinary về dưới dạng Buffer
    const response = await axios.get(originalUrl, { responseType: 'arraybuffer' });
    const inputBuffer = Buffer.from(response.data);

    // --- CẤU HÌNH WATERMARK ---
    const svgWatermark = `
            <svg width="150" height="100">
                <style>.mark { fill: white; fill-opacity: 0.25; font-weight: bold; font-size: 24px; }</style>
                <text x="50%" y="50%" class="mark" text-anchor="middle" transform="rotate(-30, 75, 50)">creatify</text>
            </svg>`;

    const processedImage = await sharp(inputBuffer)
        .resize(1200)
        .webp({ quality: 70 })
        .composite([{
          input: Buffer.from(svgWatermark),
          tile: true,
          gravity: 'northwest'
        }])
        .toBuffer();

    res.set("Content-Type", "image/webp");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(processedImage);

  } catch (error) {
    console.error("Lỗi xử lý ảnh:", error);
    res.status(500).send("Lỗi xử lý ảnh");
  }
};


// Tạo Service mới & Lưu các ảnh gốc
export const createService = async (req, res) => {
  try {
    const { title, price, description, designerId } = req.body;
    const files = req.files;
    const imagePaths = [];
    // Upload từng file lên Cloudinary
    for (const file of files) {
      // Chuyển buffer thành base64 để upload
      const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: "creatify_services", // Thư mục trên Cloudinary
        resource_type: "image"
      });

      // Lưu secure_url hoặc public_id. Ở đây lưu secure_url để dễ quản lý
      imagePaths.push(uploadResponse.secure_url);
    }

    const newService = await Service.create({
      title,
      price,
      description,
      designerId,
      images: imagePaths
    });

    res.status(201).json({ message: "Tạo sản phẩm thành công", service: newService });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo sản phẩm", error: error.message });
  }
};

