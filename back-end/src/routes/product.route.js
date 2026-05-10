import express from "express";
import { getProductDetail } from "../controllers/product.controller.js"; // Đảm bảo đúng đường dẫn controller

const router = express.Router();
router.get("/:id", getProductDetail);

export default router;