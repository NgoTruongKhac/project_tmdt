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
      <section className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Vừa ra mắt" title="Gói Mới Nhất" />
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">⚠️ {error}</div>
            <button onClick={() => window.location.reload()} className="btn bg-primary-500 hover:bg-primary-600 text-white border-none">Thử lại</button>
          </div>
        </div>
      </section>
    );
  }

  const hero = services[0];
  const rest = services.slice(1, 4);

  return (
    <section className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <SectionTitle eyebrow="Vừa ra mắt" title="Gói Mới Nhất" />

        {loading ? (
          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
            <ServiceCardSkeleton variant="default" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <ServiceCardSkeleton key={i} variant="compact" />
              ))}
            </div>
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
            {hero && (
              <div>
                <ServiceCard service={hero} showBadge badgeType="new" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {rest.map((service) => (
                <ServiceCard key={service._id} service={service} variant="compact" showBadge badgeType="new" />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500">Chưa có gói mới nào</div>
          </div>
        )}
      </div>
    </section>
  );
}
