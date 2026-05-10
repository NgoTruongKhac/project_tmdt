import { Product } from "../models/product.model.js";

export const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id).populate({
            path: "designerId",
            select: "fullName profilePicture rating bio", // Chỉ lấy các field cần thiết của Designer
        });

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};