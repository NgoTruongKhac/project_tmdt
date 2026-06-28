import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Loader2, UserCheck, X } from "lucide-react";
import apiClient from "@/api/apiClient";
import { useToast } from "@/hooks/useToast";

type DesignerStatus = "pending" | "approved" | "rejected";

interface DesignerApplication {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
    age?: number;
    degree?: string;
    major?: string;
    experienceYears?: number;
    portfolioUrl?: string;
    skills: string[];
    bio?: string;
    status: DesignerStatus;
    rejectReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

const statusLabelMap: Record<DesignerStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
};

const statusBadgeMap: Record<DesignerStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
};

const ITEMS_PER_PAGE = 10;

const normalizeStatus = (value?: string): DesignerStatus => {
    const normalized = (value || "pending").toLowerCase();
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";
    return "pending";
};

const normalizeApplication = (item: any): DesignerApplication => {
    const profile = item?.userId || item?.user || item?.account || item?.designer || {}; 
    
    const fullName =
        profile?.fullName || 
        item?.fullName ||
        item?.name ||
        profile?.name ||
        "Không xác định";

    const email = profile?.email || item?.email || "-";

    const skills = Array.isArray(item?.skills)
        ? item.skills
        : typeof item?.skills === "string"
            ? item.skills
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [];

    return {
        _id: item?._id || item?.id || "",
        fullName,
        email,
        profilePicture: profile?.profilePicture || item?.profilePicture,
        age: typeof item?.age === "number" ? item.age : undefined,
        degree: item?.degree || "",
        major: item?.major || "",
        experienceYears:
            typeof item?.experienceYears === "number"
                ? item.experienceYears
                : typeof item?.experience === "number"
                    ? item.experience
                    : undefined,
        portfolioUrl: item?.portfolioUrl || item?.portfolio || "",
        skills,
        bio: profile?.bio || item?.bio || "", 
        status: normalizeStatus(item?.status),
        rejectReason: item?.rejectReason || "",
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
    };
};

export default function AdminDesigners() {
    const [designers, setDesigners] = useState<DesignerApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeDesignerId, setActiveDesignerId] = useState<string | null>(null);

    const [detailDesigner, setDetailDesigner] = useState<DesignerApplication | null>(null);
    const [approveTarget, setApproveTarget] = useState<DesignerApplication | null>(null);
    const [rejectTarget, setRejectTarget] = useState<DesignerApplication | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const { showToast } = useToast();

    const fetchDesignerApplications = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get("/admin/designers");
            const payload = response.data?.data ?? response.data ?? [];
            const sourceList: any[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.designers)
                    ? payload.designers
                    : [];

            const normalizedList: DesignerApplication[] = sourceList
                .map(normalizeApplication)
                .filter((item: DesignerApplication) => Boolean(item._id));

            const statusOrder: Record<DesignerStatus, number> = {
                pending: 0,
                approved: 1,
                rejected: 2,
            };

            normalizedList.sort((a: DesignerApplication, b: DesignerApplication) => {
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }

                const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            setDesigners(normalizedList);
        } catch (error) {
            console.error("Error fetching designer applications:", error);
            setDesigners([]);
            showToast("Không thể tải danh sách duyệt designer.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchDesignerApplications();
    }, []);

    const totalPages = Math.max(1, Math.ceil(designers.length / ITEMS_PER_PAGE));

    const paginatedDesigners = useMemo(
        () =>
            designers.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE,
            ),
        [designers, currentPage],
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const getAvatar = (designer: DesignerApplication) => {
        if (designer.profilePicture) return designer.profilePicture;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(designer.fullName || "Designer")}&background=random`;
    };

    const updateDesignerStatus = (designerId: string, status: DesignerStatus, reason?: string) => {
        setDesigners((prev) =>
            prev.map((designer) =>
                designer._id === designerId
                    ? {
                        ...designer,
                        status,
                        rejectReason: status === "rejected" ? reason || "" : "",
                    }
                    : designer,
            ),
        );
    };

    const handleApprove = async () => {
        if (!approveTarget) return;

        setActiveDesignerId(approveTarget._id);
        try {
            await apiClient.patch(`/admin/designers/${approveTarget._id}/status`, {
                status: "approved",
            });

            updateDesignerStatus(approveTarget._id, "approved");
            showToast("Đã duyệt hồ sơ designer thành công.", "success");

            if (detailDesigner?._id === approveTarget._id) {
                setDetailDesigner({
                    ...detailDesigner,
                    status: "approved",
                    rejectReason: "",
                });
            }

            setApproveTarget(null);
        } catch (error) {
            console.error("Error approving designer application:", error);
            showToast("Không thể duyệt hồ sơ designer.", "error");
        } finally {
            setActiveDesignerId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectTarget) return;

        const reason = rejectReason.trim();
        if (!reason) {
            showToast("Vui lòng nhập lý do từ chối.", "warning");
            return;
        }

        setActiveDesignerId(rejectTarget._id);
        try {
            await apiClient.patch(`/admin/designers/${rejectTarget._id}/status`, {
                status: "rejected",
                rejectReason: reason,
            });

            updateDesignerStatus(rejectTarget._id, "rejected", reason);
            showToast("Đã từ chối hồ sơ designer.", "success");

            if (detailDesigner?._id === rejectTarget._id) {
                setDetailDesigner({
                    ...detailDesigner,
                    status: "rejected",
                    rejectReason: reason,
                });
            }

            setRejectTarget(null);
            setRejectReason("");
        } catch (error) {
            console.error("Error rejecting designer application:", error);
            showToast("Không thể từ chối hồ sơ designer.", "error");
        } finally {
            setActiveDesignerId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Duyệt Designer</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Xem và xử lý các hồ sơ chuyển vai trò designer.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Thông tin
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Kỹ năng / Bằng cấp
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Kinh nghiệm
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
                                        Đang tải danh sách hồ sơ designer...
                                    </td>
                                </tr>
                            ) : designers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-500">
                                        Chưa có hồ sơ designer cần xử lý.
                                    </td>
                                </tr>
                            ) : (
                                paginatedDesigners.map((designer) => {
                                    const isBusy = activeDesignerId === designer._id;

                                    return (
                                        <tr key={designer._id} className="hover:bg-gray-50/80">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getAvatar(designer)}
                                                        alt={designer.fullName}
                                                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{designer.fullName}</div>
                                                        <div className="text-sm text-gray-500">{designer.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {designer.degree || "Chưa cập nhật bằng cấp"}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {designer.skills.length > 0 ? (
                                                            designer.skills.slice(0, 3).map((skill) => (
                                                                <span
                                                                    key={skill}
                                                                    className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Không có kỹ năng</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {typeof designer.experienceYears === "number"
                                                        ? `${designer.experienceYears} năm`
                                                        : "Chưa cập nhật"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeMap[designer.status]}`}
                                                >
                                                    {statusLabelMap[designer.status]}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailDesigner(designer)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span>Xem chi tiết</span>
                                                    </button>

                                                    {designer.status === "pending" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setApproveTarget(designer)}
                                                                disabled={isBusy}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                                <span>Duyệt</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setRejectTarget(designer);
                                                                    setRejectReason("");
                                                                }}
                                                                disabled={isBusy}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <X className="h-4 w-4" />
                                                                <span>Từ chối</span>
                                                            </button>
                                                        </>
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

                {!isLoading && designers.length > 0 && (
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

            {detailDesigner && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Chi tiết hồ sơ Designer</h2>
                                <p className="mt-1 text-sm text-gray-500">Thông tin nộp hồ sơ chuyển vai trò designer.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailDesigner(null)}
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Họ tên</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{detailDesigner.fullName}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Email</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{detailDesigner.email}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Tuổi</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{detailDesigner.age ?? "Chưa cập nhật"}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Kinh nghiệm</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">
                                    {typeof detailDesigner.experienceYears === "number"
                                        ? `${detailDesigner.experienceYears} năm`
                                        : "Chưa cập nhật"}
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Bằng cấp</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{detailDesigner.degree || "Chưa cập nhật"}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Chuyên ngành</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{detailDesigner.major || "Chưa cập nhật"}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Link Portfolio</div>
                                {detailDesigner.portfolioUrl ? (
                                    <a
                                        href={detailDesigner.portfolioUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 inline-block break-all text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        {detailDesigner.portfolioUrl}
                                    </a>
                                ) : (
                                    <div className="mt-1 text-sm font-medium text-gray-900">Chưa cập nhật</div>
                                )}
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Kỹ năng</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {detailDesigner.skills.length > 0 ? (
                                        detailDesigner.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">Không có dữ liệu kỹ năng</span>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Giới thiệu</div>
                                <div className="mt-1 whitespace-pre-line text-sm text-gray-700">
                                    {detailDesigner.bio || "Không có mô tả."}
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Trạng thái hồ sơ</div>
                                <div className="mt-2 flex items-center gap-3">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeMap[detailDesigner.status]}`}>
                                        {statusLabelMap[detailDesigner.status]}
                                    </span>
                                    {detailDesigner.status === "rejected" && detailDesigner.rejectReason && (
                                        <span className="text-sm text-red-600">Lý do: {detailDesigner.rejectReason}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {approveTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-green-100 p-2 text-green-700">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Xác nhận duyệt hồ sơ</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Bạn có chắc chắn muốn duyệt hồ sơ của <span className="font-medium">{approveTarget.fullName}</span>?
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setApproveTarget(null)}
                                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:flex-none"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleApprove}
                                disabled={activeDesignerId === approveTarget._id}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                            >
                                {activeDesignerId === approveTarget._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                <span>Duyệt</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rejectTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900">Từ chối hồ sơ designer</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Nhập lý do từ chối cho hồ sơ của <span className="font-medium">{rejectTarget.fullName}</span>.
                        </p>

                        <div className="mt-4">
                            <label htmlFor="rejectReason" className="mb-2 block text-sm font-medium text-gray-700">
                                Lý do từ chối
                            </label>
                            <textarea
                                id="rejectReason"
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Ví dụ: Hồ sơ chưa đủ thông tin portfolio, vui lòng bổ sung..."
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            />
                        </div>

                        <div className="mt-6 flex gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectTarget(null);
                                    setRejectReason("");
                                }}
                                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:flex-none"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={activeDesignerId === rejectTarget._id}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                            >
                                {activeDesignerId === rejectTarget._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                                <span>Từ chối</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
