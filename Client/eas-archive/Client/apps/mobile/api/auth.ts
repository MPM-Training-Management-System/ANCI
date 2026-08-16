import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const BIOMETRIC_ENABLED_KEY =
  "biometric_enabled";

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
  // BIOMETRIC AVAILABILITY
  // =====================================================

  async isBiometricAvailable() {
    try {
      // -------------------------------------------------
      // Does the device have biometric hardware?
      // -------------------------------------------------

      const hasHardware =
        await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        return false;
      }

      // -------------------------------------------------
      // Does the user have a fingerprint / Face ID
      // enrolled on the device?
      // -------------------------------------------------

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
  // BIOMETRIC ENABLED FLAG
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

  // =====================================================
  // CHECK IF USER ENABLED BIOMETRIC LOGIN
  // =====================================================

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
    // =================================================
    // CHECK HARDWARE
    // =================================================

    const hasHardware =
      await LocalAuthentication.hasHardwareAsync();

    if (!hasHardware) {
      return {
        success: false as const,
        reason: "not_available" as const,
      };
    }

    // =================================================
    // CHECK ENROLLED BIOMETRIC
    // =================================================

    const isEnrolled =
      await LocalAuthentication.isEnrolledAsync();

    if (!isEnrolled) {
      return {
        success: false as const,
        reason: "not_enrolled" as const,
      };
    }

    // =================================================
    // GET BIOMETRIC TYPE
    // =================================================

    const supportedTypes =
      await LocalAuthentication
        .supportedAuthenticationTypesAsync();

    console.log(
      "BIOMETRIC TYPES:",
      supportedTypes
    );

    // =================================================
    // AUTHENTICATE
    // =================================================

    const result =
      await LocalAuthentication.authenticateAsync({
        promptMessage:
          "Sign in to ANCI",

        // iOS uses Face ID here.
        // Android uses its enrolled biometric.
        disableDeviceFallback: true,

        // IMPORTANT:
        // Empty string hides "Use Passcode"
        // fallback button on iOS.
        fallbackLabel: "",

        cancelLabel:
          "Cancel",
      });

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
    // -------------------------------------------------
    // Remove authentication
    // -------------------------------------------------

    await SecureStore.deleteItemAsync(
      TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      USER_KEY
    );

    // -------------------------------------------------
    // Disable biometric login
    // -------------------------------------------------

    await SecureStore.deleteItemAsync(
      BIOMETRIC_ENABLED_KEY
    );
  },

  // =====================================================
  // CHECK AUTHENTICATION
  // =====================================================

  async isAuthenticated() {
    return !!(
      await this.getToken()
    );
  },
};