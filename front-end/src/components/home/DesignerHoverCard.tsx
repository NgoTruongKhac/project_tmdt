import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
    getDesignerServices,
    type DesignerService,
} from "@/api/designerApi";

interface Props {
    anchorRect: DOMRect | null;
    designerId: string;
    designerName: string;
    profilePicture?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export default function DesignerHoverCard({
                                              anchorRect,
                                              designerId,
                                              designerName,
                                              profilePicture,
                                              onMouseEnter,
                                              onMouseLeave,
                                          }: Props) {
    const [services, setServices] = useState<
        DesignerService[]
    >([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response =
                    await getDesignerServices(designerId);

                setServices(response.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        void fetchServices();
    }, [designerId]);

    if (!anchorRect) return null;

    const cardWidth = 288;
    const cardEstimatedHeight = 340;
    const viewportGap = 12;
    const left = Math.min(
        Math.max(
            anchorRect.left + anchorRect.width / 2 - cardWidth / 2,
            viewportGap
        ),
        window.innerWidth - cardWidth - viewportGap
    );
    const shouldShowAbove =
        anchorRect.bottom + cardEstimatedHeight + viewportGap >
            window.innerHeight &&
        anchorRect.top > cardEstimatedHeight;
    const top = shouldShowAbove
        ? Math.max(viewportGap, anchorRect.top - cardEstimatedHeight - 8)
        : anchorRect.bottom + 8;

    return createPortal(
        <div
            style={{ left, top, width: cardWidth }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="
      fixed z-[9999]
      rounded-2xl bg-white
      border border-neutral-200 p-3 shadow-2xl
    "
        >
            <div className="flex items-center gap-3">
                <img
                    src={
                        profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            designerName
                        )}`
                    }
                    alt={designerName}
                    className="w-12 h-12 rounded-full object-cover"
                />

                <div className="min-w-0">
                    <h3 className="truncate font-bold text-neutral-900">
                        {designerName}
                    </h3>

                    <p className="text-sm text-neutral-500">
                        Designer
                    </p>
                </div>
            </div>

            <Link
                to={`/designer/${designerId}`}
                className="mt-3 block rounded-xl bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
                Xem hồ sơ designer
            </Link>

            <div className="mb-3 mt-3 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900">
                    {services.length}
                </span>{" "}
                dịch vụ đang hiển thị
            </div>

            <div className="grid grid-cols-3 gap-2">
                {services.slice(0, 6).map((service) => (
                    <div
                        key={service._id}
                        className="aspect-square overflow-hidden rounded-xl bg-neutral-100"
                    >
                        <img
                            src={service.thumbnail}
                            alt={service.name}
                            className="h-full w-full object-cover transition hover:scale-110"
                        />
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-3 rounded-xl bg-neutral-100 px-3 py-6 text-center text-sm text-neutral-500">
                        Chưa có dịch vụ hiển thị.
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
