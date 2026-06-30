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
  listingType: "hire" | "package" | "product";
  isBestSeller: boolean;
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  views: number;
  revisions: number;
  deliveryTime: number;
  createdAt: string;
  updatedAt: string;
  designer?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  sourceType?: "service" | "servicePackage";
}

export interface DesignService {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  revisions: number;
  createdAt: string;
  updatedAt: string;
  designerId?: {
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

export interface DesignServiceResponse {
  success: boolean;
  message: string;
  data: DesignService[];
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
export const getAllServices = async (
  page = 1,
  limit = 8,
): Promise<ServiceListResponse> => {
  const response = await api.get(`/services?page=${page}&limit=${limit}`);
  return response.data;
};

export const getServiceCategories =
  async (): Promise<ServiceCategoriesResponse> => {
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

export const getHireServices = async (): Promise<ServiceResponse> => {
  const response = await api.get("/services/hire");
  return response.data;
};

export const getPackageServices = async (): Promise<ServiceResponse> => {
  const response = await api.get("/services/packages");
  return response.data;
};

export const getProductServices = async (): Promise<ServiceResponse> => {
  const response = await api.get("/services/products");
  return response.data;
};

export const getDesignServices = async (): Promise<DesignServiceResponse> => {
  const response = await api.get("/services/design-services");
  return response.data;
};

// Lấy chi tiết gói dịch vụ theo slug
export const getServiceBySlug = async (
  slug: string,
): Promise<{ success: boolean; message: string; data: ServicePackage }> => {
  const response = await api.get(`/services/${slug}`);
  return response.data;
};

/**
 * === BỔ SUNG VÀO serviceApi.ts ===
 * Thêm các interface và hàm dưới đây vào file serviceApi.ts hiện có (giữ nguyên phần cũ).
 */

export interface ServiceDetailResponse {
  success: boolean;
  message: string;
  data: ServicePackage;
}

export interface ServiceMutationResponse {
  success: boolean;
  message: string;
  data: ServicePackage;
}

// Lấy danh sách dịch vụ của designer hiện tại (trang quản lý ManageServices.tsx)
export const getMyServicePackages = async (
  designerId: string,
  page = 1,
  limit = 10,
  status?: string,
): Promise<ServiceListResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status && status !== "all") params.append("status", status);

  const response = await api.get(
    `/services/designer/${designerId}/manage?${params.toString()}`,
  );
  return response.data;
};

// Lấy chi tiết 1 dịch vụ theo ID (dùng cho modal xem chi tiết / chỉnh sửa)
export const getServicePackageById = async (
  id: string,
): Promise<ServiceDetailResponse> => {
  const response = await api.get(`/services/package/${id}`);
  return response.data;
};

// Tạo dịch vụ mới
export const createServicePackage = async (
  formData: FormData,
): Promise<ServiceMutationResponse> => {
  const response = await api.post("/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Cập nhật dịch vụ
export const updateServicePackage = async (
  id: string,
  formData: FormData,
): Promise<ServiceMutationResponse> => {
  const response = await api.put(`/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Xóa dịch vụ
export const deleteServicePackage = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};
