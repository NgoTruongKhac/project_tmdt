import { useEffect, useMemo, useState } from "react";
import { Check, Filter, Search, X, Eye, Loader } from "lucide-react";
import apiClient from "@/api/apiClient";
import { useToast } from "@/hooks/useToast";

type ServiceStatus = "pending" | "approved" | "rejected";

interface ServiceItem {
    _id: string;
    name?: string;
    title?: string;
    category?: string;
    price: number;
    thumbnail?: string;
    status?: string;
    images?: string[];
    description?: string;
    updatedAt?: string;
    rejectReason?: string;
    designer?: {
        _id?: string;
        fullName?: string;
        profilePicture?: string;
        bio?: string;
    };
}

const statusLabels: Record<ServiceStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
};

const statusBadgeClass: Record<ServiceStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
};

const normalizeStatus = (status?: string): ServiceStatus => {
    const value = (status || "pending").toLowerCase();
    if (value === "approved") return "approved";
    if (value === "rejected") return "rejected";
    return "pending";
};

const formatCurrency = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price || 0);

export default function AdminServices() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | ServiceStatus>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [detailService, setDetailService] = useState<ServiceItem | null>(null);
    const [detailImageIndex, setDetailImageIndex] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get("/admin/services");
                const payload = response.data?.data ?? response.data ?? [];

                const serviceList = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.services)
                        ? payload.services
                        : [];

                setServices(serviceList);
            } catch (error) {
                console.error("Error fetching admin services:", error);
                setServices([]);
                showToast("Không thể tải danh sách gói dịch vụ.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchServices();
    }, [showToast]);

    const filteredServices = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        const list = services.filter((service) => {
            const serviceName = (service.name || service.title || "").toLowerCase();
            const serviceStatus = normalizeStatus(service.status);

            const matchSearch = !keyword || serviceName.includes(keyword);
            const matchStatus = statusFilter === "all" || serviceStatus === statusFilter;

            return matchSearch && matchStatus;
        });

        const statusOrder: Record<ServiceStatus, number> = {
            pending: 0,
            approved: 1,
            rejected: 2,
        };

        return list.sort((a, b) => {
            const sa = normalizeStatus(a.status);
            const sb = normalizeStatus(b.status);

            if (statusOrder[sa] !== statusOrder[sb]) {
                return statusOrder[sa] - statusOrder[sb];
            }

            const dateA = new Date(a.updatedAt || (a as any).createdAt || 0).getTime();
            const dateB = new Date(b.updatedAt || (b as any).createdAt || 0).getTime();

            if (dateA !== dateB) return dateB - dateA; // newest first

            return (b.price || 0) - (a.price || 0); // price desc
        });
    }, [searchTerm, services, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredServices.length / 10));
    const ITEMS_PER_PAGE = 10;
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const updateServiceStatus = (serviceId: string, status: ServiceStatus) => {
        setServices((prev) =>
            prev.map((service) =>
                service._id === serviceId ? { ...service, status } : service,
            ),
        );
    };

    const handleApprove = async (serviceId: string): Promise<boolean> => {
        setActiveServiceId(serviceId);
        try {
            await apiClient.patch(`/admin/services/${serviceId}/status`, {
                status: "approved",
            });

            updateServiceStatus(serviceId, "approved");
            showToast("Duyệt gói dịch vụ thành công.", "success");
            return true;
        } catch (error) {
            console.error("Error approving service:", error);
            showToast("Không thể duyệt gói dịch vụ.", "error");
            return false;
        } finally {
            setActiveServiceId(null);
        }
    };

    const openRejectModal = (serviceId: string) => {
        setRejectTargetId(serviceId);
        setRejectReason("");
        setIsRejectModalOpen(true);
    };

    const handleReject = async (): Promise<boolean> => {
        if (!rejectTargetId) return false;

        const reason = rejectReason.trim();
        if (!reason) {
            showToast("Vui lòng nhập lý do từ chối.", "warning");
            return false;
        }

        setActiveServiceId(rejectTargetId);
        try {
            await apiClient.patch(`/admin/services/${rejectTargetId}/status`, {
                status: "rejected",
                rejectReason: reason,
            });

            updateServiceStatus(rejectTargetId, "rejected");
            setIsRejectModalOpen(false);
            setRejectReason("");
            setRejectTargetId(null);
            showToast("Đã từ chối gói dịch vụ.", "success");
            // close detail modal if it's showing the same service
            if (detailService?._id === rejectTargetId) setDetailService(null);
            return true;
        } catch (error) {
            console.error("Error rejecting service:", error);
            showToast("Không thể từ chối gói dịch vụ.", "error");
            return false;
        } finally {
            setActiveServiceId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý gói dịch vụ</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Duyệt hoặc từ chối các gói dịch vụ do designer gửi lên.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên gói"
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div className="relative w-full sm:w-52">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as "all" | ServiceStatus)}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-8 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Thông tin gói
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Designer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Giá tiền
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
                                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-500">
                                        Đang tải danh sách gói dịch vụ...
                                    </td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-500">
                                        Không có gói dịch vụ phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                paginatedServices.map((service) => {
                                    const status = normalizeStatus(service.status);
                                    const serviceName = service.name || service.title || "Chưa có tên";
                                    const isBusy = activeServiceId === service._id;

                                    return (
                                        <tr key={service._id} className="hover:bg-gray-50/80">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={service.thumbnail || `https://placehold.co/80x80?text=${encodeURIComponent(serviceName)}`}
                                                        alt={serviceName}
                                                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{serviceName}</div>
                                                        <div className="text-sm text-gray-500">{service.category || "Chưa phân loại"}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <img
                                                        src={
                                                            service.designer?.profilePicture ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                service.designer?.fullName || "Designer",
                                                            )}&background=random`
                                                        }
                                                        alt={service.designer?.fullName || "Designer"}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {service.designer?.fullName || "Không xác định"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(service.price)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass[status]}`}
                                                >
                                                    {statusLabels[status]}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {status === "pending" ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailService(service)}
                                                                className="inline-flex items-center justify-center rounded-lg bg-gray-50 p-2 text-gray-700 transition hover:bg-gray-100"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(service._id)}
                                                                disabled={isBusy}
                                                                className="inline-flex items-center justify-center rounded-lg bg-green-50 p-2 text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                                title="Duyệt"
                                                            >
                                                                {isBusy ? (
                                                                    <Loader className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openRejectModal(service._id)}
                                                                disabled={isBusy}
                                                                className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                                title="Từ chối"
                                                            >
                                                                {isBusy ? (
                                                                    <Loader className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            Đã xử lý
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredServices.length > 0 && (
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

            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                        <h2 className="text-lg font-semibold text-gray-900">Từ chối gói dịch vụ</h2>
                        <p className="mt-2 text-sm text-gray-600">Vui lòng nhập lý do từ chối trước khi xác nhận.</p>

                        <div className="mt-4">
                            <label htmlFor="rejectReason" className="mb-2 block text-sm font-medium text-gray-700">
                                Lý do từ chối
                            </label>
                            <textarea
                                id="rejectReason"
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div className="mt-6 flex gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRejectModalOpen(false);
                                    setRejectTargetId(null);
                                    setRejectReason("");
                                }}
                                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:flex-none"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={activeServiceId === rejectTargetId}
                                className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {detailService && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/50 p-4">
                    <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-xl font-semibold text-gray-900">{detailService.name || detailService.title}</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDetailService(null)}
                                    className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
                                    title="Đóng"
                                >
                                    <X className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <div className="w-full rounded-lg bg-gray-100">
                                    {detailService.images && detailService.images.length > 0 ? (
                                        <div className="flex flex-col">
                                            <div className="h-64 w-full overflow-hidden rounded-lg">
                                                <img
                                                    src={detailService.images[detailImageIndex]}
                                                    alt={detailService.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="mt-3 flex gap-2 overflow-x-auto">
                                                {detailService.images.map((src, idx) => (
                                                    <button
                                                        key={src + idx}
                                                        onClick={() => setDetailImageIndex(idx)}
                                                        className={`h-16 w-24 overflow-hidden rounded-md border ${detailImageIndex === idx ? 'ring-2 ring-primary-300' : 'border-gray-200'}`}
                                                    >
                                                        <img src={src} className="h-full w-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                                            Không có hình ảnh
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800">Mô tả</h3>
                                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{detailService.description || 'Không có mô tả'}</p>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-500">Danh mục</div>
                                        <div className="mt-1 font-medium text-gray-900">{detailService.category || 'Chưa phân loại'}</div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-sm text-gray-500">Giá</div>
                                        <div className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(detailService.price)}</div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-sm text-gray-500">Designer</div>
                                        <div className="mt-2 flex items-center gap-3">
                                            <img src={detailService.designer?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailService.designer?.fullName || 'Designer')}&background=random`} className="h-10 w-10 rounded-full object-cover" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{detailService.designer?.fullName || 'Không xác định'}</div>
                                                <div className="text-xs text-gray-500">{detailService.designer?.bio || ''}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <button
                                            onClick={async () => {
                                                if (!detailService) return;
                                                const ok = await handleApprove(detailService._id);
                                                if (ok) setDetailService(null);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                        >
                                            {activeServiceId === detailService._id ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Duyệt
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (!detailService) return;
                                                const id = detailService._id;
                                                setDetailService(null);
                                                openRejectModal(id);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                        >
                                            <X className="h-4 w-4" /> Từ chối
                                        </button>
                                    </div>

                                    {normalizeStatus(detailService.status) === 'rejected' && (
                                        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                            <div className="font-medium">Lý do đã từ chối</div>
                                            <div className="mt-1 text-sm text-red-700">{detailService.rejectReason || 'Không có'}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
