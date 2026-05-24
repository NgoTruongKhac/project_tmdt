import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import AuthGoogle from "./pages/AuthGoogle";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  return (
    <>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-google" element={<AuthGoogle />} />
      </Routes>
    </>
  );
}

export default App;
