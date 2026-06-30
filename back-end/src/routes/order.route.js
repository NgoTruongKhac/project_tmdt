import express from "express";
import { verifyToken } from "../middlewares/auth/auth.middleware.js";
import { validate } from "../middlewares/validations/validate.middleware.js";
import {
  getMyOrdersValidationRules,
  cancelOrderValidationRules,
} from "../middlewares/validations/order.validation.js";
import {
  getMyOrders,
  cancelOrder,
  getDesignerOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get(
  "/me",
  verifyToken,
  validate(getMyOrdersValidationRules),
  getMyOrders,
);

router.patch(
  "/:orderId/cancel",
  verifyToken,
  validate(cancelOrderValidationRules),
  cancelOrder,
);
router.get("/designer", verifyToken, getDesignerOrders);
router.patch("/:orderId/status", verifyToken, updateOrderStatus);

export { router as orderRouter };
export default router;
