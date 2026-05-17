import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorite } from "@/contexts/FavoriteContext";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

interface FavoriteButtonProps {
  serviceId: string;
  variant?: "card" | "page";
  className?: string;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function FavoriteButton({ 
  serviceId, 
  variant = "card", 
  className = "",
  showToast 
}: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toggleFavorite, checkIsFavorite } = useFavorite();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const isFavorite = checkIsFavorite(serviceId);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (showToast) {
        showToast("Vui lòng đăng nhập để sử dụng tính năng yêu thích", "info");
      }
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleFavorite(serviceId);
      
      if (showToast) {
        showToast(result.message, result.success ? "success" : "error");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      if (showToast) {
        showToast("Có lỗi xảy ra khi thực hiện thao tác", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "card") {
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`
          absolute bottom-3 right-3 z-10
          w-8 h-8 rounded-full
          bg-white/90 backdrop-blur-sm
          border border-neutral-200
          hover:bg-white hover:scale-110
          transition-all duration-200
          flex items-center justify-center
          shadow-soft hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      >
        <Heart 
          className={`w-4 h-4 transition-colors duration-200 ${
            isFavorite 
              ? "text-red-500 fill-red-500" 
              : "text-neutral-400 hover:text-red-500"
          }`}
        />
      </button>
    );
  }

  // Page variant (for favorites page)
  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-3 py-2
        bg-red-50 hover:bg-red-100 text-red-600
        border border-red-200 hover:border-red-300
        rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title="Xóa khỏi yêu thích"
    >
      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
      <span className="text-sm font-medium">Yêu thích</span>
    </button>
  );
}