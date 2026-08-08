"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, GraduationCap } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
} from "@repo/ui/index";

import {
  registerTrainerSchema,
  type RegisterTrainerSchema,
} from "@/hooks/schema";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterTrainerSchema>({
    resolver: zodResolver(registerTrainerSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(
    data: RegisterTrainerSchema
  ) {
    console.log(data);

    // TODO:
    // await authApi.registerTrainer(data);
  }

  return (
    <Card className="w-full max-w-2xl rounded-3xl border-0 shadow-2xl">

      <CardHeader className="border-b bg-slate-50/60 pb-8">
       <div className="mb-2">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-teal-700 text-xs font-bold uppercase tracking-widest">
                     Secure Access Point
                   </span>
                   </div>
        <div className="flex items-center gap-5">

          

          <div>

            <CardTitle className="text-3xl font-bold">
              Create Trainer Account
            </CardTitle>

            <CardDescription className="mt-2 max-w-lg leading-6">
              Register your trainer account to securely access
              the ACE NextGen Trainer Portal and begin managing
              training sessions.
            </CardDescription>

          </div>

        </div>

      </CardHeader>

      <CardContent className="pt-8">

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >

          {/* First Row */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium">
                First Name
              </label>

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

            <div>

              <label className="mb-2 block text-sm font-medium">
                Last Name
              </label>

              <Input
                placeholder="Dela Cruz"
                {...register("lastName")}
              />

              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}

            </div>

          </div>

          {/* Second Row */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

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

            <div>

              <label className="mb-2 block text-sm font-medium">
                Username
              </label>

              <Input
                placeholder="juandelacruz"
                {...register("username")}
              />

              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}

            </div>

          </div>
                    {/* Third Row */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Password */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

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
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
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

              <label className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>

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
                  {errors.confirmPassword.message}
                </p>
              )}

            </div>

          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

  <div className="flex items-start gap-3">

    <Checkbox
      checked={agreeTerms}
      onChange={(e) =>
        setAgreeTerms(e.target.checked)
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
        </Link>

        {" "}and{" "}

        <Link
          href="/privacy-policy"
          target="_blank"
          className="font-semibold text-primary hover:underline"
        >
          Privacy Policy
        </Link>

        {" "}of ACE NextGen.

      </label>

    </div>

  </div>

</div>

          {/* Divider */}

          <div className="border-t border-slate-200 pt-6">

            <Button
  type="submit"
  className="w-full"
  disabled={isSubmitting || !agreeTerms}
>
              {isSubmitting
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
              By creating an account, you agree to the
              platform's Terms of Service and Privacy Policy.
            </p>

          </div>

        </form>

      </CardContent>

    </Card>
  );
}