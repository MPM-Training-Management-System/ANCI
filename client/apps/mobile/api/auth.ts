import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ONBOARDING_KEY = "onboarding_completed";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      console.error("INVALID JWT FORMAT");
      return true;
    }

    const payload = parts[1];

    // JWT uses base64url.
    // Convert it to normal base64 first.
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedPayload =
      normalizedPayload +
      "=".repeat(
        (4 -
          (normalizedPayload.length % 4)) %
          4
      );

    let decodedPayload = "";

    // React Native / Expo compatible decoding.
    if (
      typeof globalThis.atob ===
      "function"
    ) {
      decodedPayload =
        globalThis.atob(paddedPayload);
    } else {
      // Fallback for environments where atob
      // is not available.
      const binaryString =
        decodeURIComponent(
          paddedPayload
            .split("")
            .map((char) => {
              const code =
                char.charCodeAt(0);

              return `%${(
                "00" + code.toString(16)
              ).slice(-2)}`;
            })
            .join("")
        );

      decodedPayload = binaryString;
    }

    const payloadObject =
      JSON.parse(decodedPayload);

    const exp = payloadObject?.exp;

    if (
      typeof exp !== "number"
    ) {
      console.error(
        "JWT DOES NOT CONTAIN EXPIRATION"
      );

      return true;
    }

    const currentTime =
      Math.floor(Date.now() / 1000);

    return currentTime >= exp;
  } catch (error) {
    console.error(
      "TOKEN EXPIRATION CHECK ERROR:",
      error
    );

    return true;
  }
}

export const auth = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync(
      TOKEN_KEY,
      token
    );
  },

  async getToken() {
    return SecureStore.getItemAsync(
      TOKEN_KEY
    );
  },

  async saveUser(user: unknown) {
    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify(user)
    );
  },

  async getUser<T = unknown>(): Promise<T | null> {
    const user =
      await SecureStore.getItemAsync(
        USER_KEY
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
      TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      USER_KEY
    );

    /*
     * Do NOT delete onboarding status.
     *
     * Logout should only remove the
     * authentication session.
     */
  },

  async isAuthenticated() {
    const token =
      await SecureStore.getItemAsync(
        TOKEN_KEY
      );

    if (!token || !token.trim()) {
      return false;
    }

    const expired =
      isTokenExpired(token);

    if (expired) {
      console.log(
        "AUTH TOKEN EXPIRED"
      );

      await this.logout();

      return false;
    }

    return true;
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