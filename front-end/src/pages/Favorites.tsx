import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFavorites } from "@/api/favoriteApi";
import type { FavoriteItem } from "@/api/favoriteApi";
import { formatCurrency, formatDate } from "@/utils/format";
import { Eye, Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import ServiceCardSkeleton from "@/components/home/ServiceCardSkeleton";
import { useToast } from "@/hooks/useToast";
import { useFavorite } from "@/contexts/FavoriteContext";

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { showToast } = useToast();
  const { refreshFavoriteCount } = useFavorite();

  const fetchFavorites = async (page: number) => {
    try {
      setLoading(true);
      const response = await getFavorites(page, 12);
      setFavorites(response.data.favorites);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải danh sách yêu thích");
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites(1);
  }, []);

  const handleRemoveFavorite = (serviceId: string) => {
    // Remove from local state immediately for better UX
    setFavorites(prev => prev.filter(fav => fav.service._id !== serviceId));
    setTotalItems(prev => prev - 1);
    
    // Refresh favorite count in context
    refreshFavoriteCount();
    
    showToast("Đã xóa khỏi danh sách yêu thích", "success");
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchFavorites(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            i === currentPage
              ? "bg-primary-500 text-white border-primary-500"
              : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-neutral-500 mb-4">⚠️ {error}</div>
            <button 
              onClick={() => fetchFavorites(currentPage)} 
              className="btn bg-primary-500 hover:bg-primary-600 text-white border-none"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-neutral-800">
              Danh sách yêu thích
            </h1>
          </div>
          
          {!loading && totalItems > 0 && (
            <p className="text-neutral-600">
              {totalItems} gói dịch vụ trong danh sách yêu thích của bạn
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite._id}
                  className="group relative bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-100 hover:border-primary-200 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={favorite.service.thumbnail}
                      alt={favorite.service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Favorite Button */}
                    <FavoriteButton 
                      serviceId={favorite.service._id} 
                      variant="card"
                      showToast={(message, type) => {
                        showToast(message, type);
                        if (type === "success" && message.includes("xóa")) {
                          handleRemoveFavorite(favorite.service._id);
                        }
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full mb-2">
                        {favorite.service.category}
                      </span>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {favorite.service.name}
                      </h3>
                      <p className="text-neutral-600 text-sm line-clamp-2">
                        {favorite.service.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      {favorite.service.discountPrice ? (
                        <>
                          <span className="text-xl font-bold text-primary-600">
                            {formatCurrency(favorite.service.discountPrice)}
                          </span>
                          <span className="text-sm text-neutral-400 line-through">
                            {formatCurrency(favorite.service.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-primary-600">
                          {formatCurrency(favorite.service.price)}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        {favorite.service.soldCount} đã bán
                      </span>
                      <span>Thêm {formatDate(favorite.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {renderPagination()}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Bạn chưa có gói yêu thích nào
              </h3>
              <p className="text-neutral-600 mb-6">
                Khám phá và thêm những gói thiết kế yêu thích vào danh sách của bạn
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Khám phá dịch vụ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}