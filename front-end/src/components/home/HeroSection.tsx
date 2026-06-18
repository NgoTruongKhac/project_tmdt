import { Search, SlidersHorizontal, X } from "lucide-react";
import type { KeyboardEvent } from 'react';

interface HeroSectionProps {
  onSearch: () => void;
  onCategoryChange: (category: string) => void;
  serviceQuery: string;
  setServiceQuery: (query: string) => void;
  serviceCategory: string;
  serviceCategories: string[];
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  activeCategory: (category: string) => boolean;
  MAX_PRICE: number;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
}

const formatCategoryLabel = (category: string) => {
  if (category === "all") return "Tất cả";

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function HeroSection({
  onSearch,
  onCategoryChange,
  serviceQuery,
  setServiceQuery,
  serviceCategories,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isFilterOpen,
  setIsFilterOpen,
  activeCategory,
  MAX_PRICE,
  handleKeyPress,
  handleClearSearch
}: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-primary-600 font-medium text-sm mb-6 shadow-soft">
            Thiết kế chuyên nghiệp, giá cả hợp lý
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 mb-6 leading-tight">
            Khám Phá Thế Giới
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Thiết Kế Sáng Tạo
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Tìm kiếm và khám phá hàng nghìn mẫu thiết kế poster, banner chuyên nghiệp.
            Từ sự kiện, kinh doanh đến social media - tất cả đều có tại đây.
          </p>

          {/* Search bar with filters */}
          <div className="max-w-4xl mx-auto mb-8">
            {/* Main search bar */}
            <div className="relative group mb-4">
              <div className="flex items-center gap-3">
                {/* Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-4 py-4 rounded-2xl border transition-colors ${isFilterOpen
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-neutral-200 bg-white/90 backdrop-blur-sm text-neutral-700 hover:bg-white'
                      }`}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="text-sm font-medium hidden sm:inline">Bộ lọc</span>
                  </button>

                  {/* Price Filter Dropdown */}
                  {isFilterOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsFilterOpen(false)}
                      />

                      {/* Dropdown */}
                      <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
                        <div className="mb-4">
                          <div className="mb-3 flex items-center justify-between">
                            <label className="text-sm font-semibold text-neutral-900">Khoảng giá</label>
                            <span className="text-xs text-neutral-500">Tối đa {MAX_PRICE.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={MAX_PRICE}
                            step="100000"
                            value={maxPrice ? Number(maxPrice) : MAX_PRICE}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary-600"
                          />
                          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                            <span>0</span>
                            <span>{(maxPrice ? Number(maxPrice) : MAX_PRICE).toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-700">Giá tối thiểu</label>
                            <input
                              type="number"
                              min="0"
                              step="100000"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              placeholder="0"
                              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-700">Giá tối đa</label>
                            <input
                              type="number"
                              min="0"
                              step="100000"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                              placeholder="0"
                              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onSearch();
                            setIsFilterOpen(false);
                          }}
                          className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                          Áp dụng bộ lọc
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                    <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Tìm kiếm thiết kế poster, banner..."
                    className="w-full pl-14 pr-12 py-4 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-soft"
                  />
                  {serviceQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button
                  onClick={onSearch}
                  className="px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-2xl transition-colors shadow-soft"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 justify-center pb-2">
                {serviceCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${activeCategory(category)
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white/80 backdrop-blur-sm text-neutral-700 hover:bg-white border border-neutral-200'
                      }`}
                  >
                    {formatCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-800 mb-1">1000+</div>
              <div className="text-neutral-600">Mẫu thiết kế</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-800 mb-1">50K+</div>
              <div className="text-neutral-600">Khách hàng hài lòng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-800 mb-1">24/7</div>
              <div className="text-neutral-600">Hỗ trợ khách hàng</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
