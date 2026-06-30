import mongoose from "mongoose";
import { Designer } from "../models/designer.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";
import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js";
import { Order } from "../models/order.model.js";

export const updateProfileDesigner = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { age, degree, major, experienceYears, portfolioUrl, skills } =
      req.body;

    const updateFields = {};
    if (age !== undefined) updateFields.age = age;
    if (degree !== undefined) updateFields.degree = degree;
    if (major !== undefined) updateFields.major = major;
    if (experienceYears !== undefined) {
      updateFields.experienceYears = experienceYears;
    }
    if (portfolioUrl !== undefined) updateFields.portfolioUrl = portfolioUrl;
    if (skills !== undefined) updateFields.skills = skills;

    const updatedDesigner = await Designer.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      message: "Designer profile updated successfully",
      designer: updatedDesigner,
    });
  } catch (error) {
    next(error);
  }
};

export const getDesignerServices = async (req, res, next) => {
  try {
    const { designerId } = req.params;

    const designer = await User.findById(designerId).select(
      "_id fullName profilePicture bio skills rating role",
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy designer",
      });
    }

    const services = await ServicePackage.find({
      designer: designerId,
      isActive: true,
      status: "approved",
    })
      .populate("designer", "fullName profilePicture bio rating")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      designer,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    // req.userId được lấy ra sau khi đi qua middleware verifyToken
    const designerId = req.userId;

    if (!designerId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin định danh Designer",
      });
    }

    // Thực hiện truy vấn song song tất cả các điều kiện để tối ưu tốc độ phản hồi
    const [totalServices, totalServicePackages, totalOrders, revenueResult] =
      await Promise.all([
        // 1. Đếm số lượng sản phẩm thường (Service) dựa vào designerId
        Service.countDocuments({ designerId: designerId }),

        // 2. Đếm số lượng gói sản phẩm (ServicePackage) dựa vào designer (Lưu ý tên trường trong Model là 'designer')
        ServicePackage.countDocuments({ designer: designerId }),

        // 3. Đếm tổng số lượng đơn hàng liên quan đến designer này (Bao gồm cả pending, processing, completed, cancelled)
        Order.countDocuments({ designer: designerId }),

        // 4. Tính toán tổng doanh thu từ các đơn hàng đã 'completed'
        Order.aggregate([
          {
            $match: {
              designer: new mongoose.Types.ObjectId(designerId),
              status: "completed",
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
            },
          },
        ]),
      ]);

    // Trích xuất doanh thu thực tế từ mảng kết quả Aggregate (nếu chưa có đơn nào hoàn tất thì mặc định bằng 0)
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      message: "Lấy dữ liệu thống kê dashboard thành công",
      data: {
        totalServices, // Số lượng sản phẩm thường
        totalServicePackages, // Số lượng gói dịch vụ
        totalOrders, // Tổng số lượng đơn hàng
        totalRevenue, // Tổng doanh thu (đơn hàng completed)
      },
    });
  } catch (error) {
    next(error);
  }
};
