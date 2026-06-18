import api from "./apiClient";

export interface ServicePackage {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  thumbnail: string;
  isBestSeller: boolean;
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  designer?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: ServicePackage[];
}

export interface ServiceListResponse {
  success: boolean;
  message: string;
  data: {
    services: ServicePackage[];
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

export interface ServiceCategoriesResponse {
  success: boolean;
  message: string;
  data: string[];
}

// Lấy tất cả gói dịch vụ với phân trang
export const getAllServices = async (page = 1, limit = 8): Promise<ServiceListResponse> => {
  const response = await api.get(`/services?page=${page}&limit=${limit}`);
  return response.data;
};

export const getServiceCategories = async (): Promise<ServiceCategoriesResponse> => {
  const response = await api.get("/services/categories");
  return response.data;
};

// Lấy gói bán chạy
export const getBestSellers = async (): Promise<ServiceResponse> => {
  const response = await api.get("/services/best-sellers");
  return response.data;
};

// Lấy gói mới nhất
export const getNewestServices = async (): Promise<ServiceResponse> => {
  const response = await api.get("/services/newest");
  return response.data;
};

// Lấy gói nổi bật
export const getFeaturedServices = async (): Promise<ServiceResponse> => {
  const response = await api.get("/services/featured");
  return response.data;
};

// Lấy chi tiết gói dịch vụ theo slug
export const getServiceBySlug = async (slug: string): Promise<{ success: boolean; message: string; data: ServicePackage }> => {
  const response = await api.get(`/services/${slug}`);
  return response.data;
};
