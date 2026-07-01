import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { X } from "lucide-react";

import {
    getDesignerServices,
    type DesignerService,
} from "@/api/designerApi";

interface Props {
    designerId: string;
    designerName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function DesignerServicesModal({
                                                  designerId,
                                                  designerName,
                                                  isOpen,
                                                  onClose,
                                              }: Props) {
    const [services, setServices] =
        useState<DesignerService[]>([]);

    const [loading, setLoading] =
        useState(false);

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);

            const response =
                await getDesignerServices(
                    designerId
                );

            setServices(response.data);
        } catch (error) {
            console.error(error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, [designerId]);

    useEffect(() => {
        if (isOpen && designerId) {
            void fetchServices();
        }
    }, [fetchServices, isOpen, designerId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-7xl h-[90vh] rounded-[40px] overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-black text-slate-800">
                            {designerName}
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Dịch vụ của designer
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                    >
                        <X />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-[#f5f7ff]">
                    {loading ? (
                        <div className="text-center py-20">
                            Đang tải...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7">
                            {services.map((service) => (
                                <div
                                    key={service._id}
                                    className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition"
                                >
                                    <Link
                                        to={`/package/${service._id}`}
                                        onClick={onClose}
                                        aria-label={`Xem chi tiết ${service.name}`}
                                        className="block overflow-hidden"
                                    >
                                        <img
                                            src={service.thumbnail}
                                            alt={service.name}
                                            className="w-full h-[240px] object-cover transition duration-500 hover:scale-105"
                                        />
                                    </Link>

                                    <div className="p-6">
                                        <div className="flex justify-between gap-3">
                                            <h3 className="font-black text-xl line-clamp-2">
                                                {service.name}
                                            </h3>

                                            <div className="text-violet-600 font-black">
                                                {(
                                                    service.discountPrice ??
                                                    service.price
                                                ).toLocaleString("vi-VN")}
                                                đ
                                            </div>
                                        </div>

                                        <p className="mt-4 text-slate-500 line-clamp-3">
                                            {service.description}
                                        </p>

                                        <div className="mt-6 flex justify-between">
                                            <div className="bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold">
                                                {service.category}
                                            </div>

                                            <div className="text-slate-400 text-sm">
                                                {service.deliveryTime ?? 3} ngày
                                            </div>
                                        </div>

                                        <Link
                                            to={`/package/${service._id}`}
                                            onClick={onClose}
                                            className="mt-7 block w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition text-center"
                                        >
                                            Xem dịch vụ
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {services.length === 0 && (
                                <div className="col-span-full text-center text-slate-500 py-20">
                                    Designer này chưa có dịch vụ nào.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
