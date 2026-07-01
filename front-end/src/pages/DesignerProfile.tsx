import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Loader2, PackageSearch, Star } from "lucide-react";

import {
  getDesignerServices,
  type DesignerSummary,
} from "@/api/designerApi";
import type { ServicePackage } from "@/api/serviceApi";
import { formatCurrency } from "@/utils/format";

type LocationState = {
  designerName?: string;
  profilePicture?: string;
};

const avatarUrl = (name?: string, image?: string) =>
  image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Designer"
  )}&background=random&color=fff`;

export default function DesignerProfile() {
  const { designerId } = useParams<{ designerId: string }>();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [designer, setDesigner] = useState<DesignerSummary | null>(null);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!designerId) return;

      try {
        setLoading(true);
        setError("");
        const response = await getDesignerServices(designerId);
        setDesigner(response.designer || null);
        setServices(response.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Không thể tải hồ sơ designer");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [designerId]);

  const displayName = designer?.fullName || state.designerName || "Designer";
  const displayAvatar = avatarUrl(displayName, designer?.profilePicture || state.profilePicture);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafbfc] text-neutral-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải hồ sơ designer...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafbfc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center text-red-600">
            {error}
          </div>
        ) : (
          <>
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
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
                        {designer.skills.map((skill) => (
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

                <Link
                  to={`/designer/${designerId}/services`}
                  state={{ designerName: displayName, profilePicture: displayAvatar }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 font-bold text-white transition hover:bg-neutral-700"
                >
                  <PackageSearch className="h-5 w-5" />
                  Xem dịch vụ
                </Link>
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-neutral-900">
                    Dịch vụ nổi bật
                  </h2>
                  <p className="mt-1 text-neutral-500">
                    {services.length} dịch vụ đang hiển thị
                  </p>
                </div>

                <BriefcaseBusiness className="h-6 w-6 text-neutral-400" />
              </div>

              {services.length ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {services.slice(0, 3).map((service) => (
                    <Link
                      key={service._id}
                      to={`/package/${service._id}`}
                      className="overflow-hidden rounded-2xl border border-neutral-100 transition hover:shadow-md"
                    >
                      <img
                        src={service.thumbnail}
                        alt={service.name}
                        className="h-40 w-full object-cover"
                      />
                      <div className="p-4">
                        <h3 className="line-clamp-2 font-bold text-neutral-900">
                          {service.name}
                        </h3>
                        <p className="mt-2 font-black text-primary-600">
                          {formatCurrency(service.discountPrice || service.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-neutral-50 px-6 py-10 text-center text-neutral-500">
                  Designer này chưa có dịch vụ nào.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
