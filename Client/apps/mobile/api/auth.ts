import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const BIOMETRIC_ENABLED_KEY = "biometric_enabled";
const ONBOARDING_COMPLETED_KEY =
  "onboarding_completed";

export const auth = {
  // =====================================================
  // TOKEN
  // =====================================================

  async saveToken(token: string) {
    await SecureStore.setItemAsync(
      TOKEN_KEY,
      token
    );
  },

  async getToken() {
    return await SecureStore.getItemAsync(
      TOKEN_KEY
    );
  },

  // =====================================================
  // USER
  // =====================================================

  async saveUser(user: unknown) {
    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify(user)
    );
  },

  async getUser() {
    const user =
      await SecureStore.getItemAsync(
        USER_KEY
      );

    return user
      ? JSON.parse(user)
      : null;
  },

  // =====================================================
  // ONBOARDING
  // =====================================================

  async setOnboardingCompleted(
    completed: boolean
  ) {
    if (completed) {
      await SecureStore.setItemAsync(
        ONBOARDING_COMPLETED_KEY,
        "true"
      );

      return;
    }

    await SecureStore.deleteItemAsync(
      ONBOARDING_COMPLETED_KEY
    );
  },

  async isOnboardingCompleted() {
    const value =
      await SecureStore.getItemAsync(
        ONBOARDING_COMPLETED_KEY
      );

    return value === "true";
  },

  // =====================================================
  // BIOMETRIC AVAILABILITY
  // =====================================================

  async isBiometricAvailable() {
    try {
      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        return false;
      }

      const isEnrolled =
        await LocalAuthentication.isEnrolledAsync();

      return isEnrolled;
    } catch (error) {
      console.error(
        "BIOMETRIC AVAILABILITY ERROR:",
        error
      );

      return false;
    }
  },

  // =====================================================
  // BIOMETRIC ENABLED
  // =====================================================

  async setBiometricEnabled(
    enabled: boolean
  ) {
    if (enabled) {
      await SecureStore.setItemAsync(
        BIOMETRIC_ENABLED_KEY,
        "true"
      );

      return;
    }

    await SecureStore.deleteItemAsync(
      BIOMETRIC_ENABLED_KEY
    );
  },

  async isBiometricEnabled() {
    const value =
      await SecureStore.getItemAsync(
        BIOMETRIC_ENABLED_KEY
      );

    return value === "true";
  },

  // =====================================================
  // BIOMETRIC AUTHENTICATION
  // =====================================================

  async authenticateWithBiometrics() {
    try {
      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        return {
          success: false as const,
          reason:
            "not_available" as const,
        };
      }

      const isEnrolled =
        await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        return {
          success: false as const,
          reason:
            "not_enrolled" as const,
        };
      }

      const supportedTypes =
        await LocalAuthentication
          .supportedAuthenticationTypesAsync();

      console.log(
        "BIOMETRIC TYPES:",
        supportedTypes
      );

      const result =
        await LocalAuthentication.authenticateAsync(
          {
            promptMessage:
              "Sign in to ANCI",

            disableDeviceFallback: true,

            fallbackLabel: "",

            cancelLabel: "Cancel",
          }
        );

      console.log(
        "BIOMETRIC RESULT:",
        result
      );

      return result;
    } catch (error) {
      console.error(
        "BIOMETRIC AUTH ERROR:",
        error
      );

      return {
        success: false as const,
        reason: "unknown" as const,
      };
    }
  },

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout() {
    await SecureStore.deleteItemAsync(
      TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      USER_KEY
    );

    await SecureStore.deleteItemAsync(
      BIOMETRIC_ENABLED_KEY
    );

    // IMPORTANT:
    // Do NOT delete onboarding_completed.
  },

  // =====================================================
  // AUTHENTICATED
  // =====================================================

  async isAuthenticated() {
    return !!(
      await this.getToken()
    );
  },
};