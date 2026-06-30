import express from "express";
import multer from "multer";
import {
  getAllServices,
  getServiceCategories,
  getBestSellers,
  getNewestServices,
  getFeaturedServices,
  getHireServices,
  getPackageServices,
  getProductServices,
  getDesignServices,
  getDesignerPackages,
  getServiceByIdentifier,
  getProtectedImage,
  createService,
  createServicePackage,
  updateServicePackage,
  deleteServicePackage,
  getMyServicePackages, // Thêm hàm này nếu bạn tách riêng trang quản lý
  getServicePackageById, // Thêm hàm này để xem chi tiết theo ID trong modal
} from "../controllers/service.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ========================================================
// 1. CÁC ROUTE ĐƯỜNG DẪN CỐ ĐỊNH (FIXED PATHS) - PHẢI ĐỂ TRÊN CÙNG
// ========================================================
router.get("/", getAllServices);
router.get("/categories", getServiceCategories);
router.get("/best-sellers", getBestSellers);
router.get("/newest", getNewestServices);
router.get("/featured", getFeaturedServices);
router.get("/hire", getHireServices);
router.get("/packages", getPackageServices);
router.get("/products", getProductServices);
router.post("/create-product", upload.array("files", 5), createService);
// ========================================================
// 2. CÁC ROUTE QUẢN LÝ CỦA DESIGNER (KHỚP VỚI serviceApi.ts)
// ========================================================
// API lấy danh sách dịch vụ phía ngoài portfolio công khai
router.get("/design-services", getDesignServices);
router.get("/designer/:designerId", getDesignerPackages);

// API lấy danh sách dịch vụ trong trang QUẢN LÝ (ManageServices.tsx) của designer
router.get("/designer/:designerId/manage", getMyServicePackages);

// API lấy chi tiết gói dịch vụ bằng ID cho modal chỉnh sửa
router.get("/package/:id", getServicePackageById);

// API Tạo dịch vụ mới
router.post("/", upload.array("images", 5), createServicePackage);

// API cập nhật ảnh watermark
router.get("/image/:fileName", getProtectedImage);

// ========================================================
// 3. CÁC ROUTE CÓ PARAM ĐỘNG (DYNAMIC PARAMS) - BẮT BUỘC ĐỂ DƯỚI CÙNG
// ========================================================
// Chỉnh sửa dịch vụ theo ID
router.put("/:id", upload.array("images", 1), updateServicePackage);

// Xóa dịch vụ theo ID
router.delete("/:id", deleteServicePackage);

// Xem chi tiết dịch vụ (Bằng ID hoặc Slug)
router.get("/:identifier", getServiceByIdentifier);

export { router as serviceRouter };
export default router;
