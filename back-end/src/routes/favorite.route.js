import express from "express";
import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  checkFavorite,
  toggleFavorite,
  getFavoriteCount,
} from "../controllers/favorite.controller.js";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";

const router = express.Router();

// Tất cả routes đều cần xác thực
router.use(verifyToken);

// Thêm vào yêu thích
router.post("/", addToFavorites);

// Lấy danh sách yêu thích của user
router.get("/", getFavorites);

// Lấy số lượng yêu thích
router.get("/count", getFavoriteCount);

// Kiểm tra gói dịch vụ đã yêu thích chưa
router.get("/check/:serviceId", checkFavorite);

// Toggle yêu thích (Bonus)
router.post("/toggle/:serviceId", toggleFavorite);

// Xóa khỏi yêu thích
router.delete("/:serviceId", removeFromFavorites);

export { router as favoriteRouter };