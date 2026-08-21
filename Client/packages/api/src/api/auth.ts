import { RegisterRequest, RegisterResponse } from "@repo/types";
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
}