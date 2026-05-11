import express from "express";
import multer from "multer";
import {
    getProductDetail,
    createProduct,
    getProtectedImage
} from "../controllers/product.controller.js";

const router = express.Router();

// Cấu hình multer để nhận ảnh
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/:id", getProductDetail);
router.post("/", upload.array("images", 5), createProduct);
router.get("/image/:fileName", getProtectedImage);

export default router;