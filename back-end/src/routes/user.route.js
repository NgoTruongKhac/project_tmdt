import { getMe } from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";

export const userRouter = Router();
userRouter.get("/me", verifyToken, getMe);
