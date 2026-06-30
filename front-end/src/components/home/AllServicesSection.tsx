import { useState, useEffect } from "react";
import { getAllServices } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AllServicesSection() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchServices = async (page: number) => {
    try {
      setLoading(true);
      const response = await getAllServices(page, 8);
      setServices(response.data.services);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
      setCurrentPage(page);
    } catch (err) {
      setError("Không thể tải dữ liệu gói dịch vụ");
      console.error("Error fetching all services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchServices(page);
      // Scroll to top of section
      document.getElementById('all-services-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
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

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="px-2 text-neutral-400">...</span>);
      }
    }

    // Page numbers
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

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="px-2 text-neutral-400">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        {pages}
      </div>
    );
  };

  if (error) {
    return (
      <section id="all-services-section" className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Khám phá toàn bộ" title="Tất Cả Gói Dịch Vụ" />
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">⚠️ {error}</div>
            <button 
              onClick={() => fetchServices(currentPage)} 
              className="btn bg-primary-500 hover:bg-primary-600 text-white border-none"
            >
              Thử lại
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="all-services-section" className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <SectionTitle eyebrow="Khám phá toàn bộ" title="Tất Cả Gói Dịch Vụ" />
        
        {/* Stats */}
        {!loading && totalItems > 0 && (
          <div className="text-center mb-8">
            <p className="text-neutral-600">
              Hiển thị {((currentPage - 1) * 8) + 1} - {Math.min(currentPage * 8, totalItems)} trong tổng số {totalItems} gói dịch vụ
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">Chưa có gói dịch vụ nào</div>
          </div>
        )}
      </div>
    </section>
  );
}