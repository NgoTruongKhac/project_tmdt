import ErrorHandler from "../errors/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../../configs/env.js";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Dùng return next() để dừng thực thi ngay lập tức
      return next(new ErrorHandler("No token provided", 401));
    }

    const accessToken = authHeader.split(" ")[1];

    jwt.verify(accessToken, JWT_KEY, (err, decoded) => {
      if (err) {
        // Xử lý lỗi token một cách cụ thể và trả về 401
        if (err.name === "TokenExpiredError") {
          return next(new ErrorHandler("Access token has expired", 401));
        }
        return next(new ErrorHandler("Invalid access token", 401));
      }

      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    next(error);
  }
};
