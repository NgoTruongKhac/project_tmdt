import { User } from "../models/user.model.js";
import { Designer } from "../models/designer.model.js";
import { connectDB } from "../databases/mongodb.js";
import bcrypt from "bcryptjs";
const realNames = [
    "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Cường", "Phạm Thu Dung",
    "Hoàng Văn Đạt", "Vũ Thị Giang", "Đặng Minh Hải", "Bùi Thị Hương",
    "Đỗ Văn Kiên", "Hồ Thu Linh", "Ngô Văn Nam", "Dương Thị Oanh",
    "Lý Văn Phát", "Đào Thị Quỳnh", "Đoàn Văn Sơn"
];

// Tạo mảng 15 hồ sơ chờ duyệt tự động
const pendingApplications = Array.from({ length: 15 }).map((_, index) => {
    const emailPrefix = realNames[index].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').toLowerCase();
    return {
        email: `${emailPrefix}@example.com`,
        fullName: realNames[index],
        bio: `Xin chào, tôi là ${realNames[index]}. Tôi có niềm đam mê mãnh liệt với thiết kế sáng tạo và luôn mong muốn mang đến những sản phẩm chất lượng cao, tối ưu trải nghiệm người dùng cho hệ thống của bạn.`,
        role: "CUSTOMER",
        age: 22 + (index % 8),
        degree: index % 2 === 0 ? "Cử nhân Thiết kế Đồ họa" : "Cao đẳng Mỹ thuật",
        major: index % 2 === 0 ? "Graphic Design" : "Digital Art",
        experienceYears: (index % 5) + 1,
        portfolioUrl: `https://behance.net/${emailPrefix}`,
        skills: ["Photoshop", "Illustrator", "Figma", "UI/UX"].slice(0, (index % 3) + 2),
        status: "pending",
        rejectReason: ""
    };
});

// Thêm các hồ sơ Đã duyệt và Từ chối
const otherApplications = [
    {
        email: "chuyennghiep@example.com", fullName: "Nguyễn Chuyên Nghiệp", role: "DESIGNER",
        bio: "Designer Senior với 6 năm kinh nghiệm thực chiến tại các agency lớn.",
        age: 28, degree: "Cử nhân Truyền thông Đa phương tiện", major: "Multimedia Design",
        experienceYears: 6, portfolioUrl: "https://behance.net/nguyenchuyennghiep",
        skills: ["Branding", "Packaging", "3D"], status: "approved", rejectReason: ""
    },
    {
        email: "uytin@example.com", fullName: "Phạm Uy Tín", role: "DESIGNER",
        bio: "Chuyên gia làm Animation và Motion Graphic cho các brand quốc tế.",
        age: 30, degree: "Thạc sĩ Nghệ thuật", major: "Visual Communication",
        experienceYears: 8, portfolioUrl: "https://behance.net/phamuytin",
        skills: ["Motion Graphics", "Video Editing"], status: "approved", rejectReason: ""
    },
    {
        email: "bihuy1@example.com", fullName: "Trần Bị Hủy", role: "CUSTOMER",
        bio: "Đang tự học thiết kế qua mạng, mong muốn tìm cơ hội cọ xát.",
        age: 20, degree: "Tự học", major: "Self-taught",
        experienceYears: 0, portfolioUrl: "https://dribbble.com/tranbihuy",
        skills: ["Canva", "Paint"], status: "rejected", rejectReason: "Portfolio chưa đủ chất lượng chuyên môn. Vui lòng bổ sung thêm các dự án thực tế."
    }
];

const allApplications = [...pendingApplications, ...otherApplications];

export const seedDesigners = async () => {
    try {
        await connectDB();
        await Designer.deleteMany({});
        console.log("=== Đã dọn dẹp dữ liệu Designer profile cũ ===");

        const password = await bcrypt.hash("123456", 10);

        for (const app of allApplications) {
            // Xóa User cũ nếu trùng email để tránh lỗi
            await User.findOneAndDelete({ email: app.email });

            // Tạo User mới tích hợp luôn bio
            const user = await User.create({
                username: app.email.split("@")[0],
                email: app.email,
                fullName: app.fullName,
                password: password,
                role: app.role,
                bio: app.bio, // Đã thêm bio vào User
                isActive: true,
                isVerified: true
            });

            // Tạo Designer profile liên kết với User
            await Designer.create({
                userId: user._id,
                age: app.age,
                degree: app.degree,
                major: app.major,
                experienceYears: app.experienceYears,
                portfolioUrl: app.portfolioUrl,
                skills: app.skills,
                status: app.status,
                rejectReason: app.rejectReason
            });
        }

        console.log("=== Seed dữ liệu Hồ sơ Designer hoàn tất! ===");
        console.log(`- Đã tạo ${allApplications.length} hồ sơ (Gồm 15 Chờ duyệt, 2 Đã duyệt, và 1 Từ chối).`);
    } catch (error) {
        console.error("Lỗi khi chạy seed Designer:", error);
        process.exitCode = 1;
    }
};

seedDesigners().then(() => process.exit(process.exitCode || 0));