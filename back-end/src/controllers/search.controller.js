import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js";

export const searchDesigners = async (req, res) => {
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

    const designers = await User.find(searchFilter);

    return res.json({
        success: true,
        data: designers,
    });
};

export const searchServices = async (req, res) => {
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

    const services = await Service.find(searchFilter).populate("designerId", "fullName profilePicture");

    return res.json({
        success: true,
        data: services,
    });
};
