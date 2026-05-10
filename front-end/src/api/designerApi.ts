import api from "./apiClient";
export const updateProfileDesigner = async () => {
  const response = await api.put("/designer/update-profile", {});
  return response.data;
};
