import { useEffect, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader, Search } from "lucide-react";
import axios from "axios";

import { getServiceCategories, type ServicePackage } from "@/api/serviceApi";
import HeroSection from "@/components/home/HeroSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import BestSellerSlider from "@/components/home/BestSellerSlider";
import NewestSection from "@/components/home/NewestSection";
import AllServicesSection from "@/components/home/AllServicesSection";
import HireSection from "@/components/home/HireSection";
import PackagesSection from "@/components/home/PackagesSection";
import ProductsSection from "@/components/home/ProductsSection";
import ServiceCard from "@/components/home/ServiceCard";

interface Designer {
  _id: string;
  id?: string;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
}

interface SearchService {
  id: string;
  slug?: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  description?: string;
  revisions?: number;
  deliveryTime?: number;
  createdAt?: string;
  designerId?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  } | null;
  soldCount?: number;
  views?: number;
}

const ALL_CATEGORY = "all";
const MAX_PRICE = 20000000;

const normalizePrice = (price: string) => {
  const value = Number(price);
  if (!price || Number.isNaN(value) || value < 0) return null;
  return value;
};

const formatCategoryLabel = (category: string) => {
  if (category === ALL_CATEGORY) return "Tất cả";

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getAvatarUrl = (fullName: string, profilePicture?: string) =>
  profilePicture ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName
  )}&background=random&color=fff`;

const mapSearchServiceToPackage = (service: SearchService): ServicePackage => ({
  _id: service.id,
  name: service.title,
  slug: service.slug || service.id,
  description: service.description || "",
  price: service.originalPrice || service.price,
  discountPrice:
    service.originalPrice && service.originalPrice !== service.price
      ? service.price
      : undefined,
  category: service.category,
  thumbnail: service.images?.[0] || "",
  listingType: "package",
  isBestSeller: false,
  isFeatured: false,
  isActive: true,
  soldCount: service.soldCount || 0,
  views: service.views || 0,
  revisions: service.revisions || 0,
  deliveryTime: service.deliveryTime || 3,
  createdAt: service.createdAt || "",
  updatedAt: service.createdAt || "",
  designer: service.designerId
    ? {
        _id: service.designerId._id,
        fullName: service.designerId.fullName,
        profilePicture: service.designerId.profilePicture,
      }
    : undefined,
});

export default function Home() {
  const [showSearch, setShowSearch] = useState(false);
  const [services, setServices] = useState<SearchService[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [serviceQuery, setServiceQuery] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [isDesignerLoading, setIsDesignerLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<string[]>([
    ALL_CATEGORY,
  ]);

  const isLoading = isServiceLoading || isDesignerLoading;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getServiceCategories();
        setServiceCategories([ALL_CATEGORY, ...response.data]);
      } catch (error) {
        console.error("Error fetching service categories:", error);
      }
    };

    void fetchCategories();
  }, []);

  const fetchServices = async (
    category: string = serviceCategory,
    keyword: string = serviceQuery
  ) => {
    setIsServiceLoading(true);

    try {
      const params = new URLSearchParams();
      const normalizedMinPrice = normalizePrice(minPrice);
      const normalizedMaxPrice = normalizePrice(maxPrice);
      const shouldSwapPriceRange =
        normalizedMinPrice !== null &&
        normalizedMaxPrice !== null &&
        normalizedMinPrice > normalizedMaxPrice;
      const queryMinPrice = shouldSwapPriceRange
        ? normalizedMaxPrice
        : normalizedMinPrice;
      const queryMaxPrice = shouldSwapPriceRange
        ? normalizedMinPrice
        : normalizedMaxPrice;

      if (keyword) params.append("keyword", keyword);
      if (category && category !== ALL_CATEGORY) params.append("category", category);
      if (queryMinPrice !== null) params.append("minPrice", String(queryMinPrice));
      if (queryMaxPrice !== null) params.append("maxPrice", String(queryMaxPrice));

      const url = `http://localhost:3000/api/v1/search/services${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await axios.get(url);
      setServices(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setIsServiceLoading(false);
    }
  };

  const fetchDesigners = async (keyword: string = serviceQuery) => {
    if (!keyword.trim()) {
      setDesigners([]);
      return;
    }

    setIsDesignerLoading(true);

    try {
      const url = `http://localhost:3000/api/v1/search/designers?keyword=${encodeURIComponent(
        keyword
      )}`;
      const response = await axios.get(url);
      setDesigners(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching designers:", error);
      setDesigners([]);
    } finally {
      setIsDesignerLoading(false);
    }
  };

  const handleServiceSearch = async () => {
    setShowSearch(true);
    await Promise.all([
      fetchServices(serviceCategory, serviceQuery),
      fetchDesigners(serviceQuery),
    ]);
  };

  const handleCategoryChange = (category: string) => {
    const normalizedCategory = category === ALL_CATEGORY ? "" : category;
    setServiceCategory(normalizedCategory);
    setShowSearch(true);
    void fetchServices(normalizedCategory, serviceQuery);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleServiceSearch();
    }
  };

  const handleClearSearch = () => {
    setServiceQuery("");
    setServiceCategory("");
    setMinPrice("");
    setMaxPrice("");
    setDesigners([]);
    setServices([]);
    setShowSearch(false);
  };

  const activeCategory = (category: string) =>
    (category === ALL_CATEGORY && !serviceCategory) || serviceCategory === category;

  return (
    <div className="min-h-screen">
      {showSearch && (
        <div className="sticky top-0 z-30 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={handleClearSearch}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-blue-600"
                  title="Quay về trang chủ"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                {serviceCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                      activeCategory(category)
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {formatCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!showSearch ? (
        <div>
          <HeroSection
            onSearch={handleServiceSearch}
            onCategoryChange={handleCategoryChange}
            serviceQuery={serviceQuery}
            setServiceQuery={setServiceQuery}
            serviceCategory={serviceCategory}
            serviceCategories={serviceCategories}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            activeCategory={activeCategory}
            MAX_PRICE={MAX_PRICE}
            handleKeyPress={handleKeyPress}
            handleClearSearch={handleClearSearch}
          />

          <HireSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />
          <PackagesSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />
          <ProductsSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />
          <FeaturedSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />
          <BestSellerSlider />
          <hr className="border-none h-px bg-neutral-200 mx-6" />
          <NewestSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />
          <AllServicesSection />
        </div>
      ) : (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {designers.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Designer phù hợp
                </h2>
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-4 pb-2">
                    {designers.map((designer) => {
                      const designerId = designer._id || designer.id || "";

                      return (
                        <Link
                          key={designerId}
                          to={`/designer/${designerId}/services`}
                          state={{
                            designerName: designer.fullName,
                            profilePicture: designer.profilePicture,
                          }}
                          className="flex w-24 shrink-0 flex-col items-center text-center"
                        >
                          <img
                            src={getAvatarUrl(
                              designer.fullName,
                              designer.profilePicture
                            )}
                            alt={designer.fullName}
                            className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <span className="mt-2 line-clamp-2 text-sm font-medium text-gray-900">
                            {designer.fullName}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-lg text-gray-600">Đang tải dịch vụ...</p>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  Không tìm thấy dịch vụ nào
                </p>
                <p className="mt-2 text-gray-600">
                  Hãy thử tìm kiếm bằng từ khóa khác hoặc điều chỉnh bộ lọc
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={mapSearchServiceToPackage(service)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
