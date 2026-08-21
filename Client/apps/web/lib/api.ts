import { createApi } from "@repo/api";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured."
  );
}

export const {
  apiClient,
  authApi,
} = createApi(baseUrl);