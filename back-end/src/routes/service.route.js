import express from "express";
import multer from "multer";
import {
  getAllServices,
  getServiceCategories,
  getBestSellers,
  getNewestServices,
  getFeaturedServices,
  getHireServices,
  getPackageServices,
  getProductServices,
  getDesignServices,
  getDesignerPackages,
  getServiceByIdentifier,
  getProtectedImage,
  createService,
} from "../controllers/service.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllServices);
router.post("/", upload.array("images"), createService);

router.get("/categories", getServiceCategories);
router.get("/best-sellers", getBestSellers);
router.get("/newest", getNewestServices);
router.get("/featured", getFeaturedServices);
router.get("/hire", getHireServices);
router.get("/packages", getPackageServices);
router.get("/products", getProductServices);
router.get("/design-services", getDesignServices);
router.get("/designer/:designerId", getDesignerPackages);
router.get("/image/:fileName", getProtectedImage);

router.get("/:identifier", getServiceByIdentifier);

export { router as serviceRouter };
export default router;
