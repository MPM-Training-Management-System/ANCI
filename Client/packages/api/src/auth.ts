import { ApiClient } from "./client";
import { LoginRequest, LoginResponse } from "@repo/types";


export class AuthApi {
  constructor(private api: ApiClient) {}

  login(data: LoginRequest) {
    return this.api.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}