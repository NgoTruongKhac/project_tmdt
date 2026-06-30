import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import AuthGoogle from "./pages/AuthGoogle";
import MyOrders from "./pages/MyOrders";
import OrderHistory from "./pages/OrderHistory";
import ServiceMarketplace from "./pages/ServiceMarketplace";
import ServiceDetail from "./pages/ServiceDetail";
import Order from "./pages/Order";
import DesignerServices from "./pages/DesignerServices";
import DesignerProfile from "./pages/DesignerProfile";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminServices from "./pages/admin/AdminServices";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDesigners from "./pages/admin/AdminDesigners";

import { FavoriteProvider } from "./contexts/FavoriteContext";
import { RewardProvider } from "./contexts/RewardContext";
import { ToastContainer } from "./components/common/Toast";
import { useToast } from "./hooks/useToast";
import { useAuthStore } from "./stores/useAuthStore";
import AdminVouchers from "./pages/admin/AdminVouchers";
import AdminManageDesigners from "./pages/admin/AdminManageDesigners";
import DesignerLayout from "./layouts/DesignerLayout";
import ManageOrders from "./pages/designer/ManageOrders";
import Dashboad from "./pages/designer/Dashboad";
import ManageServices from "./pages/designer/ManageServices";

function App() {
  const { checkAuthStatus } = useAuthStore();
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <FavoriteProvider>
      <RewardProvider>
        <Toaster
          position="bottom-center"
          reverseOrder={false}
          toastOptions={{ duration: 3000 }}
        />

        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route
              path="/services-marketplace"
              element={<ServiceMarketplace />}
            />
            <Route path="/designer/:designerId" element={<DesignerProfile />} />
            <Route
              path="/designer/:designerId/services"
              element={<DesignerServices />}
            />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/order" element={<Order />} />
          </Route>
          <Route path="/designer-manage" element={<DesignerLayout />}>
            <Route path="dashboard" element={<Dashboad />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="orders" element={<ManageOrders />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth-google" element={<AuthGoogle />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="vouchers" element={<AdminVouchers />} />
            <Route path="designers" element={<AdminDesigners />} />
            <Route path="manage-designers" element={<AdminManageDesigners />} />
          </Route>
        </Routes>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </RewardProvider>
    </FavoriteProvider>
  );
}

export default App;
