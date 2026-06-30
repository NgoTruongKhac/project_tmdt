import { User } from "../models/user.model.js";
import { Designer } from "../models/designer.model.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";
import cloudinary from "../configs/cloudinary.config.js";

export const getMe = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorHandler("not found user", 401);
    }

    let designerProfile = null;

    if (user.role === "DESIGNER") {
      designerProfile = await Designer.findOne({ userId });
    }

    return res.status(200).json({
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      googleId: user.googleId,
      role: user.role,
      designerProfile,
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

export const transferRoleDesigner = async (req, res, next) => {
  try {
    const userId = req.userId;

    const { age, degree, major, experienceYears, portfolioUrl, skills } =
      req.body;

    // 1. Validate các trường dữ liệu text
    if (
      age === undefined ||
      !degree ||
      !major ||
      experienceYears === undefined ||
      !portfolioUrl ||
      !skills
    ) {
      throw new ErrorHandler("Missing required fields", 400);
    }

    // Parse 'skills' vì khi gửi bằng Form-Data (để upload ảnh), mảng thường bị biến thành string
    let parsedSkills = skills;
    if (typeof skills === "string") {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(",").map((s) => s.trim());
      }
    }

    if (!Array.isArray(parsedSkills)) {
      throw new ErrorHandler("skills must be an array", 400);
    }

    // 2. Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    // 3. Nếu user đã là DESIGNER rồi thì không cho gửi yêu cầu nữa
    if (user.role === "DESIGNER") {
      throw new ErrorHandler("User is already a designer", 400);
    }

    // 4. Kiểm tra xem hồ sơ Designer đã tồn tại chưa
    const existingDesigner = await Designer.findOne({ userId });
    if (existingDesigner) {
      throw new ErrorHandler(
        "Designer profile already exists or is pending approval",
        400,
      );
    }

    // 5. Xử lý upload NHIỀU ảnh chứng chỉ lên Cloudinary (req.files)
    let certificateImages = [];
    if (req.files && req.files.length > 0) {
      // Chạy upload song song các file bằng Promise.all để tối ưu tốc độ
      const uploadPromises = req.files.map((file) => {
        const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        return cloudinary.uploader.upload(fileBase64, {
          folder: "designer_certificates", // Thư mục lưu trên Cloudinary
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      // Gom toàn bộ link secure_url sau khi upload thành công
      certificateImages = uploadResults.map((result) => result.secure_url);
    }

    // 6. Khởi tạo hồ sơ Designer (mặc định status sẽ là "pending" theo schema)
    const designer = await Designer.create({
      userId,
      age,
      degree,
      major,
      experienceYears,
      portfolioUrl,
      skills: parsedSkills,
      certificateImages,
    });

    await user.save();

    return res.status(201).json({
      message: "Transfer role designer request submitted successfully",
      designer,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};
