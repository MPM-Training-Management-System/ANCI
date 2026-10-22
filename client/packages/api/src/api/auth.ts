import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  OtpResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterTrainerRequest,
  SendOtpRequest,
  TrainerApplication,
  VerifyOtpRequest,
  TrainerApplicationDocument,
  UpdateTrainerApplicationRequest,
  GoogleLoginResponse,
  GoogleLoginRequest,
} from "@repo/types";

import {
  ApiClient,
} from "./client";


export class AuthApi {

  constructor(
    private readonly api: ApiClient
  ) {}


async register(
  request: RegisterRequest
): Promise<RegisterResponse> {
  const formData = new FormData();

  // =========================================================
  // GOOGLE AUTHENTICATION
  // =========================================================

  if (request.googleIdToken?.trim()) {
    formData.append(
      "GoogleIdToken",
      request.googleIdToken.trim()
    );
  }

  // =========================================================
  // PERSONAL INFORMATION
  // =========================================================

  formData.append("FullName", request.fullName ?? "");
  formData.append("FirstName", request.firstName);
  formData.append("MiddleName", request.middleName ?? "");
  formData.append("LastName", request.lastName);
  formData.append("Email", request.email);
  formData.append("MobileNumber", request.mobileNumber);
  formData.append("BirthDate", request.birthDate);
  formData.append("Address", request.address);
  formData.append("Gender", request.gender);

  if (request.password) {
    formData.append("Password", request.password);
  }

  // =========================================================
  // EDUCATIONAL BACKGROUND
  // =========================================================

  const optionalFields: Array<
    [string, string | number | null | undefined]
  > = [
    [
      "HighestEducationalAttainment",
      request.highestEducationalAttainment,
    ],
    [
      "EducationalStatus",
      request.educationalStatus,
    ],
    [
      "SchoolName",
      request.schoolName,
    ],
    [
      "CourseOrDegree",
      request.courseOrDegree,
    ],
    [
      "FieldOfStudy",
      request.fieldOfStudy,
    ],
    [
      "YearGraduated",
      request.yearGraduated,
    ],

    // =======================================================
    // EMPLOYMENT INFORMATION
    // =======================================================

    [
      "EmploymentStatus",
      request.employmentStatus,
    ],
    [
      "CompanyName",
      request.companyName,
    ],
    [
      "JobTitle",
      request.jobTitle,
    ],
    [
      "Industry",
      request.industry,
    ],
    [
      "YearsOfWorkExperience",
      request.yearsOfWorkExperience,
    ],

    // =======================================================
    // EMERGENCY CONTACT
    // =======================================================

    [
      "EmergencyContactName",
      request.emergencyContactName,
    ],
    [
      "EmergencyContactNumber",
      request.emergencyContactNumber,
    ],
    [
      "EmergencyContactRelationship",
      request.emergencyContactRelationship,
    ],
  ];

  for (const [key, value] of optionalFields) {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }

  // =========================================================
  // VALID ID INFORMATION
  // Use these fields only if they exist in RegisterRequest
  // and your backend registration DTO.
  // =========================================================

  if (request.validIdType) {
    formData.append("ValidIdType", request.validIdType);
  }

  if (request.validIdNumber) {
    formData.append("ValidIdNumber", request.validIdNumber);
  }

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  if (request.profileImage) {
    formData.append(
      "ProfileImage",
      request.profileImage as any
    );
  }

    // =========================================================
  // VALID ID INFORMATION
  // =========================================================

  if (request.validIdType) {
    formData.append(
      "ValidIdType",
      request.validIdType
    );
  }

  if (request.validIdNumber) {
    formData.append(
      "ValidIdNumber",
      request.validIdNumber
    );
  }

  // =========================================================
  // VALID ID IMAGE
  // =========================================================

  if (request.validIdImage) {
    formData.append(
      "ValidIdImage",
      request.validIdImage as any
    );
  } else {
    console.error(
      "❌ ValidIdImage is missing from registration request."
    );
  }

  // =========================================================
  // DEBUG - SAFE FIELD CHECK
  // =========================================================

  console.log("========== PARTICIPANT REGISTRATION ==========");

  for (const [key, value] of formData.entries()) {
    if (key === "Password" || key === "GoogleIdToken") {
      console.log(
        `${key}:`,
        value ? "PROVIDED" : "EMPTY"
      );
      continue;
    }

    if (key === "ValidIdNumber") {
      console.log(
        `${key}:`,
        value ? "PROVIDED" : "EMPTY"
      );
      continue;
    }

    if (typeof value === "string") {
      console.log(
        `${key}:`,
        value.trim() ? "PROVIDED" : "EMPTY"
      );
      continue;
    }

    console.log(`${key}: FILE ATTACHED`);
  }

  console.log("==============================================");

  // =========================================================
  // API REQUEST
  // =========================================================

  return this.api.request<RegisterResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: formData,
    }
  );
}


async registerTrainer(
  request: RegisterTrainerRequest
): Promise<RegisterResponse> {

  const formData = new FormData();

  // =========================================================
  // GOOGLE AUTHENTICATION
  // =========================================================

  if (
    request.GoogleIdToken &&
    request.GoogleIdToken.trim()
  ) {
    formData.append(
      "GoogleIdToken",
      request.GoogleIdToken.trim()
    );
  }

  // =========================================================
  // PERSONAL INFORMATION
  // =========================================================

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

  // =========================================================
  // ACCOUNT
  // =========================================================

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

  // =========================================================
  // TRAINER INFORMATION
  // =========================================================

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
    request.YearsOfExperience !== undefined &&
    request.YearsOfExperience !== null
  ) {
    formData.append(
      "YearsOfExperience",
      String(request.YearsOfExperience)
    );
  }

  // =========================================================
  // PROFESSIONAL LICENSE
  // =========================================================

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

  if (
    request.ProfessionalLicenseExpirationDate
  ) {
    formData.append(
      "ProfessionalLicenseExpirationDate",
      request.ProfessionalLicenseExpirationDate
    );
  }

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  if (request.ProfileImage) {
    formData.append(
      "ProfileImage",
      request.ProfileImage
    );
  }

  // =========================================================
  // EDUCATIONS
  // =========================================================

  if (request.Educations?.length) {
    request.Educations.forEach(
      (education, index) => {

        formData.append(
          `Educations[${index}].Degree`,
          education.degree
        );

        if (education.fieldOfStudy) {
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
          education.yearGraduated !== undefined &&
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

  // =========================================================
  // CERTIFICATIONS
  // =========================================================

  if (request.Certifications?.length) {
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

        if (certification.issuedDate) {
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

  // =========================================================
  // DEBUG
  // =========================================================

  console.log(
    "================================="
  );

  console.log(
    "🔥 REGISTER TRAINER FORMDATA"
  );

  console.log(
    "GoogleIdToken:",
    formData.has("GoogleIdToken")
      ? "FOUND"
      : "MISSING"
  );

  const googleToken =
    formData.get("GoogleIdToken");

  console.log(
    "GoogleIdToken length:",
    typeof googleToken === "string"
      ? googleToken.length
      : 0
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

      continue;
    }

    if (value instanceof File) {
      console.log(
        key,
        {
          name: value.name,
          type: value.type,
          size: value.size,
        }
      );

      continue;
    }

    console.log(
      key,
      value
    );
  }

  console.log(
    "================================="
  );

  // =========================================================
  // API REQUEST
  // =========================================================

  return this.api.request<RegisterResponse>(
    "/api/auth/register/trainer",
    {
      method: "POST",
      body: formData,
    }
  );
}
  // =========================================================
  // ME
  // GET /api/auth/me
  // =========================================================

  async me(): Promise<MeResponse> {

    return this.api.request<MeResponse>(
      "/api/auth/me",
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // LOGIN
  // POST /api/auth/login
  // =========================================================

  async login(
    request: LoginRequest
  ): Promise<LoginResponse> {

    return this.api.request<LoginResponse>(
      "/api/auth/login",
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
      "/api/auth/google",
      {
        method: "POST",
        body: request,
      }
    );
  }


  async sendOtp(
    request: SendOtpRequest
  ): Promise<OtpResponse> {

    return this.api.request<OtpResponse>(
      "/api/otp/send",
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
      "/api/otp/verify",
      {
        method: "POST",
        body: request,
      }
    );
  }



  async getMyTrainerApplication(): Promise<TrainerApplication> {

    return this.api.request<TrainerApplication>(
      "/api/trainer-applications/me",
      {
        method: "GET",
      }
    );
  }



  async updateMyTrainerApplication(
    request: UpdateTrainerApplicationRequest
  ): Promise<TrainerApplication> {

    return this.api.request<TrainerApplication>(
      "/api/trainer-applications/me",
      {
        method: "PUT",
        body: request,
      }
    );
  }


  // =========================================================
  // UPDATE TRAINER PROFILE IMAGE
  //
  // PUT
  // /api/trainer-applications/me/profile-image
  // =========================================================

  async updateTrainerProfileImage(
    profileImage: File
  ): Promise<TrainerApplication> {

    const formData =
      new FormData();


    formData.append(
      "profileImage",
      profileImage
    );


    return this.api.request<TrainerApplication>(
      "/api/trainer-applications/me/profile-image",
      {
        method: "PUT",
        body: formData,
      }
    );
  }


  // =========================================================
  // GET MY TRAINER DOCUMENTS
  //
  // GET
  // /api/trainer-applications/{id}/documents
  // =========================================================

  async getMyTrainerDocuments(
    applicationId: string
  ): Promise<TrainerApplicationDocument[]> {

    return this.api.request<
      TrainerApplicationDocument[]
    >(
      `/api/trainer-applications/${applicationId}/documents`,
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // UPLOAD TRAINER DOCUMENT
  //
  // POST
  // /api/trainer-applications/{id}/documents
  // =========================================================

  async uploadTrainerDocument(
    applicationId: string,
    formData: FormData
  ): Promise<TrainerApplicationDocument> {

    return this.api.request<TrainerApplicationDocument>(
      `/api/trainer-applications/${applicationId}/documents`,
      {
        method: "POST",
        body: formData,
      }
    );
  }


  // =========================================================
  // DELETE TRAINER DOCUMENT
  //
  // DELETE
  // /api/trainer-applications/{id}/documents/{documentId}
  // =========================================================

  async deleteTrainerDocument(
    applicationId: string,
    documentId: string
  ): Promise<void> {

    return this.api.request<void>(
      `/api/trainer-applications/${applicationId}/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );
  }


  // =========================================================
  // =========================================================
  // ADMIN TRAINER APPLICATION
  // =========================================================
  // =========================================================


  // =========================================================
  // GET ALL TRAINER APPLICATIONS
  //
  // GET
  // /api/trainer-applications
  //
  // ADMIN ONLY
  // =========================================================

  async getAll(): Promise<TrainerApplication[]> {

    return this.api.request<TrainerApplication[]>(
      "/api/trainer-applications",
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // GET TRAINER APPLICATION BY ID
  //
  // GET
  // /api/trainer-applications/{id}
  //
  // ADMIN ONLY
  // =========================================================

  async getTrainerApplicationById(
    id: string
  ): Promise<TrainerApplication> {

    return this.api.request<TrainerApplication>(
      `/api/trainer-applications/${id}`,
      {
        method: "GET",
      }
    );
  }
}