import { useState, useEffect } from "react";
import { getHireServices } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";

export default function HireSection() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await getHireServices();
        setServices(response.data);
      } catch (err) {
        setError("Không thể tải dữ liệu dịch vụ thuê designer");
        console.error("Error fetching hire services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (error) {
    return (
      <section className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Liên hệ & đặt yêu cầu" title="Thuê Designer" />
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">⚠️ {error}</div>
            <button onClick={() => window.location.reload()} className="btn bg-primary-500 hover:bg-primary-600 text-white border-none">Thử lại</button>
          </div>
        </div>
      </section>
    );
  }

  const hero = services[0];
  const tall1 = services[1];
  const tall2 = services[2];
  const wide = services[3];

  return (
    <section className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <SectionTitle eyebrow="Liên hệ & đặt yêu cầu" title="Thuê Designer" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ServiceCardSkeleton key={i} variant="featured" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "auto auto" }}
          >
            {hero && (
              <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
                <ServiceCard service={hero} variant="featured" showBadge badgeType="featured" />
              </div>
            )}
            {tall1 && (
              <div style={{ gridColumn: "2", gridRow: "1" }}>
                <ServiceCard service={tall1} showBadge badgeType="featured" />
              </div>
            )}
            {tall2 && (
              <div style={{ gridColumn: "3", gridRow: "1" }}>
                <ServiceCard service={tall2} showBadge badgeType="featured" />
              </div>
            )}
            {wide && (
              <div style={{ gridColumn: "2 / 4", gridRow: "2" }}>
                <ServiceCard service={wide} showBadge badgeType="featured" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500">Chưa có dịch vụ thuê designer nào</div>
          </div>
        )}
      </div>
    </section>
  );
}
