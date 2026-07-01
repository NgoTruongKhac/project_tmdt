import express from "express";
import {
    getAdminVouchers,
    createVoucher,
    toggleVoucherStatus,
    deleteVoucher,
    updateVoucher
} from "../controllers/voucher.controller.js"; // Đảm bảo đúng đường dẫn tới file controller bạn đã cung cấp

const router = express.Router();

router.get("/", getAdminVouchers);

router.post("/", createVoucher);
router.patch("/:id/toggle", toggleVoucherStatus);
router.put("/:id", updateVoucher);
router.delete("/:id", deleteVoucher);

export default router;