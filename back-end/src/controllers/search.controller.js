import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js";

export const searchDesigners = async (req, res) => {
    try {
        const keyword = (req.query.keyword || "").trim();

        let searchFilter = { role: "designer" };

        if (keyword) {
            const keywords = keyword.split(/\s+/);
            searchFilter.$or = [
                {
                    $and: keywords.map(word => ({
                        fullName: { $regex: word, $options: "i" }
                    }))
                },
                {
                    $and: keywords.map(word => ({
                        skills: { $regex: word, $options: "i" }
                    }))
                }
            ];
        }

        const designers = await User.find(searchFilter)
            .select('fullName profilePicture bio skills')
            .limit(50); // Giới hạn 50 kết quả

        return res.json({
            success: true,
            data: designers,
        });
    } catch (error) {
        console.error("Error searching designers:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tìm kiếm designer",
            error: error.message
        });
    }
};

export const searchServices = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice } = req.query;

        const searchFilter = {};

        if (keyword) {
            const keywords = keyword.split(/\s+/);
            searchFilter.$and = keywords.map(word => ({
                title: { $regex: word, $options: "i" }
            }));
        }

        if (category) {
            searchFilter.category = category;
        }

        if (minPrice || maxPrice) {
            searchFilter.price = {};
            if (minPrice) {
                searchFilter.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                searchFilter.price.$lte = Number(maxPrice);
            }
        }

        const services = await Service.find(searchFilter)
            .populate("designerId", "fullName profilePicture")
            .sort({ price: 1, title: 1 })
            .limit(100);

        // Transform data để match với frontend interface
        const transformedServices = services.map(service => ({
            id: service._id,
            title: service.title,
            category: service.category,
            price: service.price,
            images: service.images || [],
            description: service.description,
            createdAt: service.createdAt,
            designerId: service.designerId ? {
                _id: service.designerId._id,
                fullName: service.designerId.fullName,
                profilePicture: service.designerId.profilePicture
            } : null
        }));

        return res.json({
            success: true,
            data: transformedServices,
        });
    } catch (error) {
        console.error("Error searching services:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi tìm kiếm dịch vụ",
            error: error.message
        });
    }
};
