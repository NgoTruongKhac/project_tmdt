import { Bell, User, LogOut, Heart } from "lucide-react";
import logo_full from "@/assets/logo/logo_full.png";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFavorite } from "@/contexts/FavoriteContext";

export default function Navbar() {
  // Lấy thông tin user từ Zustand store
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();
  const { favoriteCount, favoriteItems } = useFavorite();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleLogoClick = () => {
    // Reload trang để reset tất cả state về trang chủ gốc
    window.location.href = '/';
  };

  return (
    <div className="navbar bg-white shadow-soft px-4 sm:px-6 py-3 sticky top-0 z-50">
      {/* 1. Phần Logo (Bên trái) */}
      <div className="navbar-start">
        <button
          onClick={handleLogoClick}
          className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
        >
          <img
            src={logo_full}
            alt="logo full"
            className="h-12 w-auto object-contain sm:h-14"
          />
        </button>
      </div>

      {/* 3. Phần Icons và Nút xác thực (Bên phải) */}
      <div className="navbar-end flex items-center gap-1 sm:gap-2">

        {/* Icon Bell hiển thị khi đã đăng nhập (Giữ nguyên, tự động hoạt động trên cả mobile và desktop) */}
        {user && (
          <>
            <button
              className="btn btn-ghost btn-circle text-neutral-600 hover:text-primary hover:bg-primary-50 transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Icon Heart - Favorites */}
            <Link
              to="/favorites"
              className="btn btn-ghost btn-circle text-neutral-600 hover:text-red-500 hover:bg-red-50 transition-colors relative"
              title="Yêu thích"
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && favoriteItems.size > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {favoriteCount > 99 ? "99+" : favoriteCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* --- CẬP NHẬT: Xử lý Avatar và Menu Đăng nhập/Đăng ký --- */}
        {user ? (
          <div className="ml-2 dropdown dropdown-end">
            {/* Avatar trigger */}
            <div tabIndex={0} role="button" className="cursor-pointer">
              <div className="avatar hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary-300 shadow-sm">
                  <img
                    src={
                      user.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`
                    }
                    alt="User Avatar"
                  />
                </div>
              </div>
            </div>

            {/* Dropdown content */}
            <div
              tabIndex={0}
              className="dropdown-content mt-3 w-50 z-[100]
               bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="avatar flex-shrink-0">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={
                          user.profilePicture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.username,
                          )}&background=random`
                        }
                        alt="Avatar"
                      />
                    </div>
                  </div>

                  {/* text */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="font-semibold text-neutral-800 text-sm truncate">
                      {user.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <ul className="menu p-2 w-full">
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-neutral-700
                     hover:text-primary hover:bg-primary-50
                     font-medium rounded-lg px-3 py-2"
                  >
                    <User className="w-4 h-4" />
                    Hồ sơ
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left
                     text-red-500 hover:text-red-600 hover:bg-red-50
                     font-medium rounded-lg px-3 py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Giao diện Desktop (Màn hình sm trở lên): Giữ nguyên UI cũ */}
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Link to={"/login"}>
                <button className="btn btn-ghost text-neutral-700 hover:text-primary hover:bg-primary-50 font-medium rounded-xl">
                  Đăng nhập
                </button>
              </Link>

              <Link to={"/register"}>
                <button className="btn bg-primary-500 text-white border-none hover:bg-primary-600 shadow-sm font-medium rounded-xl">
                  Đăng ký
                </button>
              </Link>
            </div>

            {/* Giao diện Mobile (Nhỏ hơn sm): Icon User mở dropdown */}
            <div className="dropdown dropdown-end sm:hidden ml-1">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle text-neutral-600 hover:text-primary hover:bg-primary-50"
              >
                <User className="w-5 h-5" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-soft bg-white rounded-box w-48 mt-4 z-[1]"
              >
                <li>
                  <Link
                    to={"/login"}
                    className="text-neutral-700 hover:text-primary hover:bg-primary-50 font-medium"
                  >
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/register"}
                    className="text-primary hover:bg-primary-50 font-medium mt-1"
                  >
                    Đăng ký
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
