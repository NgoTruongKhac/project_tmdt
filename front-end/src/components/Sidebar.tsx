import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Briefcase } from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    path: "/designer-manage/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Quản lý đơn hàng",
    path: "/designer-manage/orders",
    icon: ClipboardList,
  },
  {
    label: "Quản lý dịch vụ",
    path: "/designer-manage/services",
    icon: Briefcase,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-soft border-r border-neutral-100 flex flex-col py-6 px-3">
      <nav className="flex flex-col gap-1">
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-600 hover:text-primary hover:bg-primary-50"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
