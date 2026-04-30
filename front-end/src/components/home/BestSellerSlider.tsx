import { useState, useEffect } from "react";
import { getBestSellers } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BestSellerSlider() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const response = await getBestSellers();
        setServices(response.data);
      } catch (err) {
        setError("Không thể tải dữ liệu gói bán chạy");
        console.error("Error fetching best sellers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + 4 >= services.length ? 0 : prev + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - 4 < 0 ? Math.max(0, services.length - 4) : prev - 4
    );
  };

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            title="Gói Bán Chạy" 
            subtitle="Những gói thiết kế được yêu thích nhất"
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
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <SectionTitle 
            title="Gói Bán Chạy" 
            subtitle="Những gói thiết kế được yêu thích nhất"
            className="text-left mb-0"
          />
          
          {!loading && services.length > 4 && (
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white shadow-soft hover:shadow-lg border border-neutral-200 hover:border-primary-300 transition-all duration-200"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5 text-neutral-600" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white shadow-soft hover:shadow-lg border border-neutral-200 hover:border-primary-300 transition-all duration-200"
                disabled={currentIndex + 4 >= services.length}
              >
                <ChevronRight className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="overflow-hidden">
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-transform duration-300"
              style={{
                transform: `translateX(-${currentIndex * (100 / 4)}%)`,
                width: `${Math.ceil(services.length / 4) * 100}%`
              }}
            >
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  showBadge={true}
                  badgeType="bestseller"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">Chưa có gói bán chạy nào</div>
          </div>
        )}

        {/* Dots indicator */}
        {!loading && services.length > 4 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(services.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 4)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(currentIndex / 4) === index
                    ? "bg-primary-500 w-6"
                    : "bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}