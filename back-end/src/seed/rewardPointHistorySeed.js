import { connectDB } from "../databases/mongodb.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { RewardPointHistory } from "../models/rewardPointHistory.model.js";

export const seedRewardPointHistories = async () => {
    try {
        await connectDB();

        const users = await User.find().limit(3);
        const orders = await Order.find().limit(5);

        if (!users.length) {
            console.log("Không có user");
            return;
        }

        // Xóa dữ liệu cũ
        await RewardPointHistory.deleteMany({});
        console.log("Đã xóa reward histories cũ");

        const histories = [];

        users.forEach((user, index) => {
            const order = orders[index % orders.length];

            histories.push(
                {
                    user: user._id,
                    order: order?.orderCode || "",
                    points: 120,
                    type: "earn",
                    description: "Nhận điểm thưởng khi hoàn thành đơn hàng",
                    createdAt: new Date(),
                },
                {
                    user: user._id,
                    order: order?.orderCode || "",
                    points: 50,
                    type: "redeem",
                    description: "Đổi điểm lấy voucher giảm giá",
                    createdAt: new Date(),
                }
            );
        });

        await RewardPointHistory.insertMany(histories);

        // update rewardPoints cho user
        for (const user of users) {
            const earned = histories
                .filter(
                    (h) =>
                        h.user.toString() === user._id.toString() &&
                        h.type === "earn"
                )
                .reduce((sum, h) => sum + h.points, 0);

            const redeemed = histories
                .filter(
                    (h) =>
                        h.user.toString() === user._id.toString() &&
                        h.type === "redeem"
                )
                .reduce((sum, h) => sum + h.points, 0);

            user.rewardPoints = earned - redeemed;
            await user.save();
        }

        console.log(
            `Đã tạo ${histories.length} reward point histories`
        );

        console.log(
            `Reward histories: ${await RewardPointHistory.countDocuments()}`
        );
    } catch (error) {
        console.error("Lỗi seed reward histories:", error);
    }
};

seedRewardPointHistories()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });