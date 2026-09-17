import { useState } from "react";
import { AuthAPIs } from "@repo/api";

import { ForgotPasswordRequest, ResetPasswordRequest, VerifyResetOtpRequest } from "@repo/types";


// =========================================================
// HOOK
// =========================================================

export function useForgotPassword(authApi: AuthAPIs) {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  // =======================================================
  // SEND PASSWORD RESET OTP
  // =======================================================

  const forgotPassword = async (
    values: ForgotPasswordRequest
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response =
        await authApi.forgotPassword({
          email: values.email
            .trim()
            .toLowerCase(),
        });

      setSuccess(response.success);

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send the password reset code. Please try again.";

      setError(message);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================================
  // VERIFY PASSWORD RESET OTP
  // =======================================================

  const verifyResetOtp = async (
    values: VerifyResetOtpRequest
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response =
        await authApi.verifyResetOtp({
          email: values.email
            .trim()
            .toLowerCase(),

          otpCode: values.otpCode.trim(),
        });

      setSuccess(response.success);

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify the OTP. Please try again.";

      setError(message);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================================
  // RESET PASSWORD
  // =======================================================

  const resetPassword = async (
    values: ResetPasswordRequest
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response =
        await authApi.resetPassword({
          email: values.email
            .trim()
            .toLowerCase(),

          otpCode: values.otpCode.trim(),

          newPassword:
            values.newPassword,

          confirmPassword:
            values.confirmPassword,
        });

      setSuccess(response.success);

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reset your password. Please try again.";

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
    // Send OTP
    forgotPassword,

    // Verify OTP
    verifyResetOtp,

    // Reset password
    resetPassword,

    // State
    isLoading,
    error,
    success,

    // Reset state
    reset,
  };
}