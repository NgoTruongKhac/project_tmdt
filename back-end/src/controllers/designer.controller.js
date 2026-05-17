import { Designer } from "../models/designer.model.js"; // Nhớ thêm đuôi .js
import ErrorHandler from "../middlewares/errors/ErrorHandler.js"; // Cần import ErrorHandler

export const updateProfileDesigner = async (req, res, next) => {
  try {
    const userId = req.userId; // Lấy từ verifyToken middleware

    // Rút trích các trường cần update, tuyệt đối không lấy password/email ở đây
    const { age, degree, major, experienceYears, portfolioUrl, skills } =
      req.body;

    // Lọc ra các trường có giá trị được gửi lên để tránh ghi đè bằng undefined
    const updateFields = {};
    if (age !== undefined) updateFields.age = age;
    if (degree !== undefined) updateFields.degree = degree;
    if (major !== undefined) updateFields.major = major;
    if (experienceYears !== undefined)
      updateFields.experienceYears = experienceYears;
    if (portfolioUrl !== undefined) updateFields.portfolioUrl = portfolioUrl;
    if (skills !== undefined) updateFields.skills = skills;

    // Tìm và cập nhật theo userId (đây là reference từ User model)
    const updatedDesigner = await Designer.findOneAndUpdate(
      { userId: userId },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }, // upsert: true giúp tạo mới nếu chưa tồn tại
    );

    return res.status(200).json({
      message: "Designer profile updated successfully",
      designer: updatedDesigner,
    });
  } catch (error) {
    next(error);
  }
};
