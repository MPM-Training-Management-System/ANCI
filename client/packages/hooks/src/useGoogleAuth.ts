import { useState } from "react";

import { AuthApi  } from "@repo/api";

import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from "@repo/types";

// =========================================================
// HOOK
// =========================================================

export function useGoogleAuth(authApi: AuthApi ) {
  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  // =======================================================
  // GOOGLE LOGIN
  // =======================================================

  const googleLogin = async (
    values: GoogleLoginRequest
  ): Promise<GoogleLoginResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      if (!values.idToken.trim()) {
        setError(
          "Google authentication token is required."
        );

        return null;
      }

      const response =
        await authApi.googleLogin({
          idToken: values.idToken,
        });

      setSuccess(true);

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to continue with Google. Please try again.";

      setError(message);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================================
  // RESET HOOK STATE
  // =======================================================

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    // Google authentication
    googleLogin,

    // State
    isLoading,
    error,
    success,

    // Reset state
    reset,
  };
}