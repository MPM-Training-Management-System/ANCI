
import { useState } from "react";

import type { RegisterRequest } from "@repo/types";
import type { AuthApi } from "@repo/api";

// =========================================================
// IMAGE TYPE
// =========================================================

export interface RegisterImage {
  uri: string;
  name: string;
  type: string;
}

// =========================================================
// FORM VALUES
// =========================================================

export interface RegisterFormValues {
  // Google authentication
  googleIdToken?: string;

  // Personal information
  firstName: string;
  middleName: string;
  lastName: string;

  address: string;
  birthDate: string;
  gender: string;

  email: string;
  mobileNumber: string;
  password: string;

  // Profile image
  profileImage?: RegisterImage;

  // Educational information
  highestEducationalAttainment?: string | null;
  educationalStatus?: string | null;
  schoolName?: string | null;
  courseOrDegree?: string | null;
  fieldOfStudy?: string | null;
  yearGraduated?: number | null;

  // Employment information
  employmentStatus?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
  yearsOfWorkExperience?: number | null;

  // Valid ID information
  validIdType?: string | null;
  validIdNumber?: string | null;
  validIdImage?: RegisterImage;

  // Emergency contact
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;
  emergencyContactRelationship?: string | null;
}

// =========================================================
// HOOK
// =========================================================

export function useRegister(authApi: AuthApi) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Full name
      const fullName = [
        values.firstName.trim(),
        values.middleName.trim(),
        values.lastName.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      // Google token
      const googleIdToken =
        values.googleIdToken?.trim() || undefined;

      // Build request
      const request: RegisterRequest = {
        // Personal information
        fullName,
        firstName: values.firstName.trim(),
        middleName: values.middleName.trim(),
        lastName: values.lastName.trim(),

        email: values.email.trim().toLowerCase(),
        mobileNumber: values.mobileNumber.trim(),
        birthDate: values.birthDate.trim(),
        address: values.address.trim(),
        gender: values.gender.trim(),
        password: values.password,

        googleIdToken,

        // Profile image
        profileImage: values.profileImage,

        // Educational information
        highestEducationalAttainment:
          values.highestEducationalAttainment ?? null,
        educationalStatus:
          values.educationalStatus ?? null,
        schoolName: values.schoolName ?? null,
        courseOrDegree: values.courseOrDegree ?? null,
        fieldOfStudy: values.fieldOfStudy ?? null,
        yearGraduated: values.yearGraduated ?? null,

        // Employment information
        employmentStatus: values.employmentStatus ?? null,
        companyName: values.companyName ?? null,
        jobTitle: values.jobTitle ?? null,
        industry: values.industry ?? null,
        yearsOfWorkExperience:
          values.yearsOfWorkExperience ?? null,

        // Valid ID information
        validIdType: values.validIdType ?? null,
        validIdNumber: values.validIdNumber ?? null,
        validIdImage: values.validIdImage,

        // Emergency contact
        emergencyContactName:
          values.emergencyContactName ?? null,
        emergencyContactNumber:
          values.emergencyContactNumber ?? null,
        emergencyContactRelationship:
          values.emergencyContactRelationship ?? null,
      };

      // Debug without logging sensitive information
      console.log("PARTICIPANT REGISTRATION", {
        email: request.email,
        hasGoogleIdToken: Boolean(googleIdToken),
        hasProfileImage: Boolean(values.profileImage),
        hasValidIdImage: Boolean(values.validIdImage),
        hasEducationalInformation: Boolean(
          values.highestEducationalAttainment ||
          values.schoolName ||
          values.courseOrDegree
        ),
        hasEmploymentInformation: Boolean(
          values.employmentStatus ||
          values.companyName ||
          values.jobTitle
        ),
        hasEmergencyContact: Boolean(
          values.emergencyContactName ||
          values.emergencyContactNumber
        ),
      });

      // API request
      const response = await authApi.register(request);

      if (response.success === false) {
        throw new Error(
          response.message || "Unable to create your account."
        );
      }

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
