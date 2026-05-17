import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import AuthGoogle from "./pages/AuthGoogle";
import Profile from "./pages/Profile";
import { FavoriteProvider } from "./contexts/FavoriteContext";
import { RewardProvider } from "./contexts/RewardContext";
import { useToast } from "./hooks/useToast";
import { ToastContainer } from "./components/common/Toast";
import Rewards from "./pages/Rewards";
import AdminLayout from "./layouts/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminServices from "./pages/admin/AdminServices";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ServiceDetail from "./pages/ServiceDetail";
import Order from "./pages/Order";

function App() {
  const { checkAuthStatus } = useAuthStore();
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <FavoriteProvider>
      <RewardProvider>
        <Routes>
          <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/order" element={<Order />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth-google" element={<AuthGoogle />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<AdminServices />} />
          </Route>
        </Routes>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </RewardProvider>
    </FavoriteProvider>
  );
}

export default App;
