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
  Image
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

import {
  useLogin,
  useMe,
  type LoginFormValues,
} from "@repo/hooks";

import { authApi } from "@/api/api";
import { auth } from "@/api/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    login,
    isLoading,
    error,
  } = useLogin(authApi);


 
  // =========================================================
  // LOGIN
  // =========================================================

 const handleLogin = async () => {
  // ============================================
  // VALIDATE EMAIL
  // ============================================

  if (!email.trim()) {
    Alert.alert(
      "Login Required",
      "Please enter your email address."
    );

    return;
  }

  // ============================================
  // VALIDATE PASSWORD
  // ============================================

  if (!password) {
    Alert.alert(
      "Login Required",
      "Please enter your password."
    );

    return;
  }

  try {
    // ============================================
    // LOGIN
    // ============================================

    const values: LoginFormValues = {
      email: email
        .trim()
        .toLowerCase(),

      password,
    };

    const response =
      await login(values);

    // ============================================
    // LOGIN FAILED
    // ============================================

    if (!response) {
      return;
    }

    // ============================================
    // CHECK ROLE
    // ============================================

    const role =
      String(
        response.user?.role ?? ""
      ).toLowerCase();

    // ============================================
    // PARTICIPANT ONLY
    // ============================================

    if (role !== "participant") {
      Alert.alert(
        "Access Denied",
        "This mobile application is only available for Participants."
      );

      return;
    }

    // ============================================
    // SAVE AUTH ONLY AFTER ROLE CHECK
    // ============================================

    await auth.saveToken(
      response.token
    );

    await auth.saveUser(
      response.user
    );

    // ============================================
    // GO TO PARTICIPANT APP
    // ============================================

    router.replace(
      "/(tabs)"
    );
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

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
      edges={[
        "top",
        "bottom",
      ]}
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
          contentContainerStyle={
            styles.scrollContent
          }
        >

       

          <View
            style={styles.brandSection}
          >

           <View style={styles.logo}>
          <Image
            source={require("@/assets/images/ANCILOGO.png")}
         
            resizeMode="contain"
          />
          </View>


            <Text
              style={styles.brandName}
            >
              ACE NEXTGEN
            </Text>


            <Text
              style={styles.brandCaption}
            >
              TRAINING MANAGEMENT
            </Text>

          </View>


          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <View
            style={styles.loginCard}
          >

            {/* CARD HEADER */}

            <View
              style={styles.cardHeader}
            >

              <View
                style={styles.accessBadge}
              >

                <Ionicons
                  name="person-outline"
                  size={15}
                  color="#2563EB"
                />

                <Text
                  style={styles.accessBadgeText}
                >
                  PARTICIPANT ACCESS
                </Text>

              </View>


              <Text
                style={styles.title}
              >
                Welcome back!
              </Text>


              <Text
                style={styles.subtitle}
              >
                Sign in to continue your
                learning journey.
              </Text>

            </View>


            {/* =================================================
                SEPARATOR
            ================================================= */}

            <View
              style={styles.separator}
            />


            {/* =================================================
                EMAIL
            ================================================= */}

            <View
              style={styles.field}
            >

              <Text
                style={styles.label}
              >
                Email
              </Text>


              <View
                style={styles.inputContainer}
              >

                <View
                  style={styles.inputIcon}
                >

                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color="#2563EB"
                  />

                </View>


                <TextInput
                  value={email}
                  onChangeText={
                    setEmail
                  }
                  placeholder="you@email.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  style={styles.input}
                />

              </View>

            </View>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <View
              style={styles.field}
            >

              <View
                style={styles.passwordHeader}
              >

                <Text
                  style={styles.label}
                >
                  Password
                </Text>


                <Pressable
                  disabled={isLoading}
                  hitSlop={8}
                >

                  <Text
                    style={styles.forgotPassword}
                  >
                    Forgot password?
                  </Text>

                </Pressable>

              </View>


              <View
                style={styles.inputContainer}
              >

                <View
                  style={styles.inputIcon}
                >

                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color="#2563EB"
                  />

                </View>


                <TextInput
                  value={password}
                  onChangeText={
                    setPassword
                  }
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  style={styles.input}
                />


                <Pressable
                  onPress={() =>
                    setShowPassword(
                      value => !value
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
                    size={20}
                    color="#64748B"
                  />

                </Pressable>

              </View>

            </View>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <View
                style={styles.errorContainer}
              >

                <View
                  style={styles.errorIcon}
                >

                  <Ionicons
                    name="alert-circle-outline"
                    size={17}
                    color="#DC2626"
                  />

                </View>


                <Text
                  style={styles.errorText}
                >
                  {error}
                </Text>

              </View>

            )}


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

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

                <View
                  style={styles.loadingContainer}
                >

                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.loginButtonText}
                  >
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


                  <View
                    style={styles.arrowContainer}
                  >

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#2563EB"
                    />

                  </View>

                </View>

              )}

            </Pressable>


            {/* =================================================
                REGISTER DIVIDER
            ================================================= */}

            <View
              style={styles.dividerRow}
            >

              <View
                style={styles.divider}
              />

              <Text
                style={styles.dividerText}
              >
                NEW HERE?
              </Text>

              <View
                style={styles.divider}
              />

            </View>


            {/* =================================================
                REGISTER
            ================================================= */}

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

              <View
                style={styles.registerIcon}
              >

                <Ionicons
                  name="person-add-outline"
                  size={19}
                  color="#2563EB"
                />

              </View>


              <View
                style={styles.registerContent}
              >

                <Text
                  style={styles.registerTitle}
                >
                  Create an account
                </Text>


                <Text
                  style={styles.registerSubtitle}
                >
                  Register as a participant
                </Text>

              </View>


              <View
                style={styles.registerArrow}
              >

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#2563EB"
                />

              </View>

            </Pressable>

          </View>


          {/* =================================================
              SECURITY FOOTER
          ================================================= */}

          <View
            style={styles.securityFooter}
          >

            <View
              style={styles.securityIcon}
            >

              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#64748B"
              />

            </View>


            <Text
              style={styles.securityText}
            >
              Secure and protected access
            </Text>

          </View>


          <Text
            style={styles.footerText}
          >
            ACE NextGen • Participant Portal
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({

  // ===========================================================
  // SCREEN
  // ===========================================================

  safeArea: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },


  // ===========================================================
  // BRAND
  // ===========================================================

  brandSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop:70,
  },

  logo: {
    width: 20,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2563EB",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 5,
  },

  logoText: {
    fontSize: 27,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  brandName: {
    marginTop: 11,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#0F172A",
  },

  brandCaption: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.7,
    color: "#94A3B8",
  },


  // ===========================================================
  // LOGIN CARD
  // ===========================================================

  loginCard: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,

    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 6,
  },


  // ===========================================================
  // CARD HEADER
  // ===========================================================

  cardHeader: {
    alignItems: "flex-start",
  },

  accessBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 10,

    backgroundColor: "#EFF6FF",
  },

  accessBadgeText: {
    marginLeft: 6,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  title: {
    marginTop: 15,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },


  // ===========================================================
  // SEPARATOR
  // ===========================================================

  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 23,
  },


  // ===========================================================
  // FORM
  // ===========================================================

  field: {
    marginBottom: 19,
  },

  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  forgotPassword: {
    marginBottom: 8,
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },

  inputContainer: {
    width: "100%",
    minHeight: 57,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: "#DCE3EC",

    backgroundColor: "#F8FAFC",
  },

  inputIcon: {
    width: 37,
    height: 37,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EAF2FF",
  },

  input: {
    flex: 1,

    minHeight: 55,

    marginLeft: 10,

    paddingVertical: 0,

    fontSize: 14,

    color: "#0F172A",
  },

  eyeButton: {
    width: 36,
    height: 42,

    alignItems: "center",
    justifyContent: "center",
  },


  // ===========================================================
  // ERROR
  // ===========================================================

  errorContainer: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    padding: 11,

    marginBottom: 17,

    borderRadius: 13,

    backgroundColor: "#FEF2F2",

    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorIcon: {
    width: 28,
    height: 28,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FEE2E2",
  },

  errorText: {
    flex: 1,

    marginLeft: 9,

    fontSize: 12,
    lineHeight: 17,

    color: "#B91C1C",
  },


  // ===========================================================
  // LOGIN BUTTON
  // ===========================================================

  loginButton: {
    width: "100%",
    minHeight: 58,

    borderRadius: 15,

    paddingHorizontal: 7,

    backgroundColor: "#2563EB",

    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  loginButtonContent: {
    minHeight: 58,

    paddingLeft: 13,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  loginButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  arrowContainer: {
    width: 43,
    height: 43,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",
  },

  loadingContainer: {
    minHeight: 58,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 9,
  },

  loginButtonPressed: {
    opacity: 0.9,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },


  // ===========================================================
  // DIVIDER
  // ===========================================================

  dividerRow: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    marginVertical: 22,
  },

  divider: {
    flex: 1,

    height: 1,

    backgroundColor: "#E2E8F0",
  },

  dividerText: {
    marginHorizontal: 10,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1.2,

    color: "#94A3B8",
  },


  // ===========================================================
  // REGISTER
  // ===========================================================

  registerButton: {
    width: "100%",
    minHeight: 67,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 11,

    borderRadius: 15,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  registerButtonPressed: {
    opacity: 0.75,
  },

  registerIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EFF6FF",
  },

  registerContent: {
    flex: 1,

    marginLeft: 11,

    paddingRight: 8,
  },

  registerTitle: {
    fontSize: 13,
    fontWeight: "800",

    color: "#0F172A",
  },

  registerSubtitle: {
    marginTop: 3,

    fontSize: 10,

    color: "#64748B",
  },

  registerArrow: {
    width: 33,
    height: 33,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EFF6FF",
  },


  // ===========================================================
  // SECURITY
  // ===========================================================

  securityFooter: {
    marginTop: 24,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  securityIcon: {
    width: 27,
    height: 27,

    borderRadius: 8,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#E2E8F0",
  },

  securityText: {
    marginLeft: 7,

    fontSize: 10,
    fontWeight: "600",

    color: "#94A3B8",
  },

  footerText: {
    marginTop: 8,

    textAlign: "center",

    fontSize: 9,

    color: "#CBD5E1",
  },

});