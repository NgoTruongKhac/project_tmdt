import express from "express";
import {
  createPaymentUrl,
  downloadServiceFile,
  vnpayReturn,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";
import { upload } from "../middlewares/uploads/upload.middleware.js";

const router = express.Router();

router.post(
  "/create-url",
  verifyToken,
  upload.single("customerImage"),
  createPaymentUrl,
);
router.get("/vnpay-return", vnpayReturn);
router.get("/download/:orderId/:format", verifyToken, downloadServiceFile);

export default router;
