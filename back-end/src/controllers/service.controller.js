import { ServicePackage } from "../models/servicePackage.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Service } from "../models/service.model.js";
import mongoose from "mongoose";
import sharp from "sharp";
import path from "path";
import fs from "fs";

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

// Xử lý đóng dấu Watermark mật độ cao
export const getProtectedImage = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Không tìm thấy ảnh" });

    // Cấu hình chữ "creatify" mờ lặp lại trên ảnh
    const svgWatermark = `
            <svg width="150" height="100">
                <style>.mark { fill: white; fill-opacity: 0.25; font-weight: bold; font-size: 24px; }</style>
                <text x="50%" y="50%" class="mark" text-anchor="middle" transform="rotate(-30, 75, 50)">creatify</text>
            </svg>`;

    const processedImage = await sharp(filePath)
        .resize(1200)
        .webp({ quality: 70 })
        .composite([{
          input: Buffer.from(svgWatermark),
          tile: true, // Kích hoạt chế độ lặp lại mật độ cao [cite: 248]
          gravity: 'northwest'
        }])
        .toBuffer();

    res.set("Content-Type", "image/webp");
    res.send(processedImage);
  } catch (error) {
    res.status(500).send("Lỗi xử lý ảnh");
  }
};

// Tạo Service mới & Lưu các ảnh gốc
export const createService = async (req, res) => {
  try {
    const { title, price, description, designerId } = req.body;
    const files = req.files;
    const imagePaths = [];
    const uploadPath = path.resolve("public/uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    // Xử lý tất cả các file được gửi lên
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Thêm i vào tên file để tránh trùng lặp nếu upload nhiều ảnh cùng 1 miligiây
      const fileName = `${Date.now()}-${i}-${file.originalname}`;
      const outputPath = path.join(uploadPath, fileName);

      fs.writeFileSync(outputPath, file.buffer);
      imagePaths.push(`/uploads/${fileName}`);
    }

    const newService = await Service.create({
      title, price, description,
      designerId,
      images: imagePaths // Mảng này sẽ chứa toàn bộ đường dẫn ảnh đã upload
    });
    res.status(201).json({ message: "Thành công", service: newService });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo", error: error.message });
  }
};