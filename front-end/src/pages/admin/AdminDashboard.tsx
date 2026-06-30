import { useEffect, useState } from "react";
import {
    AlertCircle,
    Briefcase,
    ShoppingCart,
    TrendingUp,
    Users,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import apiClient from "@/api/apiClient";

type DistributionItem = { name: string; value: number; };
type TopServiceItem = { name: string; soldCount: number; };

type DashboardResponse = {
    totalUsers: number;
    totalServices: number;
    pendingServices: number;
    totalSales: number;
    revenueByMonth: DistributionItem[];
    revenueByCategory: DistributionItem[];
    roleDistribution: DistributionItem[];
    categoryDistribution: DistributionItem[];
    topServices: TopServiceItem[];
};

type MetricCardProps = {
    title: string;
    value: number;
    icon: typeof Users;
    accentClassName: string;
    valueClassName: string;
    subtitle?: string;
    formatter?: (value: number) => string;
};

const COLORS = ["#3B82F6", "#8B5CF6", "#14B8A6", "#F59E0B", "#EC4899"];

const currencyFormatter = new Intl.NumberFormat("vi-VN");
const vndFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const formatNumber = (value?: number) => currencyFormatter.format(value ?? 0);
const formatCurrency = (value?: number) => vndFormatter.format(value ?? 0);

function MetricCard({ title, value, icon: Icon, accentClassName, valueClassName, subtitle, formatter = formatNumber }: MetricCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className={`mt-3 text-3xl font-bold tracking-tight ${valueClassName}`}>
                        {formatter(value)}
                    </div>
                    {subtitle ? <p className="mt-2 text-xs text-gray-400">{subtitle}</p> : null}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClassName}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function LoadingCard({ className = "h-80" }: { className?: string }) {
    return <div className={`animate-pulse rounded-xl border border-gray-200 bg-gray-100 ${className}`} />;
}

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get("/admin/dashboard");
                setDashboardData(response.data?.data || null);
            } catch (error) {
                console.error("Error fetching admin dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        void fetchDashboard();
    }, []);

    const revenueByMonth = dashboardData?.revenueByMonth || [];
    const revenueByCategory = dashboardData?.revenueByCategory || [];
    const categoryData = dashboardData?.categoryDistribution || [];
    const topServices = dashboardData?.topServices || [];
    const rawRoleData = dashboardData?.roleDistribution || [];

    // Xử lý gộp nhóm và Việt hóa Role
    const ROLE_MAP: Record<string, string> = {
        "ADMIN": "Quản trị viên",
        "DESIGNER": "Designer",
        "CUSTOMER": "Khách hàng"
    };

    const processedRoleData = Object.values(
        rawRoleData.reduce((acc, curr) => {
            const upperKey = (curr.name || "KHÁC").toUpperCase();
            const displayKey = ROLE_MAP[upperKey] || upperKey;

            if (!acc[displayKey]) {
                acc[displayKey] = { name: displayKey, value: 0 };
            }
            acc[displayKey].value += curr.value;
            return acc;
        }, {} as Record<string, DistributionItem>)
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
                <p className="text-sm text-gray-500">Theo dõi nhanh số liệu vận hành và hiệu suất dịch vụ.</p>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <LoadingCard key={index} className="h-32" />
                    ))}
                </div>
            ) : dashboardData ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title="Tổng người dùng" value={dashboardData.totalUsers} icon={Users} accentClassName="bg-blue-50 text-blue-600" valueClassName="text-blue-600" subtitle="Tài khoản đang hoạt động" />
                        <MetricCard title="Tổng dịch vụ" value={dashboardData.totalServices} icon={Briefcase} accentClassName="bg-violet-50 text-violet-600" valueClassName="text-violet-600" subtitle="Toàn bộ dịch vụ đã tạo" />
                        <MetricCard title="Dịch vụ chờ duyệt" value={dashboardData.pendingServices} icon={AlertCircle} accentClassName="bg-amber-50 text-amber-600" valueClassName="text-amber-600" subtitle="Cần quản trị viên xử lý ngay" />
                        <MetricCard title="Tổng doanh thu" value={dashboardData.totalSales} icon={ShoppingCart} accentClassName="bg-emerald-50 text-emerald-600" valueClassName="text-emerald-600" subtitle="Doanh thu đơn hàng thành công" formatter={formatCurrency} />
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo thời gian</h2>
                            <div className="h-[20rem]">
                                {revenueByMonth.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueByMonth}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                                            <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), "Doanh thu"]} />
                                            <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#10B981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex h-full items-center justify-center text-gray-500">Chưa có dữ liệu</div>}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tỷ trọng doanh thu theo danh mục</h2>
                            <div className="h-[20rem]">
                                {revenueByCategory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4}>
                                                {revenueByCategory.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), "Doanh thu"]} />
                                            <Legend wrapperStyle={{ borderRadius: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex h-full items-center justify-center text-gray-500">Chưa có dữ liệu</div>}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ vai trò người dùng</h2>
                            <div className="h-[20rem]">
                                {processedRoleData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={processedRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4}>
                                                {processedRoleData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Tài khoản"]} />
                                            <Legend wrapperStyle={{ borderRadius: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex h-full items-center justify-center text-gray-500">Chưa có dữ liệu</div>}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố dịch vụ theo danh mục</h2>
                            <div className="h-[20rem]">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} className="capitalize" />
                                            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                                            <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Dịch vụ"]} />
                                            <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#8B5CF6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex h-full items-center justify-center text-gray-500">Chưa có dữ liệu</div>}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Top 5 dịch vụ bán chạy nhất</h2>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <TrendingUp className="h-4 w-4" /> Top performance
                            </div>
                        </div>
                        <div className="h-[24rem]">
                            {topServices.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topServices} layout="vertical" margin={{ top: 8, right: 24, left: 20, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                        <YAxis type="category" dataKey="name" width={180} tick={{ fill: "#374151", fontSize: 12 }} />
                                        <Tooltip formatter={(value: any) => [formatNumber(Number(value)), "Đã bán"]} />
                                        <Bar dataKey="soldCount" radius={[0, 10, 10, 0]} fill="#14B8A6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <div className="flex h-full items-center justify-center text-gray-500">Chưa có dữ liệu</div>}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}