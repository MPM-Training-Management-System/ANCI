import {
  ApiClient,
  AuthApi,
  ParticipantApi
} from "@repo/api";

import { auth } from "./auth";

const client = new ApiClient({
  baseUrl:
    process.env.EXPO_PUBLIC_API_URL!,

  getToken: () =>
    auth.getToken(),
});

export const authApi =
  new AuthApi(client);
export const participantApi = new ParticipantApi(client);
export { client };