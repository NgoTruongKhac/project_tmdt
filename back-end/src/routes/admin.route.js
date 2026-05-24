import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth/auth.middleware.js";
import {
    getAllUsers,
    getDashboardStats,
    toggleUserStatus,
    getAdminServices,
    updateServiceStatus,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);

router.patch("/users/:id/status", toggleUserStatus);

router.get("/services", getAdminServices);

router.patch("/services/:id/status", updateServiceStatus);

export default router;
