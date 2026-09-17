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
    return this.api.request<RegisterResponse>(
      AuthEndpoints.registerTrainer(),
      {
        method: "POST",
        body: request,
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