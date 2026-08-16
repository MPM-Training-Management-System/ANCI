import {
  ApiClient,
  AuthApi,
  ParticipantApi,
  TrainingApi,
  TrainerApi
} from "@repo/api";

import { auth } from "./auth";


const client = new ApiClient({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL!,

  getToken: () =>
    auth.getToken(),
});

export const authApi =
  new AuthApi(client);

  export const participantApi = new ParticipantApi(client);
  export const trainingApi = new TrainingApi(client);
  export const trainerApi = new TrainerApi(client);

export { client, auth };