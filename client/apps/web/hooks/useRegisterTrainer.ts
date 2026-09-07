"use client";

import { useState } from "react";

import type {
  RegisterTrainerRequest,
  RegisterResponse,
} from "@repo/types";

import type {
  AuthApi,
} from "@repo/api";

export interface RegisterTrainerFormValues {
  fullName?: string;

  firstName: string;
  middleName: string;
  lastName: string;

  birthDate: string;
  address: string;
  gender: string;

  email: string;
  mobileNumber: string;

  password: string;
  confirmPassword: string;

  specialization: string;

  yearsOfExperience:
    | number
    | undefined;

  certificationName: string;

  certificationNumber: string;

  profileImage?: File;
}

export function useRegisterTrainer(
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

  // ==========================================================
  // REGISTER TRAINER
  // ==========================================================

  const registerTrainer = async (
    values: RegisterTrainerFormValues
  ): Promise<RegisterResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // ======================================================
      // FULL NAME
      // ======================================================

      const fullName =
        values.fullName?.trim() ||
        [
          values.firstName.trim(),
          values.middleName.trim(),
          values.lastName.trim(),
        ]
          .filter(Boolean)
          .join(" ");

      // ======================================================
      // REQUEST
      // ======================================================

      const request:
        RegisterTrainerRequest = {
        firstName:
          values.firstName.trim(),

        middleName:
          values.middleName.trim(),

        lastName:
          values.lastName.trim(),

        birthDate:
          values.birthDate,

        address:
          values.address.trim(),

        gender:
          values.gender,

        fullName,

        email:
          values.email
            .trim()
            .toLowerCase(),

        mobileNumber:
          values.mobileNumber.trim(),

        password:
          values.password,

        specialization:
          values.specialization.trim(),

        yearsOfExperience:
          values.yearsOfExperience,

        certificationName:
          values.certificationName.trim(),

        certificationNumber:
          values.certificationNumber.trim(),

        profileImage:
          values.profileImage,
      };

      // ======================================================
      // DEBUG
      // ======================================================

      console.log(
        "================================="
      );

      console.log(
        "REGISTER TRAINER REQUEST:"
      );

      console.log(
        request
      );

      console.log(
        "================================="
      );

      // ======================================================
      // API
      // ======================================================

      const response =
        await authApi.registerTrainer(
          request
        );

      console.log(
        "================================="
      );

      console.log(
        "REGISTER TRAINER RESPONSE:"
      );

      console.log(
        response
      );

      console.log(
        "================================="
      );

      // ======================================================
      // IMPORTANT
      //
      // DO NOT check response.success here.
      //
      // The API request itself succeeded if we received
      // a response.
      // ======================================================

      if (!response) {
        setError(
          "Trainer registration failed."
        );

        return null;
      }

      setSuccess(true);

      return response;

    } catch (error) {

      console.error(
        "REGISTER TRAINER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create trainer account."
      );

      return null;

    } finally {

      setIsLoading(false);

    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    registerTrainer,

    isLoading,

    error,

    success,

    reset,
  };
}