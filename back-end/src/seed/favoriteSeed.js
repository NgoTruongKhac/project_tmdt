import { Favorite } from "../models/favorite.model.js";
import { User } from "../models/user.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import { connectDB } from "../databases/mongodb.js";

// Hàm tạo dữ liệu yêu thích mẫu
export const seedFavorites = async () => {
  try {
    await connectDB();
    
    // Lấy danh sách users và services
    const users = await User.find().limit(3);
    const services = await ServicePackage.find({ isActive: true }).limit(10);
    
    if (users.length === 0) {
      console.log("Không có user nào trong database. Vui lòng tạo user trước.");
      return;
    }
    
    if (services.length === 0) {
      console.log("Không có service nào trong database. Vui lòng chạy service seed trước.");
      return;
    }
    
    // Xóa dữ liệu cũ
    await Favorite.deleteMany({});
    console.log("Đã xóa dữ liệu yêu thích cũ");
    
    // Tạo dữ liệu yêu thích mẫu
    const favoriteData = [];
    
    users.forEach((user, userIndex) => {
      // Mỗi user sẽ có 3-5 gói yêu thích ngẫu nhiên
      const favoriteCount = Math.floor(Math.random() * 3) + 3; // 3-5 favorites
      const userServices = services
        .sort(() => 0.5 - Math.random())
        .slice(0, favoriteCount);
      
      userServices.forEach(service => {
        favoriteData.push({
          user: user._id,
          service: service._id,
        });
      });
    });
    
    // Tạo favorites
    await Favorite.insertMany(favoriteData);
    
    console.log(`Đã tạo ${favoriteData.length} yêu thích mẫu thành công!`);
    
    // Hiển thị thống kê
    const stats = {
      total: await Favorite.countDocuments(),
      byUser: await Favorite.aggregate([
        {
          $group: {
            _id: "$user",
            count: { $sum: 1 }
          }
        }
      ])
    };
    
    console.log("Thống kê dữ liệu yêu thích:");
    console.log(`- Tổng số yêu thích: ${stats.total}`);
    console.log(`- Số user có yêu thích: ${stats.byUser.length}`);
    
  } catch (error) {
    console.error("Lỗi khi seed dữ liệu yêu thích:", error);
  }
};

// Chạy seed nếu file được gọi trực tiếp
seedFavorites().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Error running favorite seed:", error);
  process.exit(1);
});