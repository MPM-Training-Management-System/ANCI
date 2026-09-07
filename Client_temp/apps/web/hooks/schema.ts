import { z } from "zod";

export const registerTrainerSchema =
  z.object({

    firstName:
      z.string()
        .min(2, "First name is required."),

    middleName:
      z.string(),

    lastName:
      z.string()
        .min(2, "Last name is required."),

    email:
      z.string()
        .email("Enter a valid email address."),

    mobileNumber:
      z.string()
        .min(10, "Enter a valid mobile number."),

    password:
      z.string()
        .min(
          8,
          "Password must be at least 8 characters."
        ),

    confirmPassword:
      z.string()
        .min(
          8,
          "Please confirm your password."
        ),

    specialization:
      z.string()
        .min(
          2,
          "Specialization is required."
        ),

    yearsOfExperience:
      z.number()
        .int()
        .min(0)
        .optional(),

    certificationName:
      z.string(),

    certificationNumber:
      z.string(),

  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        "Passwords do not match.",
      path: [
        "confirmPassword",
      ],
    }
  );


export type RegisterTrainerFormValues =
  z.infer<
    typeof registerTrainerSchema
  >;