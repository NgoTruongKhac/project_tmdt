import { useState, useEffect } from "react";
import { getPackageServices } from "@/api/serviceApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import SectionTitle from "./SectionTitle";

function RevisionDots({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center gap-1 mb-2">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-medium ${
            i < count
              ? "bg-emerald-600/90 text-white"
              : "bg-white/10 border border-white/20 text-white/30"
          }`}
        >
          {i + 1}
        </div>
      ))}
      <span className="text-[9px] text-white/50 ml-1">{count} lần sửa</span>
    </div>
  );
}

function PackageCard({ service }: { service: ServicePackage }) {
  return (
    <div className="relative">
      <ServiceCard service={service} showBadge badgeType="bestseller" />
      {service.revisions > 0 && (
        <div className="absolute bottom-14 left-3 z-40 pointer-events-none">
          <RevisionDots count={service.revisions} />
        </div>
      )}
    </div>
  );
}

export default function PackagesSection() {
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await getPackageServices();
        setServices(response.data);
      } catch (err) {
        setError("Không thể tải dữ liệu gói thiết kế");
        console.error("Error fetching package services:", err);
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
          <SectionTitle eyebrow="Mua & yêu cầu chỉnh sửa" title="Gói Thiết Kế Có Sẵn" />
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
        <SectionTitle eyebrow="Mua & yêu cầu chỉnh sửa" title="Gói Thiết Kế Có Sẵn" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {services.slice(0, 4).map((service) => (
              <PackageCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-500">Chưa có gói thiết kế nào</div>
          </div>
        )}
      </div>
    </section>
  );
}
