import { Router } from "express";
import {
  updateProfileDesigner,
  getDesignerServices,
  getDashboard,
} from "../controllers/designer.controller.js";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";

export const designerRouter = Router();

designerRouter.get("/dashboard", verifyToken, getDashboard);
designerRouter.put("/update-profile", verifyToken, updateProfileDesigner);
designerRouter.get("/:designerId/services", getDesignerServices);
