import { ApiClient } from "./client";
import { AuthApi } from "./auth";

export function createApi(baseUrl: string) {
  const apiClient = new ApiClient({
    baseUrl,
  });

  const authApi = new AuthApi(apiClient);

   return {
    apiClient,
    authApi,
  };
}

export * from "./client";
export * from "./auth";
export * from "./types";