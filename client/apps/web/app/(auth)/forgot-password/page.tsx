"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";

import type {
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
} from "@repo/types";

import { authAPIs } from "@/lib/api";
import { useForgotPassword } from "@repo/hooks";

type ForgotPasswordStep = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    isLoading,
    error,
    reset,
  } = useForgotPassword(authAPIs);

  const [step, setStep] = useState<ForgotPasswordStep>("email");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  // ============================================================
  // SEND RESET OTP
  // ============================================================

  const handleSendOtp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLocalError(null);
    reset();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    const request: ForgotPasswordRequest = {
      email: cleanEmail,
    };

    const response = await forgotPassword(request);

    if (!response) {
      return;
    }

    if (!response.success) {
      setLocalError(
        response.message || "Unable to send the reset code."
      );
      return;
    }

    setEmail(cleanEmail);
    setOtpCode("");
    setStep("otp");
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleVerifyOtp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLocalError(null);
    reset();

    const cleanOtp = otpCode.trim();

    if (cleanOtp.length !== 6) {
      setLocalError("Please enter the 6-digit verification code.");
      return;
    }

    const request: VerifyResetOtpRequest = {
      email,
      otpCode: cleanOtp,
    };

    const response = await verifyResetOtp(request);

    if (!response) {
      return;
    }

    if (!response.success) {
      setLocalError(
        response.message || "The verification code is invalid."
      );
      return;
    }

    setOtpCode(cleanOtp);
    setStep("reset");
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLocalError(null);
    reset();

    if (!newPassword) {
      setLocalError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError(
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const request: ResetPasswordRequest = {
      email,
      otpCode,
      newPassword,
      confirmPassword,
    };

    const response = await resetPassword(request);

    if (!response) {
      return;
    }

    if (!response.success) {
      setLocalError(
        response.message || "Unable to reset your password."
      );
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setStep("success");
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOtp = async () => {
    setLocalError(null);
    reset();

    const response = await forgotPassword({
      email,
    });

    if (!response) {
      return;
    }

    if (!response.success) {
      setLocalError(
        response.message || "Unable to resend the verification code."
      );
      return;
    }

    setOtpCode("");
  };

  // ============================================================
  // BACK TO EMAIL
  // ============================================================

  const handleBackToEmail = () => {
    reset();
    setLocalError(null);
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("email");
  };

  // ============================================================
  // BACK TO LOGIN
  // ============================================================

  const handleBackToLogin = () => {
    router.push("/login");
  };

  const displayError = localError || error;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fafc]">

      {/* ====================================================== */}
      {/* BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#002b5c]/5 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#C5A059]/10 blur-[120px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#002b5c 1px, transparent 1px), linear-gradient(90deg, #002b5c 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ====================================================== */}
      {/* TOP BRAND */}
      {/* ====================================================== */}

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-12">

        <button
          type="button"
          onClick={handleBackToLogin}
          className="group flex items-center gap-3"
        >
          <div
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white
              p-1
              shadow-md
              ring-1
              ring-gray-100
              transition-transform
              duration-300
              group-hover:scale-105
            "
          >
            <Image
              src={Logo}
              alt="ACE NextGen"
              width={44}
              height={44}
              priority
              className="h-full w-full rounded-full object-cover"
            />
          </div>

          <div className="text-left leading-none">
            <p className="text-sm font-extrabold tracking-tight text-[#002b5c]">
              ACE{" "}
              <span className="text-[#C5A059]">
                NEXTGEN
              </span>
            </p>

            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.24em] text-[#002b5c]/40">
              Consultancy Inc.
            </p>
          </div>
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5 text-[#C5A059]" />

          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Secure Account Recovery
          </span>
        </div>

      </div>

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-center px-6 pb-10 pt-6 lg:px-12 lg:pb-16">

        <div
          className="
            grid
            w-full
            max-w-[1120px]
            overflow-hidden
            rounded-[36px]
            border
            border-gray-100
            bg-white
            shadow-[0_30px_90px_rgba(0,43,92,0.10)]
            lg:grid-cols-[0.9fr_1.1fr]
          "
        >

          {/* ==================================================== */}
          {/* LEFT INFORMATION */}
          {/* ==================================================== */}

          <section
            className="
              relative
              hidden
              overflow-hidden
              bg-[#f7fafc]
              px-10
              py-12
              lg:block
              lg:px-12
              xl:px-14
            "
          >

            <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#002b5c]/5 blur-[80px]" />

            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#C5A059]/10 blur-[90px]" />

            <div className="relative z-10">

              {/* Badge */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#002b5c]/10
                  bg-white
                  px-3
                  py-2
                  shadow-sm
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#002b5c]/60">
                  Account Recovery
                </span>
              </div>

              <h1
                className="
                  mt-7
                  max-w-[470px]
                  text-4xl
                  font-extrabold
                  leading-[1.08]
                  tracking-tight
                  text-[#002b5c]
                  xl:text-5xl
                "
              >
                Secure Your
                <br />
                <span className="text-[#C5A059]">
                  Account Again.
                </span>
              </h1>

              <p className="mt-5 max-w-[470px] text-sm leading-7 text-gray-500">
                Forgot your trainer account password? We will
                securely verify your identity through your
                registered email before allowing you to create
                a new password.
              </p>

              {/* Recovery steps */}

              <div className="mt-10 space-y-4">

                <RecoveryStep
                  number="01"
                  icon={Mail}
                  title="Verify Email"
                  description="Enter the email registered to your account."
                  active={step === "email"}
                />

                <RecoveryStep
                  number="02"
                  icon={KeyRound}
                  title="Enter Verification Code"
                  description="Use the 6-digit OTP sent to your email."
                  active={step === "otp"}
                />

                <RecoveryStep
                  number="03"
                  icon={LockKeyhole}
                  title="Create New Password"
                  description="Set a new secure password for your account."
                  active={step === "reset"}
                />

                <RecoveryStep
                  number="04"
                  icon={CheckCircle2}
                  title="Account Recovered"
                  description="Sign in using your new password."
                  active={step === "success"}
                />

              </div>

              {/* Security card */}

              <div
                className="
                  mt-10
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <div className="flex items-start gap-3">

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#002b5c]/5
                    "
                  >
                    <ShieldCheck className="h-4 w-4 text-[#002b5c]" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[#002b5c]">
                      Protected Recovery
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-gray-400">
                      Verification codes are temporary and
                      should never be shared with another person.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* ==================================================== */}
          {/* RIGHT FORM */}
          {/* ==================================================== */}

          <section
            className="
              flex
              min-h-[650px]
              items-center
              justify-center
              bg-white
              px-7
              py-12
              sm:px-10
              lg:px-12
              xl:px-16
            "
          >

            <div className="w-full max-w-[390px]">

              {/* ================================================= */}
              {/* EMAIL STEP */}
              {/* ================================================= */}

              {step === "email" && (
                <>
                  <StepHeader
                    label="Account Recovery"
                    title="Forgot Password?"
                    description="Enter your registered email address and we will send you a verification code."
                    icon={Mail}
                  />

                  {displayError && (
                    <ErrorMessage message={displayError} />
                  )}

                  <form
                    onSubmit={handleSendOtp}
                    className="mt-8 space-y-5"
                  >

                    <div>
                      <label
                        htmlFor="email"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-gray-500
                        "
                      >
                        Email Address
                      </label>

                      <div className="relative">

                        <Mail
                          className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            text-gray-300
                          "
                        />

                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) =>
                            setEmail(event.target.value)
                          }
                          disabled={isLoading}
                          placeholder="Enter your email"
                          className="
                            h-12
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-gray-50
                            pl-11
                            pr-4
                            text-sm
                            text-[#002b5c]
                            outline-none
                            transition-all
                            duration-200
                            placeholder:text-gray-300
                            focus:border-[#C5A059]
                            focus:bg-white
                            focus:ring-4
                            focus:ring-[#C5A059]/10
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        />

                      </div>
                    </div>

                    <SubmitButton
                      loading={isLoading}
                      text="Send Verification Code"
                      loadingText="Sending Code..."
                    />

                  </form>

                  <BackToLogin onClick={handleBackToLogin} />
                </>
              )}

              {/* ================================================= */}
              {/* OTP STEP */}
              {/* ================================================= */}

              {step === "otp" && (
                <>
                  <StepHeader
                    label="Email Verification"
                    title="Check Your Email."
                    description={
                      <>
                        We sent a 6-digit verification code to{" "}
                        <span className="font-bold text-[#002b5c]">
                          {email}
                        </span>
                        .
                      </>
                    }
                    icon={KeyRound}
                  />

                  {displayError && (
                    <ErrorMessage message={displayError} />
                  )}

                  <form
                    onSubmit={handleVerifyOtp}
                    className="mt-8 space-y-5"
                  >

                    <div>
                      <label
                        htmlFor="otp"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-gray-500
                        "
                      >
                        Verification Code
                      </label>

                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otpCode}
                        onChange={(event) =>
                          setOtpCode(
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                          )
                        }
                        disabled={isLoading}
                        placeholder="000000"
                        className="
                          h-14
                          w-full
                          rounded-2xl
                          border
                          border-gray-200
                          bg-gray-50
                          px-4
                          text-center
                          text-xl
                          font-extrabold
                          tracking-[0.45em]
                          text-[#002b5c]
                          outline-none
                          transition-all
                          duration-200
                          placeholder:text-gray-300
                          focus:border-[#C5A059]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#C5A059]/10
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      />
                    </div>

                    <SubmitButton
                      loading={isLoading}
                      text="Verify Code"
                      loadingText="Verifying..."
                    />

                  </form>

                  <div className="mt-5 flex items-center justify-between">

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleBackToEmail}
                      className="
                        text-[10px]
                        font-bold
                        text-gray-400
                        transition-colors
                        hover:text-[#002b5c]
                        disabled:opacity-50
                      "
                    >
                      Change email
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleResendOtp}
                      className="
                        text-[10px]
                        font-bold
                        text-[#002b5c]
                        transition-colors
                        hover:text-[#C5A059]
                        hover:underline
                        disabled:opacity-50
                      "
                    >
                      Resend code
                    </button>

                  </div>
                </>
              )}

              {/* ================================================= */}
              {/* RESET PASSWORD STEP */}
              {/* ================================================= */}

              {step === "reset" && (
                <>
                  <StepHeader
                    label="Create New Password"
                    title="Reset Your Password."
                    description="Your email has been verified. Create a new password for your trainer account."
                    icon={LockKeyhole}
                  />

                  {displayError && (
                    <ErrorMessage message={displayError} />
                  )}

                  <form
                    onSubmit={handleResetPassword}
                    className="mt-8 space-y-5"
                  >

                    {/* New Password */}

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-gray-500
                        "
                      >
                        New Password
                      </label>

                      <div className="relative">

                        <LockKeyhole
                          className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            text-gray-300
                          "
                        />

                        <input
                          id="newPassword"
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          disabled={isLoading}
                          placeholder="Enter new password"
                          className="
                            h-12
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-gray-50
                            pl-11
                            pr-12
                            text-sm
                            text-[#002b5c]
                            outline-none
                            transition-all
                            duration-200
                            placeholder:text-gray-300
                            focus:border-[#C5A059]
                            focus:bg-white
                            focus:ring-4
                            focus:ring-[#C5A059]/10
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        />

                        <PasswordToggle
                          visible={showNewPassword}
                          disabled={isLoading}
                          onClick={() =>
                            setShowNewPassword(
                              (current) => !current
                            )
                          }
                        />

                      </div>

                      <p className="mt-2 text-[9px] text-gray-400">
                        Minimum 8 characters.
                      </p>
                    </div>

                    {/* Confirm Password */}

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="
                          mb-2
                          block
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-gray-500
                        "
                      >
                        Confirm Password
                      </label>

                      <div className="relative">

                        <LockKeyhole
                          className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            text-gray-300
                          "
                        />

                        <input
                          id="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          disabled={isLoading}
                          placeholder="Confirm new password"
                          className="
                            h-12
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-gray-50
                            pl-11
                            pr-12
                            text-sm
                            text-[#002b5c]
                            outline-none
                            transition-all
                            duration-200
                            placeholder:text-gray-300
                            focus:border-[#C5A059]
                            focus:bg-white
                            focus:ring-4
                            focus:ring-[#C5A059]/10
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        />

                        <PasswordToggle
                          visible={showConfirmPassword}
                          disabled={isLoading}
                          onClick={() =>
                            setShowConfirmPassword(
                              (current) => !current
                            )
                          }
                        />

                      </div>
                    </div>

                    <SubmitButton
                      loading={isLoading}
                      text="Reset Password"
                      loadingText="Updating Password..."
                    />

                  </form>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setLocalError(null);
                      setStep("otp");
                    }}
                    className="
                      mt-5
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      text-[10px]
                      font-bold
                      text-gray-400
                      transition-colors
                      hover:text-[#002b5c]
                      disabled:opacity-50
                    "
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to verification
                  </button>
                </>
              )}

              {/* ================================================= */}
              {/* SUCCESS STEP */}
              {/* ================================================= */}

              {step === "success" && (
                <div className="text-center">

                  <div
                    className="
                      mx-auto
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-[26px]
                      bg-green-50
                    "
                  >
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>

                  <div className="mt-7">

                    <div className="mb-4 flex items-center justify-center gap-3">
                      <span className="h-px w-8 bg-[#C5A059]" />

                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                        Password Updated
                      </p>

                      <span className="h-px w-8 bg-[#C5A059]" />
                    </div>

                    <h2
                      className="
                        text-3xl
                        font-extrabold
                        tracking-tight
                        text-[#002b5c]
                      "
                    >
                      You're All Set.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      Your password has been successfully changed.
                      You can now sign in using your new password.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="
                      group
                      mt-8
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-2xl
                      bg-[#002b5c]
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white
                      shadow-lg
                      shadow-[#002b5c]/15
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-[#003b7d]
                      hover:shadow-xl
                    "
                  >
                    Back to Login

                    <ArrowRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  </button>

                </div>
              )}

            </div>
          </section>

        </div>
      </div>

      {/* ====================================================== */}
      {/* BOTTOM */}
      {/* ====================================================== */}

      <div className="relative z-10 pb-7 text-center">
        <div className="flex items-center justify-center gap-2">

          <ShieldCheck className="h-3.5 w-3.5 text-[#C5A059]" />

          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
            ACE NextGen Training Management Platform
          </p>

        </div>
      </div>

    </main>
  );
}

/* ================================================================
   STEP HEADER
================================================================ */

function StepHeader({
  label,
  title,
  description,
  icon: Icon,
}: {
  label: string;
  title: string;
  description: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div>

      <div className="mb-4 flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#002b5c]/5">
          <Icon className="h-4 w-4 text-[#002b5c]" />
        </div>

        <div className="h-px w-8 bg-[#C5A059]" />

        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
          {label}
        </p>

      </div>

      <h2
        className="
          text-3xl
          font-extrabold
          tracking-tight
          text-[#002b5c]
          sm:text-[34px]
        "
      >
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        {description}
      </p>

    </div>
  );
}

/* ================================================================
   ERROR MESSAGE
================================================================ */

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div
      className="
        mt-6
        flex
        items-start
        gap-3
        rounded-2xl
        border
        border-red-100
        bg-red-50
        px-4
        py-3
        text-sm
        leading-5
        text-red-700
      "
    >
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

      <p>{message}</p>
    </div>
  );
}

/* ================================================================
   SUBMIT BUTTON
================================================================ */

function SubmitButton({
  loading,
  text,
  loadingText,
}: {
  loading: boolean;
  text: string;
  loadingText: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        group
        flex
        h-12
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        bg-[#002b5c]
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-white
        shadow-lg
        shadow-[#002b5c]/15
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:bg-[#003b7d]
        hover:shadow-xl
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingText}
        </>
      ) : (
        <>
          {text}

          <ArrowRight
            className="
              h-4
              w-4
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </>
      )}
    </button>
  );
}

/* ================================================================
   PASSWORD TOGGLE
================================================================ */

function PasswordToggle({
  visible,
  disabled,
  onClick,
}: {
  visible: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={onClick}
      className="
        absolute
        right-3
        top-1/2
        flex
        h-8
        w-8
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        text-gray-400
        transition
        hover:bg-[#002b5c]/5
        hover:text-[#002b5c]
        disabled:opacity-50
      "
    >
      {visible ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );
}

/* ================================================================
   BACK TO LOGIN
================================================================ */

function BackToLogin({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        mt-7
        flex
        w-full
        items-center
        justify-center
        gap-2
        text-[10px]
        font-bold
        text-gray-400
        transition-colors
        hover:text-[#002b5c]
      "
    >
      <ArrowLeft className="h-3 w-3" />
      Back to Login
    </button>
  );
}

/* ================================================================
   RECOVERY STEP
================================================================ */

function RecoveryStep({
  number,
  icon: Icon,
  title,
  description,
  active = false,
}: {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`
        flex
        items-start
        gap-3
        rounded-2xl
        border
        p-4
        transition-all
        duration-300
        ${
          active
            ? "border-[#C5A059]/30 bg-white shadow-sm"
            : "border-transparent bg-white/50"
        }
      `}
    >

      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${
            active
              ? "bg-[#002b5c] text-white"
              : "bg-gray-100 text-gray-400"
          }
        `}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <span className="text-[8px] font-extrabold tracking-wider text-[#C5A059]">
            {number}
          </span>

          <p
            className={`
              text-[10px]
              font-bold
              ${
                active
                  ? "text-[#002b5c]"
                  : "text-gray-400"
              }
            `}
          >
            {title}
          </p>

        </div>

        <p className="mt-1 text-[8px] leading-4 text-gray-400">
          {description}
        </p>

      </div>

    </div>
  );
}