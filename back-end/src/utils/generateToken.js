import jwt from "jsonwebtoken";
import { JWT_KEY, JWT_REFRESH_KEY } from "../configs/env.js";

export const generateAccessToken = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_KEY, {
    expiresIn: "15m",
  });
  return accessToken;
};

export const generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_KEY, {
    expiresIn: "7d",
  });
  return refreshToken;
};
