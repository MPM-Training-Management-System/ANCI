import { useState } from "react";

import type {
  RegisterRequest,
} from "@repo/types";

import type {
  AuthApi,
} from "@repo/api";

export interface RegisterFormValues {
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
      };


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