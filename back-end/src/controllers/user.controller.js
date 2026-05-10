import { User } from "../models/user.model.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";

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