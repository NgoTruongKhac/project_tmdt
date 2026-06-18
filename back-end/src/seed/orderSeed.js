import bcrypt from "bcryptjs";
import { connectDB } from "../databases/mongodb.js";
import { User } from "../models/user.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import { Order } from "../models/order.model.js";

const sampleCustomers = [
  {
    email: "customer.one@example.com",
    fullName: "Nguyễn Minh Anh",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    email: "customer.two@example.com",
    fullName: "Trần Quốc Huy",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
];

const sampleDesigners = [
  {
    email: "designer.one@example.com",
    fullName: "Lê Thanh Khoa",
    bio: "Chuyên thiết kế poster, banner và landing page cho thương hiệu nội địa.",
    profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    skills: ["Branding", "Poster", "Social Media"],
    rating: 4.9,
  },
  {
    email: "designer.two@example.com",
    fullName: "Phạm Bảo Trâm",
    bio: "Tư vấn chiến dịch thiết kế social media và nội dung thương hiệu.",
    profilePicture: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
    skills: ["Social Media", "Packaging", "Storytelling"],
    rating: 4.8,
  },
];

const samplePackages = [
  {
    name: "Poster Khai Trương Cá Nhân",
    slug: "poster-khai-truong-ca-nhan",
    description: "Poster khai trương đơn giản, đẹp và thu hút cho cá nhân hoặc startup.",
    price: 249000,
    discountPrice: 199000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400",
    revisions: 2,
    deliveryTime: 2,
    isBestSeller: true,
    isFeatured: true,
    isActive: true,
    status: "approved",
    soldCount: 145,
  },
  {
    name: "Banner Shopee Flash Sale",
    slug: "banner-shopee-flash-sale-seed",
    description: "Banner sale chuyên nghiệp dành cho kênh thương mại điện tử, dễ chỉnh sửa và tối ưu hiển thị.",
    price: 189000,
    discountPrice: 149000,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    revisions: 3,
    deliveryTime: 3,
    isBestSeller: true,
    isFeatured: false,
    isActive: true,
    status: "approved",
    soldCount: 212,
  },
  {
    name: "Combo thiết kế Instagram Story",
    slug: "combo-thiet-ke-instagram-story",
    description: "Gói combo 5 story ngắn, nổi bật, phù hợp gia tăng tương tác trên Instagram.",
    price: 399000,
    discountPrice: 349000,
    category: "social-media",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    revisions: 4,
    deliveryTime: 4,
    isBestSeller: false,
    isFeatured: true,
    isActive: true,
    status: "approved",
    soldCount: 88,
  },
  {
    name: "Banner Bất Động Sản",
    slug: "banner-bat-dong-san-seed",
    description: "Banner landing page cho dự án bất động sản, có focus mạnh vào hình ảnh và thông điệp.",
    price: 389000,
    discountPrice: null,
    category: "banner",
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
    revisions: 2,
    deliveryTime: 5,
    isBestSeller: false,
    isFeatured: false,
    isActive: true,
    status: "approved",
    soldCount: 47,
  },
  {
    name: "Poster Mỹ Phẩm Cao Cấp",
    slug: "poster-my-pham-cao-cap",
    description: "Poster quảng cáo mỹ phẩm với phong cách sang trọng, phù hợp chụp ảnh và kênh social.",
    price: 329000,
    discountPrice: 279000,
    category: "poster",
    thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    revisions: 2,
    deliveryTime: 2,
    isBestSeller: false,
    isFeatured: true,
    isActive: true,
    status: "approved",
    soldCount: 63,
  },
];

const ensureUser = async (userData, role) => {
  const password = await bcrypt.hash("123456", 10);

  const doc = await User.findOneAndUpdate(
    { email: userData.email },
    {
      $setOnInsert: {
        ...userData,
        role,
        password,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );

  return doc;
};

const ensurePackage = async (packageData, designerId) => {
  const doc = await ServicePackage.findOneAndUpdate(
    { slug: packageData.slug },
    {
      $set: {
        ...packageData,
        designer: designerId,
      },
    },
    { upsert: true, new: true }
  );

  return doc;
};

const createOrders = async (customerId, designerId, packages) => {
  const orderDefinitions = [
    {
      orderCode: "ORD-20260524-001",
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "bank_transfer",
      packageIndex: 0,
      notes: "Khách hàng đang chờ xác nhận thông tin đặt thiết kế.",
    },
    {
      orderCode: "ORD-20260524-002",
      status: "processing",
      paymentStatus: "paid",
      paymentMethod: "momo",
      packageIndex: 1,
      notes: "Đơn hàng đang được thiết kế và kiểm duyệt.",
    },
    {
      orderCode: "ORD-20260524-003",
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "credit_card",
      packageIndex: 2,
      notes: "Khách hàng đã nhận file thiết kế hoàn chỉnh.",
    },
    {
      orderCode: "ORD-20260524-004",
      status: "cancelled",
      paymentStatus: "refunded",
      paymentMethod: "bank_transfer",
      packageIndex: 3,
      notes: "Khách hàng đổi ý và yêu cầu hủy trước khi bắt đầu thiết kế.",
      cancellationReason: "Khách hàng thay đổi nhu cầu thiết kế",
      cancelledAt: new Date("2026-05-20T09:30:00.000Z"),
    },
  ];

  const orders = orderDefinitions.map((item) => ({
    customer: customerId,
    designer: designerId,
    servicePackage: packages[item.packageIndex]._id,
    orderCode: item.orderCode,
    status: item.status,
    paymentStatus: item.paymentStatus,
    paymentMethod: item.paymentMethod,
    totalAmount: packages[item.packageIndex].price,
    currency: "VND",
    notes: item.notes,
    cancellationReason: item.cancellationReason || "",
    cancelledAt: item.cancelledAt || null,
  }));

  await Order.deleteMany({});
  await Order.insertMany(orders);
};

export const seedOrders = async () => {
  try {
    await connectDB();

    const [customerOne, customerTwo, designerOne, designerTwo] = await Promise.all([
      ensureUser(sampleCustomers[0], "customer"),
      ensureUser(sampleCustomers[1], "customer"),
      ensureUser(sampleDesigners[0], "DESIGNER"),
      ensureUser(sampleDesigners[1], "DESIGNER"),
    ]);

    const designerId = designerOne._id;

    const packages = await Promise.all(
      samplePackages.map((packageData) => ensurePackage(packageData, designerId))
    );

    await createOrders(customerOne._id, designerId, packages);

    console.log("=== Seed orders hoàn tất ===");
    console.log(`Customers: ${await User.countDocuments({ role: "customer" })}`);
    console.log(`Designers: ${await User.countDocuments({ role: "DESIGNER" })}`);
    console.log(`Service packages: ${await ServicePackage.countDocuments()}`);
    console.log(`Orders: ${await Order.countDocuments()}`);

    console.log(`Designer thứ nhất: ${designerOne.fullName}`);
    console.log(`Customer thứ nhất: ${customerOne.fullName}`);
    console.log(`Customer thứ hai: ${customerTwo.fullName}`);
  } catch (error) {
    console.error("Lỗi khi seed đơn hàng:", error);
    process.exitCode = 1;
  }
};

seedOrders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error running order seed:", error);
    process.exit(1);
  });
