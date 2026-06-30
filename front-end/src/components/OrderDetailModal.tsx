import {
  X,
  Eye,
  User,
  Package,
  CreditCard,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { DesignerOrderItem } from "@/api/orderApi";

interface OrderDetailModalProps {
  order: DesignerOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; badge: string }> = {
  pending: { label: "Đang chờ xử lý", badge: "badge-warning" },
  processing: { label: "Đang xử lý", badge: "badge-info" },
  completed: { label: "Hoàn thành", badge: "badge-success" },
  cancelled: { label: "Đã hủy", badge: "badge-error" },
};

const paymentStatusLabel: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const status = statusConfig[order.status] ?? {
    label: "Không xác định",
    badge: "badge-ghost",
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Eye className="h-5 w-5 text-primary" />
          Chi tiết đơn hàng #{order.orderCode}
        </h3>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${status.badge}`}>{status.label}</span>
            <span className="badge badge-outline">
              {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
            </span>
          </div>

          {order.customer && (
            <div className="rounded-lg border border-base-300 p-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-base-content/60">
                <User className="h-3 w-3" /> Khách hàng
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={order.customer.profilePicture}
                  alt={order.customer.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
                <div>
                  <p className="font-medium">{order.customer.fullName}</p>
                  {order.customer.email && (
                    <p className="text-xs text-base-content/50">
                      {order.customer.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {order.package && (
            <div className="rounded-lg border border-base-300 p-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-medium text-base-content/60">
                <Package className="h-3 w-3" /> Dịch vụ
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={order.package.thumbnail}
                  alt={order.package.name}
                  className="h-14 w-14 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/uploads/default-thumbnail.png";
                  }}
                />
                <div>
                  <p className="font-medium">{order.package.name}</p>
                  <p className="text-xs text-base-content/50">
                    {order.package.category}
                  </p>
                </div>
              </div>
              {order.package.description && (
                <p className="mt-2 line-clamp-3 text-sm text-base-content/70">
                  {order.package.description}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-base-200 p-3">
              <p className="flex items-center gap-1 text-xs text-base-content/60">
                <CreditCard className="h-3 w-3" /> Tổng tiền
              </p>
              <p className="font-semibold text-primary">
                {order.totalAmount.toLocaleString("vi-VN")} {order.currency}
              </p>
            </div>

            <div className="rounded-lg bg-base-200 p-3">
              <p className="text-xs text-base-content/60">Phương thức TT</p>
              <p className="font-semibold">{order.paymentMethod}</p>
            </div>

            {order.package && (
              <>
                <div className="rounded-lg bg-base-200 p-3">
                  <p className="flex items-center gap-1 text-xs text-base-content/60">
                    <Clock className="h-3 w-3" /> Thời gian giao
                  </p>
                  <p className="font-semibold">
                    {order.package.deliveryTime} ngày
                  </p>
                </div>
                <div className="rounded-lg bg-base-200 p-3">
                  <p className="flex items-center gap-1 text-xs text-base-content/60">
                    <RefreshCw className="h-3 w-3" /> Số lần sửa
                  </p>
                  <p className="font-semibold">{order.package.revisions}</p>
                </div>
              </>
            )}
          </div>

          {order.notes && (
            <div>
              <p className="text-xs font-medium text-base-content/60">
                Ghi chú
              </p>
              <p className="text-sm text-base-content/70">{order.notes}</p>
            </div>
          )}

          {order.status === "cancelled" && order.cancellationReason && (
            <div className="alert alert-error py-2 text-sm">
              <span>Lý do hủy: {order.cancellationReason}</span>
            </div>
          )}

          <p className="text-xs text-base-content/50">
            Đặt lúc: {new Date(order.createdAt).toLocaleString("vi-VN")} • Cập
            nhật: {new Date(order.updatedAt).toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Đóng
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
