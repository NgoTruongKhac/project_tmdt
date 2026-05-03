import { Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm thiết kế poster, banner..."
                className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-2xl text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-soft"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors">
                Tìm kiếm
              </button>
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