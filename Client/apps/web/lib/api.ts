import { ApiClient, AuthApi } from "@repo/api";

const client = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL!
);

export const authApi = new AuthApi(client);