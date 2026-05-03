import { useState, useEffect } from "react";
import { getNewestServices } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";

export default function NewestSection() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewestServices = async () => {
      try {
        setLoading(true);
        const response = await getNewestServices();
        setServices(response.data);
      } catch (err) {
        setError("Không thể tải dữ liệu gói mới nhất");
        console.error("Error fetching newest services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewestServices();
  }, []);

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            title="Gói Mới Nhất" 
            subtitle="Những thiết kế mới nhất được cập nhật"
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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <SectionTitle 
          title="Gói Mới Nhất" 
          subtitle="Những thiết kế mới nhất được cập nhật"
        />
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                showBadge={true}
                badgeType="new"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">Chưa có gói mới nào</div>
          </div>
        )}
      </div>
    </section>
  );
}