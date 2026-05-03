# Frontend - Giao Diện Hiển Thị Gói Dịch Vụ

## Tổng quan
Đã tích hợp thành công 4 section hiển thị gói dịch vụ vào trang Home với thiết kế hiện đại, responsive và tối ưu UX.

## Cấu trúc Files Đã Tạo

### API Layer
- `src/api/serviceApi.ts` - API calls cho services với TypeScript interfaces

### Components
- `src/components/home/HeroSection.tsx` - Hero section với search và stats
- `src/components/home/SectionTitle.tsx` - Component title tái sử dụng
- `src/components/home/ServiceCard.tsx` - Card hiển thị service (3 variants)
- `src/components/home/ServiceCardSkeleton.tsx` - Loading skeleton
- `src/components/home/FeaturedSection.tsx` - Section gói nổi bật
- `src/components/home/BestSellerSlider.tsx` - Slider gói bán chạy
- `src/components/home/NewestSection.tsx` - Section gói mới nhất
- `src/components/home/AllServicesSection.tsx` - Section tất cả gói (có phân trang)

### Utils
- `src/utils/format.ts` - Format currency và date

### Styles
- `src/index.css` - Thêm animations và utilities

## 4 Sections Đã Implement

### 1. Hero Section
- Gradient background với animations
- Search bar chức năng
- Stats hiển thị (1000+ mẫu, 50K+ khách hàng, 24/7 support)
- Responsive design

### 2. Gói Nổi Bật (Featured)
- API: `GET /api/v1/services/featured`
- Card variant: `featured` (lớn, đẹp)
- Badge: ⭐ Nổi bật
- Grid responsive: 1-2-3-4 columns

### 3. Gói Bán Chạy (Best Sellers)
- API: `GET /api/v1/services/best-sellers`
- Slider với navigation buttons
- Badge: 🔥 Bán chạy
- Dots indicator
- Auto-responsive grid

### 4. Gói Mới Nhất (Newest)
- API: `GET /api/v1/services/newest`
- Badge: 🆕 Mới
- Background: neutral-50
- Grid layout

### 5. Tất Cả Gói Dịch Vụ (All Services)
- API: `GET /api/v1/services?page=1&limit=8`
- Phân trang đầy đủ với navigation
- Stats hiển thị (showing X-Y of Z items)
- Smooth scroll khi chuyển trang

## Features Đã Implement

### UI/UX
✅ Responsive design (Mobile: 1, Tablet: 2, Desktop: 4 cards)
✅ Loading skeletons
✅ Error handling với retry button
✅ Hover effects và animations
✅ Smooth transitions
✅ Modern card design với shadows
✅ Badge system (bestseller, new, featured)

### Functionality
✅ API integration với error handling
✅ Loading states
✅ Pagination cho All Services
✅ Slider cho Best Sellers
✅ Currency formatting (VND)
✅ Date formatting (Vietnamese)
✅ Responsive images
✅ TypeScript support

### Performance
✅ Lazy loading components
✅ Optimized API calls
✅ Skeleton loading
✅ Smooth animations
✅ Efficient re-renders

## Responsive Breakpoints

```css
Mobile (< 640px):     1 card per row
Tablet (640px-1024px): 2 cards per row  
Desktop (1024px+):    3-4 cards per row
```

## API Integration

### Service API Functions
```typescript
getAllServices(page, limit)    // Tất cả gói với phân trang
getBestSellers()              // Top 8 gói bán chạy
getNewestServices()           // Top 8 gói mới nhất
getFeaturedServices()         // Top 8 gói nổi bật
getServiceBySlug(slug)        // Chi tiết gói theo slug
```

### Response Format
```typescript
interface ServicePackage {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  thumbnail: string;
  isBestSeller: boolean;
  isFeatured: boolean;
  soldCount: number;
  createdAt: string;
}
```

## Styling System

### Colors (Đã có sẵn)
- Primary: #0075f2 (blue)
- Neutral: #fafafa to #171717
- Success, Warning, Error colors

### Components
- Cards: white background, soft shadows, rounded corners
- Buttons: primary color, hover effects
- Badges: colored backgrounds với icons
- Skeletons: neutral-200 với animate-pulse

## Usage

### Chạy Development
```bash
cd front-end
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000 (cần chạy song song)
```

### Test Features
1. Mở http://localhost:5173
2. Kiểm tra 4 sections load data từ API
3. Test responsive trên mobile/tablet/desktop
4. Test pagination ở section "Tất cả gói dịch vụ"
5. Test slider ở section "Gói bán chạy"

## Next Steps (Tùy chọn)

### Có thể mở rộng:
- [ ] Thêm filter/search functionality
- [ ] Thêm sort options
- [ ] Thêm category filtering  
- [ ] Thêm wishlist functionality
- [ ] Thêm service detail page
- [ ] Thêm shopping cart
- [ ] Thêm user reviews/ratings

### Performance Optimization:
- [ ] Image lazy loading
- [ ] Virtual scrolling cho large lists
- [ ] Cache API responses
- [ ] Prefetch next page data

## Lưu ý
- Tất cả components đều TypeScript
- Responsive design theo Tailwind CSS
- Tương thích với DaisyUI components
- Error boundaries và loading states
- Accessibility friendly
- SEO ready structure