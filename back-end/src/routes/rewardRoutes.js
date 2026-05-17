import express from "express";
import {
  getCurrentPoints,
  getRewardHistory,
  redeemPoints,
  simulatePayment
} from "../controllers/rewardController.js";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";

const router = express.Router();

// Tất cả API phần thưởng đều cần user đăng nhập
router.use(verifyToken);

// API lấy điểm hiện tại
router.get("/me", getCurrentPoints);

// API lịch sử tích điểm
router.get("/history", getRewardHistory);

// API dùng điểm giảm giá
router.post("/redeem", redeemPoints);

// API test mô phỏng thanh toán thành công để cộng điểm
router.post("/earn", simulatePayment);

export { router as rewardRoutes };
