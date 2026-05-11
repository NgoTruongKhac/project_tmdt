import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import AuthGoogle from "./pages/AuthGoogle";
import { FavoriteProvider } from "./contexts/FavoriteContext";
import { useToast } from "./hooks/useToast";
import { ToastContainer } from "./components/common/Toast";
import AdminLayout from "./layouts/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminServices from "./pages/admin/AdminServices";
import ProductDetail from "./pages/ProductDetail";
import Order from "./pages/Order";;

function App() {
  const { checkAuthStatus } = useAuthStore();
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <FavoriteProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order" element={<Order />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-google" element={<AuthGoogle />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>Trang Tổng quan Admin</div>} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="services" element={<AdminServices />} />
        </Route>
      </Routes>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </FavoriteProvider>
  );
}

export default App;
