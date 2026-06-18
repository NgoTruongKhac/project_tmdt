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
    description:
      "Thiết kế poster mỹ phẩm cao cấp dành cho social media và branding campaign.",
    price: 459000,
    discountPrice: 349000,
    category: "beauty",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200",
    isBestSeller: true,
    isFeatured: true,
    soldCount: 421,
  },

  {
    title: "Modern Fashion Sale Banner",
    name: "Modern Fashion Sale Banner",
    slug: "modern-fashion-sale-banner",
    description:
      "Banner sale thời trang hiện đại phù hợp ecommerce và social media.",
    price: 329000,
    discountPrice: 249000,
    category: "fashion",
    images: [
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 278,
  },

  {
    title: "Shopee Flash Sale Master Banner",
    name: "Shopee Flash Sale Master Banner",
    slug: "shopee-flash-sale-master-banner",
    description:
      "Thiết kế banner Shopee chuyên nghiệp tối ưu conversion rate.",
    price: 259000,
    discountPrice: 199000,
    category: "ecommerce",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
    isBestSeller: true,
    isFeatured: true,
    soldCount: 612,
  },

  {
    title: "Restaurant Social Media Poster",
    name: "Restaurant Social Media Poster",
    slug: "restaurant-social-media-poster",
    description:
      "Poster nhà hàng hiện đại giúp tăng tương tác social media.",
    price: 289000,
    discountPrice: 219000,
    category: "food",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 189,
  },

  {
    title: "Real Estate Premium Banner",
    name: "Real Estate Premium Banner",
    slug: "real-estate-premium-banner",
    description:
      "Banner bất động sản cao cấp dành cho landing page và quảng cáo.",
    price: 499000,
    discountPrice: 429000,
    category: "real-estate",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
    isBestSeller: false,
    isFeatured: true,
    soldCount: 133,
  },

  {
    title: "Tech Startup Launch Poster",
    name: "Tech Startup Launch Poster",
    slug: "tech-startup-launch-poster",
    description:
      "Poster launch startup công nghệ với phong cách futuristic.",
    price: 389000,
    discountPrice: 299000,
    category: "tech",
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200",
    isBestSeller: true,
    isFeatured: false,
    soldCount: 201,
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
    thumbnail: service.thumbnail,

    designer: randomDesigner._id,

    isBestSeller: service.isBestSeller,
    isFeatured: service.isFeatured,

    rating: service.rating,
    totalReviews: service.totalReviews,
    views: service.views,

    revisions: service.revisions,
    deliveryTime: service.deliveryTime,

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