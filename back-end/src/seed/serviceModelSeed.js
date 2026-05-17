import { Service } from "../models/service.model.js";
import { User } from "../models/user.model.js";
import { connectDB } from "../databases/mongodb.js";

const sampleServices = [
  {
    title: "Thiết kế Poster Sự Kiện",
    description: "Thiết kế poster chuyên nghiệp cho các sự kiện, hội thảo, workshop với phong cách hiện đại và thu hút.",
    price: 299000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"],
  },
  {
    title: "Banner Facebook Sale",
    description: "Thiết kế banner quảng cáo Facebook chuyên nghiệp cho các chiến dịch sale, khuyến mãi với tỷ lệ chuyển đổi cao.",
    price: 199000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400"],
  },
  {
    title: "Poster Mỹ Phẩm",
    description: "Thiết kế poster quảng cáo mỹ phẩm sang trọng, tinh tế phù hợp với thương hiệu làm đẹp cao cấp.",
    price: 349000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400"],
  },
  {
    title: "Banner Shopee Flash Sale",
    description: "Thiết kế banner Shopee chuyên nghiệp cho Flash Sale, tối ưu hóa để tăng tỷ lệ click và chuyển đổi.",
    price: 179000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"],
  },
  {
    title: "Combo Thiết Kế Social Media",
    description: "Gói combo thiết kế đầy đủ cho social media bao gồm: Facebook cover, Instagram post, Story template.",
    price: 599000,
    category: "combo",
    images: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400"],
  },
  {
    title: "Poster Khai Trương",
    description: "Thiết kế poster khai trương cửa hàng, doanh nghiệp với phong cách chuyên nghiệp và ấn tượng.",
    price: 249000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400"],
  },
  {
    title: "Banner Website Chuyên Nghiệp",
    description: "Thiết kế banner header website chuyên nghiệp, responsive và tối ưu SEO cho doanh nghiệp.",
    price: 399000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"],
  },
  {
    title: "Poster Nhà Hàng",
    description: "Thiết kế poster menu nhà hàng, quán ăn với phong cách hiện đại và thu hút thực khách.",
    price: 279000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400"],
  },
  {
    title: "Banner Instagram Story",
    description: "Thiết kế template Instagram Story chuyên nghiệp cho business, tăng engagement và follower.",
    price: 159000,
    category: "social-media",
    images: ["https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400"],
  },
  {
    title: "Poster Thời Trang",
    description: "Thiết kế poster quảng cáo thời trang trendy, phù hợp với các brand fashion hiện đại.",
    price: 329000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1445205170230-053b83016050?w=400"],
  },
  {
    title: "Banner Lazada Sale",
    description: "Thiết kế banner Lazada chuyên nghiệp cho các chiến dịch sale lớn, tối ưu conversion rate.",
    price: 189000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400"],
  },
  {
    title: "Poster Công Nghệ",
    description: "Thiết kế poster cho các sản phẩm công nghệ, startup với phong cách hiện đại và sáng tạo.",
    price: 359000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"],
  },
  {
    title: "Banner YouTube Thumbnail",
    description: "Thiết kế thumbnail YouTube chuyên nghiệp, tăng CTR và view cho video của bạn.",
    price: 149000,
    category: "social-media",
    images: ["https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400"],
  },
  {
    title: "Poster Giáo Dục",
    description: "Thiết kế poster cho các khóa học, trung tâm giáo dục với phong cách chuyên nghiệp và tin cậy.",
    price: 269000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400"],
  },
  {
    title: "Banner Bất Động Sản",
    description: "Thiết kế banner quảng cáo bất động sản chuyên nghiệp, thu hút khách hàng tiềm năng.",
    price: 389000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"],
  },
  {
    title: "Banner TikTok Ads",
    description: "Thiết kế banner quảng cáo TikTok chuyên nghiệp, tối ưu cho Gen Z và millennials.",
    price: 199000,
    category: "social-media",
    images: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400"],
  },
  {
    title: "Poster Du Lịch",
    description: "Thiết kế poster quảng cáo tour du lịch, khách sạn, resort với phong cách hấp dẫn và mời gọi.",
    price: 319000,
    category: "poster",
    images: ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"],
  },
  {
    title: "Banner Email Marketing",
    description: "Thiết kế banner cho email marketing chuyên nghiệp, tăng open rate và click rate.",
    price: 229000,
    category: "banner",
    images: ["https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400"],
  },
];

// Hàm seed dữ liệu
export const seedServices = async () => {
  try {
    await connectDB();

    // Tìm một user để làm designer (hoặc tạo user mẫu)
    let designer = await User.findOne({ role: "designer" });

    if (!designer) {
      // Tạo user designer mẫu nếu chưa có
      designer = await User.create({
        username: "designer_sample",
        email: "designer@example.com",
        password: "hashedpassword", // Trong thực tế cần hash
        fullName: "Designer Mẫu",
        role: "designer",
        isVerified: true
      });
      console.log("Đã tạo designer mẫu");
    }

    // Xóa dữ liệu cũ
    await Service.deleteMany({});
    console.log("Đã xóa dữ liệu Service cũ");

    // Tạo dữ liệu mới với designerId
    const servicesData = sampleServices.map(service => ({
      ...service,
      status: "approved",
      designerId: designer._id
    }));

    await Service.insertMany(servicesData);

    console.log(`Đã tạo ${servicesData.length} services mẫu thành công!`);

    // Hiển thị thống kê
    const stats = {
      total: await Service.countDocuments(),
      byCategory: await Service.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ])
    };

    console.log("Thống kê dữ liệu Service:");
    console.log(`- Tổng số services: ${stats.total}`);
    console.log("- Theo category:");
    stats.byCategory.forEach(cat => {
      console.log(`  + ${cat._id}: ${cat.count}`);
    });

  } catch (error) {
    console.error("Lỗi khi seed dữ liệu Service:", error);
  }
};

// Chạy seed nếu file được gọi trực tiếp
seedServices().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Error running seed:", error);
  process.exit(1);
});