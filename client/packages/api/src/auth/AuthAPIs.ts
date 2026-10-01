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
  GoogleLoginRequest,
  GoogleLoginResponse,
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

  async googleLogin(
    request: GoogleLoginRequest
  ): Promise<GoogleLoginResponse> {
    return this.api.request<GoogleLoginResponse>(
      AuthEndpoints.google(),
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

  console.log(
    "================================="
  );

  console.log(
    "AUTH APIS - REGISTER TRAINER"
  );

  console.log(
    "GoogleIdToken received:",
    request.GoogleIdToken
      ? `FOUND (${request.GoogleIdToken.length} chars)`
      : "MISSING"
  );

  console.log(
    "GoogleIdToken raw:",
    request.GoogleIdToken
      ? request.GoogleIdToken.substring(0, 30) + "..."
      : "NULL"
  );

  console.log(
    "Email:",
    request.Email
  );

  console.log(
    "ProfileImage:",
    request.ProfileImage
      ? request.ProfileImage.name
      : "NO LOCAL IMAGE"
  );

  console.log(
    "================================="
  );

  const formData = new FormData();

  // ==========================================================
  // GOOGLE AUTHENTICATION
  // ==========================================================

  if (
    request.GoogleIdToken &&
    request.GoogleIdToken.trim().length > 0
  ) {
    formData.append(
      "GoogleIdToken",
      request.GoogleIdToken.trim()
    );
  }

  // ==========================================================
  // PERSONAL INFORMATION
  // ==========================================================

  formData.append(
    "FirstName",
    request.FirstName
  );

  if (request.MiddleName) {
    formData.append(
      "MiddleName",
      request.MiddleName
    );
  }

  formData.append(
    "LastName",
    request.LastName
  );

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

  formData.append(
    "Address",
    request.Address
  );

  formData.append(
    "Gender",
    request.Gender
  );

  // ==========================================================
  // ACCOUNT INFORMATION
  // ==========================================================

  formData.append(
    "Email",
    request.Email
  );

  if (request.MobileNumber) {
    formData.append(
      "MobileNumber",
      request.MobileNumber
    );
  }

  formData.append(
    "Password",
    request.Password
  );

  // ==========================================================
  // PROFESSIONAL INFORMATION
  // ==========================================================

  formData.append(
    "Specialization",
    request.Specialization
  );

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
    request.YearsOfExperience !== null &&
    request.YearsOfExperience !== undefined
  ) {
    formData.append(
      "YearsOfExperience",
      String(request.YearsOfExperience)
    );
  }

  // ==========================================================
  // PROFESSIONAL LICENSE
  // ==========================================================

  if (request.ProfessionalLicenseNumber) {
    formData.append(
      "ProfessionalLicenseNumber",
      request.ProfessionalLicenseNumber
    );
  }

  if (request.ProfessionalLicenseType) {
    formData.append(
      "ProfessionalLicenseType",
      request.ProfessionalLicenseType
    );
  }

  if (request.ProfessionalLicenseExpirationDate) {
    formData.append(
      "ProfessionalLicenseExpirationDate",
      request.ProfessionalLicenseExpirationDate
    );
  }

  // ==========================================================
  // PROFILE IMAGE
  // ==========================================================

  if (request.ProfileImage) {
    formData.append(
      "ProfileImage",
      request.ProfileImage
    );
  }

  // ==========================================================
  // EDUCATIONS
  // ==========================================================

  if (request.Educations) {
    formData.append(
      "Educations",
      JSON.stringify(request.Educations)
    );
  }

  // ==========================================================
  // CERTIFICATIONS
  // ==========================================================

  if (request.Certifications) {
    formData.append(
      "Certifications",
      JSON.stringify(request.Certifications)
    );
  }

  // ==========================================================
  // VERIFY FORMDATA BEFORE API CLIENT
  // ==========================================================

  console.log(
    "================================="
  );

  console.log(
    "FINAL FORMDATA BEFORE API CLIENT"
  );

  console.log(
    "Has GoogleIdToken:",
    formData.has("GoogleIdToken")
  );

  console.log(
    "GoogleIdToken:",
    formData.get("GoogleIdToken")
      ? "FOUND"
      : "MISSING"
  );

  console.log(
    "================================="
  );

  for (
    const [key, value]
    of formData.entries()
  ) {
    if (key === "GoogleIdToken") {
      console.log(
        key,
        typeof value === "string"
          ? `FOUND (${value.length} chars)`
          : "INVALID"
      );
    }
  }

  // ==========================================================
  // SEND REQUEST
  // ==========================================================

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