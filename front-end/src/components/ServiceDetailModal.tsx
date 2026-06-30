import { X, Eye, Star, ShoppingBag, Clock, RefreshCw, Tag } from "lucide-react";
import type { ServicePackage } from "@/api/serviceApi";

interface ServiceDetailModalProps {
  service: ServicePackage | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; badge: string }> = {
  approved: { label: "Đã duyệt", badge: "badge-success" },
  pending: { label: "Đang chờ duyệt", badge: "badge-warning" },
  rejected: { label: "Bị từ chối", badge: "badge-error" },
};

const listingTypeLabel: Record<string, string> = {
  hire: "Thuê designer",
  package: "Gói thiết kế",
  product: "Sản phẩm thiết kế",
};

export default function ServiceDetailModal({
  service,
  isOpen,
  onClose,
}: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  const status = statusConfig[(service as any).status] ?? {
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
          Chi tiết dịch vụ
        </h3>

        <div className="mt-4 flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg">
            <img
              src={service.thumbnail}
              alt={service.name}
              className="h-48 w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/uploads/default-thumbnail.png";
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${status.badge}`}>{status.label}</span>
            <span className="badge badge-outline">
              {listingTypeLabel[service.listingType] ?? service.listingType}
            </span>
            {service.isFeatured && (
              <span className="badge badge-info gap-1">
                <Star className="h-3 w-3" /> Nổi bật
              </span>
            )}
            {service.isBestSeller && (
              <span className="badge badge-secondary gap-1">
                <ShoppingBag className="h-3 w-3" /> Bán chạy
              </span>
            )}
          </div>

          <div>
            <h4 className="text-xl font-semibold">{service.name}</h4>
            <p className="mt-1 whitespace-pre-line text-sm text-base-content/70">
              {service.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-base-200 p-3">
              <p className="text-xs text-base-content/60">Giá</p>
              <p className="font-semibold text-primary">
                {service.price.toLocaleString("vi-VN")}đ
              </p>
              {service.discountPrice ? (
                <p className="text-xs text-base-content/50 line-through">
                  {service.discountPrice.toLocaleString("vi-VN")}đ
                </p>
              ) : null}
            </div>

            <div className="rounded-lg bg-base-200 p-3">
              <p className="flex items-center gap-1 text-xs text-base-content/60">
                <Tag className="h-3 w-3" /> Danh mục
              </p>
              <p className="font-semibold">{service.category}</p>
            </div>

            <div className="rounded-lg bg-base-200 p-3">
              <p className="flex items-center gap-1 text-xs text-base-content/60">
                <Clock className="h-3 w-3" /> Thời gian giao
              </p>
              <p className="font-semibold">{service.deliveryTime} ngày</p>
            </div>

            <div className="rounded-lg bg-base-200 p-3">
              <p className="flex items-center gap-1 text-xs text-base-content/60">
                <RefreshCw className="h-3 w-3" /> Số lần sửa
              </p>
              <p className="font-semibold">{service.revisions}</p>
            </div>

            <div className="rounded-lg bg-base-200 p-3">
              <p className="text-xs text-base-content/60">Đã bán</p>
              <p className="font-semibold">{service.soldCount}</p>
            </div>

            <div className="rounded-lg bg-base-200 p-3">
              <p className="text-xs text-base-content/60">Lượt xem</p>
              <p className="font-semibold">{service.views}</p>
            </div>
          </div>

          <p className="text-xs text-base-content/50">
            Tạo lúc: {new Date(service.createdAt).toLocaleString("vi-VN")} • Cập
            nhật: {new Date(service.updatedAt).toLocaleString("vi-VN")}
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
