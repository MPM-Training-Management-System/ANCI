"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";

import { Button, Card, CardContent } from "@repo/ui/index";
import { useVerifyOtp } from "@repo/hooks";

import { authApi } from "@/lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email =
    searchParams.get("email") ?? "";

  const [otpCode, setOtpCode] = useState("");

  const {
    verifyOTp,
    isLoading,
    error,
    success,
  } = useVerifyOtp(authApi);

  const handleOtpChange = (
    value: string
  ) => {
    const numericValue = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtpCode(numericValue);
  };

  const handleVerify = async () => {
    if (!email || otpCode.length !== 6) {
      return;
    }

    const response = await verifyOTp({
      email,
      otpCode,
    });

    if (response?.success) {
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-xl overflow-hidden border-slate-200 shadow-sm">
          {/* Header */}
          <div className="border-b bg-slate-50/60 px-6 py-8 sm:px-10">
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Verification
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Mail className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Verify Your Email
                </h1>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We sent a 6-digit verification code
                  to your email address. Enter the code
                  below to activate your account.
                </p>
              </div>
            </div>
          </div>

          <CardContent className="px-6 py-8 sm:px-10">
            {/* Email */}
            <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verification email
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                {email || "No email provided"}
              </p>
            </div>

            {/* OTP */}
            <div>
              <label
                htmlFor="otp"
                className="mb-3 block text-sm font-semibold text-slate-800"
              >
                Enter verification code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(event) =>
                  handleOtpChange(
                    event.target.value
                  )
                }
                placeholder="000000"
                disabled={isLoading}
                className="h-16 w-full rounded-2xl border border-slate-200 bg-white text-center text-3xl font-bold tracking-[0.45em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <p className="mt-3 text-center text-xs text-slate-400">
                Enter the 6-digit code sent to your
                email.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-center text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-center text-sm font-medium text-emerald-700">
                  Email verified successfully.
                  Redirecting to login...
                </p>
              </div>
            )}

            {/* Verify */}
            <div className="mt-7">
              <Button
                type="button"
                onClick={handleVerify}
                disabled={
                  isLoading ||
                  otpCode.length !== 6 ||
                  !email
                }
                className="h-12 w-full rounded-xl"
              >
                {isLoading
                  ? "Verifying..."
                  : "Verify Email"}
              </Button>
            </div>

            {/* Back */}
            <div className="mt-6">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Registration
              </Link>
            </div>

            {/* Security notice */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-center text-[11px] uppercase tracking-widest leading-5 text-slate-400">
                Your verification code expires after a
                limited period for security purposes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}