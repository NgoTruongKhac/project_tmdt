import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "email not blank" })
    .email({ message: "email invalid" }),
  password: z
    .string()
    .min(1, { message: "password not blank" })
    .min(6, { message: "password must be more than 6 characters" }),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: "user not blank" })
    .min(4, { message: "username must be more than 4 characters" }),

  password: z
    .string()
    .min(1, { message: "password not blank" })
    .min(6, { message: "passwrod must be more than 6 characters" }),
  email: z
    .string()
    .min(1, { message: "email not blank" })
    .email({ message: "email invalid" }),
});
