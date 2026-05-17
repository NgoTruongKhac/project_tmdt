import {
  getMe,
  updateProfilePicture,
  updateProfile,
  transferRoleDesigner,
} from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";
import { upload } from "../middlewares/uploads/upload.middleware.js";

export const userRouter = Router();
userRouter.get("/me", verifyToken, getMe);
userRouter.put("/update-profile", verifyToken, updateProfile);
userRouter.post(
  "/upload-profile-picture",
  verifyToken,
  upload.single("profilePicture"),
  updateProfilePicture,
);
userRouter.post("/transfer-role-designer", verifyToken, transferRoleDesigner);
