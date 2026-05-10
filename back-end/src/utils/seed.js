import mongoose from "mongoose";
import { User } from "../models/user.model.js"; // Nhớ sửa đường dẫn đúng file model của bạn
import { Product } from "../models/product.model.js";
import { MONGODB_URI } from "../configs/env.js";

const seedDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("đã kết nối MongoDB để tạo data mẫu...");

        // Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại
        await User.deleteMany({});
        await Product.deleteMany({});

        // 2. Tạo một Designer mẫu
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

        // 3. Tạo danh sách sản phẩm gắn với Designer này
        const products = [
            {
                title: "Tạo Logo thương hiệu chuyên nghiệp",
                price: 850000,
                images: [
                    "https://www.adobe.com/vn_vi/creativecloud/design/discover/media_18d7880f1d255e1e6c2c8825c582df658cf82b52a.jpg?width=1200&format=pjpg&optimize=medium",
                    "https://www.adobe.com/vn_vi/creativecloud/design/discover/media_149ca218b519af0eac9762c5e42519dc172f9223d.png?width=2000&format=webply&optimize=medium",
                ],
                description: "Gói chỉnh sửa cao cấp bao gồm: Frequency Separation, Dodge & Burn chuyên sâu và Color Grading theo phong cách tạp chí Vogue.",
                tags: ["Retouch", "Fashion", "Beauty"],
                designerId: designer._id, // Gắn ID của User vừa tạo ở trên
            },
            {
                title: "Thiết kế Bộ nhận diện thương hiệu Minimalist",
                price: 2500000,
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiDsx549P-gTt4_67AGzEoxv_H0liCxjReaA&s",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXkkBOos9e42vnoWfJVRrSLIUsept-j8eo_A&s"
                ],
                description: "Thiết kế Logo và Brand Guidelines tối giản, sang trọng cho các startup công nghệ hoặc thời trang.",
                tags: ["Branding", "Logo", "Minimalist"],
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