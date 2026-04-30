import { useState, useEffect } from "react";
import { getFeaturedServices } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/common/Toast";

export default function FeaturedSection() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedServices();
        setServices(response.data);
      } catch (err) {
        setError("Không thể tải dữ liệu gói nổi bật");
        console.error("Error fetching featured services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            title="Gói Nổi Bật" 
            subtitle="Những gói thiết kế được đề xuất dành riêng cho bạn"
          />
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">⚠️ {error}</div>
            <button 
              onClick={() => window.location.reload()} 
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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto">
        <SectionTitle 
          title="Gói Nổi Bật" 
          subtitle="Những gói thiết kế được đề xuất dành riêng cho bạn"
        />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <ServiceCardSkeleton key={index} variant="featured" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.slice(0, 4).map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                variant="featured"
                showBadge={true}
                badgeType="featured"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">Chưa có gói nổi bật nào</div>
          </div>
        )}
        
        {/* Toast Container for this section */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </section>
  );
}