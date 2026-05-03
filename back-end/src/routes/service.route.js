import express from "express";
import {
  getAllServices,
  getBestSellers,
  getNewestServices,
  getFeaturedServices,
  getServiceBySlug,
} from "../controllers/service.controller.js";

const router = express.Router();

// Lấy tất cả gói dịch vụ với phân trang
router.get("/", getAllServices);

// Lấy gói bán chạy
router.get("/best-sellers", getBestSellers);

// Lấy gói mới nhất
router.get("/newest", getNewestServices);

// Lấy gói nổi bật
router.get("/featured", getFeaturedServices);

// Lấy chi tiết gói dịch vụ theo slug
router.get("/:slug", getServiceBySlug);

export { router as serviceRouter };