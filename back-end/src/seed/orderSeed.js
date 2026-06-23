import bcrypt from "bcryptjs";
import { connectDB } from "../databases/mongodb.js";
import { User } from "../models/user.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import { Order } from "../models/order.model.js";

const sampleCustomers = [
  {
    email: "customer.one@example.com",
    fullName: "Nguyen Minh Anh",
    profilePicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    email: "customer.two@example.com",
    fullName: "Tran Quoc Huy",
    profilePicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    email: "camt91990@gmail.com",
    fullName: "Cam Tu",
    profilePicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
];

const sampleDesigners = [
  {
    email: "designer.one@example.com",
    fullName: "Le Thanh Khoa",
    bio: "Chuyen thiet ke poster, banner va landing page cho thuong hieu noi dia.",
    profilePicture:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    skills: ["Branding", "Poster", "Social Media"],
    rating: 4.9,
  },
  {
    email: "designer.two@example.com",
    fullName: "Pham Bao Tram",
    bio: "Tu van chien dich thiet ke social media va noi dung thuong hieu.",
    profilePicture:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
    skills: ["Social Media", "Packaging", "Storytelling"],
    rating: 4.8,
  },
];

const samplePackages = [
  {
    name: "Poster Khai Truong Ca Nhan",
    slug: "poster-khai-truong-ca-nhan",
    description:
      "Poster khai truong don gian, dep va thu hut cho ca nhan hoac startup.",
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
    views: 3280,
  },
  {
    name: "Banner Shopee Flash Sale",
    slug: "banner-shopee-flash-sale-seed",
    description:
      "Banner sale chuyen nghiep danh cho kenh thuong mai dien tu, de chinh sua va toi uu hien thi.",
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
    views: 5140,
  },
  {
    name: "Combo thiet ke Instagram Story",
    slug: "combo-thiet-ke-instagram-story",
    description:
      "Goi combo 5 story ngan, noi bat, phu hop gia tang tuong tac tren Instagram.",
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
    views: 2260,
  },
  {
    name: "Banner Bat Dong San",
    slug: "banner-bat-dong-san-seed",
    description:
      "Banner landing page cho du an bat dong san, co focus manh vao hinh anh va thong diep.",
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
    views: 1180,
  },
  {
    name: "Poster My Pham Cao Cap",
    slug: "poster-my-pham-cao-cap",
    description:
      "Poster quang cao my pham voi phong cach sang trong, phu hop chup anh va kenh social.",
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
    views: 1740,
  },
];

const ensureUser = async (userData, role) => {
  const password = await bcrypt.hash("123456", 10);

  return User.findOneAndUpdate(
    { email: userData.email },
    {
      $setOnInsert: {
        ...userData,
        username: userData.email.split("@")[0],
        role,
        password,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );
};

const ensurePackage = async (packageData, designerId) => {
  return ServicePackage.findOneAndUpdate(
    { slug: packageData.slug },
    {
      $set: {
        ...packageData,
        designer: designerId,
      },
    },
    { upsert: true, new: true }
  );
};

const createOrders = async (customers, designers, packages) => {
  const orderDefinitions = [
    {
      orderCode: "ORD-20260524-001",
      customerIndex: 0,
      designerIndex: 0,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "bank_transfer",
      packageIndex: 0,
      notes: "Khach hang dang cho xac nhan thong tin dat thiet ke.",
    },
    {
      orderCode: "ORD-20260524-002",
      customerIndex: 0,
      designerIndex: 0,
      status: "processing",
      paymentStatus: "paid",
      paymentMethod: "momo",
      packageIndex: 1,
      notes: "Don hang dang duoc thiet ke va kiem duyet.",
    },
    {
      orderCode: "ORD-20260524-003",
      customerIndex: 0,
      designerIndex: 0,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "credit_card",
      packageIndex: 2,
      notes: "Khach hang da nhan file thiet ke hoan chinh.",
    },
    {
      orderCode: "ORD-20260524-004",
      customerIndex: 0,
      designerIndex: 1,
      status: "cancelled",
      paymentStatus: "refunded",
      paymentMethod: "bank_transfer",
      packageIndex: 3,
      notes: "Khach hang doi y va yeu cau huy truoc khi bat dau thiet ke.",
      cancellationReason: "Khach hang thay doi nhu cau thiet ke",
      cancelledAt: new Date("2026-05-20T09:30:00.000Z"),
    },
    {
      orderCode: "ORD-20260524-005",
      customerIndex: 1,
      designerIndex: 1,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "bank_transfer",
      packageIndex: 4,
      notes: "Khach hang moi dat poster my pham va dang cho thanh toan.",
    },
    {
      orderCode: "ORD-20260524-006",
      customerIndex: 1,
      designerIndex: 0,
      status: "processing",
      paymentStatus: "paid",
      paymentMethod: "zalopay",
      packageIndex: 0,
      notes: "Designer dang len concept mau dau tien.",
    },
    {
      orderCode: "ORD-20260524-007",
      customerIndex: 1,
      designerIndex: 1,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "momo",
      packageIndex: 1,
      notes: "Da ban giao file banner va file source.",
    },
    {
      orderCode: "ORD-20260524-008",
      customerIndex: 0,
      designerIndex: 1,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "bank_transfer",
      packageIndex: 4,
      notes: "Khach hang hai long voi ban thiet ke cuoi cung.",
    },
    {
      orderCode: "ORD-CAMTU-001",
      customerIndex: 2,
      designerIndex: 0,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "bank_transfer",
      packageIndex: 0,
      notes: "Don hang mau cho Cam Tu dang cho xac nhan.",
    },
    {
      orderCode: "ORD-CAMTU-002",
      customerIndex: 2,
      designerIndex: 1,
      status: "processing",
      paymentStatus: "paid",
      paymentMethod: "momo",
      packageIndex: 1,
      notes: "Don hang mau cho Cam Tu dang duoc designer thuc hien.",
    },
    {
      orderCode: "ORD-CAMTU-003",
      customerIndex: 2,
      designerIndex: 0,
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "credit_card",
      packageIndex: 2,
      notes: "Don hang mau cho Cam Tu da hoan thanh.",
    },
    {
      orderCode: "ORD-CAMTU-004",
      customerIndex: 2,
      designerIndex: 1,
      status: "cancelled",
      paymentStatus: "refunded",
      paymentMethod: "bank_transfer",
      packageIndex: 3,
      notes: "Don hang mau cho Cam Tu da huy.",
      cancellationReason: "Khach hang thay doi lich su dung thiet ke",
      cancelledAt: new Date("2026-05-22T10:15:00.000Z"),
    },
  ];

  const orders = orderDefinitions.map((item) => ({
    customer: customers[item.customerIndex]._id,
    designer: designers[item.designerIndex]._id,
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

  await Order.deleteMany({ orderCode: { $in: orders.map((order) => order.orderCode) } });
  await Order.insertMany(orders);
};

export const seedOrders = async () => {
  try {
    await connectDB();

    const [customerOne, customerTwo, camTuCustomer, designerOne, designerTwo] = await Promise.all([
      ensureUser(sampleCustomers[0], "CUSTOMER"),
      ensureUser(sampleCustomers[1], "CUSTOMER"),
      ensureUser(sampleCustomers[2], "CUSTOMER"),
      ensureUser(sampleDesigners[0], "DESIGNER"),
      ensureUser(sampleDesigners[1], "DESIGNER"),
    ]);

    const packages = await Promise.all(
      samplePackages.map((packageData, index) =>
        ensurePackage(packageData, index % 2 === 0 ? designerOne._id : designerTwo._id)
      )
    );

    await createOrders(
      [customerOne, customerTwo, camTuCustomer],
      [designerOne, designerTwo],
      packages
    );

    console.log("=== Seed orders hoan tat ===");
    console.log(`Customers: ${await User.countDocuments({ role: "CUSTOMER" })}`);
    console.log(`Designers: ${await User.countDocuments({ role: "DESIGNER" })}`);
    console.log(`Service packages: ${await ServicePackage.countDocuments()}`);
    console.log(`Orders: ${await Order.countDocuments()}`);
    console.log(`Customer thu nhat: ${customerOne.fullName}`);
    console.log(`Customer thu hai: ${customerTwo.fullName}`);
    console.log(`Customer Cam Tu: ${camTuCustomer.email}`);
    console.log("Tai khoan test customer:");
    console.log("- customer.one@example.com / 123456");
    console.log("- customer.two@example.com / 123456");
    console.log("- camt91990@gmail.com / 123456");
  } catch (error) {
    console.error("Loi khi seed don hang:", error);
    process.exitCode = 1;
  }
};

seedOrders()
  .then(() => process.exit(process.exitCode || 0))
  .catch((error) => {
    console.error("Error running order seed:", error);
    process.exit(1);
  });
