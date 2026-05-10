import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import AuthGoogle from "./pages/AuthGoogle";
import Profile from "./pages/profile";

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
