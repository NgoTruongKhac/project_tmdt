import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { MONGODB_URI } from "../configs/env.js";

const seedDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("đã kết nối MongoDB để tạo data mẫu...");

        // Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại
        await User.deleteMany({});
        await Product.deleteMany({});

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

        // Tạo danh sách sản phẩm gắn với Designer này
        const products = [
            {
                title: "Tạo Logo thương hiệu chuyên nghiệp",
                price: 850000,
                images: [
                    "/uploads/sp1_1.jpg",
                    "/uploads/sp1_2.png",
                ],
                description: "Gói chỉnh sửa cao cấp bao gồm: Frequency Separation, Dodge & Burn chuyên sâu và Color Grading theo phong cách tạp chí Vogue.",
                tags: ["Retouch", "Fashion", "Beauty"],
                designerId: designer._id, // Gắn ID của User vừa tạo ở trên
            },
            {
                title: "Thiết kế Bộ nhận diện thương hiệu Minimalist",
                price: 2500000,
                images: [
                    "/uploads/sp2.jpg"
                ],
                description: "Thiết kế Logo và Brand Guidelines tối giản, sang trọng cho các startup công nghệ hoặc thời trang.",
                tags: ["Branding", "Logo", "Minimalist"],
                designerId: designer._id,
            },
            {
                title: "Thiết kế Logo phong cách tối giản",
                price: 1200000,
                images: [
                    "/uploads/sp3.jpg"
                ],
                description: "Thiết kế logo chuyên nghiệp, tập trung vào sự tối giản và nhận diện thương hiệu mạnh mẽ.",
                tags: ["Logo", "Minimalist", "Branding"],
                designerId: designer._id,
            },
            {
                title: "Chỉnh sửa ảnh chân dung nghệ thuật",
                price: 500000,
                images: [
                    "/uploads/sp4.jpg"
                ],
                description: "Dịch vụ retouch ảnh chân dung, làm đẹp da và cân chỉnh màu sắc chuyên nghiệp.",
                tags: ["Retouch", "Beauty"],
                designerId: designer._id,
            },
            {
                title: "Logo Luxury Fashion Monogram",
                price: 690000,
                images: [
                    "/uploads/sp5.jpg"
                ],
                description: "Logo monogram sang trọng dành cho thương hiệu thời trang cao cấp, thiết kế sẵn và sử dụng ngay.",
                tags: ["Fashion", "Logo", "Luxury"],
                designerId: designer._id,
            },
            {
                title: "Logo Beauty Studio Feminine",
                price: 550000,
                images: [
                    "/uploads/sp6.jpg"
                ],
                description: "Logo phong cách nữ tính phù hợp cho spa, beauty salon hoặc thương hiệu mỹ phẩm.",
                tags: ["Beauty", "Logo", "Feminine"],
                designerId: designer._id,
            },
            {
                title: "Preset Retouch Tone Hàn Quốc",
                price: 350000,
                images: [
                    "/uploads/sp2.jpg"
                ],
                description: "Bộ preset chỉnh màu và retouch phong cách Hàn Quốc dành cho photographer và creator.",
                tags: ["Retouch", "Photography", "Beauty"],
                designerId: designer._id,
            },
            {
                title: "Logo Boutique Fashion Elegant",
                price: 790000,
                images: [
                    "/uploads/sp5.jpg"
                ],
                description: "Thiết kế logo boutique thanh lịch dành cho thương hiệu thời trang nữ.",
                tags: ["Fashion", "Minimalist", "Logo"],
                designerId: designer._id,
            },
            {
                title: "Template Social Media Beauty Brand",
                price: 450000,
                images: [
                    "/uploads/sp6.jpg"
                ],
                description: "Bộ template social media thiết kế sẵn dành cho thương hiệu mỹ phẩm và skincare.",
                tags: ["Beauty", "Branding", "Social"],
                designerId: designer._id,
            },
            {
                title: "Retouch Ảnh Sản Phẩm Chuyên Nghiệp",
                price: 650000,
                images: [
                    "/uploads/sp2.jpg"
                ],
                description: "Chỉnh sửa ảnh sản phẩm chuyên nghiệp cho shop thời trang và mỹ phẩm.",
                tags: ["Retouch", "Fashion", "Ecommerce"],
                designerId: designer._id,
            }
        ];

        await Product.insertMany(products);
        console.log("Đã đổ dữ liệu Product mẫu thành công!");

        mongoose.connection.close();
        console.log("Kết thúc tiến trình.");
    } catch (error) {
        console.error("Lỗi khi seed data:", error);
    }
};

seedDB();