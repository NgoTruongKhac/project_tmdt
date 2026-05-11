import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// 1. LẤY CHI TIẾT SẢN PHẨM & DỊCH VỤ TƯƠNG TỰ
export const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const product = await Product.findById(id).populate({
            path: "designerId",
            select: "fullName profilePicture rating bio",
        });

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // Tìm sản phẩm tương tự dựa trên tags
        let relatedProducts = await Product.find({
            _id: { $ne: id },
            tags: { $in: product.tags }
        })
            .limit(4)
            .select("title price images");

        // Nếu không có sản phẩm cùng tag, lấy các sản phẩm khác của cùng Designer
        if (relatedProducts.length === 0) {
            relatedProducts = await Product.find({
                _id: { $ne: id },
                designerId: product.designerId._id
            })
                .limit(4)
                .select("title price images");
        }

        res.status(200).json({
            product,
            relatedProducts
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// 2. TẠO SẢN PHẨM MỚI (LƯU ẢNH GỐC)
export const createProduct = async (req, res) => {
    try {
        const { title, price, description, tags, designerId } = req.body;
        const files = req.files;
        const imagePaths = [];

        const uploadPath = path.resolve("public/uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

        for (const file of files) {
            const fileName = `${Date.now()}-${file.originalname}`;
            const outputPath = path.join(uploadPath, fileName);

            // Lưu file gốc vào thư mục uploads
            fs.writeFileSync(outputPath, file.buffer);
            imagePaths.push(`/uploads/${fileName}`);
        }

        const newProduct = await Product.create({
            title,
            price,
            description,
            tags: tags ? tags.split(",").map(t => t.trim()) : [],
            designerId,
            images: imagePaths
        });

        res.status(201).json({ message: "Tạo sản phẩm thành công", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tạo sản phẩm", error: error.message });
    }
};

// 3. XỬ LÝ ĐÓNG DẤU WATERMARK & GIẢM CHẤT LƯỢNG KHI LOAD ẢNH
export const getProtectedImage = async (req, res) => {
    try {
        const { fileName } = req.params;
        const filePath = path.join(process.cwd(), "public", "uploads", fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Không tìm thấy ảnh gốc" });
        }

        // --- CẤU HÌNH WATERMARK MẬT ĐỘ CAO ---
        const svgWidth = 150;  // Khoảng cách chiều ngang giữa các chữ
        const svgHeight = 100; // Khoảng cách chiều dọc giữa các chữ

        const svgWatermark = `
            <svg width="${svgWidth}" height="${svgHeight}">
                <style>
                    .mark { 
                        fill: white; 
                        fill-opacity: 0.25;
                        font-weight: bold; 
                        font-size: 24px; 
                    }
                </style>
                <text 
                    x="50%" 
                    y="50%" 
                    class="mark" 
                    text-anchor="middle" 
                    transform="rotate(-30, ${svgWidth/2}, ${svgHeight/2})"
                >
                    creatify
                </text>
            </svg>
        `;

        // Xử lý ảnh
        const processedImage = await sharp(filePath)
            .resize(1200) // Tăng nhẹ kích thước hiển thị để ảnh sắc nét hơn
            .webp({ quality: 70 })
            .composite([{
                input: Buffer.from(svgWatermark),
                tile: true,        // Kích hoạt chế độ lặp lại (mật độ cao)
                gravity: 'northwest' // Bắt đầu lặp từ góc trên bên trái
            }])
            .toBuffer();

        res.set("Content-Type", "image/webp");
        res.set("Cache-Control", "public, max-age=86400");
        res.send(processedImage);

    } catch (error) {
        console.error("Lỗi xử lý ảnh Watermark:", error);
        res.status(500).send("Lỗi xử lý ảnh");
    }
};