import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from "./env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Tìm user theo email trước để tránh lỗi E11000
        let user = await User.findOne({ email: profile._json.email });

        if (user) {
          // Kiểm tra nếu tài khoản bị khóa
          if (!user.isActive) {
            return done(
              new Error(
                "Tài khoản của bạn đã bị khóa do vi phạm chính sách. Vui lòng liên hệ quản trị viên."
              ),
              null
            );
          }

          // Cập nhật googleId nếu chưa có
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        }

        // Nếu user không tồn tại, tạo mới
        const newUser = new User({
          fullName: profile.displayName,
          email: profile._json.email,
          googleId: profile.id,
          profilePicture: profile._json.picture,
        });

        await newUser.save();

        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done(error, null);
      }
    },
  ),
);

// Passport cần 2 hàm này để quản lý session người dùng
// Serialize: Lưu một phần thông tin của user (ở đây là ID) vào session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize: Lấy thông tin user đầy đủ từ ID đã lưu trong session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error, null);
  }
});
