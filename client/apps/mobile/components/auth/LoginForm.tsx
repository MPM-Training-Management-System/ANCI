"use client";

import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

import {
  useLogin,
  type LoginFormValues,
} from "@repo/hooks";

import { authApi } from "@/api/api";
import { auth } from "@/api/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const {
    login,
    isLoading,
    error,
  } = useLogin(authApi);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Login Required",
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Login Required",
        "Please enter your password."
      );
      return;
    }

    try {
      const values: LoginFormValues = {
        email: email.trim().toLowerCase(),
        password,
      };

      const response = await login(values);

      if (!response) {
        return;
      }

      const role = String(
        response.user?.role ?? ""
      ).toLowerCase();

      if (role !== "participant") {
        Alert.alert(
          "Access Denied",
          "This mobile application is only available for Participants."
        );
        return;
      }

      await auth.saveToken(response.token);
      await auth.saveUser(response.user);

      router.replace("/(tabs)");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      Alert.alert(
        "Login Failed",
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again."
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <View style={styles.header}>

            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/ANCILOGO.png")}
                resizeMode="contain"
                style={styles.logo}
              />

              <Text style={styles.brandName}>
                ACE NEXTGEN
              </Text>

              <Text style={styles.brandSubtitle}>
                TRAINING MANAGEMENT
              </Text>
            </View>
          </View>

          {/* ================================================== */}
          {/* LOGIN CONTENT */}
          {/* ================================================== */}

          <View style={styles.content}>
            <Text style={styles.welcomeTitle}>
              Welcome back!
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your learning journey.
            </Text>

            {/* ================================================== */}
            {/* EMAIL */}
            {/* ================================================== */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Email
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  email.length > 0 &&
                    styles.inputWrapperActive,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#2563EB"
                  style={styles.inputIcon}
                />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  style={styles.input}
                />
              </View>
            </View>

            {/* ================================================== */}
            {/* PASSWORD */}
            {/* ================================================== */}

            <View style={styles.field}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>
                  Password
                </Text>

                <Pressable
                  disabled={isLoading}
                  hitSlop={8}
                >
                  <Text style={styles.forgotPassword}>
                    Forgot password?
                  </Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  password.length > 0 &&
                    styles.inputWrapperActive,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#2563EB"
                  style={styles.inputIcon}
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  style={styles.input}
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={isLoading}
                  hitSlop={10}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={21}
                    color="#718096"
                  />
                </Pressable>
              </View>
            </View>

            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#DC2626"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            {/* ================================================== */}
            {/* LOGIN BUTTON */}
            {/* ================================================== */}

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.loginButton,

                pressed &&
                  !isLoading &&
                  styles.loginButtonPressed,

                isLoading &&
                  styles.loginButtonDisabled,
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text style={styles.loginButtonText}>
                    Signing in...
                  </Text>
                </View>
              ) : (
                <View
                  style={styles.loginButtonContent}
                >
                  <Text
                    style={styles.loginButtonText}
                  >
                    Sign in
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </Pressable>

            {/* ================================================== */}
            {/* REGISTER */}
            {/* ================================================== */}

            <View style={styles.registerSection}>
              <View style={styles.registerDivider}>
                <View style={styles.divider} />

                <Text style={styles.dividerText}>
                  OR
                </Text>

                <View style={styles.divider} />
              </View>

              <Text style={styles.registerQuestion}>
                Don't have an account?
              </Text>

              <Pressable
                onPress={() =>
                  router.push("/register")
                }
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed &&
                    styles.registerButtonPressed,
                ]}
              >
                <Text
                  style={styles.registerButtonText}
                >
                  Create an account
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#2563EB"
                />
              </Pressable>
            </View>
          </View>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <View style={styles.footer}>
            <View style={styles.securityRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#64748B"
              />

              <Text style={styles.securityText}>
                Secure and protected access
              </Text>
            </View>

            <Text style={styles.footerText}>
              ACE NextGen • Participant Portal
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ================================================== */
  /* SAFE AREA */
  /* ================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 95,
    paddingBottom: 30,
  },

  /* ================================================== */
  /* HEADER */
  /* ================================================== */

  header: {
    width: "100%",
    marginBottom: 38,
  },

  /* ================================================== */
  /* BACK BUTTON */
  /* ================================================== */

  backButtonRow: {
    width: "100%",
    height: 48,

    justifyContent: "flex-start",
    alignItems: "flex-start",
  },

  backButton: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 21,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  backButtonPressed: {
    opacity: 0.6,

    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  /* ================================================== */
  /* LOGO */
  /* ================================================== */

  logoContainer: {
    width: "100%",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 4,
  },

  logo: {
    width: 92,
    height: 92,
  },

  /* ================================================== */
  /* BRAND */
  /* ================================================== */

  brandName: {
    marginTop: 8,

    fontSize: 20,
    fontWeight: "900",

    letterSpacing: 1.8,

    color: "#0F172A",
  },

  brandSubtitle: {
    marginTop: 4,

    fontSize: 9,
    fontWeight: "700",

    letterSpacing: 1.8,

    color: "#64748B",
  },

  /* ================================================== */
  /* CONTENT */
  /* ================================================== */

  content: {
    width: "100%",
  },

  welcomeTitle: {
    fontSize: 30,
    lineHeight: 36,

    fontWeight: "800",

    letterSpacing: -0.7,

    color: "#111827",
  },

  welcomeSubtitle: {
    marginTop: 8,

    maxWidth: 330,

    fontSize: 14,
    lineHeight: 21,

    color: "#64748B",
  },

  /* ================================================== */
  /* FORM */
  /* ================================================== */

  field: {
    marginTop: 25,
  },

  passwordHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  label: {
    marginBottom: 9,

    fontSize: 12,
    fontWeight: "700",

    color: "#334155",
  },

  forgotPassword: {
    marginBottom: 9,

    fontSize: 11,
    fontWeight: "700",

    color: "#2563EB",
  },

  inputWrapper: {
    width: "100%",
    height: 56,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: "#D9E2EC",

    borderRadius: 12,

    backgroundColor: "#FFFFFF",
  },

  inputWrapperActive: {
    borderColor: "#93C5FD",
  },

  inputIcon: {
    marginRight: 11,
  },

  input: {
    flex: 1,

    height: 54,

    paddingVertical: 0,

    fontSize: 14,

    color: "#111827",
  },

  eyeButton: {
    width: 32,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ================================================== */
  /* ERROR */
  /* ================================================== */

  errorContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 14,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 10,

    backgroundColor: "#FEF2F2",

    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    flex: 1,

    marginLeft: 8,

    fontSize: 11,
    lineHeight: 16,

    color: "#B91C1C",
  },

  /* ================================================== */
  /* LOGIN BUTTON */
  /* ================================================== */

  loginButton: {
    width: "100%",
    height: 56,

    marginTop: 27,

    borderRadius: 12,

    backgroundColor: "#2563EB",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2563EB",

    shadowOpacity: 0.18,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  loginButtonContent: {
    width: "100%",
    height: 56,

    paddingHorizontal: 20,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 12,
  },

  loginButtonText: {
    fontSize: 15,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  loadingContent: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 9,
  },

  loginButtonPressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  /* ================================================== */
  /* REGISTER */
  /* ================================================== */

  registerSection: {
    marginTop: 30,
  },

  registerDivider: {
    flexDirection: "row",

    alignItems: "center",

    width: "100%",
  },

  divider: {
    flex: 1,

    height: 1,

    backgroundColor: "#E2E8F0",
  },

  dividerText: {
    marginHorizontal: 12,

    fontSize: 10,
    fontWeight: "700",

    color: "#94A3B8",
  },

  registerQuestion: {
    marginTop: 18,

    textAlign: "center",

    fontSize: 12,

    color: "#64748B",
  },

  registerButton: {
    width: "100%",
    height: 50,

    marginTop: 11,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    borderRadius: 11,

    borderWidth: 1,
    borderColor: "#BFDBFE",

    backgroundColor: "#F8FBFF",
  },

  registerButtonPressed: {
    opacity: 0.7,
  },

  registerButtonText: {
    fontSize: 13,

    fontWeight: "700",

    color: "#2563EB",
  },

  /* ================================================== */
  /* FOOTER */
  /* ================================================== */

  footer: {
    alignItems: "center",

    marginTop: 32,
  },

  securityRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  securityText: {
    marginLeft: 6,

    fontSize: 10,

    color: "#64748B",
  },

  footerText: {
    marginTop: 9,

    fontSize: 9,

    color: "#CBD5E1",
  },
});