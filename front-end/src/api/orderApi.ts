import api from "./apiClient";

export interface OrderItem {
    orderId: string;
    orderCode: string;
    status: "pending" | "processing" | "completed" | "cancelled";
    totalAmount: number;
    currency: string;
    paymentStatus: string;
    paymentMethod: string;
    notes?: string;
    cancellationReason?: string;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;

    package: {
        id: string;
        name: string;
        description: string;
        thumbnail: string;
        category: string;
        deliveryTime: number;
        revisions: number;
    } | null;

    designer: {
        id: string;
        fullName: string;
        profilePicture: string;
        bio?: string;
    } | null;
}

export interface OrderResponse {
    success: boolean;
    message: string;
    data: {
        orders: OrderItem[];
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

export const getMyOrders = async (
    page = 1,
    limit = 10,
    status = "all"
): Promise<OrderResponse> => {
    const response = await api.get(
        `/orders/me?page=${page}&limit=${limit}&status=${status}`
    );

    return response.data;
};

export const cancelOrder = async (
    orderId: string,
    reason?: string
): Promise<{ success: boolean; message: string; data: { order: OrderItem } }> => {
    const response = await api.patch(
        `/orders/${orderId}/cancel`,
        { reason }
    );

    return response.data;
};
