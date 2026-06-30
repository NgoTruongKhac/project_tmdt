import { useEffect, useState, useCallback } from "react";
import { Eye, ClipboardList } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore"; // điều chỉnh lại đường dẫn nếu cần
import {
  getDesignerOrders,
  updateOrderStatus,
  type DesignerOrderItem,
  type OrderStatus,
} from "../../api/orderApi";
import OrderDetailModal from "@/components/OrderDetailModal";

const statusConfig: Record<string, { label: string; badge: string }> = {
  pending: { label: "Đang chờ xử lý", badge: "badge-warning" },
  processing: { label: "Đang xử lý", badge: "badge-info" },
  completed: { label: "Hoàn thành", badge: "badge-success" },
  cancelled: { label: "Đã hủy", badge: "badge-error" },
};

const statusTabs = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

// Phải khớp với DESIGNER_ALLOWED_TRANSITIONS trong order.controller.js,
// để tránh hiện lựa chọn rồi bị backend từ chối.
const ALLOWED_NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function ManageOrders() {
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<DesignerOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const [selectedOrder, setSelectedOrder] = useState<DesignerOrderItem | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [pendingCancel, setPendingCancel] = useState<DesignerOrderItem | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // orderId đang được cập nhật

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getDesignerOrders(page, 10, statusFilter);
      setOrders(res.data.orders);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch {
      setError("Không thể tải danh sách đơn hàng, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetail = (order: DesignerOrderItem) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (
    order: DesignerOrderItem,
    newStatus: OrderStatus,
  ) => {
    if (newStatus === order.status) return;

    if (newStatus === "cancelled") {
      setPendingCancel(order);
      setCancelReason("");
      return;
    }

    setIsUpdating(order.orderId);
    try {
      await updateOrderStatus(order.orderId, newStatus);
      fetchOrders();
    } catch {
      setError("Cập nhật trạng thái thất bại, vui lòng thử lại");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancel) return;
    setIsUpdating(pendingCancel.orderId);
    try {
      await updateOrderStatus(pendingCancel.orderId, "cancelled", cancelReason);
      setPendingCancel(null);
      fetchOrders();
    } catch {
      setError("Hủy đơn hàng thất bại, vui lòng thử lại");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-sm text-base-content/60">
          {user?.username ? `Xin chào ${user.username}, đ` : "Đ"}ây là các đơn
          hàng khách đặt dịch vụ của bạn
        </p>
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            className={`tab ${statusFilter === tab.value ? "tab-active" : ""}`}
            onClick={() => {
              setStatusFilter(tab.value as OrderStatus | "all");
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Tổng tiền</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <span className="loading loading-spinner loading-md" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-base-content/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList className="h-8 w-8" />
                    Chưa có đơn hàng nào
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const status = statusConfig[order.status] ?? {
                  label: "Không xác định",
                  badge: "badge-ghost",
                };
                const isLocked =
                  order.status === "completed" || order.status === "cancelled";
                const selectableStatuses = [
                  order.status,
                  ...ALLOWED_NEXT_STATUSES[order.status],
                ];

                return (
                  <tr key={order.orderId}>
                    <td className="font-mono text-sm">{order.orderCode}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {order.customer?.profilePicture && (
                          <img
                            src={order.customer.profilePicture}
                            alt={order.customer.fullName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <span>{order.customer?.fullName ?? "Ẩn danh"}</span>
                      </div>
                    </td>
                    <td>{order.package?.name ?? "—"}</td>
                    <td>
                      <span className="font-medium text-primary">
                        {order.totalAmount.toLocaleString("vi-VN")}{" "}
                        {order.currency}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <select
                        className={`select select-bordered select-xs ${status.badge.replace("badge", "select")}`}
                        value={order.status}
                        disabled={isLocked || isUpdating === order.orderId}
                        onChange={(e) =>
                          handleStatusChange(
                            order,
                            e.target.value as OrderStatus,
                          )
                        }
                      >
                        {selectableStatuses.map((s) => (
                          <option key={s} value={s}>
                            {statusConfig[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="btn btn-ghost btn-sm btn-square"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="join self-center">
          <button
            className="join-item btn btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            «
          </button>
          <button className="join-item btn btn-sm">
            Trang {page} / {totalPages}
          </button>
          <button
            className="join-item btn btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            »
          </button>
        </div>
      )}

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {pendingCancel && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Xác nhận hủy đơn hàng</h3>
            <p className="py-2 text-sm text-base-content/70">
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <span className="font-semibold">#{pendingCancel.orderCode}</span>?
              Hành động này không thể hoàn tác.
            </p>
            <label className="form-control">
              <span className="label-text mb-1">
                Lý do hủy (không bắt buộc)
              </span>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="textarea textarea-bordered"
                rows={3}
                placeholder="VD: Khách hàng đổi ý, không đủ tài nguyên thực hiện..."
              />
            </label>
            <div className="modal-action">
              <button onClick={() => setPendingCancel(null)} className="btn">
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                className="btn btn-error"
                disabled={isUpdating === pendingCancel.orderId}
              >
                {isUpdating === pendingCancel.orderId ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : null}
                Xác nhận hủy
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setPendingCancel(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
