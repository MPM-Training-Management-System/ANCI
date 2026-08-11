import { useState } from "react";

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

import {
  SafeAreaView,
} from "react-native-safe-area-context";

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

 const handleLogin = async () => {
    const trimmedLogin =
      login.trim();

    // ===================================================
    // VALIDATION
    // ===================================================

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
  userRole.toLowerCase() !== "participant"
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
// ACTIVE ACCOUNT CHECK
// =================================================

if (!response.user.isActive) {
  console.log(
    "ACCESS DENIED - ACCOUNT INACTIVE"
  );

  console.log(response.user.isActive)

  Alert.alert(
    "Your application is currently under review.",
    "Our administrator will review your submitted information and valid ID before activating your account."
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
  "Remember me:",
  remember
);

// =================================================
// PARTICIPANT APP
// =================================================

console.log(
  "LOGIN SUCCESS"
);

router.replace(
  "/(tabs)"
);

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
        "Remember me:",
        remember
      );

      // =================================================
      // PARTICIPANT APP
      // =================================================

      console.log(
        "LOGIN SUCCESS"
      );

      router.replace(
        "/(tabs)"
      );

    } catch (error: any) {
  console.error("LOGIN ERROR:", error);

  const message =
    error?.message?.toLowerCase() ?? "";

  // =========================================
  // INACTIVE ACCOUNT
  // =========================================

  if (
    message.includes("account is currently inactive")
  ) {
    Alert.alert(
      "Account Pending Approval",
      "Your account is currently inactive. Please wait for the administrator to approve your application."
    );

    return;
  }

  // =========================================
  // INVALID CREDENTIALS
  // =========================================

  if (
    message.includes("invalid username/email") ||
    message.includes("invalid username") ||
    message.includes("invalid email") ||
    message.includes("invalid username/email or password")
  ) {
    Alert.alert(
      "Login Failed",
      "Invalid username/email or password."
    );

    return;
  }

  // =========================================
  // OTHER ERRORS
  // =========================================

  Alert.alert(
    "Login Failed",
    "Unable to login. Please try again."
  );


    } finally {
      setLoading(false);
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Image
              source={require(
                "@/assets/auth/login.webp"
              )}
              resizeMode="contain"
              style={styles.image}
            />
          </View>

          {/* CARD */}

          <View style={styles.card}>
            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue your{"\n"}
              training journey.
            </Text>

            {/* EMAIL */}

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
              style={styles.inputSpacing}
            />

            {/* PASSWORD */}

            <Input
              label="Password"
              required
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
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

            {/* REMEMBER / FORGOT */}

            <View style={styles.row}>
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
                  style={styles.remember}
                >
                  Remember me
                </Text>
              </Pressable>

              <Pressable
                disabled={loading}
                onPress={() =>
                  router.push(
                    "/(tabs)"
                  )
                }
              >
                <Text
                  style={styles.forgot}
                >
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            {/* LOGIN */}

            <Button
  onPress={handleLogin}
  variant="primary"
  loading={loading}
  disabled={loading}
>
  Sign In
</Button>
            {/* REGISTER */}

            <View
              style={styles.footer}
            >
              <Text
                style={styles.footerText}
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
                  style={styles.register}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* DIVIDER */}

            <View
              style={
                styles.dividerContainer
              }
            >
              <View
                style={styles.divider}
              />

              <Text
                style={styles.dividerText}
              >
                Continue with
              </Text>

              <View
                style={styles.divider}
              />
            </View>

            {/* SOCIAL BUTTONS */}

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

    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 380,
    height: 360,
  },

  card: {
    marginHorizontal: 5,
    marginTop: -30,

    backgroundColor: "#FFFFFF",

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

    alignItems: "center",

    marginTop: 6,
    marginBottom: 28,
  },

  rememberRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  remember: {
    marginLeft: 8,

    color: "#475569",

    fontSize: 14,
  },

  forgot: {
    color: "#2563EB",

    fontWeight: "600",

    fontSize: 14,
  },

  footer: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

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

  dividerContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 30,
    marginBottom: 20,
  },

  divider: {
    flex: 1,

    height: 1,

    backgroundColor: "#E2E8F0",
  },

  dividerText: {
    marginHorizontal: 12,

    color: "#64748B",

    fontSize: 14,
  },

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

    borderColor: "#E2E8F0",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

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