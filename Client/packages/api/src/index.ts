import { AuthApi } from "./api";
import { ApiClient } from "./client";
import { API_BASE_URL } from "./config";


import { ParticipantApi } from "./participant";

const client = new ApiClient(API_BASE_URL);

export const authApi = new AuthApi(client);
export const participantApi = new ParticipantApi(client);

export * from "./auth";
export * from "./participant";
export * from "./client";
export * from "./config";