"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui/index";

import { authApi } from "@/lib/api";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  async function handleVerifyOtp(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    if (!email) {
      setError("Email address is missing.");
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("VERIFY OTP:", {
        email,
        otp,
      });

      await authApi.verifyotp({
        email,
        otp,
      });

      console.log("OTP VERIFIED");

      router.push("/login");
    } catch (error) {
      console.error("OTP VERIFICATION ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Invalid or expired OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (!email) {
      setError("Email address is missing.");
      return;
    }

    try {
      setError("");
      setIsResending(true);

      await authApi.sendotp({
        email,
      });

      alert("A new OTP has been sent to your email.");
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to resend OTP."
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="border-b bg-slate-50/60 pb-8">
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
            Email Verification
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>

          <div>
            <CardTitle className="text-3xl font-bold">
              Verify Your Email
            </CardTitle>

            <CardDescription className="mt-2 max-w-lg leading-6">
              We sent a verification code to your email
              address. Enter the 6-digit OTP to complete
              your trainer account registration.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <form
          onSubmit={handleVerifyOtp}
          className="space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <Input
              type="email"
              value={email}
              disabled
              className="bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Verification Code
            </label>

            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "")
                )
              }
              className="text-center text-2xl font-bold tracking-[0.5em]"
            />

            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting
                ? "Verifying..."
                : "Verify Email"}
            </Button>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the code?
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending
                ? "Sending..."
                : "Resend OTP"}
            </Button>

            <Link
              href="/login"
              className="inline-block text-sm font-semibold text-primary hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}