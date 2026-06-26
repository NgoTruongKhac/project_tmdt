import { useEffect, useState } from "react";
import { Plus, Ticket, Trash2, Power, PowerOff, X, Pencil } from "lucide-react";
import apiClient from "@/api/apiClient";
import { useToast } from "@/hooks/useToast";

interface Voucher {
    _id: string;
    code: string;
    discountPercentage: number;
    maxUsage: number;
    usedCount: number;
    expiresAt: string;
    isActive: boolean;
}

export default function AdminVouchers() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { showToast } = useToast();

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<string | null>(null);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState<{ id: string, currentStatus: boolean } | null>(null);

    // Form state
    const [formData, setFormData] = useState({ code: "", discountPercentage: "", maxUsage: "", expiresAt: "" });

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(vouchers.length / ITEMS_PER_PAGE));
    const paginatedVouchers = vouchers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get("/admin/vouchers");
            setVouchers(res.data?.data || []);
        } catch {
            showToast("Lỗi tải danh sách Voucher", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void fetchVouchers(); }, []);

    // Format ngày giờ để hiển thị vào input type="datetime-local"
    const formatForInput = (dateStr: string) => {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ code: "", discountPercentage: "", maxUsage: "", expiresAt: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (voucher: Voucher) => {
        setEditingId(voucher._id);
        setFormData({
            code: voucher.code,
            discountPercentage: voucher.discountPercentage.toString(),
            maxUsage: voucher.maxUsage.toString(),
            expiresAt: formatForInput(voucher.expiresAt)
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiClient.put(`/admin/vouchers/${editingId}`, formData);
                showToast("Cập nhật Voucher thành công", "success");
            } else {
                await apiClient.post("/admin/vouchers", formData);
                showToast("Tạo mã Voucher thành công", "success");
            }
            setIsModalOpen(false);
            fetchVouchers();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Lỗi xử lý Voucher", "error");
        }
    };

    const handleToggleStatus = async () => {
        if (!isToggleModalOpen) return;
        try {
            await apiClient.patch(`/admin/vouchers/${isToggleModalOpen.id}/status`);
            setVouchers(prev => prev.map(v => v._id === isToggleModalOpen.id ? { ...v, isActive: !isToggleModalOpen.currentStatus } : v));
            showToast("Đã cập nhật trạng thái", "success");
        } catch {
            showToast("Lỗi cập nhật", "error");
        } finally {
            setIsToggleModalOpen(null);
        }
    };

    const handleDelete = async () => {
        if (!isDeleteModalOpen) return;
        try {
            await apiClient.delete(`/admin/vouchers/${isDeleteModalOpen}`);
            setVouchers(prev => prev.filter(v => v._id !== isDeleteModalOpen));
            showToast("Đã xóa Voucher", "success");
        } catch {
            showToast("Lỗi xóa Voucher", "error");
        } finally {
            setIsDeleteModalOpen(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr));
    };

    const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Voucher</h1>
                    <p className="text-sm text-gray-500">Tạo mã giảm giá và quản lý chiến dịch khuyến mãi.</p>
                </div>
                <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 transition">
                    <Plus className="w-5 h-5" /> Thêm Voucher
                </button>
            </div>

            {/* Sửa lại viền border-gray-200 cho bảng */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Mã / Giảm giá</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Lượt dùng</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Hạn sử dụng</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Đang tải...</td></tr>
                        ) : paginatedVouchers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Chưa có Voucher nào.</td></tr>
                        ) : paginatedVouchers.map(voucher => {
                            const expired = isExpired(voucher.expiresAt);
                            return (
                                <tr key={voucher._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-50 rounded-lg text-green-600"><Ticket className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-900 tracking-wider">{voucher.code}</div>
                                                <div className="text-sm font-medium text-green-600">Giảm {voucher.discountPercentage}%</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium">{voucher.usedCount} / {voucher.maxUsage}</div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min((voucher.usedCount / voucher.maxUsage) * 100, 100)}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {formatDate(voucher.expiresAt)}
                                        {expired && <div className="text-xs text-red-500 font-medium mt-1">Đã hết hạn</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${!voucher.isActive ? "bg-gray-100 text-gray-600" : expired || voucher.usedCount >= voucher.maxUsage ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                                            {!voucher.isActive ? "Đã tắt" : expired ? "Hết hạn" : voucher.usedCount >= voucher.maxUsage ? "Hết lượt" : "Hoạt động"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        {/* Nút Sửa */}
                                        <button onClick={() => handleOpenEdit(voucher)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Sửa">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setIsToggleModalOpen({ id: voucher._id, currentStatus: voucher.isActive })} className={`p-2 rounded-lg transition ${voucher.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`} title={voucher.isActive ? "Tắt Voucher" : "Bật Voucher"}>
                                            {voucher.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => setIsDeleteModalOpen(voucher._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Xóa">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-200 text-sm">
                    <span>Trang <b>{currentPage}</b> / {totalPages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 border border-gray-200 bg-white rounded-xl disabled:opacity-50">Trước</button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-200 bg-white rounded-xl disabled:opacity-50">Sau</button>
                    </div>
                </div>
            </div>

            {/* Modal Thêm / Sửa Voucher */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold">{editingId ? "Sửa Voucher" : "Thêm Voucher mới"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            {/* Thêm border-gray-200 cho input */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Mã Voucher (Code)</label>
                                <input required type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 uppercase outline-none focus:border-green-500" placeholder="VD: SUMMER20" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">% Giảm giá (1-100)</label>
                                <input required type="number" min="1" max="100" value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-green-500" placeholder="20" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Số lượt sử dụng tối đa</label>
                                <input required type="number" min="1" value={formData.maxUsage} onChange={e => setFormData({ ...formData, maxUsage: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-green-500" placeholder="100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Ngày hết hạn</label>
                                <input required type="datetime-local" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-green-500" />
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-6 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700">
                            {editingId ? "Lưu thay đổi" : "Tạo mã"}
                        </button>
                    </form>
                </div>
            )}

            {/* Modal Xác nhận Toggle */}
            {isToggleModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold">{isToggleModalOpen.currentStatus ? "Tạm ngưng Voucher" : "Kích hoạt Voucher"}</h2>
                        <p className="text-gray-600 mt-2">{isToggleModalOpen.currentStatus ? "Khách hàng sẽ không thể sử dụng mã này cho đến khi bạn bật lại. Bạn có chắc chắn?" : "Voucher này sẽ được kích hoạt để khách hàng có thể áp dụng. Bạn có chắc chắn?"}</p>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setIsToggleModalOpen(null)} className="px-4 py-2 bg-gray-100 rounded-xl font-medium text-gray-700">Hủy</button>
                            <button onClick={handleToggleStatus} className={`px-4 py-2 text-white rounded-xl font-medium ${isToggleModalOpen.currentStatus ? "bg-amber-500" : "bg-green-600"}`}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xác nhận Xóa */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-red-600">Xóa vĩnh viễn Voucher</h2>
                        <p className="text-gray-600 mt-2">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa mã giảm giá này khỏi hệ thống?</p>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setIsDeleteModalOpen(null)} className="px-4 py-2 bg-gray-100 rounded-xl font-medium text-gray-700">Hủy</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium">Xóa vĩnh viễn</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}