"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { auth } from "@/lib/auth";

import {
  Button,
  Checkbox,
  Input,
  Spinner,
} from "@repo/ui/index";

import {
  useLogin,
  type LoginFormValues,
} from "@repo/hooks";

import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const {
    login,
    isLoading,
    error,
  } = useLogin(authApi);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (
    data: LoginFormValues
  ) => {
    const response = await login(data);

    if (!response) {
      return;
    }

    auth.saveToken(response.token);
    auth.saveUser(response.user)

    router.push("/dashboard");
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl">

        {/* HEADER */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
            Secure Access Point
          </span>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            Welcome Back, Trainer!
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Sign in to your Trainer Portal to manage
            training sessions, monitor trainees, and
            track learning progress.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Email Address
            </label>

            <Input
              type="email"
              placeholder="trainer@acenextgen.com"
              className="w-full rounded-lg bg-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400"
              {...register("email", {
                required:
                  "Email address is required",

                pattern: {
                  value:
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                  message:
                    "Enter a valid email address",
                },
              })}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Password
            </label>

            <div className="relative">
              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                className="w-full rounded-lg bg-slate-100 px-4 py-3 pr-16 outline-none focus:ring-2 focus:ring-teal-400"
                {...register("password", {
                  required:
                    "Password is required",
                })}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API ERROR */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* REMEMBER ME */}
          <div className="flex items-center gap-3">
            <Checkbox
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
            />

            <label className="text-sm text-slate-600">
              Keep session active for 30 days
            </label>
          </div>

          {/* BUTTON */}
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full rounded-lg py-4 font-bold transition"
          >
            {isLoading ? (
              <>
                <Spinner
                  size="md"
                  className="mr-2"
                />
                Signing In...
              </>
            ) : (
              "Secure Login"
            )}
          </Button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 space-y-5 border-t pt-6">

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Don't have a trainer account?{" "}

              <button
                type="button"
                onClick={() =>
                  router.push("/register")
                }
                className="font-semibold text-primary transition hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>

          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              Authorized Personnel Only • All
              Activity Monitored
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}