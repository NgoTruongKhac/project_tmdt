import { query, param, body } from "express-validator";

export const getMyOrdersValidationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page phải là số nguyên >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit phải là số nguyên từ 1 đến 50"),
  query("status")
    .optional()
    .isIn(["all", "pending", "processing", "completed", "cancelled"])
    .withMessage("status phải là one of: all, pending, processing, completed, cancelled"),
];

export const cancelOrderValidationRules = [
  param("orderId")
    .isMongoId()
    .withMessage("orderId không hợp lệ"),
  body("reason")
    .optional()
    .isLength({ max: 255 })
    .withMessage("reason tối đa 255 ký tự"),
];
