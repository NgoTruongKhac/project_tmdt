import { Service } from "../models/service.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import { User } from "../models/user.model.js";
import { connectDB } from "../databases/mongodb.js";

const sampleData = [
  {
    title: "Thiết kế Poster Sự Kiện",
    name: "Thiết kế Poster Sự Kiện",
    slug: "thiet-ke-poster-su-kien",
    description: "Thiết kế poster chuyên nghiệp cho các sự kiện, hội thảo, workshop với phong cách hiện đại và thu hút.",
    price: 299000,
    discountPrice: 199000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
    isBestSeller: true,
    isFeatured: true,
    soldCount: 156,
  },
  {
    title: "Banner Facebook Sale",
    name: "Banner Facebook Sale",
    slug: "banner-facebook-sale",
    description: "Thiết kế banner quảng cáo Facebook chuyên nghiệp cho các chiến dịch sale, khuyến mãi với tỷ lệ chuyển đổi cao.",
    price: 199000,
    discountPrice: 149000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 234,
  },
  {
    title: "Poster Mỹ Phẩm",
    name: "Poster Mỹ Phẩm",
    slug: "poster-my-pham",
    description: "Thiết kế poster quảng cáo mỹ phẩm sang trọng, tinh tế phù hợp với thương hiệu làm đẹp cao cấp.",
    price: 349000,
    discountPrice: null,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 89,
  },
  {
    title: "Banner Shopee Flash Sale",
    name: "Banner Shopee Flash Sale", 
    slug: "banner-shopee-flash-sale",
    description: "Thiết kế banner Shopee chuyên nghiệp cho Flash Sale, tối ưu hóa để tăng tỷ lệ click và chuyển đổi.",
    price: 179000,
    discountPrice: 129000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 312,
  },
  {
    title: "Combo Thiết Kế Social Media",
    name: "Combo Thiết Kế Social Media",
    slug: "combo-thiet-ke-social-media",
    description: "Gói combo thiết kế đầy đủ cho social media bao gồm: Facebook cover, Instagram post, Story template.",
    price: 599000,
    discountPrice: 399000,
    category: "combo",
    images: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 67,
  },
  {
    title: "Poster Khai Trương",
    name: "Poster Khai Trương",
    slug: "poster-khai-truong",
    description: "Thiết kế poster khai trương cửa hàng, doanh nghiệp với phong cách chuyên nghiệp và ấn tượng.",
    price: 249000,
    discountPrice: 199000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 45,
  },
  {
    title: "Banner Website Chuyên Nghiệp",
    name: "Banner Website Chuyên Nghiệp",
    slug: "banner-website-chuyen-nghiep",
    description: "Thiết kế banner header website chuyên nghiệp, responsive và tối ưu SEO cho doanh nghiệp.",
    price: 399000,
    discountPrice: null,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 78,
  },
  {
    title: "Poster Nhà Hàng",
    name: "Poster Nhà Hàng",
    slug: "poster-nha-hang",
    description: "Thiết kế poster menu nhà hàng, quán ăn với phong cách hiện đại và thu hút thực khách.",
    price: 279000,
    discountPrice: 229000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 123,
  },
  {
    title: "Banner Instagram Story",
    name: "Banner Instagram Story",
    slug: "banner-instagram-story",
    description: "Thiết kế template Instagram Story chuyên nghiệp cho business, tăng engagement và follower.",
    price: 159000,
    discountPrice: 119000,
    category: "social-media",
    images: ["https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 201,
  },
  {
    title: "Poster Thời Trang",
    name: "Poster Thời Trang",
    slug: "poster-thoi-trang",
    description: "Thiết kế poster quảng cáo thời trang trendy, phù hợp với các brand fashion hiện đại.",
    price: 329000,
    discountPrice: null,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1445205170230-053b83016050?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 56,
  },
  {
    title: "Banner Lazada Sale",
    name: "Banner Lazada Sale",
    slug: "banner-lazada-sale",
    description: "Thiết kế banner Lazada chuyên nghiệp cho các chiến dịch sale lớn, tối ưu conversion rate.",
    price: 189000,
    discountPrice: 139000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 189,
  },
  {
    title: "Poster Công Nghệ",
    name: "Poster Công Nghệ",
    slug: "poster-cong-nghe",
    description: "Thiết kế poster cho các sản phẩm công nghệ, startup với phong cách hiện đại và sáng tạo.",
    price: 359000,
    discountPrice: 299000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 34,
  },
  {
    title: "Banner YouTube Thumbnail",
    name: "Banner YouTube Thumbnail",
    slug: "banner-youtube-thumbnail",
    description: "Thiết kế thumbnail YouTube chuyên nghiệp, tăng CTR và view cho video của bạn.",
    price: 149000,
    discountPrice: 99000,
    category: "social-media",
    images: ["https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 267,
  },
  {
    title: "Poster Giáo Dục",
    name: "Poster Giáo Dục",
    slug: "poster-giao-duc",
    description: "Thiết kế poster cho các khóa học, trung tâm giáo dục với phong cách chuyên nghiệp và tin cậy.",
    price: 269000,
    discountPrice: 219000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 92,
  },
  {
    title: "Banner Bất Động Sản",
    name: "Banner Bất Động Sản",
    slug: "banner-bat-dong-san",
    description: "Thiết kế banner quảng cáo bất động sản chuyên nghiệp, thu hút khách hàng tiềm năng.",
    price: 389000,
    discountPrice: null,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 43,
  },
  {
    title: "Banner TikTok Ads",
    name: "Banner TikTok Ads",
    slug: "banner-tiktok-ads",
    description: "Thiết kế banner quảng cáo TikTok chuyên nghiệp, tối ưu cho Gen Z và millennials.",
    price: 199000,
    discountPrice: 159000,
    category: "social-media",
    images: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 145,
  },
  {
    title: "Poster Du Lịch",
    name: "Poster Du Lịch",
    slug: "poster-du-lich",
    description: "Thiết kế poster quảng cáo tour du lịch, khách sạn, resort với phong cách hấp dẫn và mời gọi.",
    price: 319000,
    discountPrice: null,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"],
    thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 63,
  },
  {
    title: "Banner Email Marketing",
    name: "Banner Email Marketing",
    slug: "banner-email-marketing",
    description: "Thiết kế banner cho email marketing chuyên nghiệp, tăng open rate và click rate.",
    price: 229000,
    discountPrice: 179000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400"],
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

  return sampleData.map((service) => ({
    ...service,
    createdAt: new Date(
      sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    ),
  }));
};

// Hàm seed dữ liệu cho cả hai models
export const seedCombinedServices = async () => {
  try {
    await connectDB();
    
    // Tìm hoặc tạo designer
    let designer = await User.findOne({ role: "designer" });
    
    if (!designer) {
      designer = await User.create({
        username: "designer_sample",
        email: "designer@example.com",
        password: "hashedpassword",
        fullName: "Designer Mẫu",
        role: "designer",
        isVerified: true
      });
      console.log("Đã tạo designer mẫu");
    }
    
    // Xóa dữ liệu cũ
    await Service.deleteMany({});
    await ServicePackage.deleteMany({});
    console.log("Đã xóa dữ liệu cũ của cả Service và ServicePackage");

    // Tạo dữ liệu mới
    const servicesData = createSampleData();
    
    // Seed cho Service model (của Nghia)
    const serviceModelData = servicesData.map(service => ({
      title: service.title,
      description: service.description,
      price: service.price,
      category: service.category,
      designerId: designer._id,
      images: service.images,
      status: "approved",
      createdAt: service.createdAt
    }));
    
    await Service.insertMany(serviceModelData);
    console.log(`Đã tạo ${serviceModelData.length} records cho Service model`);
    
    // Seed cho ServicePackage model (của main)
    const servicePackageData = servicesData.map(service => ({
      name: service.name,
      slug: service.slug,
      description: service.description,
      price: service.price,
      discountPrice: service.discountPrice,
      category: service.category,
      thumbnail: service.thumbnail,
      designer: designer._id, // Thêm designer vào ServicePackage
      isBestSeller: service.isBestSeller || false,
      isFeatured: service.isFeatured || false,
      isActive: true,
      status: "approved",
      soldCount: service.soldCount || 0,
      createdAt: service.createdAt
    }));
    
    await ServicePackage.insertMany(servicePackageData);
    console.log(`Đã tạo ${servicePackageData.length} records cho ServicePackage model`);
    
    // Hiển thị thống kê
    const serviceStats = await Service.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const packageStats = await ServicePackage.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    console.log("\n=== THỐNG KÊ DỮ LIỆU ===");
    console.log(`Service model: ${await Service.countDocuments()} records`);
    console.log(`ServicePackage model: ${await ServicePackage.countDocuments()} records`);
    
    console.log("\nService model theo category:");
    serviceStats.forEach(cat => {
      console.log(`  + ${cat._id}: ${cat.count}`);
    });
    
    console.log("\nServicePackage model theo category:");
    packageStats.forEach(cat => {
      console.log(`  + ${cat._id}: ${cat.count}`);
    });
    
    console.log("\n Seed hoàn tất! Cả hai models đều có data giống nhau.");
    
  } catch (error) {
    console.error(" Lỗi khi seed dữ liệu:", error);
  }
};

// Gọi trực tiếp hàm chạy luôn không cần check điều kiện nữa
seedCombinedServices().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Error running seed:", error);
  process.exit(1);
});