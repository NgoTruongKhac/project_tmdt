import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getFavoriteCount, toggleFavorite as toggleFavoriteApi } from "@/api/favoriteApi";
import { useAuthStore } from "@/stores/useAuthStore";

interface FavoriteContextType {
  favoriteCount: number;
  favoriteItems: Set<string>; // Set of service IDs
  isLoading: boolean;
  toggleFavorite: (serviceId: string) => Promise<{ success: boolean; message: string; isFavorite: boolean }>;
  checkIsFavorite: (serviceId: string) => boolean;
  refreshFavoriteCount: () => Promise<void>;
  addToFavoriteItems: (serviceId: string) => void;
  removeFromFavoriteItems: (serviceId: string) => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
};

interface FavoriteProviderProps {
  children: ReactNode;
}

export const FavoriteProvider = ({ children }: FavoriteProviderProps) => {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  // Fetch favorite count khi user đăng nhập
  const refreshFavoriteCount = async () => {
    if (!isAuthenticated || !user) {
      setFavoriteCount(0);
      setFavoriteItems(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const response = await getFavoriteCount();
      setFavoriteCount(response.data.count);
    } catch (error) {
      console.error("Error fetching favorite count:", error);
      setFavoriteCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if service is favorite
  const checkIsFavorite = (serviceId: string): boolean => {
    return favoriteItems.has(serviceId);
  };

  // Add to favorite items set
  const addToFavoriteItems = (serviceId: string) => {
    setFavoriteItems(prev => new Set([...prev, serviceId]));
  };

  // Remove from favorite items set
  const removeFromFavoriteItems = (serviceId: string) => {
    setFavoriteItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(serviceId);
      return newSet;
    });
  };

  // Toggle favorite
  const toggleFavorite = async (serviceId: string) => {
    if (!isAuthenticated || !user) {
      return {
        success: false,
        message: "Vui lòng đăng nhập để sử dụng tính năng yêu thích",
        isFavorite: false
      };
    }

    try {
      const response = await toggleFavoriteApi(serviceId);
      
      if (response.success) {
        if (response.data.action === "added") {
          setFavoriteCount(prev => prev + 1);
          addToFavoriteItems(serviceId);
        } else {
          setFavoriteCount(prev => Math.max(0, prev - 1));
          removeFromFavoriteItems(serviceId);
        }
      }

      return {
        success: response.success,
        message: response.message,
        isFavorite: response.data.isFavorite
      };
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Có lỗi xảy ra khi thực hiện thao tác",
        isFavorite: false
      };
    }
  };

  // Load favorite count khi component mount hoặc user thay đổi
  useEffect(() => {
    refreshFavoriteCount();
  }, [isAuthenticated, user]);

  const value: FavoriteContextType = {
    favoriteCount,
    favoriteItems,
    isLoading,
    toggleFavorite,
    checkIsFavorite,
    refreshFavoriteCount,
    addToFavoriteItems,
    removeFromFavoriteItems,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};