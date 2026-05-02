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
    const { fullName, password, email } = req.body;
    const sessionOTP = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.formData = {
      fullName,
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
    const { fullName, password, email, createAt, sessionOTP } =
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
      fullName,
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

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.userId; // Cần middleware để giải mã JWT và gán req.userId
    const { oldPassword, newPassword } = req.body;

    // 1. Tìm user hiện tại
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User does not exist", 404);
    }

    // 2. Kiểm tra mật khẩu cũ có khớp không
    const isMatch = await brcypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ErrorHandler("Old password is wrong", 401);
    }

    // 3. Hash mật khẩu mới và lưu vào database
    const hashedNewPassword = await brcypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const changeEmail = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { newEmail } = req.body;

    // (Tùy chọn) Kiểm tra xem email mới đã được ai sử dụng chưa
    const existingEmail = await User.findOne({ email: newEmail });
    if (existingEmail) {
      throw new ErrorHandler("This email is already in use", 400);
    }

    // Tạo OTP và lưu vào session.
    // Lưu ý: Dùng key riêng (ví dụ changeEmailData) để không ảnh hưởng đến register
    const sessionOTP = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.changeEmailData = {
      userId,
      newEmail,
      sessionOTP: sessionOTP,
      createAt: Date.now(),
    };

    // Gửi email
    await sendEmail(
      newEmail,
      "OTP for Email Change",
      `Your OTP to change email is: ${sessionOTP}`,
    );

    res.status(200).json({
      message: "OTP sent to your new email",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyChangeEmail = async (req, res, next) => {
  try {
    const { otp } = req.body;

    // Kiểm tra xem session có tồn tại không
    if (!req.session.changeEmailData) {
      throw new ErrorHandler("No pending email change request found", 404);
    }

    const { userId, newEmail, createAt, sessionOTP } =
      req.session.changeEmailData;

    const timeElapsed = Date.now() - createAt;

    // Kiểm tra hạn OTP (2 phút)
    if (timeElapsed > 2 * 60 * 1000) {
      delete req.session.changeEmailData; // Chỉ xóa data này thay vì destroy toàn bộ session
      throw new ErrorHandler("OTP expired", 400);
    }

    // Kiểm tra tính hợp lệ của OTP
    if (otp !== sessionOTP) {
      throw new ErrorHandler("Your OTP is incorrect. Please try again.", 400);
    }

    // Cập nhật email mới
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User does not exist", 404);
    }

    user.email = newEmail;
    await user.save();

    // Xóa session data sau khi đổi thành công
    delete req.session.changeEmailData;

    return res.status(200).json({
      message: "Email changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
