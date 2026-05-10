import api from "./apiClient";
import Cookies from "js-cookie";

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const signup = async (
  fullName: string,
  password: string,
  email: string,
) => {
  const response = await api.post("/auth/register", {
    fullName,
    password,
    email,
  });
  return response.data;
};

export const verifyOtp = async (otp: string) => {
  const response = await api.post("/auth/verify-register", { otp });
  return response.data;
};

export const logout = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};
export const loginWithGoogle = () => {
  window.location.href = `${
    import.meta.env.VITE_SERVER_DOMAIN
  }/api/v1/auth/google`;
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
) => {
  const response = await api.post("/auth/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data;
};
