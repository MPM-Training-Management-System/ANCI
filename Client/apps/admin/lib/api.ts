import {
  ApiClient,
  AuthApi,
  TrainerApplicationApi,
} from "@repo/api";

import {
  auth,
} from "@/lib/auth";


// =========================================================
// API BASE URL
// =========================================================

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured."
  );
}


// =========================================================
// API CLIENT
// =========================================================

export const api =
  new ApiClient({
    baseUrl,

    getToken: async () => {
      if (
        typeof window === "undefined"
      ) {
        return null;
      }

      const token =
        auth.getToken();

      console.log(
        "ADMIN API TOKEN:",
        token
          ? "TOKEN EXISTS"
          : "NO TOKEN"
      );

      return token;
    },
  });


// =========================================================
// AUTH API
// =========================================================

export const authApi =
  new AuthApi(api);


// =========================================================
// TRAINER APPLICATION API
// =========================================================

export const trainerApplicationApi =
  new TrainerApplicationApi(api);