"use client";

import { useState } from "react";

import type {
  RegisterTrainerRequest,
  RegisterResponse,
  CreateTrainerEducationRequest,
  CreateTrainerCertificationRequest,
} from "@repo/types";

import type { AuthApi } from "@repo/api";

export interface RegisterTrainerFormValues {
  // ==========================================================
  // PERSONAL INFORMATION
  // ==========================================================

  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthDate?: string;
  address: string;
  gender: string;

  // ==========================================================
  // ACCOUNT INFORMATION
  // ==========================================================

  email: string;
  mobileNumber?: string;
  password: string;
  confirmPassword?: string;

  // ==========================================================
  // PROFESSIONAL INFORMATION
  // ==========================================================

  specialization: string;
  professionalTitle?: string;
  currentOrganization?: string;
  bio?: string;
  yearsOfExperience?: number;

  // ==========================================================
  // PROFESSIONAL LICENSE
  // ==========================================================

  professionalLicenseNumber?: string;
  professionalLicenseType?: string;
  professionalLicenseExpirationDate?: string;

  // ==========================================================
  // PROFILE
  // ==========================================================

  profileImage?: File;

  // ==========================================================
  // EDUCATION
  // ==========================================================

  educations: CreateTrainerEducationRequest[];

  // ==========================================================
  // CERTIFICATIONS
  // ==========================================================

  certifications: CreateTrainerCertificationRequest[];
}

export function useRegisterTrainer(authApi: AuthApi) {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

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
      // CLEAN VALUES
      // ======================================================

      const firstName = values.firstName.trim();

      const middleName =
        values.middleName?.trim() || undefined;

      const lastName = values.lastName.trim();

      const suffix =
        values.suffix?.trim() || undefined;

      const email =
        values.email.trim().toLowerCase();

      const mobileNumber =
        values.mobileNumber?.trim() || undefined;

      const address =
        values.address.trim();

      const specialization =
        values.specialization.trim();

      const professionalTitle =
        values.professionalTitle?.trim() || undefined;

      const currentOrganization =
        values.currentOrganization?.trim() || undefined;

      const bio =
        values.bio?.trim() || undefined;

      const professionalLicenseNumber =
        values.professionalLicenseNumber?.trim() ||
        undefined;

      const professionalLicenseType =
        values.professionalLicenseType?.trim() ||
        undefined;

      // ======================================================
      // EDUCATIONS
      // ======================================================

      const educations: CreateTrainerEducationRequest[] =
        values.educations.map((education) => ({
          degree: education.degree.trim(),

          fieldOfStudy:
            education.fieldOfStudy?.trim() || null,

          institution:
            education.institution.trim(),

          yearGraduated:
            education.yearGraduated ?? null,
        }));

      // ======================================================
      // CERTIFICATIONS
      // ======================================================

      const certifications: CreateTrainerCertificationRequest[] =
        values.certifications.map((certification) => ({
          name: certification.name.trim(),

          issuingOrganization:
            certification.issuingOrganization?.trim() ||
            null,

          issuedDate:
            certification.issuedDate || null,

          expirationDate:
            certification.expirationDate || null,

          certificateUrl:
            certification.certificateUrl?.trim() ||
            null,
        }));

      // ======================================================
      // REQUEST
      // ======================================================

      const request: RegisterTrainerRequest = {
        // ----------------------------------------------------
        // PERSONAL
        // ----------------------------------------------------

        FirstName: firstName,

        MiddleName: middleName ?? null,

        LastName: lastName,

        Suffix: suffix ?? null,

        BirthDate:
          values.birthDate || null,

        Address: address,

        Gender: values.gender,

        // ----------------------------------------------------
        // ACCOUNT
        // ----------------------------------------------------

        Email: email,

        MobileNumber:
          mobileNumber ?? null,

        Password: values.password,

        // ----------------------------------------------------
        // PROFESSIONAL
        // ----------------------------------------------------

        Specialization:
          specialization,

        ProfessionalTitle:
          professionalTitle ?? null,

        CurrentOrganization:
          currentOrganization ?? null,

        Bio:
          bio ?? null,

        YearsOfExperience:
          values.yearsOfExperience ?? null,

        // ----------------------------------------------------
        // PROFESSIONAL LICENSE
        // ----------------------------------------------------

        ProfessionalLicenseNumber:
          professionalLicenseNumber ?? null,

        ProfessionalLicenseType:
          professionalLicenseType ?? null,

        ProfessionalLicenseExpirationDate:
          values.professionalLicenseExpirationDate ||
          null,

        // ----------------------------------------------------
        // PROFILE IMAGE
        // ----------------------------------------------------

        ProfileImage:
          values.profileImage ?? null,

        // ----------------------------------------------------
        // EDUCATION
        // ----------------------------------------------------

        Educations:
          educations,

        // ----------------------------------------------------
        // CERTIFICATIONS
        // ----------------------------------------------------

        Certifications:
          certifications,
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

      console.log(request);

      console.log(
        "================================="
      );

      // ======================================================
      // API
      // ======================================================

      const response =
        await authApi.registerTrainer(request);

      // ======================================================
      // RESPONSE DEBUG
      // ======================================================

      console.log(
        "================================="
      );

      console.log(
        "REGISTER TRAINER RESPONSE:"
      );

      console.log(response);

      console.log(
        "================================="
      );

      // ======================================================
      // RESPONSE VALIDATION
      // ======================================================

      if (!response) {
        setError(
          "Trainer registration failed."
        );

        return null;
      }

      // ======================================================
      // SUCCESS
      // ======================================================

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

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    registerTrainer,

    isLoading,

    error,

    success,

    reset,
  };
}