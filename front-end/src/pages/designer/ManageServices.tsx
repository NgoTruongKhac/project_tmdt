import { useEffect, useState, useCallback } from "react";
import { Plus, Eye, Pencil, Trash2, PackageSearch } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore"; // điều chỉnh lại đường dẫn nếu store của bạn ở vị trí khác
import {
  getMyServicePackages,
  getServicePackageById,
  deleteServicePackage,
  type ServicePackage,
} from "../../api/serviceApi";
import ServiceDetailModal from "@/components/ServiceDetailModal";
import ServiceFormModal from "@/components/ServiceFormModal";
import ServiceModal from "@/components/ServiceModal";

const statusConfig: Record<string, { label: string; badge: string }> = {
  approved: { label: "Đã duyệt", badge: "badge-success" },
  pending: { label: "Đang chờ duyệt", badge: "badge-warning" },
  rejected: { label: "Bị từ chối", badge: "badge-error" },
};

const listingTypeLabel: Record<string, string> = {
  hire: "Thuê designer",
  package: "Gói thiết kế",
  product: "Sản phẩm",
};

const statusTabs = [
  { value: "all", label: "Tất cả" },
  { value: "approved", label: "Đã duyệt" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "rejected", label: "Bị từ chối" },
];

export default function ManageServices() {
  const { user } = useAuthStore(); // giả định useAuthStore trả về { user } với user._id là designerId
  const designerId = user?.userId;

  const [services, setServices] = useState<ServicePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedService, setSelectedService] = useState<ServicePackage | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ServicePackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!designerId) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await getMyServicePackages(
        designerId,
        page,
        10,
        statusFilter,
      );
      setServices(res.data.services);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      setError("Không thể tải danh sách dịch vụ, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  }, [designerId, page, statusFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleViewDetail = async (service: ServicePackage) => {
    try {
      const res = await getServicePackageById(service._id);
      setSelectedService(res.data);
    } catch {
      setSelectedService(service);
    }
    setIsDetailOpen(true);
  };

  const handleCreate = () => {
    setFormMode("create");
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleCreate2 = () => {
    setFormMode("create");
    setIsProductModalOpen(true);
  };

  const handleEdit = async (service: ServicePackage) => {
    try {
      const res = await getServicePackageById(service._id);
      setSelectedService(res.data);
    } catch {
      setSelectedService(service);
    }
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteServicePackage(deleteTarget._id);
      setDeleteTarget(null);
      fetchServices();
    } catch {
      setError("Xóa dịch vụ thất bại, vui lòng thử lại");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
          <p className="text-sm text-base-content/60">
            Quản lý các dịch vụ thiết kế bạn đang cung cấp trên nền tảng
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCreate2}
            className="btn btn-outline btn-primary gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo sản phẩm mới
          </button>
          <button onClick={handleCreate} className="btn btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Tạo gói dịch vụ mới
          </button>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-boxed w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            className={`tab ${statusFilter === tab.value ? "tab-active" : ""}`}
            onClick={() => {
              setStatusFilter(tab.value);
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
              <th>Dịch vụ</th>
              <th>Loại hình</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Đã bán</th>
              <th>Lượt xem</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <span className="loading loading-spinner loading-md" />
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-base-content/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <PackageSearch className="h-8 w-8" />
                    Chưa có dịch vụ nào
                  </div>
                </td>
              </tr>
            ) : (
              services.map((service) => {
                const status = statusConfig[(service as any).status] ?? {
                  label: "Không xác định",
                  badge: "badge-ghost",
                };
                return (
                  <tr key={service._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={service.thumbnail}
                          alt={service.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-base-content/50">
                            {service.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {listingTypeLabel[service.listingType] ??
                        service.listingType}
                    </td>
                    <td>
                      <span className="font-medium text-primary">
                        {service.price.toLocaleString("vi-VN")}đ
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${status.badge}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>{service.soldCount}</td>
                    <td>{service.views}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(service)}
                          className="btn btn-ghost btn-sm btn-square"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(service)}
                          className="btn btn-ghost btn-sm btn-square"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="btn btn-ghost btn-sm btn-square text-error"
                          title="Xóa dịch vụ"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <ServiceDetailModal
        service={selectedService}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {designerId && (
        <ServiceFormModal
          isOpen={isFormOpen}
          mode={formMode}
          designerId={designerId}
          service={formMode === "edit" ? selectedService : null}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchServices}
        />
      )}
      {designerId && (
        <ServiceModal
          isOpen={isProductModalOpen}
          mode={formMode}
          designerId={designerId}
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={fetchServices} // Tự động reload danh sách khi thêm mới thành công
        />
      )}

      {deleteTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Xác nhận xóa dịch vụ</h3>
            <p className="py-4 text-sm text-base-content/70">
              Bạn có chắc chắn muốn xóa dịch vụ{" "}
              <span className="font-semibold">{deleteTarget.name}</span>? Hành
              động này không thể hoàn tác.
            </p>
            <div className="modal-action">
              <button onClick={() => setDeleteTarget(null)} className="btn">
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-error"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Xóa
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteTarget(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
