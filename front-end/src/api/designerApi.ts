import api from "./apiClient";

export interface DesignerService {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  thumbnail: string;
  deliveryTime?: number;
}

export interface DesignerServicesResponse {
  success: boolean;
  data: DesignerService[];
}

export const updateProfileDesigner = async () => {
  const response = await api.put("/designer/update-profile", {});
  return response.data;
};
export const getDesignerServices = async (
    designerId: string
): Promise<DesignerServicesResponse> => {
  const response = await api.get(
      `/designer/${designerId}/services`
  );

  return response.data;
};
