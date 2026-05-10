import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

export const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        // 1. Lấy chi tiết sản phẩm và populate thông tin Designer
        const product = await Product.findById(id).populate({
            path: "designerId",
            select: "fullName profilePicture rating bio",
        });

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // 2. Lấy sản phẩm tương tự (cùng tags, loại trừ sản phẩm hiện tại)
        const relatedProducts = await Product.find({
            _id: { $ne: id }, // Không lấy chính nó
            tags: { $in: product.tags } // Có ít nhất 1 tag chung
        })
            .limit(4) // Lấy tối đa 4 cái
            .select("title price images");

        // Trả về cả 2 thông tin
        res.status(200).json({
            product,
            relatedProducts
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};