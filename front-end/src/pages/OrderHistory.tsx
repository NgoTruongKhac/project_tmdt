import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  Search,
  Truck,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { cancelOrder, getMyOrders, type OrderItem } from "@/api/orderApi";
import { formatCurrency, formatDate } from "@/utils/format";

const fallbackImage =
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900";

const statusLabel: Record<OrderItem["status"], string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusStyle: Record<OrderItem["status"], string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  processing: "bg-blue-50 text-blue-700 ring-blue-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-100",
};

const statusDot: Record<OrderItem["status"], string> = {
  pending: "bg-amber-400",
  processing: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

const statusIcon: Record<OrderItem["status"], typeof Clock3> = {
  pending: Clock3,
  processing: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

const getServiceName = (order: OrderItem) =>
  order.package?.name || "Dịch vụ không còn hiển thị";

const getDesignerName = (order: OrderItem) =>
  order.designer?.fullName || "Designer";

const canCancelOrder = (order: OrderItem) =>
  order.status === "pending" || order.status === "processing";

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<(typeof filterOptions)[number]["value"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders(1, 50);
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setOrders([]);
      setError("Không thể tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const totalSpent = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      total: orders.length,
      active: orders.filter((order) => canCancelOrder(order)).length,
      completed: orders.filter((order) => order.status === "completed").length,
      totalSpent,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchKeyword =
        !keyword ||
        order.orderCode.toLowerCase().includes(keyword) ||
        getServiceName(order).toLowerCase().includes(keyword) ||
        getDesignerName(order).toLowerCase().includes(keyword);

      return matchStatus && matchKeyword;
    });
  }, [orders, searchTerm, statusFilter]);

  const heroOrder = orders[0];

  const openCancelModal = (order: OrderItem) => {
    setCancelTarget(order);
    setCancelReason("");
    setError("");
    setMessage("");
  };

  const closeCancelModal = () => {
    if (cancellingId) return;
    setCancelTarget(null);
    setCancelReason("");
  };

  const submitCancelOrder = async () => {
    if (!cancelTarget) return;

    const reason = cancelReason.trim();
    if (reason.length < 5) {
      setError("Vui lòng nhập lý do hủy đơn ít nhất 5 ký tự.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setCancellingId(cancelTarget.orderId);

      const response = await cancelOrder(cancelTarget.orderId, reason);
      const updatedOrder = response.data.order;

      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === cancelTarget.orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      );

      setSelectedOrder((current) =>
        current?.orderId === cancelTarget.orderId
          ? { ...current, ...updatedOrder }
          : current
      );

      setMessage(response.message || "Hủy đơn hàng thành công.");
      setCancelTarget(null);
      setCancelReason("");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Không thể hủy đơn hàng.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f6f7fb] px-4 py-16">
        <div className="mx-auto max-w-7xl space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[28px] bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[34px] border border-[#d8e2ff] bg-[linear-gradient(135deg,#ffffff_0%,#eef4ff_58%,#fff8e8_100%)] shadow-[0_26px_80px_rgba(11,92,255,0.12)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#0b5cff]" />
          <div className="relative grid gap-8 p-8 lg:grid-cols-[1fr_520px] lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#0b5cff] ring-1 ring-[#0b5cff]/15">
                <PackageCheck className="h-4 w-4" />
                Trung tâm đơn hàng
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-neutral-950 md:text-5xl">
                Lịch sử đơn hàng của bạn
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
                Theo dõi tiến độ thiết kế, xem chi tiết từng gói dịch vụ và hủy
                đơn còn đang xử lý bằng lý do rõ ràng.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-[#0b5cff] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/70">
                  {stats.total} đơn hàng
                </div>
                <div className="rounded-2xl bg-white/85 px-5 py-3 text-sm font-bold text-neutral-900 ring-1 ring-white">
                  {formatCurrency(stats.totalSpent)} đã thanh toán
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-3 shadow-[0_20px_55px_rgba(15,23,42,0.12)] backdrop-blur">
                <div className="relative h-48 overflow-hidden rounded-[22px] bg-neutral-200">
                  <img
                    src={heroOrder?.package?.thumbnail || fallbackImage}
                    alt={heroOrder ? getServiceName(heroOrder) : "Order preview"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/80 to-transparent p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-white/60">
                      Đơn gần nhất
                    </div>
                    <div className="mt-1 line-clamp-1 text-lg font-black text-white">
                      {heroOrder ? getServiceName(heroOrder) : "Chưa có đơn hàng"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Tổng đơn" value={String(stats.total)} icon={WalletCards} tone="blue" />
                <StatCard label="Đang xử lý" value={String(stats.active)} icon={Truck} tone="gold" />
                <StatCard label="Hoàn thành" value={String(stats.completed)} icon={CheckCircle2} tone="green" />
                <StatCard label="Đã chi" value={formatCurrency(stats.totalSpent)} icon={CreditCard} tone="ink" compact />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                    statusFilter === option.value
                      ? "bg-[#0b5cff] text-white shadow-lg shadow-blue-200"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 lg:w-[360px]">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm mã đơn, dịch vụ, designer..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </section>

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
            {message}
          </div>
        )}

        {error && !cancelTarget && (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-neutral-300 bg-white px-6 py-20 text-center text-neutral-500">
            Không có đơn hàng phù hợp.
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {filteredOrders.map((order, index) => (
              <OrderRow
                key={order.orderId}
                order={order}
                index={index}
                isCancelling={cancellingId === order.orderId}
                onView={() => setSelectedOrder(order)}
                onCancel={() => openCancelModal(order)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {cancelTarget && (
        <CancelOrderModal
          order={cancelTarget}
          reason={cancelReason}
          error={error}
          isSubmitting={Boolean(cancellingId)}
          onReasonChange={setCancelReason}
          onClose={closeCancelModal}
          onSubmit={submitCancelOrder}
        />
      )}
    </div>
  );
}

function OrderRow({
  order,
  index,
  isCancelling,
  onView,
  onCancel,
}: {
  order: OrderItem;
  index: number;
  isCancelling: boolean;
  onView: () => void;
  onCancel: () => void;
}) {
  const Icon = statusIcon[order.status];
  const canCancel = canCancelOrder(order);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
        <div className="relative min-h-64 overflow-hidden bg-neutral-100 lg:min-h-full">
          <img
            src={order.package?.thumbnail || fallbackImage}
            alt={getServiceName(order)}
            className="h-full min-h-64 w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-neutral-800 backdrop-blur">
            #{String(index + 1).padStart(2, "0")}
          </div>
        </div>

        <div className="p-6 lg:p-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ring-1 ${statusStyle[order.status]}`}>
                  <span className={`h-2 w-2 rounded-full ${statusDot[order.status]}`} />
                  {statusLabel[order.status]}
                </span>
                <span className="text-sm font-semibold text-neutral-400">
                  {order.orderCode}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black text-neutral-950">
                {getServiceName(order)}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                {order.package?.description ||
                  "Đơn hàng thiết kế đang được lưu trong hệ thống."}
              </p>
            </div>

            <div className="text-left xl:text-right">
              <div className="text-sm font-semibold text-neutral-400">
                Tổng thanh toán
              </div>
              <div className="mt-1 text-3xl font-black text-neutral-950">
                {formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <MiniInfo icon={CalendarDays} label="Ngày tạo" value={formatDate(order.createdAt)} />
            <MiniInfo icon={CreditCard} label="Thanh toán" value={order.paymentMethod} />
            <MiniInfo icon={Icon} label="Designer" value={getDesignerName(order)} />
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-neutral-500">
              Trạng thái thanh toán:{" "}
              <span className="font-bold text-neutral-800">
                {order.paymentStatus}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onView}
                className="rounded-2xl border border-neutral-200 px-5 py-3 font-bold text-neutral-800 transition hover:bg-neutral-50"
              >
                Xem chi tiết
              </button>

              {canCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="rounded-2xl bg-rose-500 px-5 py-3 font-bold text-white transition hover:bg-rose-600 disabled:opacity-60"
                >
                  {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderDetailModal({
  order,
  onClose,
}: {
  order: OrderItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="text-2xl font-black text-neutral-950">
              Chi tiết đơn hàng
            </h2>
            <p className="mt-1 text-sm font-semibold text-neutral-400">
              {order.orderCode}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-7 p-6 lg:grid-cols-[320px_1fr]">
          <img
            src={order.package?.thumbnail || fallbackImage}
            alt={getServiceName(order)}
            className="h-80 w-full rounded-[28px] object-cover"
          />

          <div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${statusStyle[order.status]}`}>
              {statusLabel[order.status]}
            </span>

            <h3 className="mt-4 text-3xl font-black text-neutral-950">
              {getServiceName(order)}
            </h3>
            <p className="mt-3 leading-7 text-neutral-600">
              {order.package?.description || "Không có mô tả cho dịch vụ này."}
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Info label="Designer" value={getDesignerName(order)} />
              <Info label="Tổng tiền" value={formatCurrency(order.totalAmount)} />
              <Info label="Phương thức thanh toán" value={order.paymentMethod} />
              <Info label="Trạng thái thanh toán" value={order.paymentStatus} />
              <Info label="Ngày tạo" value={formatDate(order.createdAt)} />
              <Info label="Thời gian giao" value={`${order.package?.deliveryTime || 3} ngày`} />
              <Info label="Số lần chỉnh sửa" value={`${order.package?.revisions || 0}`} />
              <Info label="Tiền tệ" value={order.currency} />
            </div>

            {order.notes && (
              <div className="mt-5 rounded-3xl bg-neutral-50 p-5">
                <div className="text-sm font-bold text-neutral-500">Ghi chú</div>
                <div className="mt-2 text-neutral-700">{order.notes}</div>
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="mt-5 rounded-3xl bg-rose-50 p-5 text-rose-700">
                <div className="text-sm font-black">Lý do hủy</div>
                <div className="mt-2">
                  {order.cancellationReason || "Không có lý do"}
                </div>
                {order.cancelledAt && (
                  <div className="mt-2 text-sm">
                    Hủy lúc: {formatDate(order.cancelledAt)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelOrderModal({
  order,
  reason,
  error,
  isSubmitting,
  onReasonChange,
  onClose,
  onSubmit,
}: {
  order: OrderItem;
  reason: string;
  error: string;
  isSubmitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-neutral-950">
              Hủy đơn hàng
            </h2>
            <p className="mt-1 text-sm font-semibold text-neutral-400">
              {order.orderCode} - {getServiceName(order)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-black text-neutral-700">
            Lý do hủy đơn
          </span>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={5}
            maxLength={255}
            placeholder="Ví dụ: Tôi muốn thay đổi yêu cầu thiết kế..."
            className="mt-2 w-full resize-none rounded-3xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-50"
          />
        </label>

        <div className="mt-2 text-right text-xs font-semibold text-neutral-400">
          {reason.length}/255
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl border border-neutral-200 px-5 py-3 font-bold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-2xl bg-rose-500 px-5 py-3 font-bold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {isSubmitting ? "Đang hủy..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  compact = false,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
  tone: "blue" | "gold" | "green" | "ink";
  compact?: boolean;
}) {
  const toneClass = {
    blue: {
      card: "border-[#0b5cff]/15 bg-white",
      accent: "bg-[#0b5cff]",
      icon: "text-[#0b5cff] bg-[#0b5cff]/10",
      value: "text-neutral-950",
      label: "text-[#0b5cff]",
    },
    gold: {
      card: "border-amber-200 bg-[#fffaf0]",
      accent: "bg-amber-400",
      icon: "text-amber-700 bg-amber-100",
      value: "text-neutral-950",
      label: "text-amber-700",
    },
    green: {
      card: "border-emerald-200 bg-[#f3fbf7]",
      accent: "bg-emerald-500",
      icon: "text-emerald-700 bg-emerald-100",
      value: "text-neutral-950",
      label: "text-emerald-700",
    },
    ink: {
      card: "border-neutral-300 bg-neutral-950",
      accent: "bg-white",
      icon: "text-white bg-white/10",
      value: "text-white",
      label: "text-white/60",
    },
  }[tone];

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${toneClass.card}`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${toneClass.accent}`} />
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={`mt-4 font-black ${toneClass.value} ${compact ? "text-xl" : "text-4xl"}`}>
        {value}
      </div>
      <div className={`mt-1 text-xs font-black uppercase tracking-wide ${toneClass.label}`}>
        {label}
      </div>
    </div>
  );
}

function MiniInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 font-black text-neutral-900">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-neutral-50 p-5">
      <div className="text-sm font-bold text-neutral-500">{label}</div>
      <div className="mt-1 font-black text-neutral-950">{value}</div>
    </div>
  );
}
