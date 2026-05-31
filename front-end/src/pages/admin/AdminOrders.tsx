import { useEffect, useState } from "react";
import { ChevronDown, Clock3, Loader2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/api/apiClient";

type OrderStatus = "pending" | "paid" | "completed" | "cancelled";

type OrderServiceItem = {
    quantity?: number;
    service?: {
        _id?: string;
        name?: string;
    };
};

type OrderUser = {
    fullName?: string;
    email?: string;
    profilePicture?: string;
    avatar?: string;
};

type OrderItem = {
    _id: string;
    createdAt?: string;
    totalPrice?: number;
    status?: string;
    user?: OrderUser;
    services?: OrderServiceItem[];
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = ["pending", "paid", "completed", "cancelled"];

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: "Chờ xử lý",
    paid: "Đã thanh toán",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
};

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 ring-yellow-200",
    paid: "bg-blue-100 text-blue-700 ring-blue-200",
    completed: "bg-green-100 text-green-700 ring-green-200",
    cancelled: "bg-red-100 text-red-700 ring-red-200",
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

const formatCurrency = (value?: number) => currencyFormatter.format(value ?? 0);

const formatDateTime = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const getOrderStatus = (status?: string): OrderStatus => {
    const normalized = (status || "pending").toLowerCase();

    if (normalized === "paid") return "paid";
    if (normalized === "completed") return "completed";
    if (normalized === "cancelled") return "cancelled";

    return "pending";
};

const getAvatarUrl = (order: OrderItem) => {
    const user = order.user;
    const name = user?.fullName || user?.email || order._id;

    if (user?.profilePicture || user?.avatar) {
        return user.profilePicture || user.avatar || "";
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
};

const getTotalQuantity = (services?: OrderServiceItem[]) => {
    if (!services?.length) return 0;

    return services.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get("/admin/orders");
                const payload = response.data?.data ?? response.data ?? [];

                const orderList = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.orders)
                        ? payload.orders
                        : [];

                setOrders(orderList);
            } catch (error) {
                console.error("Error fetching admin orders:", error);
                setOrders([]);
                toast.error("Không thể tải danh sách đơn hàng.");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchOrders();
    }, []);

    const updateOrderStatus = (orderId: string, status: OrderStatus) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) => (order._id === orderId ? { ...order, status } : order)),
        );
    };

    const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
    const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleChangeStatus = async (orderId: string, nextStatus: OrderStatus) => {
        const currentOrder = orders.find((order) => order._id === orderId);
        if (!currentOrder) return;

        const currentStatus = getOrderStatus(currentOrder.status);
        if (currentStatus === nextStatus) return;

        setUpdatingOrderId(orderId);
        try {
            await apiClient.patch(`/admin/orders/${orderId}/status`, {
                status: nextStatus,
            });

            updateOrderStatus(orderId, nextStatus);
            toast.success("Cập nhật trạng thái đơn hàng thành công.");
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Không thể cập nhật trạng thái đơn hàng.");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                <p className="text-sm text-gray-500">Theo dõi và cập nhật nhanh trạng thái các đơn hàng của hệ thống.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Mã đơn / Ngày tạo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Người mua
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Dịch vụ
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Tổng tiền
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Hành động
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                                        <div className="inline-flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tải danh sách đơn hàng...
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                                        Chưa có đơn hàng nào.
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => {
                                    const status = getOrderStatus(order.status);
                                    const isFinalized = status === "completed" || status === "cancelled";
                                    const isBusy = updatingOrderId === order._id;
                                    const buyerName = order.user?.fullName || "Người mua ẩn danh";
                                    const buyerEmail = order.user?.email || "Chưa có email";
                                    const firstServiceName = order.services?.[0]?.service?.name || "Chưa có dịch vụ";
                                    const totalQuantity = getTotalQuantity(order.services);
                                    const orderCode = order._id.length > 8 ? `${order._id.slice(0, 8)}...` : order._id;

                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50/80">
                                            <td className="px-6 py-4 align-top">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">{orderCode}</div>
                                                    <div className="inline-flex items-center gap-1 text-sm text-gray-500">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        {formatDateTime(order.createdAt)}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getAvatarUrl(order)}
                                                        alt={buyerName}
                                                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{buyerName}</div>
                                                        <div className="text-sm text-gray-500">{buyerEmail}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <div className="space-y-1">
                                                    <div className="inline-flex items-center gap-2 font-medium text-gray-900">
                                                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                                                        {firstServiceName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Tổng số lượng: {totalQuantity}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 align-top text-sm font-semibold text-gray-900">
                                                {formatCurrency(order.totalPrice)}
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_BADGE_CLASSES[status]}`}
                                                >
                                                    {STATUS_LABELS[status]}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 align-top">
                                                {isFinalized ? (
                                                    <div className="text-sm text-gray-400">Không thể thay đổi</div>
                                                ) : (
                                                    <div className="relative inline-flex items-center">
                                                        <select
                                                            value={status}
                                                            onChange={(e) =>
                                                                void handleChangeStatus(order._id, e.target.value as OrderStatus)
                                                            }
                                                            disabled={isBusy}
                                                            className="min-w-36 appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {ORDER_STATUS_OPTIONS.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {STATUS_LABELS[option]}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && orders.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-600">
                            Trang <span className="font-semibold text-gray-900">{currentPage}</span> / {totalPages}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}