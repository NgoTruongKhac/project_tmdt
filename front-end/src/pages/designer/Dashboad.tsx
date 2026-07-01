import { useEffect, useState } from "react";
import { getDashboardData, type DashboardData } from "@/api/designerApi";
import {
  Package,
  Layers,
  ShoppingBag,
  DollarSign,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await getDashboardData();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Không thể tải dữ liệu.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-base-content/60 font-medium">
          Đang tải dữ liệu tổng quan...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Tiêu đề & Nút làm mới */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-base-content/60">
            Theo dõi hiệu suất làm việc, doanh thu và quản lý các sản phẩm thiết
            kế của bạn.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="btn btn-outline btn-sm gap-2"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </button>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="alert alert-error shadow-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Grid thống kê số liệu (Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Tổng doanh thu
            </span>
            <div className="text-2xl font-bold text-primary">
              {(data?.totalRevenue || 0).toLocaleString("vi-VN")}đ
            </div>
            <p className="text-xs text-base-content/40">Từ đơn hàng hoàn tất</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Tổng đơn hàng
            </span>
            <div className="text-2xl font-bold">{data?.totalOrders || 0}</div>
            <p className="text-xs text-base-content/40">
              Tất cả các trạng thái
            </p>
          </div>
          <div className="p-3 bg-success/10 text-success rounded-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Sản phẩm thường */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Sản phẩm gốc
            </span>
            <div className="text-2xl font-bold">{data?.totalServices || 0}</div>
            <p className="text-xs text-base-content/40">Sản phẩm đơn lẻ</p>
          </div>
          <div className="p-3 bg-info/10 text-info rounded-xl">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Gói sản phẩm */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Gói dịch vụ
            </span>
            <div className="text-2xl font-bold">
              {data?.totalServicePackages || 0}
            </div>
            <p className="text-xs text-base-content/40">
              Gói combo / thiết kế riêng
            </p>
          </div>
          <div className="p-3 bg-warning/10 text-warning rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
