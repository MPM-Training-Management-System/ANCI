import {
    ApiClient,
    AuthApi,
    API_BASE_URL
} from "@repo/api";

const client = new ApiClient(API_BASE_URL);

export const authApi = new AuthApi(client);