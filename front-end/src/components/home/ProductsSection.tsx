import { useState, useEffect } from "react";
import { getProductServices } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";

export default function ProductsSection() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await getProductServices();
        setServices(response.data);
      } catch (err) {
        setError("Không thể tải dữ liệu sản phẩm thiết kế");
        console.error("Error fetching product services:", err);
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
          <SectionTitle eyebrow="Mua & dùng ngay — không cần chỉnh" title="Sản Phẩm Thiết Kế" />
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">⚠️ {error}</div>
            <button onClick={() => window.location.reload()} className="btn bg-primary-500 hover:bg-primary-600 text-white border-none">Thử lại</button>
          </div>
        </div>
      </section>
    );
  }

  const hero = services[0];
  const sm1 = services[1];
  const sm2 = services[2];
  const sm3 = services[3];
  const wide = services[4];

  return (
    <section className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <SectionTitle eyebrow="Mua & dùng ngay — không cần chỉnh" title="Sản Phẩm Thiết Kế" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gridTemplateRows: "auto auto" }}
          >
            {hero && (
              <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
                <ServiceCard service={hero} variant="featured" showBadge badgeType="new" />
              </div>
            )}
            {sm1 && (
              <div style={{ gridColumn: "2", gridRow: "1" }}>
                <ServiceCard service={sm1} showBadge badgeType="new" />
              </div>
            )}
            {sm2 && (
              <div style={{ gridColumn: "3", gridRow: "1" }}>
                <ServiceCard service={sm2} showBadge badgeType="new" />
              </div>
            )}
            {sm3 && (
              <div style={{ gridColumn: "4", gridRow: "1" }}>
                <ServiceCard service={sm3} showBadge badgeType="new" />
              </div>
            )}
            {wide && (
              <div style={{ gridColumn: "2 / 5", gridRow: "2" }}>
                <ServiceCard service={wide} showBadge badgeType="new" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500">Chưa có sản phẩm thiết kế nào</div>
          </div>
        )}
      </div>
    </section>
  );
}
