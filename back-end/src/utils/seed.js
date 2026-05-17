import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js"; // Đổi từ Product sang Service
import { MONGODB_URI } from "../configs/env.js";

const seedDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Đã kết nối MongoDB để tạo data mẫu...");

        // Xóa dữ liệu cũ để tránh trùng lặp
        await User.deleteMany({});
        await Service.deleteMany({}); // Xóa bảng Service mới

        // Tạo một Designer mẫu
        const designer = await User.create({
            fullName: "Julian Nguyen",
            password: "nguyen123",
            email: "julian@studio.com",
            role: "designer",
            profilePicture: "https://hthaostudio.com/wp-content/uploads/2024/10/Anh-profile-nam-dep-6-min.jpg",
            skills: ["Retouching", "Branding", "UI/UX"],
            bio: "Chuyên gia thiết kế logo với hơn 10 năm kinh nghiệm làm việc cùng các thương hiệu lớn.",
            rating: 4.9,
        });

        console.log("Đã tạo User Designer thành công!");

        // Tạo danh sách dịch vụ gắn với Designer này
        const services = [
            {
                title: "Tạo Logo thương hiệu chuyên nghiệp",
                price: 850000,
                category: "Logo Design", // Thêm category (bắt buộc theo model mới)
                images: [
                    "/uploads/sp1_1.jpg",
                    "/uploads/sp1_2.png",
                ],
                description: "Gói chỉnh sửa cao cấp bao gồm: Frequency Separation, Dodge & Burn chuyên sâu và Color Grading theo phong cách tạp chí Vogue.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Thiết kế Bộ nhận diện thương hiệu Minimalist",
                price: 2500000,
                category: "Branding",
                images: ["/uploads/sp2.jpg"],
                description: "Thiết kế Logo và Brand Guidelines tối giản, sang trọng cho các startup công nghệ hoặc thời trang.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Thiết kế Logo phong cách tối giản",
                price: 1200000,
                category: "Logo Design",
                images: ["/uploads/sp3.jpg"],
                description: "Thiết kế logo chuyên nghiệp, tập trung vào sự tối giản và nhận diện thương hiệu mạnh mẽ.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Chỉnh sửa ảnh chân dung nghệ thuật",
                price: 500000,
                category: "Photography",
                images: ["/uploads/sp4.jpg"],
                description: "Dịch vụ retouch ảnh chân dung, làm đẹp da và cân chỉnh màu sắc chuyên nghiệp.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Logo Luxury Fashion Monogram",
                price: 690000,
                category: "Logo Design",
                images: ["/uploads/sp5.jpg"],
                description: "Logo monogram sang trọng dành cho thương hiệu thời trang cao cấp, thiết kế sẵn và sử dụng ngay.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Logo Beauty Studio Feminine",
                price: 550000,
                category: "Logo Design",
                images: ["/uploads/sp6.jpg"],
                description: "Logo phong cách nữ tính phù hợp cho spa, beauty salon hoặc thương hiệu mỹ phẩm.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Preset Retouch Tone Hàn Quốc",
                price: 350000,
                category: "Retouching",
                images: ["/uploads/sp2.jpg"],
                description: "Bộ preset chỉnh màu và retouch phong cách Hàn Quốc dành cho photographer và creator.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Logo Boutique Fashion Elegant",
                price: 790000,
                category: "Logo Design",
                images: ["/uploads/sp5.jpg"],
                description: "Thiết kế logo boutique thanh lịch dành cho thương hiệu thời trang nữ.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Template Social Media Beauty Brand",
                price: 450000,
                category: "Social Media",
                images: ["/uploads/sp6.jpg"],
                description: "Bộ template social media thiết kế sẵn dành cho thương hiệu mỹ phẩm và skincare.",
                designerId: designer._id,
                status: "approved"
            },
            {
                title: "Retouch Ảnh Sản Phẩm Chuyên Nghiệp",
                price: 650000,
                category: "Retouching",
                images: ["/uploads/sp2.jpg"],
                description: "Chỉnh sửa ảnh sản phẩm chuyên nghiệp cho shop thời trang và mỹ phẩm.",
                designerId: designer._id,
                status: "approved"
            }
        ];

        await Service.insertMany(services);
        console.log("Đã đổ dữ liệu Service mẫu thành công!");

        mongoose.connection.close();
        console.log("Kết thúc tiến trình.");
    } catch (error) {
        console.error("Lỗi khi seed data:", error);
    }
};

seedDB();