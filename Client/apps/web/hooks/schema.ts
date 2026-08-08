import { z } from "zod";

export const registerTrainerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required."),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required."),

    email: z
      .string()
      .trim()
      .email("Invalid email address."),

    username: z
      .string()
      .trim()
      .min(4, "Username must be at least 4 characters.")
      .max(20),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),

    confirmPassword: z
      .string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    }
  );

export type RegisterTrainerSchema = z.infer<
  typeof registerTrainerSchema
>;