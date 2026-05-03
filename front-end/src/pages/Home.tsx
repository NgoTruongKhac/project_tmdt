import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Search, SlidersHorizontal, X } from 'lucide-react';
import axios from 'axios';

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

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [isDesignerLoading, setIsDesignerLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isLoading = isServiceLoading || isDesignerLoading;

  const serviceCategories = [
    'Tất cả',
    'Logo Design',
    'Web Design',
    'Banner',
    'UI/UX Design',
    'Illustration',
    'Branding',
    'Animation',
    'Other',
  ];

  const MAX_PRICE = 20000000;

  const fetchServices = async (category: string = serviceCategory, keyword: string = serviceQuery) => {
    setIsServiceLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category && category !== 'Tất cả') params.append('category', category);
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

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceSearch = async () => {
    await Promise.all([fetchServices(serviceCategory, serviceQuery), fetchDesigners(serviceQuery)]);
  };

  const handleCategoryChange = (category: string) => {
    setServiceCategory(category);
    const normalizedCategory = category === 'Tất cả' ? '' : category;
    void fetchServices(normalizedCategory, serviceQuery);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void handleServiceSearch();
    }
  };

  const handleClearSearch = () => {
    setServiceQuery('');
    setDesigners([]);
    void fetchServices(serviceCategory, '');
  };

  const getAvatarUrl = (fullName: string, profilePicture?: string) =>
    profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  const activeCategory = (category: string) =>
    (category === 'Tất cả' && !serviceCategory) || serviceCategory === category;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <button
                onClick={() => setIsFilterOpen((value) => !value)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900">Khoảng giá</label>
                      <span className="text-xs text-gray-500">Tối đa {MAX_PRICE.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="100000"
                      value={maxPrice ? Number(maxPrice) : MAX_PRICE}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>{(maxPrice ? Number(maxPrice) : MAX_PRICE).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Giá tối thiểu</label>
                      <input
                        type="number"
                        min="0"
                        step="100000"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Giá tối đa</label>
                      <input
                        type="number"
                        min="0"
                        step="100000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      void handleServiceSearch();
                      setIsFilterOpen(false);
                    }}
                    className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tìm kiếm dịch vụ thiết kế..."
                className="w-full rounded-full bg-gray-100 py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 outline-none transition focus:ring-2 focus:ring-blue-500"
              />
              {serviceQuery.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2 pb-2">
              {serviceCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition ${activeCategory(category)
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-white'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
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
    </div>
  );
}
