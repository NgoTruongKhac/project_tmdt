import api from "./apiClient";

export const getCurrentUser = async () => {
  const response = await api.get("/user/me");
  return response.data;
};

export const updateProfile = async (fullName: string) => {
  const response = await api.put("/user/update-profile", { fullName });
  return response.data;
};

export const updateProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append("profilePicture", file);
  const response = await api.post("/user/upload-profile-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const transferRoleDesigner = async (designerData: {
  age: number;
  degree: string;
  major: string;
  experienceYears: number;
  portfolioUrl: string;
  skills: string[];
}) => {
  const response = await api.post("/user/transfer-role-designer", designerData);
  return response.data;
};
