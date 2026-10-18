
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

type RegistrationImage = {
  uri: string;
  name: string;
  type: string;
};

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
  // GOOGLE LOGIN
  // ==========================================

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
    const formData = new FormData();

    // Append non-empty text and numeric values.
    const appendValue = (
      key: string,
      value: string | number | null | undefined
    ) => {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        formData.append(key, String(value));
      }
    };

    // Append Expo / React Native image objects.
    const appendImage = (
      key: string,
      image?: RegistrationImage | null
    ) => {
      if (!image) return;

      formData.append(
        key,
        {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as unknown as Blob
      );
    };

    // ------------------------------------------
    // GOOGLE AUTHENTICATION
    // ------------------------------------------

    appendValue("GoogleIdToken", request.googleIdToken);

    // ------------------------------------------
    // PERSONAL INFORMATION
    // ------------------------------------------

    appendValue("FirstName", request.firstName);
    appendValue("MiddleName", request.middleName);
    appendValue("LastName", request.lastName);

    appendValue("Email", request.email);
    appendValue("MobileNumber", request.mobileNumber);
    appendValue("BirthDate", request.birthDate);
    appendValue("Address", request.address);
    appendValue("Gender", request.gender);
    appendValue("Password", request.password);

    // ------------------------------------------
    // EDUCATIONAL INFORMATION
    // ------------------------------------------

    appendValue(
      "HighestEducationalAttainment",
      request.highestEducationalAttainment
    );

    appendValue(
      "EducationalStatus",
      request.educationalStatus
    );

    appendValue("SchoolName", request.schoolName);
    appendValue("CourseOrDegree", request.courseOrDegree);
    appendValue("FieldOfStudy", request.fieldOfStudy);
    appendValue("YearGraduated", request.yearGraduated);

    // ------------------------------------------
    // EMPLOYMENT INFORMATION
    // ------------------------------------------

    appendValue("EmploymentStatus", request.employmentStatus);
    appendValue("CompanyName", request.companyName);
    appendValue("JobTitle", request.jobTitle);
    appendValue("Industry", request.industry);

    appendValue(
      "YearsOfWorkExperience",
      request.yearsOfWorkExperience
    );

    // ------------------------------------------
    // VALID ID INFORMATION
    // ------------------------------------------

    appendValue("ValidIdType", request.validIdType);
    appendValue("ValidIdNumber", request.validIdNumber);

    appendImage("ValidIdImage", request.validIdImage);

    // ------------------------------------------
    // EMERGENCY CONTACT
    // ------------------------------------------

    appendValue(
      "EmergencyContactName",
      request.emergencyContactName
    );

    appendValue(
      "EmergencyContactNumber",
      request.emergencyContactNumber
    );

    appendValue(
      "EmergencyContactRelationship",
      request.emergencyContactRelationship
    );

    // ------------------------------------------
    // PROFILE IMAGE
    // ------------------------------------------

    appendImage("ProfileImage", request.profileImage);

    // ------------------------------------------
    // SEND REGISTRATION REQUEST
    // ------------------------------------------

    return this.api.request<RegisterResponse>(
      AuthEndpoints.register(),
      {
        method: "POST",
        body: formData,
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

    const appendValue = (
      key: string,
      value: string | number | null | undefined
    ) => {
      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        formData.append(key, String(value));
      }
    };

    appendValue("GoogleIdToken", request.GoogleIdToken);
    appendValue("FirstName", request.FirstName);
    appendValue("MiddleName", request.MiddleName);
    appendValue("LastName", request.LastName);
    appendValue("Suffix", request.Suffix);
    appendValue("BirthDate", request.BirthDate);
    appendValue("Address", request.Address);
    appendValue("Gender", request.Gender);
    appendValue("Email", request.Email);
    appendValue("MobileNumber", request.MobileNumber);
    appendValue("Password", request.Password);

    appendValue("Specialization", request.Specialization);
    appendValue("ProfessionalTitle", request.ProfessionalTitle);
    appendValue("CurrentOrganization", request.CurrentOrganization);
    appendValue("Bio", request.Bio);
    appendValue("YearsOfExperience", request.YearsOfExperience);

    appendValue(
      "ProfessionalLicenseNumber",
      request.ProfessionalLicenseNumber
    );

    appendValue(
      "ProfessionalLicenseType",
      request.ProfessionalLicenseType
    );

    appendValue(
      "ProfessionalLicenseExpirationDate",
      request.ProfessionalLicenseExpirationDate
    );

    if (request.ProfileImage) {
      formData.append(
        "ProfileImage",
        request.ProfileImage
      );
    }

    if (request.Educations) {
      formData.append(
        "Educations",
        JSON.stringify(request.Educations)
      );
    }

    if (request.Certifications) {
      formData.append(
        "Certifications",
        JSON.stringify(request.Certifications)
      );
    }

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
