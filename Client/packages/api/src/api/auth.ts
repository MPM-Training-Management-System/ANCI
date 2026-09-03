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

    const formData =
      new FormData();


    formData.append(
      "FullName",
      request.fullName ?? ""
    );

    formData.append(
      "FirstName",
      request.firstName
    );

    formData.append(
      "MiddleName",
      request.middleName
    );

    formData.append(
      "LastName",
      request.lastName
    );

    formData.append(
      "Email",
      request.email
    );

    formData.append(
      "MobileNumber",
      request.mobileNumber
    );

    formData.append(
      "BirthDate",
      request.birthDate
    );

    formData.append(
      "Address",
      request.address
    );

    formData.append(
      "Gender",
      request.gender
    );

    formData.append(
      "Password",
      request.password
    );


    if (
      request.profileImage
    ) {

      formData.append(
        "ProfileImage",
        request.profileImage as any
      );
    }


    return this.api.request<RegisterResponse>(
      "/api/auth/register",
      {
        method: "POST",
        body: formData,
      }
    );
  }


  // =========================================================
  // REGISTER TRAINER
  // POST /api/auth/register/trainer
  // =========================================================

  async registerTrainer(
    request: RegisterTrainerRequest
  ): Promise<RegisterResponse> {

    const formData =
      new FormData();


    // =======================================================
    // PERSONAL INFORMATION
    // =======================================================

    formData.append(
      "FullName",
      request.fullName ?? ""
    );

    formData.append(
      "FirstName",
      request.firstName
    );

    formData.append(
      "MiddleName",
      request.middleName
    );

    formData.append(
      "LastName",
      request.lastName
    );

    formData.append(
      "BirthDate",
      request.birthDate
    );

    formData.append(
      "Address",
      request.address
    );

    formData.append(
      "Gender",
      request.gender
    );


    // =======================================================
    // ACCOUNT
    // =======================================================

    formData.append(
      "Email",
      request.email
    );

    formData.append(
      "MobileNumber",
      request.mobileNumber ?? ""
    );

    formData.append(
      "Password",
      request.password
    );


    // =======================================================
    // TRAINER INFORMATION
    // =======================================================

    formData.append(
      "Specialization",
      request.specialization
    );

    formData.append(
      "YearsOfExperience",
      String(
        request.yearsOfExperience ?? 0
      )
    );

    formData.append(
      "CertificationName",
      request.certificationName ?? ""
    );

    formData.append(
      "CertificationNumber",
      request.certificationNumber ?? ""
    );


    // =======================================================
    // PROFILE IMAGE
    // =======================================================

    if (
      request.profileImage
    ) {

      formData.append(
        "ProfileImage",
        request.profileImage
      );
    }


    // =======================================================
    // DEBUG
    // =======================================================

    console.log(
      "=============================="
    );

    console.log(
      "REGISTER TRAINER"
    );

    for (
      const [key, value]
      of formData.entries()
    ) {

      if (
        value instanceof File
      ) {

        console.log(
          key,
          {
            name: value.name,
            type: value.type,
            size: value.size,
          }
        );

      } else {

        console.log(
          key,
          value
        );
      }
    }

    console.log(
      "=============================="
    );


    // =======================================================
    // API
    // =======================================================

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