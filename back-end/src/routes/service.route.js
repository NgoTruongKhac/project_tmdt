import express from "express";
import {
  getAllServices,
  getServiceCategories,
  getBestSellers,
  getNewestServices,
  getFeaturedServices,
  getHireServices,
  getPackageServices,
  getProductServices,
  getDesignerPackages,
  getServiceBySlug,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/categories", getServiceCategories);
router.get("/best-sellers", getBestSellers);
router.get("/newest", getNewestServices);
router.get("/featured", getFeaturedServices);
router.get("/hire", getHireServices);
router.get("/packages", getPackageServices);
router.get("/products", getProductServices);
router.get("/designer/:designerId", getDesignerPackages);
router.get("/:slug", getServiceBySlug);

export { router as serviceRouter };
