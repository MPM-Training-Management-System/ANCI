import { ApiClient } from "./client";
import type { LoginRequest, LoginResponse } from "@repo/types";

export class AuthApi {
  constructor(private api: ApiClient) {}

  login(data: LoginRequest) {
    return this.api.request<LoginResponse>(
      "/api/Auth/Login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }
}