import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Order from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Đã kết nối Database thành công!");

        await Order.deleteMany({});
        console.log("Đã dọn dẹp bảng Orders.");

        const users = await User.find().limit(5);
        const services = await ServicePackage.find().limit(5);

        if (users.length === 0 || services.length === 0) {
            console.log("Lỗi: Cần có ít nhất 1 User và 1 Gói dịch vụ trong DB để tạo đơn hàng.");
            process.exit(1);
        }

        const statuses = ["pending", "paid", "completed", "cancelled"];
        const ordersToCreate = [];

        for (let i = 0; i < 15; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomService = services[Math.floor(Math.random() * services.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; 

            ordersToCreate.push({
                user: randomUser._id,
                services: [
                    {
                        service: randomService._id,
                        quantity: quantity
                    }
                ],
                totalPrice: randomService.price * quantity,
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }

        await Order.insertMany(ordersToCreate);
        console.log("Đã bơm thành công 15 đơn hàng mẫu vào Database!");
        
        process.exit(0);
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng mẫu:", error);
        process.exit(1);
    }
};

seedOrders();