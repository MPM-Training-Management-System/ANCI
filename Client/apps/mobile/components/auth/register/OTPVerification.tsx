import { useEffect, useRef, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
  Button,
  FormSection,
} from "@repo/ui-mobile";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OTPVerification() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      email?: string;
    }>();

  const email = params.email ?? "";

  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill("")
  );

  const [loading, setLoading] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [countdown, setCountdown] =
    useState(RESEND_SECONDS);

  const inputRefs = useRef<
    Array<TextInput | null>
  >([]);

  /*
   * =====================================================
   * COUNTDOWN
   * =====================================================
   */

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown(
        (current) => current - 1
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [countdown]);

  /*
   * =====================================================
   * OTP CHANGE
   * =====================================================
   */

  const handleOtpChange = (
    value: string,
    index: number
  ) => {
    /*
     * Only allow numbers
     */
    const numericValue =
      value.replace(/[^0-9]/g, "");

    /*
     * Handle empty value
     */
    if (!numericValue) {
      const newOtp = [...otp];

      newOtp[index] = "";

      setOtp(newOtp);

      return;
    }

    /*
     * Only take the first number
     */
    const number =
      numericValue.charAt(
        numericValue.length - 1
      );

    const newOtp = [...otp];

    newOtp[index] = number;

    setOtp(newOtp);

    /*
     * Automatically move to next input
     */
    if (
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  /*
   * =====================================================
   * BACKSPACE
   * =====================================================
   */

  const handleKeyPress = (
    key: string,
    index: number
  ) => {
    if (
      key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  /*
   * =====================================================
   * VERIFY
   * =====================================================
   */

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      Alert.alert(
        "Incomplete OTP",
        "Please enter the 6-digit verification code."
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "VERIFY OTP:",
        code
      );

      /*
       * =================================================
       * TEMPORARY
       * =================================================
       *
       * Backend OTP verification
       * will be connected here later.
       *
       * For now, proceed directly
       * to participant registration.
       */

    //   router.replace(
    //     // "/(auth)/register/registration"
    //   );
    } catch (error) {
      console.error(
        "OTP ERROR:",
        error
      );

      Alert.alert(
        "Verification Failed",
        "Unable to verify the OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * RESEND OTP
   * =====================================================
   */

  const handleResend = async () => {
    if (countdown > 0) {
      return;
    }

    try {
      setResendLoading(true);

      console.log(
        "RESEND OTP TO:",
        email
      );

      /*
       * Backend resend OTP
       * will be connected later.
       */

      setCountdown(
        RESEND_SECONDS
      );

      setOtp(
        Array(OTP_LENGTH).fill("")
      );

      inputRefs.current[0]?.focus();

      Alert.alert(
        "OTP Sent",
        "A new verification code has been sent."
      );
    } catch (error) {
      console.error(
        "RESEND OTP ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to resend OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  /*
   * =====================================================
   * CHANGE EMAIL
   * =====================================================
   */

  const handleChangeEmail = () => {
    router.back();
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
            styles.scrollContent
          }
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <View
              style={
                styles.iconContainer
              }
            >
              <Ionicons
                name="mail-outline"
                size={32}
                color="#2563EB"
              />
            </View>

            <Text style={styles.title}>
              Verify Your Email
            </Text>

            <Text
              style={styles.subtitle}
            >
              We sent a 6-digit verification
              code to
            </Text>

            <Text
              style={styles.email}
              numberOfLines={1}
            >
              {email || "your email address"}
            </Text>

            <Pressable
              onPress={
                handleChangeEmail
              }
              disabled={loading}
            >
              <Text
                style={
                  styles.changeEmail
                }
              >
                Change email
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              OTP FORM
          ================================================= */}

          <FormSection
            title="Enter Verification Code"
            subtitle="Enter the code we sent to your email."
          >
            <View
              style={styles.otpContainer}
            >
              {otp.map(
                (value, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[
                        index
                      ] = ref;
                    }}
                    value={value}
                    onChangeText={(
                      text
                    ) =>
                      handleOtpChange(
                        text,
                        index
                      )
                    }
                    onKeyPress={({
                      nativeEvent,
                    }) =>
                      handleKeyPress(
                        nativeEvent.key,
                        index
                      )
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    editable={!loading}
                    selectTextOnFocus
                    style={[
                      styles.otpInput,
                      value &&
                        styles.otpInputFilled,
                    ]}
                  />
                )
              )}
            </View>

            {/* RESEND */}

            <View
              style={
                styles.resendContainer
              }
            >
              <Text
                style={
                  styles.resendLabel
                }
              >
                Didn't receive the code?
              </Text>

              <Pressable
                onPress={
                  handleResend
                }
                disabled={
                  countdown > 0 ||
                  resendLoading
                }
              >
                <Text
                  style={[
                    styles.resendButton,
                    countdown > 0 &&
                      styles.resendDisabled,
                  ]}
                >
                  {countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend OTP"}
                </Text>
              </Pressable>
            </View>

            {/* VERIFY */}

            <Button
              variant="primary"
              loading={loading}
              disabled={loading}
              onPress={handleVerify}
              style={styles.verifyButton}
            >
              Verify Email
            </Button>
          </FormSection>

          {/* INFO */}

          <View style={styles.infoBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#2563EB"
            />

            <Text
              style={styles.infoText}
            >
              Never share your verification
              code with anyone. Our team
              will never ask for your OTP.
            </Text>
          </View>
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  /*
   * HEADER
   */

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  iconContainer: {
    width: 68,
    height: 68,

    borderRadius: 34,

    backgroundColor: "#EEF4FF",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,

    fontSize: 15,
    lineHeight: 22,

    color: "#64748B",

    textAlign: "center",
  },

  email: {
    marginTop: 3,

    maxWidth: "90%",

    fontSize: 15,

    fontWeight: "700",

    color: "#0F172A",

    textAlign: "center",
  },

  changeEmail: {
    marginTop: 8,

    fontSize: 14,

    fontWeight: "600",

    color: "#2563EB",
  },

  /*
   * OTP
   */

  otpContainer: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    marginTop: 8,
  },

  otpInput: {
    width: 46,
    height: 56,

    borderWidth: 1,

    borderColor: "#CBD5E1",

    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    textAlign: "center",

    fontSize: 22,

    fontWeight: "700",

    color: "#0F172A",
  },

  otpInputFilled: {
    borderColor: "#2563EB",

    backgroundColor: "#EEF4FF",
  },

  /*
   * RESEND
   */

  resendContainer: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 24,
  },

  resendLabel: {
    fontSize: 14,

    color: "#64748B",

    marginRight: 5,
  },

  resendButton: {
    fontSize: 14,

    fontWeight: "700",

    color: "#2563EB",
  },

  resendDisabled: {
    color: "#94A3B8",
  },

  /*
   * BUTTON
   */

  verifyButton: {
    marginTop: 24,

    borderRadius: 16,
  },

  /*
   * INFO
   */

  infoBox: {
    flexDirection: "row",

    alignItems: "flex-start",

    marginTop: 20,

    padding: 14,

    borderRadius: 14,

    backgroundColor: "#EEF4FF",

    borderWidth: 1,

    borderColor: "#DBEAFE",
  },

  infoText: {
    flex: 1,

    marginLeft: 10,

    fontSize: 13,

    lineHeight: 20,

    color: "#475569",
  },
});