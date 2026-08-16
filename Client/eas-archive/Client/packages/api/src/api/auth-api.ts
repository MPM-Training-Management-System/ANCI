import { User } from "@repo/types";
import { ApiClient } from "./client";

export interface LoginRequest {
  login: string;
  password: string;
}


export interface UpdateUser {
  username: string;
  fullName: String;
  email:  string;
}

export interface ChangePassRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
}
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}
export interface RegisterResponse {
  success: boolean;
  message: string;
  token: string;
  user: LoginUser;
}

export interface SendOtpResponse {
  email: string;
}

export interface VerifyOtpResponse {
  email: string;
  otp: string;
}

export interface OtpResponse{
  message: string;
  token: string;
  user: User;
}

export class AuthApi {
  constructor(
    private readonly api: ApiClient
  ) {}


  sendotp(data: SendOtpResponse) {
    return this.api.post<OtpResponse>(
      "/api/auth/send-otp",
      data
    );
  }

  verifyotp(data: VerifyOtpResponse) {
    return this.api.post<OtpResponse>(
      "/api/auth/verify-otp",
      data
    );
  }

  login(data: LoginRequest) {
    return this.api.post<LoginResponse>(
      "/api/auth/login",
      data
    );
  }
    register(data: RegisterRequest) {
    return this.api.post<RegisterResponse>(
      "/api/auth/register-account",
      data
    );
  }

  me() {
    return this.api.get<LoginUser>(
      "/api/auth/me"
    );
  }
  changepassword(data: ChangePassRequest){
    return this.api.post<ChangePassRequest>(
      "api/auth/change-password"
    )
  }

  logout() {
    return this.api.post<void>(
      "/api/auth/logout"
    );
  }

  refreshToken() {
    return this.api.post<{
      token: string;
    }>(
      "/api/auth/refresh"
    );
  }
}