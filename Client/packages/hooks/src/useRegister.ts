import { useState } from "react";
import type { AuthApi } from "@repo/api";
import type { RegisterRequest } from "@repo/types";

export interface RegisterFormValues {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export function useRegister(
  authApi: AuthApi
) {
  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  const register = async (
    values: RegisterFormValues
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const request: RegisterRequest = {
        fullName: [
          values.firstName.trim(),
          values.middleName?.trim(),
          values.lastName.trim(),
        ]
          .filter(Boolean)
          .join(" "),

        email: values.email
          .trim()
          .toLowerCase(),

        mobileNumber:
          values.mobileNumber.trim(),

        password: values.password,
      };

      await authApi.register(request);

      setSuccess(true);

      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    register,
    isLoading,
    error,
    success,
    reset,
  };
}