import { validationResult } from "express-validator";

export const validate = (rules) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(rules.map((rule) => rule.run(req)));

    // Check if there were validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format and return validation errors
    return res.status(400).json({
      status: "400",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  };
};
