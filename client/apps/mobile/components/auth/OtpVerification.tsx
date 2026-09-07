import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useVerifyOtp } from "@repo/hooks";
import { authApi } from "@/api/api";
import { useRouter } from "expo-router";

interface Props {
  email: string;

  onVerified?: () => void;

  onChangeEmail?: () => void;
}

export default function OtpVerification({
  email,
  onVerified,
  onChangeEmail,
}: Props) {
  const [otp, setOtp] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [secondsLeft, setSecondsLeft] =
    useState(120);

  const [localError, setLocalError] =
    useState("");

    const router = useRouter();

  const inputs =
    useRef<Array<TextInput | null>>([]);

  const {
    verifyOTp,
    isLoading,
    error,
    success,
  } = useVerifyOtp(authApi);

  /*
   * =====================================================
   * COUNTDOWN
   * =====================================================
   */

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(
        (previous) =>
          previous > 0
            ? previous - 1
            : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secondsLeft]);

  /*
   * =====================================================
   * API SUCCESS
   * =====================================================
   */

  useEffect(() => {
    if (!success) {
      return;
    }

    Keyboard.dismiss();

    Alert.alert(
      "Email Verified",
      "Your email has been successfully verified. Your account is now waiting for administrator approval.",
      [
        {
          text: "Continue",
          onPress: () => {
            onVerified?.();
          },
        },
      ]
    );
  }, [success, onVerified]);

  /*
   * =====================================================
   * FORMAT TIMER
   * =====================================================
   */

  const formatTime = () => {
    const minutes = Math.floor(
      secondsLeft / 60
    );

    const seconds =
      secondsLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  /*
   * =====================================================
   * OTP INPUT
   * =====================================================
   */

  const handleChange = (
    value: string,
    index: number
  ) => {
    setLocalError("");

    const numericValue =
      value.replace(/[^0-9]/g, "");

    /*
     * Empty input
     */

    if (!numericValue) {
      const updated = [...otp];

      updated[index] = "";

      setOtp(updated);

      return;
    }

    /*
     * Paste full OTP
     */

    if (numericValue.length > 1) {
      const digits =
        numericValue
          .slice(0, 6)
          .split("");

      const updated = [
        "",
        "",
        "",
        "",
        "",
        "",
      ];

      digits.forEach(
        (digit, digitIndex) => {
          updated[digitIndex] =
            digit;
        }
      );

      setOtp(updated);

      const nextIndex =
        Math.min(
          digits.length,
          5
        );

      inputs.current[
        nextIndex
      ]?.focus();

      return;
    }

    /*
     * Normal input
     */

    const updated = [...otp];

    updated[index] =
      numericValue;

    setOtp(updated);

    /*
     * Move to next input
     */

    if (
      numericValue &&
      index < 5
    ) {
      inputs.current[
        index + 1
      ]?.focus();
    }

    /*
     * Dismiss keyboard after
     * completing the OTP.
     */

    if (
      index === 5 &&
      updated.every(Boolean)
    ) {
      Keyboard.dismiss();
    }
  };

  /*
   * =====================================================
   * BACKSPACE
   * =====================================================
   */

  const handleKeyPress = (
    event: any,
    index: number
  ) => {
    if (
      event.nativeEvent.key ===
        "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[
        index - 1
      ]?.focus();
    }
  };

  /*
   * =====================================================
   * VERIFY OTP
   * =====================================================
   */

  const handleVerify = async () => {
    setLocalError("");

    const enteredOtp =
      otp.join("");

    /*
     * Validate length
     */

    if (enteredOtp.length !== 6) {
      setLocalError(
        "Please enter the complete 6-digit OTP."
      );

      return;
    }

    /*
     * Validate timer
     */

    if (secondsLeft <= 0) {
      setLocalError(
        "This OTP has expired. Please request a new OTP."
      );

      return;
    }

    Keyboard.dismiss();

    try {
     

      await verifyOTp({
        email: email
          .trim()
          .toLowerCase(),

        otpCode: enteredOtp,

        
      });
      router.push("/(auth)/login")
    } catch (err) {
      console.error(
        "OTP VERIFICATION ERROR:",
        err
      );
    }
  };

  /*
   * =====================================================
   * RESEND OTP
   * =====================================================
   */

  const handleResend = async () => {
    if (secondsLeft > 0) {
      return;
    }

    setLocalError("");

    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    /*
     * IMPORTANT:
     *
     * This calls your real resend API
     * if your auth hook/API exposes it.
     *
     * Since the uploaded code only shows
     * useVerifyOtp, we don't invent a
     * resend method that may not exist.
     */

    Alert.alert(
      "Resend OTP",
      "The resend OTP API still needs to be connected to your auth hook."
    );

    inputs.current[0]?.focus();

    /*
     * Once your hook has resendOtp(),
     * this section can become:
     *
     * await resendOtp({
     *   email,
     * });
     *
     * setSecondsLeft(120);
     */
  };

  /*
   * =====================================================
   * CHANGE EMAIL
   * =====================================================
   */

  const handleChangeEmail = () => {
    if (onChangeEmail) {
      onChangeEmail();

      return;
    }

    Alert.alert(
      "Change Email",
      "Return to registration to update your email address."
    );
  };

  /*
   * =====================================================
   * ERROR MESSAGE
   * =====================================================
   */

  const errorMessage =
    localError ||
    error ||
    "";

  return (
    <View style={styles.container}>
      {/* =================================================
          ICON
      ================================================= */}

      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="mail-outline"
            size={30}
            color="#2563EB"
          />
        </View>
      </View>

      {/* =================================================
          TITLE
      ================================================= */}

      <Text style={styles.title}>
        Verify your email
      </Text>

      <Text style={styles.description}>
        Enter the 6-digit verification
        code sent to
      </Text>

      <Text style={styles.email}>
        {email}
      </Text>

      {/* =================================================
          CHANGE EMAIL
      ================================================= */}

      <Pressable
        onPress={handleChangeEmail}
        style={({ pressed }) => [
          styles.changeEmailButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name="create-outline"
          size={13}
          color="#2563EB"
        />

        <Text
          style={styles.changeEmailText}
        >
          Change email
        </Text>
      </Pressable>

      {/* =================================================
          OTP INPUT
      ================================================= */}

      <View style={styles.otpContainer}>
        {otp.map(
          (digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[
                  index
                ] = ref;
              }}
              value={digit}
              onChangeText={(value) =>
                handleChange(
                  value,
                  index
                )
              }
              onKeyPress={(event) =>
                handleKeyPress(
                  event,
                  index
                )
              }
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              selectTextOnFocus
              style={[
                styles.otpInput,
                digit &&
                  styles.otpInputFilled,
                errorMessage &&
                  styles.otpInputError,
              ]}
            />
          )
        )}
      </View>

      {/* =================================================
          ERROR
      ================================================= */}

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={15}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {/* =================================================
          VERIFY BUTTON
      ================================================= */}

      <Pressable
        onPress={handleVerify}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.verifyButton,
          isLoading &&
            styles.disabledButton,
          pressed &&
            !isLoading &&
            styles.pressed,
        ]}
      >
        {isLoading ? (
          <Text
            style={styles.buttonText}
          >
            Verifying...
          </Text>
        ) : (
          <>
            <Text
              style={styles.buttonText}
            >
              Verify Email
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#FFFFFF"
            />
          </>
        )}
      </Pressable>

      {/* =================================================
          TIMER
      ================================================= */}

      <View style={styles.resendContainer}>
        {secondsLeft > 0 ? (
          <>
            <Text style={styles.resendLabel}>
              Didn't receive the code?
            </Text>

            <Text
              style={styles.timer}
            >
              Resend in{" "}
              {formatTime()}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.resendLabel}>
              Didn't receive the code?
            </Text>

            <Pressable
              onPress={
                handleResend
              }
            >
              <Text
                style={
                  styles.resendButton
                }
              >
                Resend OTP
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* =================================================
          SECURITY INFO
      ================================================= */}

      <View style={styles.infoBox}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color="#2563EB"
        />

        <Text style={styles.infoText}>
          Your verification code is
          securely processed by the ACE
          NextGen authentication service.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },

  iconContainer: {
    alignItems: "center",
    marginTop: 24,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  title: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#0F172A",
  },

  description: {
    marginTop: 9,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  email: {
    marginTop: 3,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  changeEmailButton: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  changeEmailText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#2563EB",
  },

  otpContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  otpInput: {
    width: 46,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  otpInputFilled: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  otpInputError: {
    borderColor: "#EF4444",
  },

  errorContainer: {
    marginTop: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  errorText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
    color: "#DC2626",
    fontWeight: "600",
  },

  verifyButton: {
    marginTop: 22,
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  resendContainer: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  resendLabel: {
    fontSize: 9,
    color: "#64748B",
  },

  timer: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
  },

  resendButton: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },

  infoBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  infoText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 14,
    color: "#64748B",
  },

  pressed: {
    opacity: 0.7,
  },
});