import { useState } from "react";
import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import {
    Briefcase,
    LayoutDashboard,
    LogOut,
    ShoppingCart,
    Users,
} from "lucide-react";

const menuItems = [
    {
        label: "Tổng quan",
        path: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Người dùng",
        path: "/admin/users",
        icon: Users,
    },
    {
        label: "Gói dịch vụ",
        path: "/admin/services",
        icon: Briefcase,
    },
    {
        label: "Đơn hàng",
        path: "/admin/orders",
        icon: ShoppingCart,
    },
];

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user, isAuthenticated, isLoading } = useAuthStore();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Đang kiểm tra quyền truy cập...</div>;
    }
    if (!isAuthenticated || user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    const isActive = (path: string) => {
        if (path === "/admin") {
            return location.pathname === "/admin";
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    }

    return (
        <div className="min-h-screen bg-gray-50 md:flex">
            <aside className="w-full bg-gray-900 text-white md:w-64 md:min-h-screen md:flex md:flex-col">
                <div className="border-b border-white/10 px-6 py-5">
                    <div className="text-lg font-semibold tracking-wide">Admin Panel</div>
                    <p className="mt-1 text-sm text-gray-400">Quản trị hệ thống</p>
                </div>

                <nav className="flex-1 px-3 py-4">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active
                                        ? "bg-white/10 text-white"
                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="border-t border-white/10 p-3">
                    <button
                        type="button"
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>

            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold text-gray-900">Xác nhận đăng xuất</h2>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                            Bạn có chắc chắn muốn thoát khỏi phiên làm việc này không?
                        </p>

                        <div className="mt-6 flex gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:flex-none"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    setIsLogoutModalOpen(false);
                                    navigate("/login");
                                }}
                                className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 sm:flex-none"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
