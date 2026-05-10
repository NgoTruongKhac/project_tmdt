import express from "express";
import { getProductDetail } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/:id", getProductDetail);

export default router;