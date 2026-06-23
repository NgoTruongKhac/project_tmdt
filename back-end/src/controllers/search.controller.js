import { User } from "../models/user.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";

export const searchDesigners = async (req, res) => {
    try {
        const keyword = (req.query.keyword || "").trim();

        let searchFilter = { role: "DESIGNER" };

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

        const searchFilter = {
            status: "approved",
            isActive: true,
        };

        if (keyword) {
            const keywords = keyword.trim().split(/\s+/);
            searchFilter.$and = keywords.map((word) => ({
                $or: [
                    { name: { $regex: word, $options: "i" } },
                    { description: { $regex: word, $options: "i" } },
                    { category: { $regex: word, $options: "i" } },
                ],
            }));
        }

        if (category && category !== "all") {
            searchFilter.category = category;
        }

        const minPriceValue = Number(minPrice);
        const maxPriceValue = Number(maxPrice);
        const priceExpr = { $ifNull: ["$discountPrice", "$price"] };
        const priceConditions = [];

        if (minPrice && !Number.isNaN(minPriceValue)) {
            priceConditions.push({ $gte: [priceExpr, minPriceValue] });
        }

        if (maxPrice && !Number.isNaN(maxPriceValue)) {
            priceConditions.push({ $lte: [priceExpr, maxPriceValue] });
        }

        if (priceConditions.length > 0) {
            searchFilter.$expr =
                priceConditions.length === 1
                    ? priceConditions[0]
                    : { $and: priceConditions };
        }

        const services = await ServicePackage.find(searchFilter)
            .populate("designer", "fullName profilePicture")
            .sort({ price: 1, name: 1 })
            .limit(100);

        // Transform data để match với frontend interface
        const transformedServices = services.map(service => ({
            id: service._id,
            title: service.name,
            category: service.category,
            price: service.discountPrice || service.price,
            originalPrice: service.price,
            images: service.thumbnail ? [service.thumbnail] : [],
            description: service.description,
            slug: service.slug,
            revisions: service.revisions,
            deliveryTime: service.deliveryTime,
            soldCount: service.soldCount,
            views: service.views || 0,
            createdAt: service.createdAt,
            designerId: service.designer ? {
                _id: service.designer._id,
                fullName: service.designer.fullName,
                profilePicture: service.designer.profilePicture
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
