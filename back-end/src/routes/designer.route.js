import { Router } from "express";
import { updateProfileDesigner } from "../controllers/designer.controller.js";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";

export const designerRouter = Router();
designerRouter.put("/update-profile", verifyToken, updateProfileDesigner);
