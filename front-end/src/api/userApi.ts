import api from "./apiClient";

export const getCurrentUser = async () => {
  const response = await api.get("/user/me");
  return response.data;
};
