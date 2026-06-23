import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import { Lock, Search, Unlock } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: "admin" | "designer" | "customer" | string;
    isActive: boolean;
    createdAt?: string;
    profilePicture?: string;
}

const roleStyles: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    designer: "bg-blue-100 text-blue-700",
    customer: "bg-gray-100 text-gray-700",
};

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get("/admin/users");
                const data = response.data?.data ?? response.data ?? [];
                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching users:", error);
                setUsers([]);
                showToast("Không thể tải danh sách người dùng.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchUsers();
    }, [showToast]);

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return users;

        return users.filter((user) => {
            const fullName = user.fullName?.toLowerCase() ?? "";
            const email = user.email?.toLowerCase() ?? "";
            return fullName.includes(keyword) || email.includes(keyword);
        });
    }, [searchTerm, users]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const formatDate = (value?: string) => {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    };

    const getAvatarUrl = (user: User) => {
        if (user.profilePicture) return user.profilePicture;

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.fullName || "User",
        )}&background=random`;
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        setUpdatingUserId(userId);

        try {
            await apiClient.patch(`/admin/users/${userId}/status`, {
                isActive: !currentStatus
            });

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, isActive: !currentStatus } : user,
                ),
            );

            showToast(
                currentStatus ? "Đã khóa người dùng thành công." : "Đã mở khóa người dùng thành công.",
                "success",
            );
        } catch (error) {
            console.error("Error updating user status:", error);
            showToast("Cập nhật trạng thái người dùng thất bại.", "error");
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Xem danh sách tài khoản và quản lý trạng thái hoạt động.
                    </p>
                </div>

                <div className="relative w-full lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên hoặc email"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
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
                                    Vai trò
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Ngày tham gia
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
                                        Đang tải danh sách người dùng...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-500">
                                        Không tìm thấy người dùng phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => {
                                    const roleKey = (user.role || "customer").toLowerCase();
                                    const isBusy = updatingUserId === user._id;

                                    return (
                                        <tr key={user._id} className="hover:bg-gray-50/80">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getAvatarUrl(user)}
                                                        alt={user.fullName}
                                                        className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.fullName}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleStyles[roleKey] ?? "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {roleKey}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"
                                                            }`}
                                                    />
                                                    <span>{user.isActive ? "Hoạt động" : "Bị khóa"}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {formatDate(user.createdAt)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                    disabled={isBusy}
                                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${user.isActive
                                                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                                                        : "bg-green-50 text-green-700 hover:bg-green-100"
                                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                                >
                                                    {user.isActive ? (
                                                        <Lock className="h-4 w-4" />
                                                    ) : (
                                                        <Unlock className="h-4 w-4" />
                                                    )}
                                                    <span>{user.isActive ? "Khóa" : "Mở khóa"}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredUsers.length > 0 && (
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
