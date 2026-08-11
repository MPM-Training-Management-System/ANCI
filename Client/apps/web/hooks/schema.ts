import { z } from "zod";

export const registerTrainerSchema = z
  .object({
    

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