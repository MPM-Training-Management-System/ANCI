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

import OTPVerification from "./register/OTPVerification";

import { authApi } from "@/api/api";

type RegisterStep =
  | "account"
  | "otp";

export default function RegisterForm() {
  const [loading, setLoading] =
    useState(false);

  const [step, setStep] =
    useState<RegisterStep>("account");

  const [form, setForm] =
    useState<AccountSetup>({
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

      console.log(
        "REGISTER ACCOUNT:",
        {
          Username: form.Username,
          Email: form.Email,
        }
      );

      const response =
        await authApi.register({
          username:
            form.Username.trim(),

          email:
            form.Email
              .trim()
              .toLowerCase(),

          password:
            form.Password,
        });

      console.log(
        "REGISTER ACCOUNT RESPONSE:",
        response
      );

      /*
       * Backend already:
       *
       * 1. Created User
       * 2. Saved User
       * 3. Generated OTP
       * 4. Saved OTP
       * 5. Sent OTP to email
       *
       * Now show OTP screen.
       */

      setStep("otp");

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

  /*
   * =====================================================
   * OTP STEP
   * =====================================================
   */

  if (step === "otp") {
    return (
      <OTPVerification
        email={form.Email}
        onVerified={() => {
          /*
           * After successful OTP verification,
           * proceed to the next registration step.
           */

          console.log(
            "EMAIL VERIFIED"
          );

          // NEXT STEP LATER
          // setStep("registration");
        }}
      />
    );
  }

  /*
   * =====================================================
   * ACCOUNT STEP
   * =====================================================
   */

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
            onContinue={
              handleContinue
            }
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