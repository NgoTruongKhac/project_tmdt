import { useEffect, useState } from "react";
import { getAllServices } from "@/api/serviceApi";

import {
    Search,
    Sparkles,
    Star,
} from "lucide-react";

export default function ServiceMarketplace() {
    const [services, setServices] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response =
                await getAllServices(1, 20);

            setServices(response.data.services);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices =
        services.filter((service) =>
            service.name
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    return (
        <div className="min-h-screen bg-[#f4f7ff] px-8 py-10">
            {/* HEADER */}

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                <div>
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-violet-600" />

                        <span className="font-semibold text-violet-600">
              Creative Marketplace
            </span>
                    </div>

                    <h1 className="text-5xl font-black text-slate-800 mt-4">
                        Designer Services
                    </h1>
                </div>

                <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm w-full xl:w-[380px]">
                    <Search
                        className="text-slate-400"
                        size={20}
                    />

                    <input
                        placeholder="Search services..."
                        className="outline-none w-full"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>
            </div>

            {/* GRID */}

            {loading ? (
                <div className="text-center py-20">
                    Loading...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mt-12">
                    {filteredServices.map((service) => (
                        <div
                            key={service._id}
                            className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition group"
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={service.thumbnail}
                                    className="h-[260px] w-full object-cover group-hover:scale-105 transition duration-500"
                                />
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="font-black text-xl text-slate-800 line-clamp-2">
                                        {service.name}
                                    </h3>

                                    <div className="text-violet-600 font-black text-xl whitespace-nowrap">
                                        {service.price.toLocaleString()}
                                        đ
                                    </div>
                                </div>

                                <p className="text-slate-500 mt-4 line-clamp-3">
                                    {service.description}
                                </p>

                                <div className="mt-6 flex items-center justify-between">
                                    <div className="px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold">
                                        {service.category}
                                    </div>

                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star
                                            size={16}
                                            fill="currentColor"
                                        />

                                        <span className="font-semibold">
                      {service.soldCount}
                    </span>
                                    </div>
                                </div>

                                {service.designer && (
                                    <div className="mt-6 flex items-center gap-3">
                                        <img
                                            src={
                                                service.designer
                                                    .profilePicture
                                            }
                                            className="w-11 h-11 rounded-full object-cover"
                                        />

                                        <div>
                                            <div className="font-semibold">
                                                {
                                                    service.designer
                                                        .fullName
                                                }
                                            </div>

                                            <div className="text-sm text-slate-400">
                                                Designer
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button className="mt-7 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition">
                                    View Service
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}