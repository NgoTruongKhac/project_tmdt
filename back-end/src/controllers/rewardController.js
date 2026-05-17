import { User } from "../models/user.model.js";
import { RewardPointHistory } from "../models/RewardPointHistory.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Cập nhật hạng thành viên
const updateMembershipRank = async (user) => {
  // Tính tổng điểm đã nhận (chỉ tính loại 'earn')
  const histories = await RewardPointHistory.find({ user: user._id, type: "earn" });
  const totalEarned = histories.reduce((sum, h) => sum + h.points, 0);

  let newLevel = "Bronze";
  if (totalEarned >= 5000) newLevel = "Platinum";
  else if (totalEarned >= 2000) newLevel = "Gold";
  else if (totalEarned >= 500) newLevel = "Silver";

  if (user.membershipLevel !== newLevel) {
    user.membershipLevel = newLevel;
    await user.save();
  }
};

/**
 * Hàm cộng điểm (có thể import để dùng sau khi thanh toán thành công)
 */
export const earnPointsForOrder = async (userId, orderId, totalPrice) => {
  const earnedPoints = Math.floor(totalPrice / 10000);
  
  if (earnedPoints <= 0) return;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    user.rewardPoints += earnedPoints;
    await user.save({ session });

    const history = new RewardPointHistory({
      user: userId,
      order: orderId,
      points: earnedPoints,
      type: "earn",
      description: `Nhận ${earnedPoints} điểm từ đơn hàng ${orderId}`
    });
    await history.save({ session });

    await session.commitTransaction();
    
    // Cập nhật rank (không nằm trong transaction để tránh lỗi lock)
    await updateMembershipRank(user);
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// API mô phỏng việc thanh toán và cộng điểm
export const simulatePayment = asyncHandler(async (req, res, next) => {
  const { orderId, totalPrice } = req.body;
  const userId = req.userId;

  if (!orderId || !totalPrice) {
    return next(new ErrorHandler("Thiếu orderId hoặc totalPrice", 400));
  }

  await earnPointsForOrder(userId, orderId, totalPrice);

  res.status(200).json({
    success: true,
    message: "Đã cộng điểm thành công sau thanh toán",
    data: { orderId, totalPrice }
  });
});

// 4. API lấy điểm hiện tại
export const getCurrentPoints = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Lấy điểm thành công",
    data: {
      points: user.rewardPoints,
      membershipLevel: user.membershipLevel,
    }
  });
});

// 5. API lịch sử tích điểm
export const getRewardHistory = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const history = await RewardPointHistory.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await RewardPointHistory.countDocuments({ user: req.userId });

  res.status(200).json({
    success: true,
    message: "Lấy lịch sử tích điểm thành công",
    data: {
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// 6. API dùng điểm giảm giá
export const redeemPoints = asyncHandler(async (req, res, next) => {
  const { points, orderId, orderTotal } = req.body;
  const userId = req.userId;

  if (!points || points <= 0) {
    return next(new ErrorHandler("Số điểm không hợp lệ", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    if (user.rewardPoints < points) {
      throw new ErrorHandler("Không đủ điểm để thực hiện giao dịch", 400);
    }

    const discountAmount = points * 100;

    if (orderTotal && discountAmount > orderTotal) {
      throw new ErrorHandler("Không được redeem quá tổng giá trị đơn hàng", 400);
    }

    user.rewardPoints -= points;
    await user.save({ session });

    const desc = orderId 
        ? `Đã dùng ${points} điểm để giảm giá đơn hàng ${orderId}` 
        : `Đã dùng ${points} điểm để giảm giá đơn hàng`;

    const history = new RewardPointHistory({
      user: userId,
      order: orderId || "",
      points: points,
      type: "redeem",
      description: desc
    });
    
    await history.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Đổi điểm thành công",
      data: {
        pointsUsed: points,
        discountAmount: discountAmount,
        remainingPoints: user.rewardPoints
      }
    });

  } catch (error) {
    await session.abortTransaction();
    if (error instanceof ErrorHandler) {
      return next(error);
    }
    return next(new ErrorHandler(error.message, 500));
  } finally {
    session.endSession();
  }
});
