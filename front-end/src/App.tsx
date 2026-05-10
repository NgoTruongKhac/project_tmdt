import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import AuthGoogle from "./pages/AuthGoogle";
import ProductDetail from "./pages/ProductDetail";
import Order from "./pages/Order";;

function App() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order" element={<Order />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-google" element={<AuthGoogle />} />
      </Routes>
    </>
  );
}

export default App;
