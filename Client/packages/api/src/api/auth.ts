import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  OtpResponse,
  RegisterRequest,
  RegisterResponse,
  SendOtpRequest,
  VerifyOtpRequest,
} from "@repo/types";

import {
  ApiClient,
} from "./client";


export class AuthApi {

  constructor(
    private readonly api: ApiClient
  ) {}


  // =========================================================
  // REGISTER PARTICIPANT
  // =========================================================

  async register(
    request: RegisterRequest
  ): Promise<RegisterResponse> {

    const formData =
      new FormData();


    // =======================================================
    // TEXT FIELDS
    // =======================================================

    formData.append(
      "fullName",
      request.fullName ?? ""
    );

    formData.append(
      "firstName",
      request.firstName
    );

    formData.append(
      "middleName",
      request.middleName
    );

    formData.append(
      "lastName",
      request.lastName
    );

    formData.append(
      "email",
      request.email
    );

    formData.append(
      "mobileNumber",
      request.mobileNumber
    );

    formData.append(
      "birthDate",
      request.birthDate
    );

    formData.append(
      "address",
      request.address
    );

    formData.append(
      "gender",
      request.gender
    );

    formData.append(
      "password",
      request.password
    );


    // =======================================================
    // PROFILE IMAGE
    // =======================================================

    if (
      request.profileImage
    ) {

      formData.append(
        "profileImage",
        {
          uri:
            request.profileImage.uri,

          name:
            request.profileImage.name,

          type:
            request.profileImage.type,
        } as any
      );
    }


    // =======================================================
    // API
    // =======================================================

    return this.api.request<RegisterResponse>(
      "/api/auth/register",
      {
        method: "POST",

        body: formData,
      }
    );
  }


  // =========================================================
  // ME
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


  // =========================================================
  // SEND OTP
  // =========================================================

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


  // =========================================================
  // VERIFY OTP
  // =========================================================

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
}