import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AccountStep, {
  AccountSetup,
} from "./register/AccountStep";

import { authApi } from "@/api/api";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AccountSetup>({
    Username: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
  });

  const updateForm = (
    values: Partial<AccountSetup>
  ) => {
    setForm((current) => ({
      ...current,
      ...values,
    }));
  };

  const handleContinue = async () => {
    if (loading) return;

    try {
      setLoading(true);

      console.log("REGISTER ACCOUNT:", {
        Username: form.Username,
        Email: form.Email,
      });

      const response =
        await authApi.register({
          username: form.Username.trim(),
          email: form.Email.trim().toLowerCase(),
          password: form.Password,
        });

      console.log(
        "REGISTER ACCOUNT RESPONSE:",
        response
      );

      Alert.alert(
        "Account Created",
        response.message
      );

      /*
       * NEXT:
       *
       * Account
       *    ↓
       * Register Account API
       *    ↓
       * Database
       *    ↓
       * Generate OTP
       *    ↓
       * Send Email
       *    ↓
       * OTP Screen
       */
    } catch (error: any) {
      console.error(
        "REGISTER ACCOUNT ERROR:",
        error
      );

      Alert.alert(
        "Registration Failed",
        error?.message ||
          "Unable to create your account."
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          <AccountStep
            form={form}
            updateForm={updateForm}
            loading={loading}
            onContinue={handleContinue}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
});