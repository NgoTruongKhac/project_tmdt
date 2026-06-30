import express from "express";
import { PORT } from "./src/configs/env.js";
import { CLIENT_DOMAIN } from "./src/configs/env.js";
import { SESSION_KEY } from "./src/configs/env.js";
import { connectDB } from "./src/databases/mongodb.js";
import { authRouter } from "./src/routes/auth.route.js";
import { userRouter } from "./src/routes/user.route.js";
import { designerRouter } from "./src/routes/designer.route.js";
import serviceRouter from "./src/routes/service.route.js";
import { favoriteRouter } from "./src/routes/favorite.route.js";
import searchRouter from "./src/routes/search.route.js";
import { rewardRoutes } from "./src/routes/rewardRoutes.js";
import { orderRouter } from "./src/routes/order.route.js";
import { errorHandler } from "./src/middlewares/errors/error.middleware.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import "./src/configs/passport.config.js";
import adminRoutes from "./src/routes/admin.route.js";
import paymentRouter from "./src/routes/payment.route.js";

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_DOMAIN,
    credentials: true,
  }),
);

app.use(
  session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize()); // <-- Khởi tạo Passport
app.use(passport.session()); // <-- Sử dụng session với Passport

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/designer", designerRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/favorites", favoriteRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/rewards", rewardRoutes);
app.use('/uploads', express.static('public/uploads'));
app.use("/api/v1/payments", paymentRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});