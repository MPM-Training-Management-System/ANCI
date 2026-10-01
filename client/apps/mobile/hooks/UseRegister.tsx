import { useState } from "react";

import type {
  RegisterRequest,
} from "@repo/types";

import type {
  AuthApi,
} from "@repo/api";


// =========================================================
// FORM VALUES
// =========================================================

export interface RegisterFormValues {
  // Google authentication
  googleIdToken?: string;

  firstName: string;

  middleName: string;

  lastName: string;

  address: string;

  birthDate: string;

  gender: string;

  email: string;

  mobileNumber: string;

  password: string;

  profileImage?: {
    uri: string;
    name: string;
    type: string;
  };
}


// =========================================================
// HOOK
// =========================================================

export function useRegister(
  authApi: AuthApi
) {
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState(false);


  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (
    values: RegisterFormValues
  ) => {
    try {
      setIsLoading(true);

      setError(null);

      setSuccess(false);


      // =====================================================
      // FULL NAME
      // =====================================================

      const fullName = [
        values.firstName.trim(),

        values.middleName.trim(),

        values.lastName.trim(),
      ]
        .filter(Boolean)
        .join(" ");


      // =====================================================
      // GOOGLE TOKEN
      // =====================================================

      const googleIdToken =
        values.googleIdToken?.trim() ||
        undefined;


      // =====================================================
      // REQUEST
      // =====================================================

      const request: RegisterRequest = {
        fullName,

        firstName:
          values.firstName.trim(),

        middleName:
          values.middleName.trim(),

        lastName:
          values.lastName.trim(),

        email:
          values.email
            .trim()
            .toLowerCase(),

        mobileNumber:
          values.mobileNumber.trim(),

        birthDate:
          values.birthDate.trim(),

        address:
          values.address.trim(),

        gender:
          values.gender.trim(),

        password:
          values.password,

        profileImage:
          values.profileImage,

        // Google registration
        googleIdToken,
      };


      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "PARTICIPANT GOOGLE REGISTRATION DEBUG"
      );

      console.log(
        "GoogleIdToken:",
        googleIdToken
          ? `FOUND (${googleIdToken.length} chars)`
          : "MISSING"
      );

      console.log(
        "ProfileImage:",
        values.profileImage
          ? "LOCAL IMAGE"
          : "NO LOCAL IMAGE"
      );

      console.log(
        "Email:",
        values.email
      );


      // =====================================================
      // API
      // =====================================================

      await authApi.register(
        request
      );


      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(true);

      return true;
    }

    catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );

      return false;
    }

    finally {
      setIsLoading(false);
    }
  };


  // =========================================================
  // RESET
  // =========================================================

  const reset = () => {
    setIsLoading(false);

    setError(null);

    setSuccess(false);
  };


  // =========================================================
  // RETURN
  // =========================================================

  return {
    register,

    isLoading,

    error,

    success,

    reset,
  };
}