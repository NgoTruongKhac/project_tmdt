import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import brcypt from "bcryptjs";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { JWT_REFRESH_KEY } from "../configs/env.js";

export const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const sessionOTP = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.formData = {
      username,
      password,
      email,
      sessionOTP: sessionOTP,
      createAt: Date.now(),
    };

    await sendEmail(
      email,
      "OTP for Registration",
      `Your OTP is: ${sessionOTP}`,
    );

    res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRegister = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const { username, password, email, createAt, sessionOTP } =
      req.session.formData;

    const timeElapsed = Date.now() - createAt;

    if (timeElapsed > 2 * 60 * 1000) {
      req.session.destroy();
      throw new ErrorHandler("otp expired", 404);
    }

    if (otp !== sessionOTP) {
      throw new ErrorHandler("Your OTP is incorrect. Please try again.", 404);
    }

    const hashedPassword = await brcypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    await newUser.save();

    req.session.destroy();

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorHandler("user does not exist", 401);
    }

    const isMatch = await brcypt.compare(password, user.password);

    if (!isMatch) {
      throw new ErrorHandler("password is wrong", 401);
    }

    const userId = user._id;

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    //get refresh token form coookie
    const refreshToken = req.cookies.refresh_token;
    console.log("refersh:" + refreshToken);

    if (!refreshToken) return new ErrorHandler("refresh token not found", 401);

    jwt.verify(refreshToken, JWT_REFRESH_KEY, (err, decoded) => {
      if (err) {
        // Nếu token không hợp lệ hoặc hết hạn
        return next(
          new ErrorHandler(
            "Invalid or expired refresh token, please login again",
            403,
          ),
        );
      }

      // Token hợp lệ, tạo một access token mới
      const newAccessToken = generateAccessToken(decoded.userId);

      // Gửi access token mới về cho client
      res.status(200).json({
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};
