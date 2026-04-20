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
        const existUser = await User.findOne({ googleId: profile.id });

        if (existUser) return done(null, existUser);

        const newUser = new User({
          username: profile.displayName,
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
    }
  )
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
