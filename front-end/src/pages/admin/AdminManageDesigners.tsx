import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import { Search, ShieldBan, ShieldCheck, Briefcase, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface UserPopulated {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
    isActive: boolean;
    bio?: string;
}

interface DesignerProfile {
    _id: string;
    userId: UserPopulated;
    major: string;
    degree?: string;
    age?: number;
    experienceYears: number;
    portfolioUrl: string;
    skills: string[];
    status: string;
}

export default function AdminManageDesigners() {
    const [designers, setDesigners] = useState<DesignerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingId, setUpdatingUserId] = useState<string | null>(null);
    
    const [confirmModalData, setConfirmModalData] = useState<{ userId: string; currentStatus: boolean; designerName: string } | null>(null);
    const [detailDesigner, setDetailDesigner] = useState<DesignerProfile | null>(null);
    
    const { showToast } = useToast();

    useEffect(() => {
        const fetchApprovedDesigners = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get("/admin/designers");
                const allDesigners = response.data?.data || [];
                const approvedOnly = allDesigners.filter((d: DesignerProfile) => d.status === "approved" && d.userId);
                setDesigners(approvedOnly);
            } catch (error) {
                showToast("Lỗi tải danh sách Designer.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        void fetchApprovedDesigners();
    }, [showToast]);

    const filteredDesigners = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return designers;
        return designers.filter(d => 
            d.userId.fullName.toLowerCase().includes(keyword) || 
            d.userId.email.toLowerCase().includes(keyword) ||
            d.major?.toLowerCase().includes(keyword)
        );
    }, [searchTerm, designers]);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(filteredDesigners.length / ITEMS_PER_PAGE));
    const paginatedData = filteredDesigners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const executeToggleStatus = async () => {
        if (!confirmModalData) return;
        const { userId, currentStatus } = confirmModalData;
        setUpdatingUserId(userId);

        try {
            await apiClient.patch(`/admin/users/${userId}/status`);
            
            setDesigners(prev => prev.map(d => 
                d.userId._id === userId 
                    ? { ...d, userId: { ...d.userId, isActive: !currentStatus } } 
                    : d
            ));
            
            showToast(currentStatus ? "Đã đình chỉ Designer thành công." : "Đã khôi phục hoạt động cho Designer.", "success");
        } catch (error) {
            showToast("Thao tác thất bại.", "error");
        } finally {
            setUpdatingUserId(null);
            setConfirmModalData(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Designer</h1>
                    <p className="mt-1 text-sm text-gray-500">Giám sát hoạt động và xử lý vi phạm của các Designer trên hệ thống.</p>
                </div>
                <div className="relative w-full lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm tên, email hoặc chuyên môn..."
                        className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Designer</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Chuyên môn</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Tình trạng</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : paginatedData.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Không có Designer nào.</td></tr>
                        ) : paginatedData.map((d) => (
                            <tr key={d._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={d.userId.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.userId.fullName)}`} className="h-10 w-10 rounded-full object-cover" alt="" />
                                        <div>
                                            <div className="font-medium text-gray-900">{d.userId.fullName}</div>
                                            <div className="text-sm text-gray-500">{d.userId.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                        <Briefcase className="h-4 w-4 text-gray-400" /> {d.major || "Chưa cập nhật"}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">{d.experienceYears} năm kinh nghiệm</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${d.userId.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${d.userId.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                        {d.userId.isActive ? "Đang hoạt động" : "Bị đình chỉ"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <button
                                        onClick={() => setDetailDesigner(d)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Xem chi tiết</span>
                                    </button>

                                    <button
                                        onClick={() => setConfirmModalData({ userId: d.userId._id, currentStatus: d.userId.isActive, designerName: d.userId.fullName })}
                                        disabled={updatingId === d.userId._id}
                                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${d.userId.isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"} disabled:opacity-50`}
                                    >
                                        {d.userId.isActive ? <><ShieldBan className="h-4 w-4" /> Đình chỉ</> : <><ShieldCheck className="h-4 w-4" /> Khôi phục</>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="p-4 bg-gray-50 flex justify-between items-center border-t text-sm border-gray-200">
                    <span>Trang <b>{currentPage}</b> / {totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => p - 1)} 
                            disabled={currentPage === 1} 
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => p + 1)} 
                            disabled={currentPage === totalPages} 
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            {confirmModalData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                        <h2 className={`text-lg font-bold ${confirmModalData.currentStatus ? 'text-red-600' : 'text-green-600'}`}>
                            {confirmModalData.currentStatus ? "Đình chỉ Designer" : "Khôi phục hoạt động"}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {confirmModalData.currentStatus 
                                ? <>Bạn có chắc chắn muốn đình chỉ tài khoản của Designer <b>{confirmModalData.designerName}</b>? Họ sẽ không thể đăng nhập hoặc nhận thêm công việc mới.</>
                                : <>Bạn có muốn khôi phục quyền hoạt động cho Designer <b>{confirmModalData.designerName}</b>?</>
                            }
                        </p>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button onClick={() => setConfirmModalData(null)} className="px-4 py-2 bg-gray-100 rounded-xl font-medium">Hủy</button>
                            <button onClick={executeToggleStatus} className={`px-4 py-2 text-white rounded-xl font-medium ${confirmModalData.currentStatus ? 'bg-red-600' : 'bg-green-600'}`}>
                                Xác nhận {confirmModalData.currentStatus ? "Đình chỉ" : "Khôi phục"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                <div className="mt-1 text-sm font-medium text-gray-900">{detailDesigner.userId.fullName}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500">Email</div>
                                <div className="mt-1 text-sm font-medium text-gray-900">{detailDesigner.userId.email}</div>
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
                                    {detailDesigner.skills && detailDesigner.skills.length > 0 ? (
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
                                    {detailDesigner.userId.bio || "Không có mô tả."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}