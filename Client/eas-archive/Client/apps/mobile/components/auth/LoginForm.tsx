import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

import {
  Input,
  Button,
} from "@repo/ui-mobile";

import { auth } from "@/api/auth";
import { authApi } from "@/api/api";

export default function LoginForm() {
  const router = useRouter();

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [login, setLogin] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [remember, setRemember] =
    useState(false);

  const [
    biometricEnabled,
    setBiometricEnabled,
  ] = useState(false);

  const [
    biometricAvailable,
    setBiometricAvailable,
  ] = useState(false);

  // =====================================================
  // REFS
  // =====================================================

  /**
   * Prevent automatic biometric prompt
   * from opening multiple times.
   */
  const biometricStarted =
    useRef(false);

  /**
   * Prevent state updates after
   * component unmount.
   */
  const mountedRef =
    useRef(true);

  // =====================================================
  // MOUNT / UNMOUNT
  // =====================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // =====================================================
  // GO TO DASHBOARD
  // =====================================================

  const goToDashboard =
    useCallback(() => {
      if (!mountedRef.current) {
        return;
      }

      router.replace("/(tabs)");
    }, [router]);

  // =====================================================
  // HANDLE BIOMETRIC LOGIN
  // =====================================================

  const handleBiometricLogin =
    useCallback(async () => {
      if (
        biometricStarted.current
      ) {
        return;
      }

      if (loading) {
        return;
      }

      biometricStarted.current = true;

      try {
        console.log(
          "================================"
        );

        console.log(
          "AUTOMATIC BIOMETRIC LOGIN"
        );

        // =================================================
        // 1. CHECK BIOMETRIC ENABLED
        // =================================================

        const enabled =
          await auth.isBiometricEnabled();

        console.log(
          "BIOMETRIC ENABLED:",
          enabled
        );

        if (!enabled) {
          return;
        }

        // =================================================
        // 2. CHECK BIOMETRIC AVAILABLE
        // =================================================

        const available =
          await auth.isBiometricAvailable();

        console.log(
          "BIOMETRIC AVAILABLE:",
          available
        );

        if (mountedRef.current) {
          setBiometricAvailable(
            available
          );

          setBiometricEnabled(
            available
          );
        }

        if (!available) {
          console.log(
            "BIOMETRIC IS NO LONGER AVAILABLE"
          );

          await auth.setBiometricEnabled(
            false
          );

          if (mountedRef.current) {
            setBiometricEnabled(
              false
            );
          }

          return;
        }

        // =================================================
        // 3. GET SAVED TOKEN
        // =================================================

        const token =
          await auth.getToken();

        if (!token) {
          console.log(
            "NO SAVED TOKEN"
          );

          await auth.setBiometricEnabled(
            false
          );

          if (mountedRef.current) {
            setBiometricEnabled(
              false
            );
          }

          return;
        }

        // =================================================
        // 4. GET SAVED USER
        // =================================================

        const user =
          await auth.getUser();

        if (!user) {
          console.log(
            "NO SAVED USER"
          );

          await auth.setBiometricEnabled(
            false
          );

          if (mountedRef.current) {
            setBiometricEnabled(
              false
            );
          }

          return;
        }

        // =================================================
        // 5. CHECK ROLE
        // =================================================

        const role =
          user.role ??
          user.Role;

        console.log(
          "SAVED USER ROLE:",
          role
        );

        if (
          !role ||
          role.toLowerCase() !==
            "participant"
        ) {
          console.log(
            "SAVED USER IS NOT PARTICIPANT"
          );

          await auth.logout();

          if (mountedRef.current) {
            setBiometricEnabled(
              false
            );
          }

          Alert.alert(
            "Access Denied",
            "Only participant accounts can access the mobile application."
          );

          return;
        }

        // =================================================
        // 6. CHECK ACTIVE
        // =================================================

        if (!user.isActive) {
          console.log(
            "SAVED USER IS INACTIVE"
          );

          Alert.alert(
            "Account Under Review",
            "Your account is currently inactive. Please wait for administrator approval."
          );

          return;
        }

        // =================================================
        // 7. FACE ID / FINGERPRINT
        // =================================================

        console.log(
          "OPENING BIOMETRIC PROMPT..."
        );

        const result =
          await auth.authenticateWithBiometrics();

        console.log(
          "BIOMETRIC RESULT:",
          result
        );

        // =================================================
        // 8. FAILED
        // =================================================

        if (!result.success) {
          console.log(
            "BIOMETRIC FAILED:",
            result
          );

          /*
           * Your auth.ts can return:
           *
           * reason:
           * - not_available
           * - not_enrolled
           * - unknown
           *
           * OR native Expo error:
           * - user_cancel
           * - system_cancel
           * - authentication_failed
           * - lockout
           * - missing_usage_description
           */

          const biometricError =
            "error" in result
              ? result.error
              : "reason" in result
              ? result.reason
              : undefined;

          console.log(
            "BIOMETRIC ERROR:",
            biometricError
          );

          // -------------------------------------------------
          // USER CANCELLED
          // -------------------------------------------------

          if (
            biometricError ===
              "user_cancel" ||
            biometricError ===
              "system_cancel"
          ) {
            console.log(
              "BIOMETRIC CANCELLED"
            );

            return;
          }

          // -------------------------------------------------
          // NOT AVAILABLE / NOT ENROLLED
          // -------------------------------------------------

          if (
            biometricError ===
              "not_available" ||
            biometricError ===
              "not_enrolled"
          ) {
            await auth.setBiometricEnabled(
              false
            );

            if (mountedRef.current) {
              setBiometricEnabled(
                false
              );
            }

            Alert.alert(
              "Biometric Login Unavailable",
              "Please sign in using your email and password."
            );

            return;
          }

          // -------------------------------------------------
          // FACE ID CONFIGURATION
          // -------------------------------------------------

          if (
            biometricError ===
              "missing_usage_description"
          ) {
            Alert.alert(
              "Face ID Configuration Required",
              "Face ID is available but the app needs to be rebuilt with Face ID permission enabled."
            );

            return;
          }

          // -------------------------------------------------
          // AUTHENTICATION FAILED
          // -------------------------------------------------

          if (
            biometricError ===
              "authentication_failed"
          ) {
            Alert.alert(
              "Authentication Failed",
              "Face ID or fingerprint did not recognize you. Please try again or sign in with your email and password."
            );

            return;
          }

          // -------------------------------------------------
          // LOCKOUT
          // -------------------------------------------------

          if (
            biometricError ===
              "lockout"
          ) {
            Alert.alert(
              "Biometric Locked",
              "Too many failed biometric attempts. Please unlock your device and try again."
            );

            return;
          }

          // -------------------------------------------------
          // DEFAULT
          // -------------------------------------------------

          Alert.alert(
            "Authentication Failed",
            "Biometric authentication was not completed. Please sign in using your email and password."
          );

          return;
        }

        // =================================================
        // 9. SUCCESS
        // =================================================

        console.log(
          "================================"
        );

        console.log(
          "BIOMETRIC LOGIN SUCCESS"
        );

        goToDashboard();

      } catch (error) {
        console.error(
          "AUTOMATIC BIOMETRIC LOGIN ERROR:",
          error
        );

        /*
         * Don't block normal login.
         */
      }
    }, [
      loading,
      goToDashboard,
    ]);

  // =====================================================
  // AUTOMATIC BIOMETRIC LOGIN
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const initializeLogin =
      async () => {
        try {
          // =================================================
          // CHECK AVAILABILITY
          // =================================================

          const available =
            await auth.isBiometricAvailable();

          if (cancelled) {
            return;
          }

          setBiometricAvailable(
            available
          );

          // =================================================
          // CHECK ENABLED
          // =================================================

          const enabled =
            await auth.isBiometricEnabled();

          if (cancelled) {
            return;
          }

          setBiometricEnabled(
            available &&
              enabled
          );

          console.log(
            "================================"
          );

          console.log(
            "LOGIN INITIALIZATION"
          );

          console.log(
            "BIOMETRIC AVAILABLE:",
            available
          );

          console.log(
            "BIOMETRIC ENABLED:",
            enabled
          );

          // =================================================
          // AUTOMATIC BIOMETRIC
          // =================================================

          if (
            available &&
            enabled &&
            !biometricStarted.current
          ) {
            console.log(
              "STARTING AUTOMATIC BIOMETRIC LOGIN..."
            );

            setTimeout(() => {
              if (
                cancelled ||
                !mountedRef.current
              ) {
                return;
              }

              handleBiometricLogin();
            }, 500);
          }

        } catch (error) {
          console.error(
            "LOGIN INITIALIZATION ERROR:",
            error
          );
        }
      };

    initializeLogin();

    return () => {
      cancelled = true;
    };
  }, [
    handleBiometricLogin,
  ]);

  // =====================================================
  // ASK TO ENABLE BIOMETRIC
  // =====================================================

  const askEnableBiometric =
    async () => {
      try {
        const available =
          await auth.isBiometricAvailable();

        if (!available) {
          goToDashboard();

          return;
        }

        Alert.alert(
          "Enable Biometric Login?",
          "Your Face ID or fingerprint will appear automatically the next time you open the login screen.",
          [
            {
              text: "Not Now",
              style: "cancel",

              onPress: () => {
                goToDashboard();
              },
            },

            {
              text: "Enable",

              onPress: async () => {
                try {
                  console.log(
                    "ENABLING BIOMETRIC LOGIN..."
                  );

                  // =========================================
                  // AUTHENTICATE
                  // =========================================

                  const result =
                    await auth.authenticateWithBiometrics();

                  console.log(
                    "BIOMETRIC SETUP RESULT:",
                    result
                  );

                  if (
                    !result.success
                  ) {
                    const biometricError =
                      "error" in result
                        ? result.error
                        : "reason" in result
                        ? result.reason
                        : undefined;

                    console.log(
                      "BIOMETRIC SETUP ERROR:",
                      biometricError
                    );

                    if (
                      biometricError ===
                        "user_cancel" ||
                      biometricError ===
                        "system_cancel"
                    ) {
                      Alert.alert(
                        "Biometric Login Not Enabled",
                        "You can enable biometric login the next time you sign in."
                      );

                      goToDashboard();

                      return;
                    }

                    if (
                      biometricError ===
                        "missing_usage_description"
                    ) {
                      Alert.alert(
                        "Face ID Configuration Required",
                        "Face ID is available but the app needs to be rebuilt with Face ID permission enabled."
                      );

                      goToDashboard();

                      return;
                    }

                    Alert.alert(
                      "Biometric Setup Failed",
                      "Biometric login was not enabled."
                    );

                    goToDashboard();

                    return;
                  }

                  // =========================================
                  // SAVE BIOMETRIC ENABLED
                  // =========================================

                  await auth.setBiometricEnabled(
                    true
                  );

                  if (
                    mountedRef.current
                  ) {
                    setBiometricEnabled(
                      true
                    );
                  }

                  console.log(
                    "BIOMETRIC LOGIN ENABLED"
                  );

                  Alert.alert(
                    "Biometric Login Enabled",
                    "Next time you open the login screen, Face ID or fingerprint will appear automatically.",
                    [
                      {
                        text: "OK",

                        onPress: () => {
                          goToDashboard();
                        },
                      },
                    ],
                    {
                      cancelable: false,
                    }
                  );

                } catch (error) {
                  console.error(
                    "ENABLE BIOMETRIC ERROR:",
                    error
                  );

                  goToDashboard();
                }
              },
            },
          ],
          {
            cancelable: false,
          }
        );

      } catch (error) {
        console.error(
          "BIOMETRIC SETUP ERROR:",
          error
        );

        goToDashboard();
      }
    };

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const handleLogin =
    async () => {
      if (loading) {
        return;
      }

      const trimmedLogin =
        login.trim();

      // =================================================
      // VALIDATION
      // =================================================

      if (!trimmedLogin) {
        Alert.alert(
          "Email Required",
          "Please enter your email address."
        );

        return;
      }

      if (!password) {
        Alert.alert(
          "Password Required",
          "Please enter your password."
        );

        return;
      }

      try {
        setLoading(true);

        console.log(
          "================================"
        );

        console.log(
          "ATTEMPTING PARTICIPANT LOGIN"
        );

        console.log({
          login: trimmedLogin,
        });

        // =================================================
        // LOGIN API
        // =================================================

        const response =
          await authApi.login({
            login: trimmedLogin,
            password,
          });

        console.log(
          "LOGIN RESPONSE:",
          response
        );

        // =================================================
        // CHECK USER
        // =================================================

        if (!response?.user) {
          Alert.alert(
            "Login Failed",
            "Unable to retrieve your account information."
          );

          return;
        }

        // =================================================
        // ROLE
        // =================================================

        const userRole =
          response.user.role ??
          response.user.role;

        console.log(
          "USER ROLE:",
          userRole
        );

        // =================================================
        // PARTICIPANT ONLY
        // =================================================

        if (
          !userRole ||
          userRole.toLowerCase() !==
            "participant"
        ) {
          console.log(
            "ACCESS DENIED - ROLE:",
            userRole
          );

          Alert.alert(
            "Access Denied",
            "Only participant accounts can access the mobile application."
          );

          return;
        }

        // =================================================
        // ACTIVE / APPROVED
        // =================================================

        if (!response.user.isActive) {
          console.log(
            "ACCOUNT IS NOT ACTIVE"
          );

          Alert.alert(
            "Account Under Review",
            "Your account is currently under review. Please wait for administrator approval."
          );

          return;
        }

        // =================================================
        // SAVE TOKEN
        // =================================================

        await auth.saveToken(
          response.token
        );

        console.log(
          "TOKEN SAVED"
        );

        // =================================================
        // SAVE USER
        // =================================================

        await auth.saveUser(
          response.user
        );

        console.log(
          "USER SAVED"
        );

        // =================================================
        // REMEMBER ME
        // =================================================

        console.log(
          "REMEMBER ME:",
          remember
        );

        // =================================================
        // CHECK BIOMETRIC
        // =================================================

        const available =
          await auth.isBiometricAvailable();

        const alreadyEnabled =
          await auth.isBiometricEnabled();

        console.log(
          "BIOMETRIC AVAILABLE:",
          available
        );

        console.log(
          "BIOMETRIC ENABLED:",
          alreadyEnabled
        );

        if (mountedRef.current) {
          setBiometricAvailable(
            available
          );

          setBiometricEnabled(
            available &&
              alreadyEnabled
          );
        }

        // =================================================
        // ALREADY ENABLED
        // =================================================

        if (
          available &&
          alreadyEnabled
        ) {
          console.log(
            "BIOMETRIC ALREADY ENABLED"
          );

          goToDashboard();

          return;
        }

        // =================================================
        // FIRST LOGIN + BIOMETRIC AVAILABLE
        // =================================================

        if (
          available &&
          !alreadyEnabled
        ) {
          await askEnableBiometric();

          return;
        }

        // =================================================
        // NO BIOMETRIC
        // =================================================

        console.log(
          "BIOMETRIC NOT AVAILABLE"
        );

        goToDashboard();

      } catch (error: any) {
        console.error(
          "LOGIN ERROR:",
          error
        );

        const message =
          error?.message ??
          "";

        const normalizedMessage =
          message.toLowerCase();

        // =================================================
        // INVALID CREDENTIALS
        // =================================================

        if (
          normalizedMessage.includes(
            "invalid username"
          ) ||
          normalizedMessage.includes(
            "invalid email"
          ) ||
          normalizedMessage.includes(
            "invalid credentials"
          ) ||
          normalizedMessage.includes(
            "invalid username/email"
          )
        ) {
          Alert.alert(
            "Login Failed",
            "Invalid email or password."
          );

          return;
        }

        // =================================================
        // DEFAULT
        // =================================================

        Alert.alert(
          "Login Failed",
          message ||
            "Unable to login. Please try again."
        );

      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // UI
  // =====================================================

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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <Image
              source={require(
                "@/assets/auth/login.webp"
              )}
              resizeMode="contain"
              style={styles.image}
            />
          </View>

          {/* =================================================
              CARD
          ================================================= */}

          <View style={styles.card}>

            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue your{"\n"}
              training journey.
            </Text>

            {/* =================================================
                EMAIL
            ================================================= */}

            <Input
              label="Email"
              required
              placeholder="Enter your email"
              value={login}
              onChangeText={setLogin}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              leftIcon={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#64748B"
                />
              }
            />

            <View
              style={
                styles.inputSpacing
              }
            />

            {/* =================================================
                PASSWORD
            ================================================= */}

            <Input
              label="Password"
              required
              placeholder="Enter your password"
              value={password}
              onChangeText={
                setPassword
              }
              secureTextEntry={
                !showPassword
              }
              editable={!loading}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#64748B"
                />
              }
              rightIcon={
                <Pressable
                  disabled={loading}
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              }
            />

            {/* =================================================
                REMEMBER ME
            ================================================= */}

            <View
              style={styles.row}
            >
              <Pressable
                style={
                  styles.rememberRow
                }
                disabled={loading}
                onPress={() =>
                  setRemember(
                    !remember
                  )
                }
              >
                <Ionicons
                  name={
                    remember
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.remember
                  }
                >
                  Remember me
                </Text>
              </Pressable>
            </View>

            {/* =================================================
                SIGN IN
            ================================================= */}

            <Button
              onPress={
                handleLogin
              }
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>

            {/* =================================================
                REGISTER
            ================================================= */}

            <View
              style={
                styles.footer
              }
            >
              <Text
                style={
                  styles.footerText
                }
              >
                Don't have an account?
              </Text>

              <Pressable
                disabled={loading}
                onPress={() =>
                  router.push(
                    "/(auth)/register"
                  )
                }
              >
                <Text
                  style={
                    styles.register
                  }
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <View
              style={
                styles.dividerContainer
              }
            >
              <View
                style={
                  styles.divider
                }
              />

              <Text
                style={
                  styles.dividerText
                }
              >
                Continue with
              </Text>

              <View
                style={
                  styles.divider
                }
              />
            </View>

            {/* =================================================
                SOCIAL
            ================================================= */}

            <View
              style={
                styles.socialContainer
              }
            >
              <Pressable
                style={
                  styles.socialButton
                }
                disabled={loading}
              >
                <AntDesign
                  name="google"
                  size={22}
                  color="#EA4335"
                />

                <Text
                  style={
                    styles.socialText
                  }
                >
                  Google
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.socialButton,
                  styles.facebookButton,
                ]}
                disabled={loading}
              >
                <FontAwesome
                  name="facebook"
                  size={22}
                  color="#1877F2"
                />

                <Text
                  style={
                    styles.socialText
                  }
                >
                  Facebook
                </Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    height: 200,

    justifyContent:
      "center",

    alignItems:
      "center",
  },

  image: {
    width: 380,
    height: 360,
  },

  card: {
    marginHorizontal: 5,
    marginTop: -30,

    backgroundColor:
      "#FFFFFF",

    borderRadius: 32,

    paddingHorizontal: 24,
    paddingVertical: 28,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.08,

    shadowRadius: 20,

    elevation: 12,
  },

  title: {
    fontSize: 30,

    fontWeight: "700",

    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,

    marginBottom: 30,

    color: "#64748B",

    lineHeight: 22,

    fontSize: 15,
  },

  inputSpacing: {
    height: 18,
  },

  row: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginTop: 6,

    marginBottom: 28,
  },

  rememberRow: {
    flexDirection: "row",

    alignItems:
      "center",
  },

  remember: {
    marginLeft: 8,

    color: "#475569",

    fontSize: 14,
  },

  // ===================================================
  // FOOTER
  // ===================================================

  footer: {
    flexDirection: "row",

    justifyContent:
      "center",

    alignItems:
      "center",

    marginTop: 26,
  },

  footerText: {
    color: "#64748B",

    fontSize: 15,
  },

  register: {
    marginLeft: 5,

    color: "#2563EB",

    fontWeight: "700",

    fontSize: 15,
  },

  // ===================================================
  // DIVIDER
  // ===================================================

  dividerContainer: {
    flexDirection: "row",

    alignItems:
      "center",

    marginTop: 30,

    marginBottom: 20,
  },

  divider: {
    flex: 1,

    height: 1,

    backgroundColor:
      "#E2E8F0",
  },

  dividerText: {
    marginHorizontal: 12,

    color: "#64748B",

    fontSize: 14,
  },

  // ===================================================
  // SOCIAL
  // ===================================================

  socialContainer: {
    flexDirection: "row",

    justifyContent:
      "space-between",
  },

  socialButton: {
    flex: 1,

    height: 56,

    borderRadius: 16,

    borderWidth: 1,

    borderColor:
      "#E2E8F0",

    backgroundColor:
      "#FFFFFF",

    flexDirection:
      "row",

    justifyContent:
      "center",

    alignItems:
      "center",

    marginRight: 6,
  },

  facebookButton: {
    marginRight: 0,

    marginLeft: 6,
  },

  socialText: {
    marginLeft: 10,

    fontSize: 16,

    fontWeight: "600",

    color: "#334155",
  },
});