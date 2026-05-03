import express from "express";
import Product from "../models/product.model.js";

const router = express.Router();

// Lấy chi tiết sản phẩm
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("designer", "name");

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;