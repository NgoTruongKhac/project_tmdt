import express from "express";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

// Mua ngay
router.post("/buy-now", async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        const order = await Order.create({
            user: req.user?.id || null, // nếu chưa có auth thì tạm null
            products: [
                {
                    product: productId,
                    quantity: 1
                }
            ],
            totalPrice: product.price
        });

        res.json({
            message: "Mua thành công",
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;