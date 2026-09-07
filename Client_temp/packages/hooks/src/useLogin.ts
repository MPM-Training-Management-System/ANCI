import { useState } from "react";
import { AuthApi } from "@repo/api";

export interface LoginFormValues {
  email: string;
  password: string;
}

export function useLogin(authApi: AuthApi) {
  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  const login = async (
    values: LoginFormValues
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response =
        await authApi.login({
          email: values.email
            .trim()
            .toLowerCase(),

          password: values.password,
        });

      setSuccess(true);

      return response;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login right now. Please try again."
      );

      return null;
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
    login,
    isLoading,
    error,
    success,
    reset,
  };
}