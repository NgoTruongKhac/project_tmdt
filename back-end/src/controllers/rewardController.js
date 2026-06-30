import { User } from "../models/user.model.js";
import { RewardPointHistory } from "../models/rewardPointHistory.model.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const updateMembershipRank = async (user) => {
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

export const earnPointsForOrder = async (userId, orderId, totalPrice) => {
  const earnedPoints = Math.floor(Number(totalPrice) / 10000);

  if (!orderId || earnedPoints <= 0) return;

  const existingHistory = await RewardPointHistory.findOne({
    user: userId,
    order: orderId,
    type: "earn",
  });

  if (existingHistory) return;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { rewardPoints: earnedPoints } },
    { new: true }
  );

  if (!user) throw new Error("Không tìm thấy người dùng");

  await RewardPointHistory.create({
    user: userId,
    order: orderId,
    points: earnedPoints,
    type: "earn",
    description: `Nhận ${earnedPoints} điểm từ đơn hàng ${orderId}`,
  });

  await updateMembershipRank(user);
};

export const redeemPointsForOrder = async (userId, orderId, points, orderTotal) => {
  const pointsToUse = Number(points);

  if (!orderId || !Number.isInteger(pointsToUse) || pointsToUse <= 0) {
    return { pointsUsed: 0, discountAmount: 0 };
  }

  const existingHistory = await RewardPointHistory.findOne({
    user: userId,
    order: orderId,
    type: "redeem",
  });

  if (existingHistory) {
    return {
      pointsUsed: existingHistory.points,
      discountAmount: existingHistory.points * 100,
    };
  }

  const discountAmount = pointsToUse * 100;
  if (orderTotal && discountAmount >= orderTotal) {
    throw new ErrorHandler("Số tiền giảm phải nhỏ hơn tổng giá trị đơn hàng", 400);
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, rewardPoints: { $gte: pointsToUse } },
    { $inc: { rewardPoints: -pointsToUse } },
    { new: true }
  );

  if (!user) {
    throw new ErrorHandler("Không đủ điểm để thực hiện giao dịch", 400);
  }

  await RewardPointHistory.create({
    user: userId,
    order: orderId,
    points: pointsToUse,
    type: "redeem",
    description: `Đã dùng ${pointsToUse} điểm để giảm giá đơn hàng ${orderId}`,
  });

  return {
    pointsUsed: pointsToUse,
    discountAmount,
    remainingPoints: user.rewardPoints,
  };
};

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
    data: { orderId, totalPrice },
  });
});

export const getCurrentPoints = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new ErrorHandler("Không tìm thấy người dùng", 404));
  }

  res.status(200).json({
    success: true,
    message: "Lấy điểm thành công",
    data: {
      points: user.rewardPoints,
      membershipLevel: user.membershipLevel,
    },
  });
});

export const getRewardHistory = asyncHandler(async (req, res) => {
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
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const redeemPoints = asyncHandler(async (req, res, next) => {
  const { orderId, orderTotal } = req.body;
  const points = Number(req.body.points);
  const userId = req.userId;

  if (!Number.isInteger(points) || points <= 0) {
    return next(new ErrorHandler("Số điểm không hợp lệ", 400));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("Không tìm thấy người dùng", 404);
    }

    if (user.rewardPoints < points) {
      throw new ErrorHandler("Không đủ điểm để thực hiện giao dịch", 400);
    }

    const discountAmount = points * 100;

    if (orderTotal && discountAmount > orderTotal) {
      throw new ErrorHandler("Không được đổi điểm vượt quá tổng giá trị đơn hàng", 400);
    }

    user.rewardPoints -= points;
    await user.save();

    const description = orderId
      ? `Đã dùng ${points} điểm để giảm giá đơn hàng ${orderId}`
      : `Đã dùng ${points} điểm để giảm giá đơn hàng`;

    await RewardPointHistory.create({
      user: userId,
      order: orderId || "",
      points,
      type: "redeem",
      description,
    });

    res.status(200).json({
      success: true,
      message: "Đổi điểm thành công",
      data: {
        pointsUsed: points,
        discountAmount,
        remainingPoints: user.rewardPoints,
      },
    });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return next(error);
    }
    return next(new ErrorHandler(error.message, 500));
  }
});
