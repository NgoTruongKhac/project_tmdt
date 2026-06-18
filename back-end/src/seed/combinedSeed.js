import { Service } from "../models/service.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import { User } from "../models/user.model.js";
import { Designer } from "../models/designer.model.js";
import { connectDB } from "../databases/mongodb.js";

const designersData = [
  {
    username: "khoacreative",
    email: "khoa@example.com",
    fullName: "Lê Thanh Khoa",
    role: "DESIGNER",
    profilePicture: "https://i.pravatar.cc/300?img=12",
    bio: "Brand Identity & Poster Designer",
    skills: ["Poster", "Branding", "Social Media"],
    rating: 4.9,
    isVerified: true,
  },
  {
    username: "tramstudio",
    email: "tram@example.com",
    fullName: "Phạm Bảo Trâm",
    role: "DESIGNER",
    profilePicture: "https://i.pravatar.cc/300?img=32",
    bio: "Luxury Cosmetic Designer",
    skills: ["Beauty", "Instagram", "Banner"],
    rating: 4.8,
    isVerified: true,
  },
  {
    username: "minhvisual",
    email: "minh@example.com",
    fullName: "Nguyễn Minh",
    role: "DESIGNER",
    profilePicture: "https://i.pravatar.cc/300?img=15",
    bio: "Modern UI Marketing Designer",
    skills: ["UI", "Ads", "Landing Page"],
    rating: 4.7,
    isVerified: true,
  },
  {
    username: "huymedia",
    email: "huy@example.com",
    fullName: "Trần Quốc Huy",
    role: "DESIGNER",
    profilePicture: "https://i.pravatar.cc/300?img=58",
    bio: "Ecommerce Banner Specialist",
    skills: ["Shopee", "Lazada", "TikTok"],
    rating: 4.9,
    isVerified: true,
  },
];

const sampleData = [
  {
    title: "Luxury Cosmetic Campaign Poster",
    name: "Luxury Cosmetic Campaign Poster",
    slug: "luxury-cosmetic-campaign-poster",
    description: "Thiết kế poster mỹ phẩm cao cấp dành cho social media và branding campaign.",
    price: 459000,
    discountPrice: 349000,
    category: "beauty",
    listingType: "product",
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200",
    isBestSeller: true,
    isFeatured: true,
    soldCount: 421,
  },
  {
    title: "Modern Fashion Sale Banner",
    name: "Modern Fashion Sale Banner",
    slug: "modern-fashion-sale-banner",
    description: "Banner sale thời trang hiện đại phù hợp ecommerce và social media.",
    price: 329000,
    discountPrice: 249000,
    category: "fashion",
    listingType: "product",
    images: ["https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 278,
  },
  {
    title: "Shopee Flash Sale Master Banner",
    name: "Shopee Flash Sale Master Banner",
    slug: "shopee-flash-sale-master-banner",
    description: "Thiết kế banner Shopee chuyên nghiệp tối ưu conversion rate.",
    price: 259000,
    discountPrice: 199000,
    category: "ecommerce",
    listingType: "product",
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
    isBestSeller: true,
    isFeatured: true,
    soldCount: 612,
  },
  {
    title: "Restaurant Social Media Poster",
    name: "Restaurant Social Media Poster",
    slug: "restaurant-social-media-poster",
    description: "Poster nhà hàng hiện đại giúp tăng tương tác social media.",
    price: 289000,
    discountPrice: 219000,
    category: "food",
    listingType: "package",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 189,
    revisions: 3,
  },
  {
    title: "Real Estate Premium Banner",
    name: "Real Estate Premium Banner",
    slug: "real-estate-premium-banner",
    description: "Banner bất động sản cao cấp dành cho landing page và quảng cáo.",
    price: 499000,
    discountPrice: 429000,
    category: "real-estate",
    listingType: "package",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 133,
    revisions: 5,
  },
  {
    title: "Tech Startup Launch Poster",
    name: "Tech Startup Launch Poster",
    slug: "tech-startup-launch-poster",
    description: "Poster launch startup công nghệ với phong cách futuristic.",
    price: 389000,
    discountPrice: 299000,
    category: "tech",
    listingType: "package",
    images: ["https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 201,
    revisions: 2,
  },
  {
    title: "Thiết Kế Bộ Nhận Diện Thương Hiệu",
    name: "Thiết Kế Bộ Nhận Diện Thương Hiệu",
    slug: "thiet-ke-bo-nhan-dien-thuong-hieu",
    description: "Dịch vụ thiết kế bộ nhận diện thương hiệu đầy đủ theo yêu cầu, liên hệ để báo giá.",
    price: 3500000,
    discountPrice: null,
    category: "branding",
    listingType: "hire",
    images: ["https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 214,
    revisions: 0,
    deliveryTime: 10,
  },
  {
    title: "Thiết Kế Website Theo Yêu Cầu",
    name: "Thiết Kế Website Theo Yêu Cầu",
    slug: "thiet-ke-website-theo-yeu-cau",
    description: "Dịch vụ thiết kế UI/UX website chuyên nghiệp, làm việc trực tiếp với designer.",
    price: 2000000,
    discountPrice: null,
    category: "tech",
    listingType: "hire",
    images: ["https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 98,
    revisions: 0,
    deliveryTime: 7,
  },
  {
    title: "Content Visual Mạng Xã Hội",
    name: "Content Visual Mạng Xã Hội",
    slug: "content-visual-mang-xa-hoi",
    description: "Dịch vụ thiết kế nội dung visual cho fanpage, Instagram theo yêu cầu.",
    price: 800000,
    discountPrice: null,
    category: "social-media",
    listingType: "hire",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 73,
    revisions: 0,
    deliveryTime: 5,
  },
  {
    title: "Animation Logo & Video Thương Hiệu",
    name: "Animation Logo & Video Thương Hiệu",
    slug: "animation-logo-video-thuong-hieu",
    description: "Dịch vụ làm motion design, animation logo và video intro thương hiệu.",
    price: 2500000,
    discountPrice: null,
    category: "other",
    listingType: "hire",
    images: ["https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 61,
    revisions: 0,
    deliveryTime: 14,
  },
  {
    title: "Bộ Nhận Diện Nhà Hàng Cao Cấp",
    name: "Bộ Nhận Diện Nhà Hàng Cao Cấp",
    slug: "bo-nhan-dien-nha-hang-cao-cap",
    description: "Gói thiết kế nhận diện nhà hàng cao cấp, có thể chỉnh sửa theo yêu cầu.",
    price: 2500000,
    discountPrice: 2100000,
    category: "food",
    listingType: "package",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 128,
    revisions: 3,
  },
  {
    title: "Bộ Branding Thương Hiệu Cá Nhân",
    name: "Bộ Branding Thương Hiệu Cá Nhân",
    slug: "bo-branding-thuong-hieu-ca-nhan",
    description: "Gói thiết kế thương hiệu cá nhân, portfolio, danh thiếp có thể chỉnh sửa.",
    price: 1800000,
    discountPrice: null,
    category: "branding",
    listingType: "package",
    images: ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200",
    isBestSeller: false,
    isFeatured: false,
    soldCount: 57,
    revisions: 2,
  },
  {
    title: "Mega Banner Pack — Đủ Kích Thước",
    name: "Mega Banner Pack — Đủ Kích Thước",
    slug: "mega-banner-pack-du-kich-thuoc",
    description: "Bộ banner đủ kích thước Facebook, Instagram, Google Ads — mua và dùng ngay.",
    price: 250000,
    discountPrice: 199000,
    category: "banner",
    listingType: "product",
    images: ["https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1200"],
    thumbnail: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1200",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 631,
    revisions: 0,
  },
];

const createSampleData = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(
    now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000
  );

  return sampleData.map((service) => ({
    ...service,

    rating: Number((4 + Math.random()).toFixed(1)),
    totalReviews: Math.floor(Math.random() * 300) + 20,
    views: Math.floor(Math.random() * 5000) + 500,
    revisions: Math.floor(Math.random() * 5) + 1,
    deliveryTime: Math.floor(Math.random() * 5) + 1,

    createdAt: new Date(
      sixMonthsAgo.getTime() +
        Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    ),
  }));
};

export const seedCombinedServices = async () => {
  try {
    await connectDB();

    // Xóa dữ liệu cũ
    await Designer.deleteMany({});
    await User.deleteMany({ role: "DESIGNER" });
    await Service.deleteMany({});
    await ServicePackage.deleteMany({});

    console.log("Đã xóa dữ liệu cũ");

    // Tạo users designer
    const designers = await User.insertMany(
      designersData.map((designer) => ({
        ...designer,
        password: "hashedpassword",
      }))
    );

    console.log(`Đã tạo ${designers.length} designer users`);

    // Tạo designer profiles
    const designerProfiles = designers.map((user, index) => ({
      userId: user._id,

      age: 22 + index,

      degree: [
        "Bachelor of Graphic Design",
        "Bachelor of Multimedia",
        "Bachelor of Visual Communication",
        "Bachelor of Fine Arts",
      ][index % 4],

      major: [
        "Graphic Design",
        "Multimedia Design",
        "Visual Communication",
        "Digital Art",
      ][index % 4],

      experienceYears: 2 + index,

      portfolioUrl: `https://behance.net/${user.username}`,

    skills: user.skills || [],
}));

await Designer.insertMany(designerProfiles);

console.log(
    `Đã tạo ${designerProfiles.length} designer profiles`
);

const servicesData = createSampleData();

// Seed Service
const serviceModelData = servicesData.map((service) => {
  const randomDesigner =
      designers[Math.floor(Math.random() * designers.length)];

  return {
    title: service.title,
    description: service.description,
    price: service.price,
    category: service.category,
    designerId: randomDesigner._id,
    images: service.images,
    status: "approved",
    createdAt: service.createdAt,
  };
});

await Service.insertMany(serviceModelData);

// Seed ServicePackage
const servicePackageData = servicesData.map((service) => {
  const randomDesigner =
      designers[Math.floor(Math.random() * designers.length)];

  return {
    name: service.name,
    slug: service.slug,
    description: service.description,
    price: service.price,
    discountPrice: service.discountPrice,
    category: service.category,
    listingType: service.listingType || "package",
    thumbnail: service.thumbnail,
    designer: randomDesigner._id,
    isBestSeller: service.isBestSeller,
    isFeatured: service.isFeatured,
    rating: service.rating,
    totalReviews: service.totalReviews,
    views: service.views,
    revisions: service.revisions ?? 0,
    deliveryTime: service.deliveryTime ?? 3,
    isActive: true,
    status: "approved",
    soldCount: service.soldCount,
    createdAt: service.createdAt,
  };
});

await ServicePackage.insertMany(servicePackageData);

console.log("Seed dữ liệu premium thành công!");

console.log(
    `Users DESIGNER: ${await User.countDocuments({
      role: "DESIGNER",
    })}`
);

console.log(
    `Designer Profiles: ${await Designer.countDocuments()}`
);

console.log(
    `Service: ${await Service.countDocuments()}`
);

console.log(
    `ServicePackage: ${await ServicePackage.countDocuments()}`
);

} catch (error) {
  console.error("Lỗi seed:", error);
}
};

seedCombinedServices()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });