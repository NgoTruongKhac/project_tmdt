import api from "./apiClient";
import type { ServicePackage } from "./serviceApi";

export interface DesignerSummary {
  _id: string;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  role?: string;
}

export type DesignerService = ServicePackage;

export interface DesignerServicesResponse {
  success: boolean;
  designer?: DesignerSummary;
  data: ServicePackage[];
}

// 🆕 Định nghĩa Response cho Dashboard
export interface DashboardData {
  totalServices: number;
  totalServicePackages: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

export const updateProfileDesigner = async () => {
  const response = await api.put("/designer/update-profile", {});
  return response.data;
};

export const getDesignerServices = async (
  designerId: string,
): Promise<DesignerServicesResponse> => {
  const response = await api.get(`/designer/${designerId}/services`);
  return response.data;
};

export const getDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get("/designer/dashboard");
  return response.data;
};
