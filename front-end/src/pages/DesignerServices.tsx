import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, PackageSearch, Star } from "lucide-react";

import {
  getDesignerServices,
  type DesignerSummary,
} from "@/api/designerApi";
import type { ServicePackage } from "@/api/serviceApi";
import ServiceCard from "@/components/home/ServiceCard";

type LocationState = {
  designerName?: string;
  profilePicture?: string;
};

const avatarUrl = (name?: string, image?: string) =>
  image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Designer"
  )}&background=random&color=fff`;

export default function DesignerServices() {
  const { designerId } = useParams<{ designerId: string }>();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [designer, setDesigner] = useState<DesignerSummary | null>(null);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDesignerServices = async () => {
      if (!designerId) return;

      try {
        setLoading(true);
        setError("");
        const response = await getDesignerServices(designerId);
        setDesigner(response.designer || null);
        setServices(response.data || []);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            "Không thể tải danh sách dịch vụ của designer"
        );
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchDesignerServices();
  }, [designerId]);

  const displayName = designer?.fullName || state.designerName || "Designer";
  const displayAvatar = avatarUrl(displayName, designer?.profilePicture || state.profilePicture);

  const stats = useMemo(() => {
    return {
      total: services.length,
      sold: services.reduce((sum, service) => sum + (service.soldCount || 0), 0),
      views: services.reduce((sum, service) => sum + (service.views || 0), 0),
    };
  }, [services]);

  return (
    <main className="min-h-screen bg-[#fafbfc]">
      <section className="border-b border-neutral-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
              />

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black text-neutral-900 md:text-5xl">
                    {displayName}
                  </h1>
                  {designer?.rating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                      <Star className="h-4 w-4 fill-current" />
                      {designer.rating}
                    </span>
                  )}
                </div>

                {designer?.bio && (
                  <p className="mt-3 max-w-2xl text-neutral-600">{designer.bio}</p>
                )}

                {designer?.skills?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {designer.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-center">
              <div>
                <div className="text-2xl font-black text-neutral-900">{stats.total}</div>
                <div className="text-xs font-medium text-neutral-500">Dịch vụ</div>
              </div>
              <div>
                <div className="text-2xl font-black text-neutral-900">{stats.sold}</div>
                <div className="text-xs font-medium text-neutral-500">Lượt mua</div>
              </div>
              <div>
                <div className="text-2xl font-black text-neutral-900">{stats.views}</div>
                <div className="text-xs font-medium text-neutral-500">Lượt xem</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-neutral-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải dịch vụ...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center text-red-600">
              {error}
            </div>
          ) : services.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
              <PackageSearch className="mb-4 h-10 w-10 text-neutral-400" />
              <h2 className="text-xl font-bold text-neutral-900">
                Designer này chưa có dịch vụ nào
              </h2>
              <p className="mt-2 text-neutral-500">
                Hãy quay lại sau hoặc khám phá các designer khác.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
