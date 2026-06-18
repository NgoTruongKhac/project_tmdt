import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Search, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { getServiceCategories } from "@/api/serviceApi";
import HeroSection from "@/components/home/HeroSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import BestSellerSlider from "@/components/home/BestSellerSlider";
import NewestSection from "@/components/home/NewestSection";
import AllServicesSection from "@/components/home/AllServicesSection";
import HireSection from "@/components/home/HireSection";
import PackagesSection from "@/components/home/PackagesSection";
import ProductsSection from "@/components/home/ProductsSection";

interface Designer {
  _id: string;
  id?: string;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
}

interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  images?: string[];
  description?: string;
  designerId?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
}

const ALL_CATEGORY = "all";

const formatCategoryLabel = (category: string) => {
  if (category === ALL_CATEGORY) return "Tất cả";

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Home() {
  const [showSearch, setShowSearch] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [isDesignerLoading, setIsDesignerLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<string[]>([ALL_CATEGORY]);
  const isLoading = isServiceLoading || isDesignerLoading;

  const MAX_PRICE = 20000000;

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

  const fetchServices = async (category: string = serviceCategory, keyword: string = serviceQuery) => {
    setIsServiceLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category && category !== ALL_CATEGORY) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const url = `http://localhost:3000/api/v1/search/services${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      setServices(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
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
      const url = keyword
        ? `http://localhost:3000/api/v1/search/designers?keyword=${encodeURIComponent(keyword)}`
        : 'http://localhost:3000/api/v1/search/designers';

      const response = await axios.get(url);
      setDesigners(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching designers:', error);
      setDesigners([]);
    } finally {
      setIsDesignerLoading(false);
    }
  };

  const handleServiceSearch = async () => {
    setShowSearch(true);
    await Promise.all([fetchServices(serviceCategory, serviceQuery), fetchDesigners(serviceQuery)]);
  };

  const handleCategoryChange = (category: string) => {
    const normalizedCategory = category === ALL_CATEGORY ? '' : category;
    setServiceCategory(normalizedCategory);
    setShowSearch(true);
    void fetchServices(normalizedCategory, serviceQuery);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void handleServiceSearch();
    }
  };

  const handleClearSearch = () => {
    setServiceQuery('');
    setServiceCategory('');
    setDesigners([]);
    setServices([]);
    setShowSearch(false);
  };

  const getAvatarUrl = (fullName: string, profilePicture?: string) =>
    profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  const activeCategory = (category: string) =>
    (category === ALL_CATEGORY && !serviceCategory) || serviceCategory === category;

  return (
    <div className="min-h-screen">
      {/* Category Filter Buttons - Show when searching */}
      {showSearch && (
        <div className="sticky top-0 z-30 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 pb-2 items-center">

                {/* Nút Mũi tên Quay Lại */}
                <button
                  onClick={() => {
                    setShowSearch(false); // Ẩn màn hình tìm kiếm, quay về trang chủ
                    setServiceQuery(''); // Xóa từ khóa tìm kiếm
                    setServiceCategory(''); // Reset danh mục
                  }}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-blue-600"
                  title="Quay về trang chủ"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Các nút danh mục cũ */}
                {serviceCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${activeCategory(category)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

      {/* Main Content */}
      {!showSearch ? (
        // Original Home Page Content
        <div>
          {/* Hero Section */}
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

          {/* Thuê Designer */}
          <HireSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />

          {/* Gói Có Sẵn */}
          <PackagesSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />

          {/* Sản Phẩm Số */}
          <ProductsSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />

          {/* Featured Services */}
          <FeaturedSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />

          {/* Best Sellers */}
          <BestSellerSlider />
          <hr className="border-none h-px bg-neutral-200 mx-6" />

          {/* Newest Services */}
          <NewestSection />
          <hr className="border-none h-px bg-neutral-200 mx-6" />

          {/* All Services */}
          <AllServicesSection />
        </div>
      ) : (
        // Search Results
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Designers Section */}
            {designers.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Designer phù hợp</h2>
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-4 pb-2">
                    {designers.map((designer) => {
                      const designerId = designer._id || designer.id || '';
                      return (
                        <Link
                          key={designerId}
                          to={`/designer/${designerId}`}
                          className="flex w-24 shrink-0 flex-col items-center text-center"
                        >
                          <img
                            src={getAvatarUrl(designer.fullName, designer.profilePicture)}
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

            {/* Services Section */}
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
                <p className="text-xl font-semibold text-gray-900">Không tìm thấy dịch vụ nào</p>
                <p className="mt-2 text-gray-600">Hãy thử tìm kiếm bằng từ khóa khác hoặc điều chỉnh bộ lọc</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((service) => {
                  const serviceDesigner = service.designerId;
                  const designerId = serviceDesigner?._id || '';

                  return (
                    <div key={service.id} className="group overflow-hidden rounded-lg transition hover:shadow-sm">
                      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                        {service.images && service.images.length > 0 ? (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="px-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
                            {service.title}
                          </h3>
                          <p className="shrink-0 text-base font-bold text-gray-900">{service.price.toLocaleString('vi-VN')}đ</p>
                        </div>

                        <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">{service.category}</p>

                        {serviceDesigner && designerId && (
                          <Link
                            to={`/designer/${designerId}`}
                            className="mt-4 flex items-center gap-2 text-sm text-gray-700 transition hover:text-blue-600"
                          >
                            <img
                              src={getAvatarUrl(serviceDesigner.fullName, serviceDesigner.profilePicture)}
                              alt={serviceDesigner.fullName}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            <span className="font-medium">{serviceDesigner.fullName}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
