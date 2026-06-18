import { useEffect, useState } from "react";
import { cancelOrder, getMyOrders, type OrderItem } from "@/api/orderApi";

export default function OrderHistory() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await getMyOrders();
            setOrders(response.data.orders);
        } catch (error) {
            console.error("Fetch orders error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId: string) => {
        const confirmCancel = window.confirm(
            "Bạn có chắc muốn hủy đơn hàng này?"
        );

        if (!confirmCancel) return;

        try {
            await cancelOrder(orderId, "Khách hàng tự hủy");

            setOrders((prev) =>
                prev.map((order) =>
                    order.orderId === orderId
                        ? {
                            ...order,
                            status: "cancelled",
                        }
                        : order
                )
            );

            alert("Hủy đơn hàng thành công");
        } catch (error: any) {
            console.error(error);

            alert(
                error?.response?.data?.message ||
                "Không thể hủy đơn hàng"
            );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">
                Lịch sử đơn hàng
            </h1>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500">
                    Bạn chưa có đơn hàng nào
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((order) => (
                        <div
                            key={order.orderId}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-5"
                        >
                            <img
                                src={order.package.thumbnail}
                                alt={order.package.name}
                                className="w-full md:w-40 h-40 object-cover rounded-xl"
                            />

                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {order.package.name}
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Mã đơn: {order.orderCode}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Designer: {order.designer.fullName}
                                        </p>
                                    </div>

                                    <div
                                        className={`px-3 py-1 rounded-full text-sm font-medium
                                        ${order.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : order.status === "processing"
                                                ? "bg-blue-100 text-blue-700"
                                                : order.status === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {order.status}
                                    </div>
                                </div>

                                <div className="mt-4 text-gray-600">
                                    <p>
                                        Thanh toán: {order.paymentMethod}
                                    </p>

                                    <p>
                                        Trạng thái thanh toán:{" "}
                                        {order.paymentStatus}
                                    </p>

                                    <p>
                                        Ngày tạo:{" "}
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <div className="text-2xl font-bold text-primary">
                                        {order.totalAmount.toLocaleString(
                                            "vi-VN"
                                        )}{" "}
                                        đ
                                    </div>

                                    {(order.status === "pending" ||
                                        order.status === "processing") && (
                                        <button
                                            onClick={() =>
                                                handleCancelOrder(
                                                    order.orderId
                                                )
                                            }
                                            className="btn btn-error text-white"
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}