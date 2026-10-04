"use client";

import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";

import { AppAlert } from "@repo/ui-mobile";

import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import {
  useLogin,
  useGoogleAuth,
  type LoginFormValues,
} from "@repo/hooks";

import { authApi } from "@/api/api";
import { auth } from "@/api/auth";

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

const GOOGLE_REGISTRATION_TOKEN_KEY =
  "google_registration_id_token";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [appAlert, setAppAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
    confirmText: "OK",
    showCancel: false,
  });

  const [alertAction, setAlertAction] = useState<(() => void) | null>(null);

  const { login, isLoading, error } = useLogin(authApi);
  const { googleLogin } = useGoogleAuth(authApi);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    confirmText = "OK",
    onConfirm?: () => void
  ) => {
    setAlertAction(() => onConfirm ?? null);

    setAppAlert({
      visible: true,
      type,
      title,
      message,
      confirmText,
      showCancel: false,
    });
  };

  const closeAlert = () => {
    const action = alertAction;

    setAlertAction(null);

    setAppAlert((prev) => ({
      ...prev,
      visible: false,
    }));

    action?.();
  };

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });

    console.log(
      "GOOGLE WEB CLIENT ID:",
      GOOGLE_WEB_CLIENT_ID
    );
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      showAlert(
        "Login Required",
        "Please enter your email address.",
        "warning"
      );
      return;
    }

    if (!password) {
      showAlert(
        "Login Required",
        "Please enter your password.",
        "warning"
      );
      return;
    }

    const values: LoginFormValues = {
      email: email.trim().toLowerCase(),
      password,
    };

    try {
      const response = await login(values);

      if (!response?.token || !response?.user) {
        showAlert(
          "Login Failed",
          "Invalid login response from the server.",
          "error"
        );
        return;
      }

      const role = response.user.role?.toLowerCase();

      if (role !== "participant") {
        showAlert(
          "Access Denied",
          "Only participant accounts can log in to the mobile application.",
          "warning"
        );
        return;
      }

      await auth.saveToken(response.token);
      await auth.saveUser(response.user);

      const savedToken = await auth.getToken();

      if (!savedToken) {
        showAlert(
          "Login Failed",
          "Your session could not be saved. Please try again.",
          "error"
        );
        return;
      }

      router.replace("/(tabs)");
    } catch (err) {
      showAlert(
        "Login Failed",
        err instanceof Error
          ? err.message
          : "Unable to login. Please try again.",
        "error"
      );
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading || isLoading) {
      return;
    }

    if (!GOOGLE_WEB_CLIENT_ID) {
      showAlert(
        "Google Sign-In",
        "Google Sign-In is not configured. Please check the Google Web Client ID.",
        "error"
      );
      return;
    }

    try {
      setIsGoogleLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      const idToken = response.data?.idToken;

      if (!idToken) {
        showAlert(
          "Google Sign-In Failed",
          "Google did not return a valid ID token.",
          "error"
        );
        return;
      }

   const loginResult = await googleLogin({
  idToken,
});

if (!loginResult) {
  showAlert(
    "Google Sign-In Failed",
    "No login response was received from the server. Please try again.",
    "error"
  );
  return;
}

if (
  loginResult.requiresRegistration ||
  loginResult.isNewUser
) {
        await auth.saveToken("");

        await auth.saveToken(
          idToken
        );

        const googleUser = response.data?.user;

        const params = new URLSearchParams();

        if (googleUser?.email) {
          params.set("email", googleUser.email);
        }

        if (googleUser?.givenName) {
          params.set(
            "firstName",
            googleUser.givenName
          );
        }

        if (googleUser?.familyName) {
          params.set(
            "lastName",
            googleUser.familyName
          );
        }

        if (googleUser?.name) {
          params.set(
            "fullName",
            googleUser.name
          );
        }

        if (googleUser?.photo) {
          params.set(
            "profileImageUrl",
            googleUser.photo
          );
        }

        router.push(
          `/(auth)/register?${params.toString()}`
        );

        return;
      }

      const token = loginResult.login?.token;
      const user = loginResult.login?.user;

      if (!token || !user) {
        showAlert(
          "Google Sign-In Failed",
          "The server did not return a valid login session.",
          "error"
        );
        return;
      }

      const role = user.role?.toLowerCase();

      if (role !== "participant") {
        showAlert(
          "Access Denied",
          "Only participant accounts can log in to the mobile application.",
          "warning"
        );
        return;
      }

      await auth.saveToken(token);
      await auth.saveUser(user);

      const savedToken = await auth.getToken();

      if (!savedToken) {
        showAlert(
          "Google Sign-In Failed",
          "Your session could not be saved. Please try again.",
          "error"
        );
        return;
      }

      showAlert(
        "Welcome to ANCI",
        `Welcome ${
          user.fullName ??
          response.data?.user?.name ??
          "User"
        }!`,
        "success",
        "Continue",
        () => {
          router.replace("/(tabs)");
        }
      );
    } catch (err: any) {
      if (
        err?.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }

      if (
        err?.code === statusCodes.IN_PROGRESS
      ) {
        showAlert(
          "Google Sign-In",
          "Google Sign-In is already in progress.",
          "warning"
        );
        return;
      }

      if (
        err?.code ===
        statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        showAlert(
          "Google Play Services",
          "Google Play Services is not available or needs to be updated.",
          "warning"
        );
        return;
      }

      showAlert(
        "Google Sign-In Failed",
        err instanceof Error
          ? err.message
          : "Unable to sign in with Google. Please try again.",
        "error"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <AppAlert
        visible={appAlert.visible}
        type={appAlert.type}
        title={appAlert.title}
        message={appAlert.message}
        confirmText={appAlert.confirmText}
        onConfirm={closeAlert}
        showCancel={false}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/ANCILOGO.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.title}>
                Welcome Back
              </Text>

              <Text style={styles.subtitle}>
                Sign in to your ACE NextGen account
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email Address
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#64748B"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={
                      !isLoading &&
                      !isGoogleLoading
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Password
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#64748B"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={
                      !isLoading &&
                      !isGoogleLoading
                    }
                  />

                  <Pressable
                    onPress={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    style={styles.eyeButton}
                    disabled={
                      isLoading ||
                      isGoogleLoading
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={21}
                      color="#64748B"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  router.push(
                    "/(auth)/otp-verification"
                  )
                }
                disabled={
                  isLoading ||
                  isGoogleLoading
                }
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>
                  Forgot Password?
                </Text>
              </Pressable>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#DC2626"
                  />

                  {/* <Text
                    style={styles.errorText}
                  >
                    {error instanceof Error
                      ? error.message
                      : String(error)}
                  </Text> */}
                </View>
              ) : null}

              <Pressable
                onPress={handleLogin}
                disabled={
                  isLoading ||
                  isGoogleLoading
                }
                style={[
                  styles.loginButton,
                  (isLoading ||
                    isGoogleLoading) &&
                    styles.disabledButton,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text
                      style={styles.loginButtonText}
                    >
                      Sign In
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>

              <View style={styles.dividerContainer}>
                <View
                  style={styles.divider}
                />

                <Text
                  style={styles.dividerText}
                >
                  OR
                </Text>

                <View
                  style={styles.divider}
                />
              </View>

              <Pressable
                onPress={handleGoogleLogin}
                disabled={
                  isLoading ||
                  isGoogleLoading
                }
                style={[
                  styles.googleButton,
                  (isLoading ||
                    isGoogleLoading) &&
                    styles.disabledGoogleButton,
                ]}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#002B5C"
                  />
                ) : (
                  <>
                    <View
                      style={
                        styles.googleIconContainer
                      }
                    >
                      <Text
                        style={
                          styles.googleIcon
                        }
                      >
                        G
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.googleButtonText
                      }
                    >
                      Continue with Google
                    </Text>
                  </>
                )}
              </Pressable>

              <View
                style={styles.registerContainer}
              >
                <Text
                  style={styles.registerText}
                >
                  Don't have an account?
                </Text>

                <Pressable
                  onPress={() =>
                    router.push(
                      "/(auth)/register"
                    )
                  }
                  disabled={
                    isLoading ||
                    isGoogleLoading
                  }
                >
                  <Text
                    style={
                      styles.registerLink
                    }
                  >
                    Create Account
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ACE NextGen Consultancy Inc.
              </Text>

              <Text
                style={styles.footerSubtext}
              >
                Integrated Service and Training
                Management System
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    width: 100,
    height: 100,
  },

  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#002B5C",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },

  form: {
    width: "100%",
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D2142",
    marginBottom: 8,
  },

  inputWrapper: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0D2142",
  },

  passwordInput: {
    paddingRight: 8,
  },

  eyeButton: {
    padding: 6,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 20,
  },

  forgotText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B7597",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#DC2626",
  },

  loginButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#002B5C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  dividerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginHorizontal: 12,
  },

  googleButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  disabledGoogleButton: {
    opacity: 0.6,
  },

  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  googleIcon: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4285F4",
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D2142",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    gap: 5,
  },

  registerText: {
    fontSize: 14,
    color: "#64748B",
  },

  registerLink: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3B7597",
  },

  footer: {
    alignItems: "center",
    marginTop: 32,
  },

  footerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },

  footerSubtext: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
});