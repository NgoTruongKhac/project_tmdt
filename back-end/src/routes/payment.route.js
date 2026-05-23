import express from "express";
import { createPaymentUrl, vnpayReturn } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth/auth.middleware.js"; // Giả sử bạn có middleware này

const router = express.Router();

router.post("/create-url", verifyToken, createPaymentUrl);
router.get("/vnpay-return", vnpayReturn);

export default router;