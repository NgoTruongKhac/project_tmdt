import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth/auth.middleware.js";
import {
    getAllUsers,
    getDashboardStats,
    toggleUserStatus,
    getAdminServices,
    updateServiceStatus,
    getAdminOrders,
    updateOrderStatus,
} from "../controllers/admin.controller.js";
import { createVoucher, getAdminVouchers, updateVoucher, toggleVoucherStatus, deleteVoucher } from "../controllers/voucher.controller.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);

router.patch("/users/:id/status", toggleUserStatus);

router.get("/services", getAdminServices);

router.patch("/services/:id/status", updateServiceStatus);

router.get("/orders", getAdminOrders);

router.patch("/orders/:id/status", updateOrderStatus);

router.get("/vouchers", getAdminVouchers);
router.post("/vouchers", createVoucher);
router.put("/vouchers/:id", updateVoucher);
router.patch("/vouchers/:id/status", toggleVoucherStatus);
router.delete("/vouchers/:id", deleteVoucher);

export default router;
