"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/lib/api";
import { useRegister } from "@repo/hooks";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  FormLabel,
  Input,
} from "@repo/ui/index";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/hooks/schema";

export default function RegisterForm() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const {
    register: registerAccount,
    isLoading,
    error: registerError,
    success,
  } = useRegister(authApi);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (
    data: RegisterFormValues
  ) => {
    if (!agreeTerms) {
      return;
    }

    const registered =
      await registerAccount({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        password: data.password,
      });

    if (registered) {
      reset();
      setAgreeTerms(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b bg-slate-50/60 pb-8">
        <div className="mb-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
            Secure Access Point
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div>
            <CardTitle className="text-3xl font-bold">
              Create Trainer Account
            </CardTitle>

            <CardDescription className="mt-2 max-w-lg leading-6">
              Register your trainer account to securely
              access the ACE NextGen Trainer Portal and
              begin your application.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Registration Error */}
          {registerError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                {registerError}
              </p>
            </div>
          )}

          {/* Registration Success */}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">
                Registration successful. Please verify
                your email using the OTP sent to you.
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter your complete name as it appears on
                your official documents.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* First Name */}
              <div>
                <FormLabel>First Name</FormLabel>

                <Input
                  placeholder="Juan"
                  {...register("firstName")}
                />

                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <FormLabel>
                  Middle Name
                </FormLabel>

                <Input
                  placeholder="Dela"
                  {...register("middleName")}
                />

                {errors.middleName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.middleName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <FormLabel>Last Name</FormLabel>

                <Input
                  placeholder="Cruz"
                  {...register("lastName")}
                />

                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Account Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These credentials will be used to access
                your trainer account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Email */}
              <div>
                <FormLabel>
                  Email Address
                </FormLabel>

                <Input
                  type="email"
                  placeholder="juan@email.com"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <FormLabel>
                  Mobile Number
                </FormLabel>

                <Input
                  type="tel"
                  placeholder="09123456789"
                  {...register("mobileNumber")}
                />

                {errors.mobileNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Password
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Password */}
              <div>
                <FormLabel>
                  Password
                </FormLabel>

                <div className="relative">
                  <Input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    className="pr-12"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <FormLabel>
                  Confirm Password
                </FormLabel>

                <div className="relative">
                  <Input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm password"
                    className="pr-12"
                    {...register("confirmPassword")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {
                      errors.confirmPassword
                        .message
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={agreeTerms}
                onChange={(e) =>
                  setAgreeTerms(
                    e.target.checked
                  )
                }
              />

              <div>
                <label className="text-sm leading-6 text-slate-600">
                  I have read and agree to the{" "}
                  <Link
                    href="/terms-and-conditions"
                    target="_blank"
                    className="font-semibold text-primary hover:underline"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="font-semibold text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  of ACE NextGen.
                </label>

                {!agreeTerms && (
                  <p className="mt-2 text-sm text-slate-500">
                    You must agree to continue.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-slate-200 pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                !agreeTerms
              }
            >
              {isLoading
                ? "Creating Account..."
                : "Create Account"}
            </Button>
          </div>

          {/* Login */}
          <div className="space-y-4">
            <p className="text-center text-sm text-slate-500">
              Already have a trainer account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary transition hover:underline"
              >
                Sign In
              </Link>
            </p>

            <p className="text-center text-[11px] uppercase tracking-widest text-slate-400">
              By creating an account, you agree to
              the platform&apos;s Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}