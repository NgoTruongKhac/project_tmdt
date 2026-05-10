import {
  register,
  verifyRegister,
  login,
  refreshToken,
  changePassword,
  changeEmail,
  verifyChangeEmail,
} from "../controllers/auth.controller.js";
import { registerValidationRules } from "../middlewares/validations/rules.validation.js";
import { validate } from "../middlewares/validations/validate.middleware.js";
import { Router } from "express";
import passport from "passport";
import { CLIENT_DOMAIN } from "../configs/env.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerValidationRules), register);
authRouter.post("/verify-register", verifyRegister);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_DOMAIN}/login?error=true`, // Chuyển về trang login của client nếu thất bại
    session: false, // Không dùng session của passport, chúng ta sẽ dùng JWT
  }),
  (req, res) => {
    const accessToken = generateAccessToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);
    res.redirect(
      `${CLIENT_DOMAIN}/auth-google?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  },
);

authRouter.post("/change-password", verifyToken, changePassword);
authRouter.post("/change-email", verifyToken, changeEmail);
authRouter.post("/verify-change-email", verifyToken, verifyChangeEmail);
