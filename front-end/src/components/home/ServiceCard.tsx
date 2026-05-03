import type { ServicePackage } from "@/api/serviceApi";
import { formatCurrency, formatDate } from "@/utils/format";
import { Eye, ShoppingCart } from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/hooks/useToast";

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
  badgeType = "bestseller"
}: ServiceCardProps) {
  const { showToast } = useToast();
  
  const getBadgeContent = () => {
    switch (badgeType) {
      case "bestseller":
        return {
          text: "Bán chạy",
          className: "bg-red-500 text-white"
        };
      case "new":
        return {
          text: "Mới",
          className: "bg-green-500 text-white"
        };
      case "featured":
        return {
          text: "Nổi bật",
          className: "bg-primary-500 text-white"
        };
      default:
        return null;
    }
  };

  const badgeContent = getBadgeContent();

  if (variant === "featured") {
    return (
      <div className="group relative bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-100 hover:border-primary-200">
        {/* Badge */}
        {showBadge && badgeContent && (
          <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-medium ${badgeContent.className}`}>
            {badgeContent.text}
          </div>
        )}

        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={service.thumbnail}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop&crop=center";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Favorite Button */}
          <FavoriteButton 
            serviceId={service._id} 
            variant="card"
            showToast={showToast}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full mb-2">
              {service.category}
            </span>
            <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
              {service.name}
            </h3>
            <p className="text-neutral-600 text-sm line-clamp-2">
              {service.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            {service.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(service.discountPrice)}
                </span>
                <span className="text-lg text-neutral-400 line-through">
                  {formatCurrency(service.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(service.price)}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
            <span className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              {service.soldCount} đã bán
            </span>
            <span>{formatDate(service.createdAt)}</span>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Xem ngay
          </button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="group relative bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-100 hover:border-primary-200 hover:-translate-y-1">
        {/* Badge */}
        {showBadge && badgeContent && (
          <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-xs font-medium ${badgeContent.className}`}>
            {badgeContent.text}
          </div>
        )}

        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={service.thumbnail}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop&crop=center";
            }}
          />
          
          {/* Favorite Button */}
          <FavoriteButton 
            serviceId={service._id} 
            variant="card"
            showToast={showToast}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-neutral-800 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
              {service.name}
            </h3>
            <p className="text-neutral-600 text-sm line-clamp-2">
              {service.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            {service.discountPrice ? (
              <>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(service.discountPrice)}
                </span>
                <span className="text-sm text-neutral-400 line-through">
                  {formatCurrency(service.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary-600">
                {formatCurrency(service.price)}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{service.soldCount} đã bán</span>
            <span>{formatDate(service.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="group relative bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-100 hover:border-primary-200 hover:-translate-y-1">
      {/* Badge */}
      {showBadge && badgeContent && (
        <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-xs font-medium ${badgeContent.className}`}>
          {badgeContent.text}
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.thumbnail}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop&crop=center";
          }}
        />
        
        {/* Favorite Button */}
        <FavoriteButton 
          serviceId={service._id} 
          variant="card"
          showToast={showToast}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full mb-2">
            {service.category}
          </span>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {service.name}
          </h3>
          <p className="text-neutral-600 text-sm line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {service.discountPrice ? (
            <>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(service.discountPrice)}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                {formatCurrency(service.price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary-600">
              {formatCurrency(service.price)}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
          <span className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            {service.soldCount}
          </span>
          <span>{formatDate(service.createdAt)}</span>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}