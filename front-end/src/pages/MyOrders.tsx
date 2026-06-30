import { useEffect, useMemo, useState } from "react";
import {
    cancelOrder,
    getMyOrders,
    type OrderItem,
} from "@/api/orderApi";

import {
    Clock3,
    Package,
    Search,
    Sparkles,
    X,
} from "lucide-react";

const STATUS_TABS = [
    "all",
    "pending",
    "processing",
    "completed",
    "cancelled",
];

const fallbackThumbnail =
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600";

export default function MyOrders() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [selectedOrder, setSelectedOrder] =
        useState<OrderItem | null>(null);

    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await getMyOrders(
                1,
                20,
                status
            );

            setOrders(response.data.orders);

            if (response.data.orders.length > 0) {
                setSelectedOrder(response.data.orders[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [status]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const packageName =
                order.package?.name || "Dịch vụ không còn hiển thị";

            return (
                packageName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                order.orderCode
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        });
    }, [orders, search]);

    const handleCancelOrder = async (
        orderId: string
    ) => {
        try {
            await cancelOrder(
                orderId,
                "Khách hàng yêu cầu hủy đơn"
            );

            const updatedOrders = orders.map((order) =>
                order.orderId === orderId
                    ? {
                        ...order,
                        status: "cancelled" as const,
                    }
                    : order
            );

            setOrders(updatedOrders);

            const updatedSelected = updatedOrders.find(
                (o) => o.orderId === orderId
            );

            if (updatedSelected) {
                setSelectedOrder(updatedSelected);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "processing":
                return "bg-blue-100 text-blue-700";

            case "completed":
                return "bg-emerald-100 text-emerald-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7ff] flex">
            {/* SIDEBAR */}

            <aside className="w-[250px] bg-white border-r border-gray-100 px-6 py-8 hidden lg:block">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">
                        AtelierMarket
                    </h1>

                    <p className="text-sm text-slate-400 mt-2">
                        Creative Dashboard
                    </p>
                </div>

                <div className="mt-14 space-y-3">
                    <button className="w-full bg-violet-100 text-violet-700 rounded-2xl py-4 px-5 font-semibold flex items-center gap-3">
                        <Package size={20} />
                        My Orders
                    </button>

                    <button className="w-full hover:bg-slate-100 rounded-2xl py-4 px-5 text-slate-600 flex items-center gap-3">
                        <Sparkles size={20} />
                        Services
                    </button>
                </div>

                <div className="mt-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 p-6 text-white">
                    <h3 className="font-bold text-xl">
                        Need Support?
                    </h3>

                    <p className="mt-3 text-sm text-violet-100">
                        Contact our creative support team for
                        assistance.
                    </p>

                    <button className="mt-5 w-full rounded-2xl bg-white text-violet-700 py-3 font-semibold">
                        Support Center
                    </button>
                </div>
            </aside>

            {/* CONTENT */}

            <main className="flex-1 flex">
                {/* LIST */}

                <div className="flex-1 p-8 xl:p-10">
                    {/* TOP */}

                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                        <div>
                            <h1 className="text-5xl font-black text-slate-800">
                                My Orders
                            </h1>

                            <p className="text-slate-500 mt-3">
                                Track and manage your design
                                services.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm w-full xl:w-[380px]">
                            <Search
                                className="text-slate-400"
                                size={20}
                            />

                            <input
                                placeholder="Search orders..."
                                className="outline-none w-full bg-transparent"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* FILTERS */}

                    <div className="flex gap-3 mt-10 overflow-x-auto pb-3">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatus(tab)}
                                className={`px-5 py-3 rounded-2xl font-semibold whitespace-nowrap transition ${
                                    status === tab
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                                        : "bg-white text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ORDERS */}

                    <div className="mt-10 space-y-5">
                        {loading && (
                            <div className="text-center py-20">
                                Loading...
                            </div>
                        )}

                        {!loading &&
                            filteredOrders.map((order) => (
                                <div
                                    key={order.orderId}
                                    onClick={() =>
                                        setSelectedOrder(order)
                                    }
                                    className="bg-white rounded-[28px] p-5 shadow-sm hover:shadow-xl transition cursor-pointer border border-transparent hover:border-violet-100"
                                >
                                    <div className="flex gap-5">
                                        <img
                                            src={order.package?.thumbnail || fallbackThumbnail}
                                            className="w-[170px] h-[120px] rounded-3xl object-cover"
                                        />

                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <div>
                                                    <div className="text-sm text-slate-400">
                                                        ORDER ID
                                                    </div>

                                                    <div className="font-bold text-xl mt-1">
                                                        {order.orderCode}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`px-4 py-2 rounded-full text-sm font-semibold h-fit ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold text-slate-800 mt-5">
                                                {order.package?.name || "Dịch vụ không còn hiển thị"}
                                            </h3>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={
                                                            order.designer?.profilePicture ||
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                order.designer?.fullName || "Designer"
                                                            )}&background=random&color=fff`
                                                        }
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />

                                                    <div>
                                                        <div className="font-semibold">
                                                            {
                                                                order.designer?.fullName || "Designer"
                                                            }
                                                        </div>

                                                        <div className="text-sm text-slate-400">
                                                            Designer
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-3xl font-black text-violet-600">
                                                    {order.totalAmount.toLocaleString()}
                                                    đ
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* DETAIL */}

                {selectedOrder && (
                    <div className="w-[430px] bg-white border-l border-slate-100 p-8 hidden xl:block">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black text-slate-800">
                                Order Details
                            </h2>

                            <button>
                                <X />
                            </button>
                        </div>

                        <img
                            src={selectedOrder.package?.thumbnail || fallbackThumbnail}
                            className="mt-8 rounded-[32px] w-full h-[240px] object-cover"
                        />

                        <div className="mt-8">
                            <div className="text-sm tracking-[3px] text-slate-400 uppercase">
                                Banner Service
                            </div>

                            <h3 className="text-3xl font-bold mt-3">
                                {selectedOrder.package?.name || "Dịch vụ không còn hiển thị"}
                            </h3>
                        </div>

                        <div className="mt-8 space-y-5">
                            <div className="flex justify-between">
                <span className="text-slate-500">
                  Designer
                </span>

                                <span className="font-semibold">
                  {
                      selectedOrder.designer?.fullName || "Designer"
                  }
                </span>
                            </div>

                            <div className="flex justify-between">
                <span className="text-slate-500">
                  Payment
                </span>

                                <span className="font-semibold">
                  {
                      selectedOrder.paymentStatus
                  }
                </span>
                            </div>

                            <div className="flex justify-between">
                <span className="text-slate-500">
                  Delivery
                </span>

                                <span className="font-semibold">
                  {
                      selectedOrder.package?.deliveryTime || 3
                  }{" "}
                                    days
                </span>
                            </div>
                        </div>

                        {/* TIMELINE */}

                        <div className="mt-10">
                            <div className="flex items-center gap-2">
                                <Clock3
                                    size={18}
                                    className="text-violet-600"
                                />

                                <h4 className="font-bold text-lg">
                                    Order Progress
                                </h4>
                            </div>

                            <div className="mt-6 space-y-5">
                                <div className="flex gap-4">
                                    <div className="w-4 h-4 rounded-full bg-violet-600 mt-1" />

                                    <div>
                                        <div className="font-semibold">
                                            Order Created
                                        </div>

                                        <div className="text-sm text-slate-400">
                                            {new Date(
                                                selectedOrder.createdAt
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-4 h-4 rounded-full bg-violet-300 mt-1" />

                                    <div>
                                        <div className="font-semibold">
                                            Payment Status
                                        </div>

                                        <div className="text-sm text-slate-400">
                                            {
                                                selectedOrder.paymentStatus
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-4 h-4 rounded-full bg-violet-200 mt-1" />

                                    <div>
                                        <div className="font-semibold">
                                            Current Status
                                        </div>

                                        <div className="text-sm text-slate-400">
                                            {selectedOrder.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BUTTON */}

                        {[
                            "pending",
                            "processing",
                        ].includes(selectedOrder.status) && (
                            <button
                                onClick={() =>
                                    handleCancelOrder(
                                        selectedOrder.orderId
                                    )
                                }
                                className="mt-10 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 transition text-white py-5 rounded-3xl font-bold text-lg"
                            >
                                Cancel Order
                            </button>
                        )}

                        {selectedOrder.status ===
                            "completed" && (
                                <button className="mt-10 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition text-white py-5 rounded-3xl font-bold text-lg">
                                    Download Files
                                </button>
                            )}
                    </div>
                )}
            </main>
        </div>
    );
}
