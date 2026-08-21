import { OtpResponse, RegisterRequest, RegisterResponse, SendOtpRequest, VerifyOtpRequest } from "@repo/types";
import { ApiClient } from "./client";


export class AuthApi {
  constructor(
    private readonly api: ApiClient
  ) {}

  async register(
    request: RegisterRequest
  ): Promise<RegisterResponse>{
    return this.api.request<RegisterResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: request
    }
  );
  }


  async sendOtp(
    request: SendOtpRequest
  ): Promise<OtpResponse>{
    return this.api.request<OtpResponse>(
      "/api/otp/send",
      {
        method: "POST",
        body: request
      }
    )
  }

  async verifyOtp(
    request: VerifyOtpRequest
  ): Promise<OtpResponse>{
    return this.api.request<OtpResponse>(
      "/api/otp/verify",
      {
        method: "POST",
        body: request
      }
    )
  }
}