import { ServicePackage } from "../models/ServicePackage.js";
import { connectDB } from "../databases/mongodb.js";

const sampleServices = [
  {
    name: "Thiết kế Poster Sự Kiện",
    slug: "thiet-ke-poster-su-kien",
    description: "Thiết kế poster chuyên nghiệp cho các sự kiện, hội thảo, workshop với phong cách hiện đại và thu hút.",
    price: 299000,
    discountPrice: 199000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
    isBestSeller: true,
    isFeatured: true,
    soldCount: 156,
  },
  {
    name: "Banner Facebook Sale",
    slug: "banner-facebook-sale",
    description: "Thiết kế banner quảng cáo Facebook chuyên nghiệp cho các chiến dịch sale, khuyến mãi với tỷ lệ chuyển đổi cao.",
    price: 199000,
    discountPrice: 149000,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 234,
  },
  {
    name: "Poster Mỹ Phẩm",
    slug: "poster-my-pham",
    description: "Thiết kế poster quảng cáo mỹ phẩm sang trọng, tinh tế phù hợp với thương hiệu làm đẹp cao cấp.",
    price: 349000,
    discountPrice: null,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 89,
  },
  {
    name: "Banner Shopee Flash Sale",
    slug: "banner-shopee-flash-sale",
    description: "Thiết kế banner Shopee chuyên nghiệp cho Flash Sale, tối ưu hóa để tăng tỷ lệ click và chuyển đổi.",
    price: 179000,
    discountPrice: 129000,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 312,
  },
  {
    name: "Combo Thiết Kế Social Media",
    slug: "combo-thiet-ke-social-media",
    description: "Gói combo thiết kế đầy đủ cho social media bao gồm: Facebook cover, Instagram post, Story template.",
    price: 599000,
    discountPrice: 399000,
    category: "combo",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 67,
  },
  {
    name: "Poster Khai Trương",
    slug: "poster-khai-truong",
    description: "Thiết kế poster khai trương cửa hàng, doanh nghiệp với phong cách chuyên nghiệp và ấn tượng.",
    price: 249000,
    discountPrice: 199000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 45,
  },
  {
    name: "Banner Website Chuyên Nghiệp",
    slug: "banner-website-chuyen-nghiep",
    description: "Thiết kế banner header website chuyên nghiệp, responsive và tối ưu SEO cho doanh nghiệp.",
    price: 399000,
    discountPrice: null,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 78,
  },
  {
    name: "Poster Nhà Hàng",
    slug: "poster-nha-hang",
    description: "Thiết kế poster menu nhà hàng, quán ăn với phong cách hiện đại và thu hút thực khách.",
    price: 279000,
    discountPrice: 229000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 123,
  },
  {
    name: "Banner Instagram Story",
    slug: "banner-instagram-story",
    description: "Thiết kế template Instagram Story chuyên nghiệp cho business, tăng engagement và follower.",
    price: 159000,
    discountPrice: 119000,
    category: "social-media",
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 201,
  },
  {
    name: "Poster Thời Trang",
    slug: "poster-thoi-trang",
    description: "Thiết kế poster quảng cáo thời trang trendy, phù hợp với các brand fashion hiện đại.",
    price: 329000,
    discountPrice: null,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 56,
  },
  {
    name: "Banner Lazada Sale",
    slug: "banner-lazada-sale",
    description: "Thiết kế banner Lazada chuyên nghiệp cho các chiến dịch sale lớn, tối ưu conversion rate.",
    price: 189000,
    discountPrice: 139000,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 189,
  },
  {
    name: "Poster Công Nghệ",
    slug: "poster-cong-nghe",
    description: "Thiết kế poster cho các sản phẩm công nghệ, startup với phong cách hiện đại và sáng tạo.",
    price: 359000,
    discountPrice: 299000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 34,
  },
  {
    name: "Banner YouTube Thumbnail",
    slug: "banner-youtube-thumbnail",
    description: "Thiết kế thumbnail YouTube chuyên nghiệp, tăng CTR và view cho video của bạn.",
    price: 149000,
    discountPrice: 99000,
    category: "social-media",
    thumbnail: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 267,
  },
  {
    name: "Poster Giáo Dục",
    slug: "poster-giao-duc",
    description: "Thiết kế poster cho các khóa học, trung tâm giáo dục với phong cách chuyên nghiệp và tin cậy.",
    price: 269000,
    discountPrice: 219000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 92,
  },
  {
    name: "Banner Bất Động Sản",
    slug: "banner-bat-dong-san",
    description: "Thiết kế banner quảng cáo bất động sản chuyên nghiệp, thu hút khách hàng tiềm năng.",
    price: 389000,
    discountPrice: null,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 43,
  },
  {
    name: "Combo Branding Doanh Nghiệp",
    slug: "combo-branding-doanh-nghiep",
    description: "Gói combo thiết kế branding hoàn chỉnh: Logo, Business card, Letterhead, Poster, Banner.",
    price: 999000,
    discountPrice: 699000,
    category: "combo",
    thumbnail: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400",
    isBestSeller: true,
    isFeatured: true,
    soldCount: 28,
  },
  {
    name: "Poster Y Tế",
    slug: "poster-y-te",
    description: "Thiết kế poster cho phòng khám, bệnh viện, dược phẩm với phong cách chuyên nghiệp và tin cậy.",
    price: 299000,
    discountPrice: 249000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 71,
  },
  {
    name: "Banner TikTok Ads",
    slug: "banner-tiktok-ads",
    description: "Thiết kế banner quảng cáo TikTok chuyên nghiệp, tối ưu cho Gen Z và millennials.",
    price: 199000,
    discountPrice: 159000,
    category: "social-media",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 145,
  },
  {
    name: "Poster Du Lịch",
    slug: "poster-du-lich",
    description: "Thiết kế poster quảng cáo tour du lịch, khách sạn, resort với phong cách hấp dẫn và mời gọi.",
    price: 319000,
    discountPrice: null,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 63,
  },
  {
    name: "Banner Email Marketing",
    slug: "banner-email-marketing",
    description: "Thiết kế banner cho email marketing chuyên nghiệp, tăng open rate và click rate.",
    price: 229000,
    discountPrice: 179000,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 108,
  },
];

// Hàm tạo dữ liệu mẫu với thời gian tạo ngẫu nhiên trong 6 tháng qua
const createSampleData = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

  return sampleServices.map((service) => ({
    ...service,
    createdAt: new Date(
      sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    ),
  }));
};

// Hàm seed dữ liệu
export const seedServices = async () => {
  try {
    await connectDB();
    
    // Xóa dữ liệu cũ
    await ServicePackage.deleteMany({});
    console.log("Đã xóa dữ liệu cũ");

    // Tạo dữ liệu mới
    const servicesData = createSampleData();
    await ServicePackage.insertMany(servicesData);
    
    console.log(`Đã tạo ${servicesData.length} gói dịch vụ mẫu thành công!`);
    
    // Hiển thị thống kê
    const stats = {
      total: await ServicePackage.countDocuments(),
      active: await ServicePackage.countDocuments({ isActive: true }),
      bestSellers: await ServicePackage.countDocuments({ isBestSeller: true }),
      featured: await ServicePackage.countDocuments({ isFeatured: true }),
    };
    
    console.log("Thống kê dữ liệu:");
    console.log(`- Tổng số gói: ${stats.total}`);
    console.log(`- Gói đang hoạt động: ${stats.active}`);
    console.log(`- Gói bán chạy: ${stats.bestSellers}`);
    console.log(`- Gói nổi bật: ${stats.featured}`);
    
  } catch (error) {
    console.error("Lỗi khi seed dữ liệu:", error);
  }
};

// Chạy seed nếu file được gọi trực tiếp
seedServices().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Error running seed:", error);
  process.exit(1);
});