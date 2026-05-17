import express from "express";
import {
  getAllServices,
  getBestSellers,
  getNewestServices,
  getFeaturedServices,
  getServiceBySlug,
  getServiceDetail, getProtectedImage, createService
} from "../controllers/service.controller.js";
import multer from "multer";

const router = express.Router();

// Lấy tất cả gói dịch vụ với phân trang
router.get("/", getAllServices);

// Lấy gói bán chạy
router.get("/best-sellers", getBestSellers);

// Lấy gói mới nhất
router.get("/newest", getNewestServices);

// Lấy gói nổi bật
router.get("/featured", getFeaturedServices);

// Lấy sản phẩm theo id
router.get("/:id", getServiceDetail);

// Cấu hình multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route lấy chi tiết dịch vụ
router.get("/:id", getServiceDetail);

// Route upload dịch vụ kèm ảnh
router.post("/", upload.array("images"), createService);

// Route xử lý ảnh bảo vệ
router.get("/image/:fileName", getProtectedImage);

// Lấy chi tiết gói dịch vụ theo slug
router.get("/:slug", getServiceBySlug);

// export { router as serviceRouter };
export default router;