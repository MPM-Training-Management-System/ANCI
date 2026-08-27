import {
  ApiClient,
  AuthApi,
} from "@repo/api";

const apiClient = new ApiClient({
  baseUrl:
    process.env.EXPO_PUBLIC_API_URL ?? "",
});

export const authApi =
  new AuthApi(apiClient);