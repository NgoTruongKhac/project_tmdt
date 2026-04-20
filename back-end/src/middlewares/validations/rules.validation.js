import { body } from "express-validator";

export const registerValidationRules = [
  body("username").notEmpty().withMessage("Username không được để trống"),
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),

  // body("confirmPassword").custom((value, { req }) => {
  //   if (value !== req.body.password) {
  //     throw new Error("Xác nhận mật khẩu không trùng khớp");
  //   }
  //   return true;
  // }),
];

export const loginValidationRules = [];
