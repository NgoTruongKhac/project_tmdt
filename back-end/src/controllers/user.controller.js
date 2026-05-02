import { User } from "../models/user.model.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";
import cloudinary from "../configs/cloudinary.config.js";

export const getMe = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorHandler("not found user", 401);
    }

    return res.status(200).json({
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    //1. get userId from request after verify accesstoken
    const userId = req.userId;

    // 2. Kiểm tra xem file đã được upload chưa (nhờ multer)
    if (!req.file) {
      throw new ErrorHandler("Không có file nào được tải lên.", 400);
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64; // 4. Upload ảnh lên Cloudinary

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "profile_pictures",
      //Tạo một ID cố định và duy nhất cho ảnh của user này
      public_id: `user_${userId}`,
      //Cho phép Cloudinary ghi đè lên file có public_id trùng**
      overwrite: true,
      // (Tùy chọn) Xóa cache CDN ngay lập tức để user thấy ảnh mới
      invalidate: true,
      // overwrite: true
    });

    // 5. Lấy URL an toàn (https) từ kết quả
    const imageUrl = result.secure_url; // 6. Lưu đường dẫn ảnh vào profilePicture trong MongoDB

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }, // Tùy chọn này để trả về document đã được cập nhật
    );

    if (!updatedUser) {
      throw new ErrorHandler("Không tìm thấy người dùng", 404);
    } // 7. Trả về thông báo thành công và ảnh mới

    return res.status(200).json({
      message: "Cập nhật ảnh đại diện thành công",
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    next(error);
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId; // Lấy từ verifyToken middleware
    const { fullName } = req.body;

    if (!fullName) {
      throw new ErrorHandler("fullName is required", 400);
    }

    // Cập nhật fullName
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true, runValidators: true }, // new: true để trả về document sau khi update
    );

    if (!updatedUser) {
      throw new ErrorHandler("User not found", 404);
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      fullName: updatedUser.fullName,
    });
  } catch (error) {
    next(error);
  }
};
