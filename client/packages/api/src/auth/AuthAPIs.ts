import { ApiClient } from "../api/client";
import { AuthEndpoints } from "./AuthEndpoints";

import type {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  SendOtpRequest,
  OtpResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  MeResponse,
  RegisterTrainerRequest,
} from "@repo/types";

export class AuthAPIs {
  constructor(private readonly api: ApiClient) {}

  // ==========================================
  // LOGIN
  // ==========================================

  async login(
    request: LoginRequest
  ): Promise<LoginResponse> {
    return this.api.request<LoginResponse>(
      AuthEndpoints.login(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ==========================================
  // PARTICIPANT REGISTRATION
  // ==========================================

  async register(
    request: RegisterRequest
  ): Promise<RegisterResponse> {
    return this.api.request<RegisterResponse>(
      AuthEndpoints.register(),
      {
        method: "POST",
        body: request,
      }
    );
  }
// ==========================================
// TRAINER REGISTRATION
// ==========================================

async registerTrainer(
  request: RegisterTrainerRequest
): Promise<RegisterResponse> {
  const formData = new FormData();

  // ========================================================
  // PERSONAL INFORMATION
  // ========================================================

  if (request.FirstName) {
    formData.append(
      "FirstName",
      request.FirstName
    );
  }

  if (request.MiddleName) {
    formData.append(
      "MiddleName",
      request.MiddleName
    );
  }

  if (request.LastName) {
    formData.append(
      "LastName",
      request.LastName
    );
  }

  if (request.Suffix) {
    formData.append(
      "Suffix",
      request.Suffix
    );
  }

  if (request.BirthDate) {
    formData.append(
      "BirthDate",
      request.BirthDate
    );
  }

  if (request.Address) {
    formData.append(
      "Address",
      request.Address
    );
  }

  if (request.Gender) {
    formData.append(
      "Gender",
      request.Gender
    );
  }

  // ========================================================
  // ACCOUNT INFORMATION
  // ========================================================

  if (request.Email) {
    formData.append(
      "Email",
      request.Email
    );
  }

  if (request.MobileNumber) {
    formData.append(
      "MobileNumber",
      request.MobileNumber
    );
  }

  if (request.Password) {
    formData.append(
      "Password",
      request.Password
    );
  }

  // ========================================================
  // PROFESSIONAL INFORMATION
  // ========================================================

  if (request.Specialization) {
    formData.append(
      "Specialization",
      request.Specialization
    );
  }

  if (request.ProfessionalTitle) {
    formData.append(
      "ProfessionalTitle",
      request.ProfessionalTitle
    );
  }

  if (request.CurrentOrganization) {
    formData.append(
      "CurrentOrganization",
      request.CurrentOrganization
    );
  }

  if (request.Bio) {
    formData.append(
      "Bio",
      request.Bio
    );
  }

  if (
    request.YearsOfExperience !==
      undefined &&
    request.YearsOfExperience !== null
  ) {
    formData.append(
      "YearsOfExperience",
      String(
        request.YearsOfExperience
      )
    );
  }

  // ========================================================
  // PROFESSIONAL LICENSE
  // ========================================================

  if (
    request.ProfessionalLicenseNumber
  ) {
    formData.append(
      "ProfessionalLicenseNumber",
      request.ProfessionalLicenseNumber
    );
  }

  if (
    request.ProfessionalLicenseType
  ) {
    formData.append(
      "ProfessionalLicenseType",
      request.ProfessionalLicenseType
    );
  }

  if (
    request.ProfessionalLicenseExpirationDate
  ) {
    formData.append(
      "ProfessionalLicenseExpirationDate",
      request.ProfessionalLicenseExpirationDate
    );
  }

  // ========================================================
  // PROFILE IMAGE
  // ========================================================

  if (request.ProfileImage) {
    formData.append(
      "ProfileImage",
      request.ProfileImage
    );
  }

  // ========================================================
  // EDUCATIONS
  // ========================================================

  if (request.Educations?.length) {
    request.Educations.forEach(
      (education, index) => {
        formData.append(
          `Educations[${index}].Degree`,
          education.degree
        );

        if (
          education.fieldOfStudy
        ) {
          formData.append(
            `Educations[${index}].FieldOfStudy`,
            education.fieldOfStudy
          );
        }

        formData.append(
          `Educations[${index}].Institution`,
          education.institution
        );

        if (
          education.yearGraduated !==
            undefined &&
          education.yearGraduated !== null
        ) {
          formData.append(
            `Educations[${index}].YearGraduated`,
            String(
              education.yearGraduated
            )
          );
        }
      }
    );
  }

  // ========================================================
  // CERTIFICATIONS
  // ========================================================

  if (
    request.Certifications?.length
  ) {
    request.Certifications.forEach(
      (certification, index) => {
        formData.append(
          `Certifications[${index}].Name`,
          certification.name
        );

        if (
          certification.issuingOrganization
        ) {
          formData.append(
            `Certifications[${index}].IssuingOrganization`,
            certification.issuingOrganization
          );
        }

        if (
          certification.issuedDate
        ) {
          formData.append(
            `Certifications[${index}].IssuedDate`,
            certification.issuedDate
          );
        }

        if (
          certification.expirationDate
        ) {
          formData.append(
            `Certifications[${index}].ExpirationDate`,
            certification.expirationDate
          );
        }

        if (
          certification.certificateUrl
        ) {
          formData.append(
            `Certifications[${index}].CertificateUrl`,
            certification.certificateUrl
          );
        }
      }
    );
  }

  // ========================================================
  // DEBUG FORMDATA
  // ========================================================

  console.log(
    "================================="
  );

  console.log(
    "REGISTER TRAINER FORMDATA"
  );

  for (
    const [key, value] of formData.entries()
  ) {
    if (value instanceof File) {
      console.log(
        key,
        value.name,
        value.type,
        value.size
      );
    } else {
      console.log(
        key,
        value
      );
    }
  }

  console.log(
    "================================="
  );

  // ========================================================
  // API REQUEST
  // ========================================================

  return this.api.request<RegisterResponse>(
    AuthEndpoints.registerTrainer(),
    {
      method: "POST",
      body: formData,
    }
  );
}

  // ==========================================
  // EMAIL VERIFICATION
  // ==========================================

  async sendOtp(
    request: SendOtpRequest
  ): Promise<OtpResponse> {
    return this.api.request<OtpResponse>(
      AuthEndpoints.sendOtp(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  async verifyOtp(
    request: VerifyOtpRequest
  ): Promise<OtpResponse> {
    return this.api.request<OtpResponse>(
      AuthEndpoints.verifyOtp(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<OtpResponse> {
    return this.api.request<OtpResponse>(
      AuthEndpoints.forgotPassword(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ==========================================
  // VERIFY PASSWORD RESET OTP
  // ==========================================

  async verifyResetOtp(
    request: VerifyResetOtpRequest
  ): Promise<OtpResponse> {
    return this.api.request<OtpResponse>(
      AuthEndpoints.verifyResetOtp(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<OtpResponse> {
    return this.api.request<OtpResponse>(
      AuthEndpoints.resetPassword(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  async changePassword(
    request: ChangePasswordRequest
  ): Promise<OtpResponse> {
    return this.api.request<OtpResponse>(
      AuthEndpoints.changePassword(),
      {
        method: "POST",
        body: request,
      }
    );
  }

  // ==========================================
  // CURRENT USER
  // ==========================================

  async me(): Promise<MeResponse> {
    return this.api.request<MeResponse>(
      AuthEndpoints.me(),
      {
        method: "GET",
      }
    );
  }
}