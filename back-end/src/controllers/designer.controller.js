import { Designer } from "../models/designer.model.js";
import { ServicePackage } from "../models/servicePackage.model.js";

export const updateProfileDesigner = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { age, degree, major, experienceYears, portfolioUrl, skills } =
      req.body;

    const updateFields = {};
    if (age !== undefined) updateFields.age = age;
    if (degree !== undefined) updateFields.degree = degree;
    if (major !== undefined) updateFields.major = major;
    if (experienceYears !== undefined) {
      updateFields.experienceYears = experienceYears;
    }
    if (portfolioUrl !== undefined) updateFields.portfolioUrl = portfolioUrl;
    if (skills !== undefined) updateFields.skills = skills;

    const updatedDesigner = await Designer.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      message: "Designer profile updated successfully",
      designer: updatedDesigner,
    });
  } catch (error) {
    next(error);
  }
};

export const getDesignerServices = async (req, res, next) => {
  try {
    const { designerId } = req.params;

    const services = await ServicePackage.find({
      designer: designerId,
      isActive: true,
      status: "approved",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};
