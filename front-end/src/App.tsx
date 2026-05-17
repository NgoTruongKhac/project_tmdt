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
import { RewardProvider } from "./contexts/RewardContext";
import { useToast } from "./hooks/useToast";
import { ToastContainer } from "./components/common/Toast";
import Rewards from "./pages/Rewards";

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
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/rewards" element={<Rewards />} />
          </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-google" element={<AuthGoogle />} />
      </Routes>
      
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </RewardProvider>
    </FavoriteProvider>
  );
}

export default App;
