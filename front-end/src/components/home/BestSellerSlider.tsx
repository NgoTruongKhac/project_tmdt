import { useState, useEffect } from "react";
import { getBestSellers } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";

export default function BestSellerSlider() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <section className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Được yêu thích nhất" title="Gói Bán Chạy" />
          <div className="text-center py-12">
            <div className="text-neutral-500 mb-4">⚠️ {error}</div>
            <button onClick={() => window.location.reload()} className="btn bg-primary-500 hover:bg-primary-600 text-white border-none">Thử lại</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <SectionTitle eyebrow="Được yêu thích nhất" title="Gói Bán Chạy" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {services.slice(0, 4).map((service) => (
              <ServiceCard key={service._id} service={service} showBadge badgeType="bestseller" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500">Chưa có gói bán chạy nào</div>
          </div>
        )}
      </div>
    </section>
  );
}
