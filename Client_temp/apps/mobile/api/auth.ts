import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ONBOARDING_KEY = "onboarding_completed";
export const auth = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync(
      "auth_token",
      token
    );
  },

  async getToken() {
    return SecureStore.getItemAsync(
      "auth_token"
    );
  },

  async saveUser(user: unknown) {
    await SecureStore.setItemAsync(
      "auth_user",
      JSON.stringify(user)
    );
  },

  async getUser<T = unknown>(): Promise<T | null> {
    const user =
      await SecureStore.getItemAsync(
        "auth_user"
      );

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as T;
    } catch {
      return null;
    }
  },

  async logout() {
    await SecureStore.deleteItemAsync(
      "auth_token"
    );

    await SecureStore.deleteItemAsync(
      "auth_user"
    );
  },

  async isAuthenticated() {
    const token =
      await SecureStore.getItemAsync(
        "auth_token"
      );

    return !!token;
  },

  async setOnboardingCompleted(
    completed: boolean
  ) {
    await SecureStore.setItemAsync(
      ONBOARDING_KEY,
      completed ? "true" : "false"
    );
  },

  async isOnboardingCompleted() {
    const value =
      await SecureStore.getItemAsync(
        ONBOARDING_KEY
      );

    return value === "true";
  },
};