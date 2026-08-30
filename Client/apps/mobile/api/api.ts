import {
  ApiClient,
  AuthApi,
  ParticipantApi
} from "@repo/api";
import { auth } from "./auth";
const apiClient = new ApiClient({
  baseUrl:
    process.env.EXPO_PUBLIC_API_URL ?? "",
    getToken: async() =>{
      return auth.getToken();
    },
});
export const participantApi = new ParticipantApi(apiClient);
export const authApi =
  new AuthApi(apiClient);