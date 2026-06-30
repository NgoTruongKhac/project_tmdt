import type { ServicePackage } from "@/api/serviceApi";
import { formatCurrency } from "@/utils/format";
import { Link } from "react-router-dom";

import {
    Eye,
    ShoppingCart,
} from "lucide-react";

import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/hooks/useToast";
import DesignerHoverCard from "@/components/home/DesignerHoverCard";

import { useEffect, useRef, useState } from "react";

interface ServiceCardProps {
    service: ServicePackage;
    variant?: "default" | "featured" | "compact";
    showBadge?: boolean;
    badgeType?: "bestseller" | "new" | "featured";
}

export default function ServiceCard({
                                        service,
                                        variant = "default",
                                        showBadge = false,
                                        badgeType = "bestseller",
                                    }: ServiceCardProps) {
    const { showToast } = useToast();

    const [showDesignerCard, setShowDesignerCard] =
        useState(false);
    const [designerAnchorRect, setDesignerAnchorRect] =
        useState<DOMRect | null>(null);
    const designerAnchorRef = useRef<HTMLDivElement | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateDesignerAnchorRect = () => {
        setDesignerAnchorRect(
            designerAnchorRef.current?.getBoundingClientRect() ?? null
        );
    };

    const openDesignerCard = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        updateDesignerAnchorRect();
        setShowDesignerCard(true);
    };

    const closeDesignerCard = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setShowDesignerCard(false);
        }, 180);
    };

    useEffect(() => {
        if (!showDesignerCard) return;

        const handleViewportChange = () => updateDesignerAnchorRect();

        window.addEventListener("scroll", handleViewportChange, true);
        window.addEventListener("resize", handleViewportChange);

        return () => {
            window.removeEventListener("scroll", handleViewportChange, true);
            window.removeEventListener("resize", handleViewportChange);
        };
    }, [showDesignerCard]);

    const getBadgeContent = () => {
        switch (badgeType) {
            case "bestseller":
                return {
                    text: "Bán chạy",
                    className: "bg-red-500 text-white",
                };

            case "new":
                return {
                    text: "Mới",
                    className: "bg-green-500 text-white",
                };

            case "featured":
                return {
                    text: "Nổi bật",
                    className: "bg-primary-500 text-white",
                };

            default:
                return null;
        }
    };

    const badgeContent = getBadgeContent();
    const views = service.views ?? 0;
    const detailUrl =
        service.sourceType === "service"
            ? `/service/${service._id}?type=service`
            : null;

    return (
        <div
            className="
      group relative overflow-hidden
      rounded-3xl bg-neutral-100
      cursor-pointer
      break-inside-avoid mb-6
    "
        >
            {/* BADGE */}
            {showBadge && badgeContent && (
                <div
                    className={`
            absolute top-4 left-4 z-30
            px-3 py-1 rounded-full
            text-xs font-medium
            ${badgeContent.className}
          `}
                >
                    {badgeContent.text}
                </div>
            )}

            {/* IMAGE */}
            {detailUrl ? (
                <Link
                    to={detailUrl}
                    aria-label={`Xem chi tiết ${service.name}`}
                    className={`
        block overflow-hidden

        ${
                    variant === "compact"
                        ? "aspect-[4/4]"
                        : variant === "featured"
                            ? "aspect-[4/5]"
                            : "aspect-[4/5]"
                }
      `}
                >
                    <img
                        src={service.thumbnail}
                        alt={service.name}
                        className="
            w-full h-full object-cover
            transition duration-500
            group-hover:scale-105
          "
                        onError={(e) => {
                            const target =
                                e.target as HTMLImageElement;

                            target.src =
                                "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400";
                        }}
                    />
                </Link>
            ) : (
                <div
                    className={`
        block overflow-hidden

        ${
                        variant === "compact"
                            ? "aspect-[4/4]"
                            : variant === "featured"
                                ? "aspect-[4/5]"
                                : "aspect-[4/5]"
                    }
      `}
                >
                    <img
                        src={service.thumbnail}
                        alt={service.name}
                        className="
            w-full h-full object-cover
            transition duration-500
            group-hover:scale-105
          "
                        onError={(e) => {
                            const target =
                                e.target as HTMLImageElement;

                            target.src =
                                "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400";
                        }}
                    />
                </div>
            )}

            {/* FAVORITE */}
            <div className="absolute top-4 right-4 z-30">
                <FavoriteButton
                    serviceId={service._id}
                    variant="card"
                    showToast={showToast}
                />
            </div>

            {/* OVERLAY */}
            <div
                className="
        absolute inset-0
        bg-gradient-to-t
        from-black/90
        via-black/20
        to-transparent

        opacity-0
        group-hover:opacity-100

        transition-all duration-300

        p-4
        flex flex-col justify-between
        pointer-events-none
      "
            >
                {/* BOTTOM */}
                <div className="pointer-events-auto">
                    {/* DESIGNER */}
                    {service.designer && (
                        <div
                            ref={designerAnchorRef}
                            className={`relative w-fit ${
                                showBadge && badgeContent ? "mt-10" : ""
                            }`}
                            onMouseEnter={openDesignerCard}
                            onMouseLeave={closeDesignerCard}
                        >
                            <button
                                type="button"
                                className="
                flex items-center gap-2
                mb-3
              "
                            >
                                <img
                                    src={
                                        service.designer.profilePicture ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            service.designer.fullName
                                        )}`
                                    }
                                    alt={
                                        service.designer.fullName
                                    }
                                    className="
                    w-10 h-10 rounded-full
                    border-2 border-white
                    object-cover
                  "
                                />

                                <span
                                    className="
                  text-white font-medium
                "
                                >
                  {service.designer.fullName}
                </span>
                            </button>

                            {showDesignerCard && (
                                <DesignerHoverCard
                                    anchorRect={
                                        designerAnchorRect
                                    }
                                    designerId={
                                        service.designer._id
                                    }
                                    designerName={
                                        service.designer.fullName
                                    }
                                    profilePicture={
                                        service.designer
                                            .profilePicture
                                    }
                                    onMouseEnter={
                                        openDesignerCard
                                    }
                                    onMouseLeave={
                                        closeDesignerCard
                                    }
                                />
                            )}
                        </div>
                    )}

                    {/* TITLE */}
                    <h3
                        className="
            text-white text-xl
            font-bold mb-2
            line-clamp-2
          "
                    >
                        {service.name}
                    </h3>

                    {/* CATEGORY */}
                    <p
                        className="
            text-white/70 text-sm
            uppercase tracking-wider
            mb-3
          "
                    >
                        {service.category}
                    </p>

                    {/* STATS */}
                    <div
                        className="
            flex items-center gap-4
            text-white/80 text-sm
            mb-4
          "
                    >
                        <div className="flex items-center gap-1">
                            <ShoppingCart className="w-4 h-4" />
                            {service.soldCount}
                        </div>

                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {views}
                        </div>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-center gap-2">
                        {service.discountPrice ? (
                            <>
                <span
                    className="
                  text-white text-2xl font-bold
                "
                >
                  {formatCurrency(
                      service.discountPrice
                  )}
                </span>

                                <span
                                    className="
                  text-white/50 line-through
                "
                                >
                  {formatCurrency(
                      service.price
                  )}
                </span>
                            </>
                        ) : (
                            <span
                                className="
                text-white text-2xl font-bold
              "
                            >
                {formatCurrency(service.price)}
              </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
