import { Voucher } from "../models/voucher.model.js";
import { connectDB } from "../databases/mongodb.js";

const sampleVouchers = [
    { code: "SUMMER20", discountPercentage: 20, maxUsage: 100, usedCount: 15, expiresAt: new Date("2026-08-31T23:59:59.000Z"), isActive: true },
    { code: "WELCOME50", discountPercentage: 50, maxUsage: 500, usedCount: 120, expiresAt: new Date("2026-12-31T23:59:59.000Z"), isActive: true },
    { code: "VIPDESIGN", discountPercentage: 15, maxUsage: 50, usedCount: 50, expiresAt: new Date("2026-07-15T23:59:59.000Z"), isActive: true },
    { code: "EXPIRED10", discountPercentage: 10, maxUsage: 200, usedCount: 5, expiresAt: new Date("2026-05-01T00:00:00.000Z"), isActive: true },
    { code: "PROMO30", discountPercentage: 30, maxUsage: 100, usedCount: 0, expiresAt: new Date("2026-09-30T23:59:59.000Z"), isActive: false },
    { code: "WINTER15", discountPercentage: 15, maxUsage: 150, usedCount: 45, expiresAt: new Date("2026-11-30T23:59:59.000Z"), isActive: true },
    { code: "SPRING25", discountPercentage: 25, maxUsage: 80, usedCount: 10, expiresAt: new Date("2026-04-30T23:59:59.000Z"), isActive: true },
    { code: "AUTUMN10", discountPercentage: 10, maxUsage: 300, usedCount: 295, expiresAt: new Date("2026-10-31T23:59:59.000Z"), isActive: true },
    { code: "BLACKFRIDAY", discountPercentage: 70, maxUsage: 1000, usedCount: 999, expiresAt: new Date("2026-11-27T23:59:59.000Z"), isActive: true },
    { code: "CYBERMONDAY", discountPercentage: 40, maxUsage: 200, usedCount: 200, expiresAt: new Date("2026-11-30T23:59:59.000Z"), isActive: true },
    { code: "FASHION05", discountPercentage: 5, maxUsage: 50, usedCount: 2, expiresAt: new Date("2026-07-01T23:59:59.000Z"), isActive: true },
    { code: "TECHBRAND", discountPercentage: 35, maxUsage: 120, usedCount: 40, expiresAt: new Date("2026-08-15T23:59:59.000Z"), isActive: true },
    { code: "NEWUSER100", discountPercentage: 100, maxUsage: 10, usedCount: 10, expiresAt: new Date("2026-12-25T23:59:59.000Z"), isActive: true },
    { code: "DESIGNFREE", discountPercentage: 100, maxUsage: 5, usedCount: 0, expiresAt: new Date("2026-06-30T23:59:59.000Z"), isActive: false },
    { code: "GIFTCON", discountPercentage: 8, maxUsage: 250, usedCount: 12, expiresAt: new Date("2026-09-05T23:59:59.000Z"), isActive: true }
];

export const seedVouchers = async () => {
    try {
        await connectDB();

        await Voucher.deleteMany({});
        console.log("=== Đã xóa dữ liệu Voucher cũ ===");

        await Voucher.insertMany(sampleVouchers);

        console.log("=== Seed dữ liệu 15 Voucher hoàn tất! ===");
        console.log(`- Tổng số mã đã tạo thành công: ${await Voucher.countDocuments()}`);
        console.log("- Bạn có thể ra trình duyệt mở trang Voucher để test phân trang 10 dòng/trang.");

    } catch (error) {
        console.error("Lỗi khi chạy seed Voucher:", error);
        process.exitCode = 1;
    }
};

seedVouchers()
    .then(() => process.exit(process.exitCode || 0))
    .catch((error) => {
        console.error("Error running voucher seed:", error);
        process.exit(1);
    });