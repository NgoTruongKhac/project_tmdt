import api from "./apiClient";
import type { ServicePackage } from "./serviceApi";

export interface FavoriteItem {
  _id: string;
  user: string;
  service: ServicePackage;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
  data: FavoriteItem[];
}

export interface FavoriteListResponse {
  success: boolean;
  message: string;
  data: {
    favorites: FavoriteItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface FavoriteCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

export interface FavoriteCheckResponse {
  success: boolean;
  message: string;
  data: {
    isFavorite: boolean;
  };
}

export interface FavoriteToggleResponse {
  success: boolean;
  message: string;
  data: {
    isFavorite: boolean;
    action: "added" | "removed";
    favorite?: FavoriteItem;
  };
}

// Lấy danh sách yêu thích
export const getFavorites = async (page = 1, limit = 10): Promise<FavoriteListResponse> => {
  const response = await api.get(`/favorites?page=${page}&limit=${limit}`);
  return response.data;
};

// Lấy số lượng yêu thích
export const getFavoriteCount = async (): Promise<FavoriteCountResponse> => {
  const response = await api.get("/favorites/count");
  return response.data;
};

// Kiểm tra đã yêu thích chưa
export const checkFavorite = async (serviceId: string): Promise<FavoriteCheckResponse> => {
  const response = await api.get(`/favorites/check/${serviceId}`);
  return response.data;
};

// Toggle yêu thích
export const toggleFavorite = async (serviceId: string): Promise<FavoriteToggleResponse> => {
  const response = await api.post(`/favorites/toggle/${serviceId}`);
  return response.data;
};

// Xóa khỏi yêu thích
export const removeFavorite = async (serviceId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/favorites/${serviceId}`);
  return response.data;
};