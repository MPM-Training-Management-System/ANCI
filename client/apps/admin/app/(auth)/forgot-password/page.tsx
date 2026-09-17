"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  Input,
  Spinner,
} from "@repo/ui/index";

import { authAPIs } from "@/lib/api";

import {
  notify,
  useForgotPassword,
} from "@repo/hooks";

import type {
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
} from "@repo/types";

type ForgotPasswordStep =
  | "email"
  | "otp"
  | "reset"
  | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // =========================================================
  // STEP
  // =========================================================

  const [step, setStep] =
    useState<ForgotPasswordStep>("email");

  // =========================================================
  // FORM STATE
  // =========================================================

  const [email, setEmail] = useState("");

  const [otpCode, setOtpCode] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================================================
  // FORGOT PASSWORD HOOK
  // =========================================================

  const {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    isLoading,
    error,
    reset,
  } = useForgotPassword(authAPIs);

  // =========================================================
  // STEP 1
  // SEND PASSWORD RESET OTP
  // =========================================================

  const handleSendOtp = async () => {
    reset();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      notify.error(
        "Please enter your email address."
      );
      return;
    }

    const request: ForgotPasswordRequest = {
      email: normalizedEmail,
    };

    const response =
      await forgotPassword(request);

    if (!response) {
      return;
    }

    setEmail(normalizedEmail);

    setOtpCode("");

    setStep("otp");

    notify.success(
      "A verification code has been sent to your email."
    );
  };

  // =========================================================
  // STEP 2
  // VERIFY OTP
  // =========================================================

  const handleVerifyOtp = async () => {
    reset();

    const normalizedOtp =
      otpCode.trim();

    if (!normalizedOtp) {
      notify.error(
        "Please enter the verification code."
      );
      return;
    }

    if (normalizedOtp.length !== 6) {
      notify.error(
        "The verification code must be 6 digits."
      );
      return;
    }

    const request: VerifyResetOtpRequest = {
      email: email.trim().toLowerCase(),
      otpCode: normalizedOtp,
    };

    const response =
      await verifyResetOtp(request);

    if (!response) {
      return;
    }

    setOtpCode(normalizedOtp);

    setStep("reset");

    notify.success(
      "Verification successful."
    );
  };

  // =========================================================
  // STEP 3
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword = async () => {
    reset();

    if (!newPassword) {
      notify.error(
        "Please enter your new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      notify.error(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (!confirmPassword) {
      notify.error(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error(
        "Passwords do not match."
      );
      return;
    }

    const request: ResetPasswordRequest = {
      email: email.trim().toLowerCase(),
      otpCode: otpCode.trim(),
      newPassword,
      confirmPassword,
    };

    const response =
      await resetPassword(request);

    if (!response) {
      return;
    }

    setStep("success");

    notify.success(
      "Your password has been reset successfully."
    );
  };

  // =========================================================
  // RESEND OTP
  // =========================================================

  const handleResendOtp = async () => {
    reset();

    const request: ForgotPasswordRequest = {
      email: email.trim().toLowerCase(),
    };

    const response =
      await forgotPassword(request);

    if (!response) {
      return;
    }

    setOtpCode("");

    notify.success(
      "A new verification code has been sent."
    );
  };

  // =========================================================
  // BACK TO EMAIL
  // =========================================================

  const handleBackToEmail = () => {
    reset();

    setOtpCode("");

    setStep("email");
  };

  // =========================================================
  // BACK TO LOGIN
  // =========================================================

  const handleBackToLogin = () => {
    router.replace("/login");
  };

  // =========================================================
  // ERROR
  // =========================================================

  const showError =
    error && step !== "success";

  return (
    <div
      className="
        w-full
        max-w-[440px]
        rounded-[28px]
        border
        border-slate-200/80
        bg-white
        shadow-[0_30px_80px_rgba(0,0,0,0.25)]
      "
    >
      <div className="px-8 py-9 sm:px-10">

        {/* =====================================================
            STEP 1 — EMAIL
        ====================================================== */}

        {step === "email" && (
          <>
            <div className="mb-8">

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-[#1670a8]/10
                  bg-[#1670a8]/5
                  px-3
                  py-1.5
                "
              >
                <span
                  className="
                    mr-2
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-teal-400
                  "
                />

                <span
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-[#1670a8]
                  "
                >
                  Account Recovery
                </span>
              </div>

              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                "
              >
                Forgot your password?
              </h1>

              <p
                className="
                  mt-2
                  max-w-sm
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Enter your registered email address
                and we&apos;ll send you a verification
                code to reset your password.
              </p>
            </div>

            {/* ERROR */}

            {showError && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-xs
                  font-medium
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {/* EMAIL */}

            <div className="mb-6">
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-slate-500
                "
              >
                Institutional Email
              </label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@acenextgen.com"
                disabled={isLoading}
                autoComplete="email"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendOtp();
                  }
                }}
                className="
                  h-12
                  rounded-xl
                  border-slate-200
                  bg-slate-50
                  text-sm
                  transition-all
                  focus:border-[#1670a8]
                  focus:bg-white
                "
              />
            </div>

            {/* SEND BUTTON */}

            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="
                h-12
                w-full
                rounded-xl
                bg-[#1670a8]
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(22,112,168,0.22)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#126391]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Sending code...
                </span>
              ) : (
                "Send Verification Code"
              )}
            </Button>

            {/* BACK */}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="
                  text-[10px]
                  font-bold
                  text-slate-400
                  transition-colors
                  hover:text-[#1670a8]
                "
              >
                ← Back to login
              </button>
            </div>
          </>
        )}

        {/* =====================================================
            STEP 2 — OTP
        ====================================================== */}

        {step === "otp" && (
          <>
            <div className="mb-8">

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-[#1670a8]/10
                  bg-[#1670a8]/5
                  px-3
                  py-1.5
                "
              >
                <span
                  className="
                    mr-2
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-teal-400
                  "
                />

                <span
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-[#1670a8]
                  "
                >
                  Verification
                </span>
              </div>

              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                "
              >
                Verify your email
              </h1>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Enter the 6-digit verification code
                sent to:
              </p>

              <p
                className="
                  mt-1
                  break-all
                  text-xs
                  font-bold
                  text-[#1670a8]
                "
              >
                {email}
              </p>
            </div>

            {/* ERROR */}

            {showError && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-xs
                  font-medium
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {/* OTP INPUT */}

            <div className="mb-6">
              <label
                htmlFor="otpCode"
                className="
                  mb-2
                  block
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-slate-500
                "
              >
                Verification Code
              </label>

              <Input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const value =
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                  setOtpCode(value);
                }}
                placeholder="000000"
                disabled={isLoading}
                autoComplete="one-time-code"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleVerifyOtp();
                  }
                }}
                className="
                  h-14
                  rounded-xl
                  border-slate-200
                  bg-slate-50
                  text-center
                  text-xl
                  font-bold
                  tracking-[0.5em]
                  transition-all
                  focus:border-[#1670a8]
                  focus:bg-white
                "
              />
            </div>

            {/* VERIFY */}

            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={
                isLoading ||
                otpCode.length !== 6
              }
              className="
                h-12
                w-full
                rounded-xl
                bg-[#1670a8]
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(22,112,168,0.22)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#126391]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* RESEND */}

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="
                  text-[10px]
                  font-bold
                  text-[#1670a8]
                  transition-colors
                  hover:text-[#126391]
                  hover:underline
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Resend verification code
              </button>
            </div>

            {/* BACK */}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={isLoading}
                className="
                  text-[10px]
                  font-bold
                  text-slate-400
                  transition-colors
                  hover:text-[#1670a8]
                "
              >
                ← Use a different email
              </button>
            </div>
          </>
        )}

        {/* =====================================================
            STEP 3 — RESET PASSWORD
        ====================================================== */}

        {step === "reset" && (
          <>
            <div className="mb-8">

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-[#1670a8]/10
                  bg-[#1670a8]/5
                  px-3
                  py-1.5
                "
              >
                <span
                  className="
                    mr-2
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-teal-400
                  "
                />

                <span
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-[#1670a8]
                  "
                >
                  New Password
                </span>
              </div>

              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                "
              >
                Create a new password
              </h1>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Your email has been verified.
                Create a new password for your
                account.
              </p>
            </div>

            {/* ERROR */}

            {showError && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-xs
                  font-medium
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {/* NEW PASSWORD */}

            <div className="mb-5">
              <label
                htmlFor="newPassword"
                className="
                  mb-2
                  block
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-slate-500
                "
              >
                New Password
              </label>

              <div className="relative">
                <Input
                  id="newPassword"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="
                    h-12
                    rounded-xl
                    border-slate-200
                    bg-slate-50
                    pr-16
                    text-sm
                    transition-all
                    focus:border-[#1670a8]
                    focus:bg-white
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={isLoading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    px-2
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                    hover:text-[#1670a8]
                  "
                >
                  {showNewPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              <p
                className="
                  mt-2
                  text-[10px]
                  text-slate-400
                "
              >
                Minimum 8 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="
                  mb-2
                  block
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-slate-500
                "
              >
                Confirm Password
              </label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleResetPassword();
                    }
                  }}
                  className="
                    h-12
                    rounded-xl
                    border-slate-200
                    bg-slate-50
                    pr-16
                    text-sm
                    transition-all
                    focus:border-[#1670a8]
                    focus:bg-white
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={isLoading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    px-2
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                    hover:text-[#1670a8]
                  "
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {/* RESET PASSWORD */}

            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={isLoading}
              className="
                h-12
                w-full
                rounded-xl
                bg-[#1670a8]
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(22,112,168,0.22)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#126391]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Resetting password...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </>
        )}

        {/* =====================================================
            STEP 4 — SUCCESS
        ====================================================== */}

        {step === "success" && (
          <div className="py-5 text-center">

            <div
              className="
                mx-auto
                mb-6
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-emerald-50
                text-2xl
                text-emerald-600
              "
            >
              ✓
            </div>

            <h1
              className="
                text-2xl
                font-extrabold
                tracking-tight
                text-slate-900
              "
            >
              Password reset successful
            </h1>

            <p
              className="
                mx-auto
                mt-3
                max-w-sm
                text-xs
                leading-5
                text-slate-500
              "
            >
              Your password has been updated
              successfully. You can now sign in using
              your new password.
            </p>

            <Button
              type="button"
              onClick={handleBackToLogin}
              className="
                mt-7
                h-12
                w-full
                rounded-xl
                bg-[#1670a8]
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(22,112,168,0.22)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#126391]
              "
            >
              Back to Login
            </Button>

          </div>
        )}

      </div>
    </div>
  );
}