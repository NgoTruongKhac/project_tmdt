import apiClient from "./apiClient";

export interface RewardPointsResponse {
  points: number;
  membershipLevel: string;
}

export interface RewardHistoryItem {
  _id: string;
  points: number;
  type: "earn" | "redeem";
  description: string;
  createdAt: string;
}

export interface RewardHistoryResponse {
  history: RewardHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RedeemResponse {
  pointsUsed: number;
  discountAmount: number;
  remainingPoints: number;
}

export const rewardApi = {
  getMyRewards: async () => {
    const response = await apiClient.get<{ success: boolean; message: string; data: RewardPointsResponse }>("/rewards/me");
    return response.data;
  },

  getRewardHistory: async (page = 1, limit = 10) => {
    const response = await apiClient.get<{ success: boolean; message: string; data: RewardHistoryResponse }>(`/rewards/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  redeemPoints: async (points: number, orderId?: string, orderTotal?: number) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: RedeemResponse }>("/rewards/redeem", {
      points,
      orderId,
      orderTotal,
    });
    return response.data;
  },

  simulatePayment: async (orderId: string, totalPrice: number) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>("/rewards/earn", {
      orderId,
      totalPrice,
    });
    return response.data;
  },
};
