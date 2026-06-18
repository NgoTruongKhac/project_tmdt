import {Route, Routes} from "react-router-dom";
import {useEffect} from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import AuthGoogle from "./pages/AuthGoogle";

import MyOrders from "./pages/MyOrders";
import ServiceMarketplace from "./pages/ServiceMarketplace";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import AdminUsers from "./pages/admin/AdminUsers";
import AdminServices from "./pages/admin/AdminServices";

import {useAuthStore} from "./stores/useAuthStore";

import {FavoriteProvider} from "./contexts/FavoriteContext";
import {RewardProvider} from "./contexts/RewardContext";
import OrderHistory from "./pages/OrderHistory";

import {useToast} from "./hooks/useToast";
import {ToastContainer} from "./components/common/Toast";

function App() {
    const {checkAuthStatus} = useAuthStore();
    const {toasts, removeToast} = useToast();

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    return (
        <FavoriteProvider>
            <RewardProvider>
                <Routes>
                    {/* MAIN LAYOUT */}

                    <Route element={<MainLayout/>}>
                        <Route path="/" element={<Home/>}/>

                        <Route
                            path="/profile"
                            element={<Profile/>}
                        />

                        <Route
                            path="/favorites"
                            element={<Favorites/>}
                        />

                        <Route
                            path="/rewards"
                            element={<Rewards/>}
                        />

                        <Route
                            path="/my-orders"
                            element={<MyOrders/>}
                        />

                        <Route path="/orders" element={<OrderHistory/>}/>

                        <Route
                            path="/services-marketplace"
                            element={<ServiceMarketplace/>}
                        />
                    </Route>

                    {/* AUTH */}

                    <Route
                        path="/login"
                        element={<Login/>}
                    />

                    <Route
                        path="/register"
                        element={<Register/>}
                    />

                    <Route
                        path="/auth-google"
                        element={<AuthGoogle/>}
                    />

                    {/* ADMIN */}

                    <Route
                        path="/admin"
                        element={<AdminLayout/>}
                    >
                        <Route
                            index
                            element={<div>Trang Tổng quan Admin</div>}
                        />

                        <Route
                            path="users"
                            element={<AdminUsers/>}
                        />

                        <Route
                            path="services"
                            element={<AdminServices/>}
                        />
                    </Route>
                </Routes>

                {/* TOAST */}

                <ToastContainer
                    toasts={toasts}
                    onRemove={removeToast}
                />
            </RewardProvider>
        </FavoriteProvider>
    );
}

export default App;