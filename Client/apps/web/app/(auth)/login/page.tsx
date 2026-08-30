"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import type {
  LoginRequest,
} from "@repo/types";

import { authApi } from "@/lib/api";
import { auth } from "@/lib/auth";
import { notify } from "@repo/hooks";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // ==========================================================
  // UI
  // ==========================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError(null);

      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      const cleanEmail =
        email.trim().toLowerCase();

      if (!cleanEmail) {
        setError(
          "Please enter your email address."
        );

        return;
      }

      if (!password) {
        setError(
          "Please enter your password."
        );

        return;
      }

      try {
        setIsLoading(true);

      
        const request: LoginRequest = {
          email: cleanEmail,
          password,
        };

        console.log(
          "LOGIN REQUEST:",
          {
            email: cleanEmail,
          }
        );

       

        const response =
          await authApi.login(
            request
          );

        console.log(
          "LOGIN RESPONSE:",
          response
        );

      
        if (!response) {
          setError(
            "Unable to login. Please try again."
          );

          return;
        }

        if (!response.token) {
          setError(
            "Login succeeded but no authentication token was returned."
          );

          return;
        }

        if (!response.user) {
          setError(
            "Login succeeded but no user information was returned."
          );

          return;
        }

        
        const role =
          response.user.role
            ?.toLowerCase();

        const status =
          response.user.status
            ?.toLowerCase();

        /*
         * Support both:
         *
         * status = "Active"
         *
         * OR
         *
         * isActive = true
         */

        const isActive =
          response.user.status === "Active";

        console.log(
          "LOGIN ROLE:",
          response.user.role
        );

        console.log(
          "LOGIN STATUS:",
          response.user.status
        );

        console.log(
          "LOGIN IS ACTIVE:",
          response.user.status
        );

        if (
          role === "trainer"
        ) {
          
          auth.saveToken(
            response.token
          );

          auth.saveUser(
            response.user
          );

       

          if (isActive) {
            notify.success(
              "Trainer login successful."
            );

            router.replace(
              "/dashboard"
            );

            return;
          }

        

          notify.info(
            "Your trainer application is still under review."
          );

          router.replace(
            "/trainer-application"
          );

          return;
        }

       
        auth.logout();

        setError(
          "This portal is for trainers only."
        );

        notify.error(
          "This portal is for trainers only."
        );

      } catch (error) {

        console.error(
          "LOGIN ERROR:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Unable to login. Please check your credentials.";

        setError(
          message
        );

      } finally {

        setIsLoading(false);

      }
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f5f7fa]">

      <div className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">

        {/* ====================================================
            MAIN LOGIN CONTAINER
        ==================================================== */}

        <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_60px_rgba(16,24,40,0.10)] lg:grid-cols-[1.05fr_0.95fr]">

          {/* ==================================================
              LEFT BRANDING PANEL
          ================================================== */}

          <section className="relative hidden min-h-[650px] overflow-hidden bg-[#092653] lg:flex">

            {/* BACKGROUND SHAPES */}

            <div className="absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-[#1769a8]/50" />

            <div className="absolute -bottom-28 -left-24 h-[300px] w-[300px] rounded-full bg-[#123c79]/70" />

            <div className="absolute right-[-70px] top-[45%] h-[190px] w-[190px] rounded-full border border-white/10" />

            <div className="absolute bottom-[90px] left-[70px] h-[90px] w-[90px] rounded-full bg-white/5" />

            {/* CONTENT */}

            <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-14">

              {/* LOGO */}

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">

                    <AceLogo />

                  </div>

                  <div>

                    <p className="text-sm font-semibold tracking-[0.16em] text-white">
                      ACE
                    </p>

                    <p className="text-[10px] tracking-[0.18em] text-white/60">
                      NEXT GEN
                    </p>

                  </div>

                </div>

              </div>

              {/* HERO */}

              <div className="max-w-[430px]">

                <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8fd1ff]">
                  Trainer Portal
                </p>

                <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.04em] text-white xl:text-[46px]">
                  Empower
                  <br />
                  Every
                  <br />
                  Learning Session.
                </h1>

                <p className="mt-6 max-w-[390px] text-sm leading-7 text-white/65">
                  Access your training workspace to
                  manage training sessions, monitor
                  trainee progress, record attendance,
                  and evaluate performance — all from
                  one secure platform.
                </p>

              </div>

              {/* BOTTOM LABEL */}

              <div className="flex items-center justify-between gap-4">

                <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">

                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/45">
                    ACE NEXT GEN
                  </p>

                  <p className="mt-1 text-xs text-white/70">
                    Secure · Reliable · Built for Trainers
                  </p>

                </div>

                <div className="hidden text-right xl:block">

                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">
                    Secure Access
                  </p>

                  <p className="mt-1 text-xs text-white/55">
                    Authorized Personnel Only
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              RIGHT LOGIN
          ================================================== */}

          <section className="flex min-h-[650px] items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">

            <div className="w-full max-w-[390px]">

              {/* MOBILE LOGO */}

              <div className="mb-10 flex items-center gap-3 lg:hidden">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#1769e0]">

                  <AceLogo />

                </div>

                <div>

                  <p className="text-sm font-semibold text-[#172033]">
                    ACE NEXT GEN
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#98a2b3]">
                    Trainer Portal
                  </p>

                </div>

              </div>

              {/* TITLE */}

              <div className="mb-8">

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a90b8]">
                  Secure Access Point
                </p>

                <h2 className="text-[29px] font-semibold tracking-[-0.04em] text-[#172033]">
                  Welcome Back, Trainer!
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#7b8495]">
                  Sign in to your Trainer Portal to
                  manage training sessions, monitor
                  trainees, and track learning progress.
                </p>

              </div>

              {/* ERROR */}

              {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {error}
                </div>

              )}

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]"
                  >
                    Email or Username
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    disabled={
                      isLoading
                    }
                    placeholder="Enter your email"
                    className="h-11 w-full rounded-lg border border-[#dfe4eb] bg-white px-4 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aab6] focus:border-[#3c7da3] focus:ring-4 focus:ring-[#3c7da3]/10 disabled:bg-[#f5f7fa]"
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#697386]"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      disabled={
                        isLoading
                      }
                      placeholder="Enter your password"
                      className="h-11 w-full rounded-lg border border-[#dfe4eb] bg-white px-4 pr-14 text-sm text-[#172033] outline-none transition placeholder:text-[#a3aab6] focus:border-[#3c7da3] focus:ring-4 focus:ring-[#3c7da3]/10 disabled:bg-[#f5f7fa]"
                    />

                    <button
                      type="button"
                      disabled={
                        isLoading
                      }
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-1 text-[11px] font-medium text-[#7b8495] hover:text-[#1769e0]"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

                {/* REMEMBER / FORGOT */}

                <div className="flex items-center justify-between">

                  <label className="flex cursor-pointer items-center gap-2">

                    <input
                      type="checkbox"
                      checked={
                        rememberMe
                      }
                      disabled={
                        isLoading
                      }
                      onChange={(
                        event
                      ) =>
                        setRememberMe(
                          event.target.checked
                        )
                      }
                      className="h-3.5 w-3.5 rounded border-[#cfd5df] text-[#3c7da3] focus:ring-[#3c7da3]"
                    />

                    <span className="text-[11px] text-[#7b8495]">
                      Keep session active for 30 days
                    </span>

                  </label>

                  <button
                    type="button"
                    disabled={
                      isLoading
                    }
                    onClick={() =>
                      router.push(
                        "/forgot-password"
                      )
                    }
                    className="text-[11px] font-medium text-[#3c7da3] hover:underline disabled:opacity-50"
                  >
                    Forgot password?
                  </button>

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-[#3d7d9f] text-xs font-semibold text-white shadow-[0_3px_8px_rgba(61,125,159,0.18)] transition hover:bg-[#326b8a] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isLoading
                    ? "Signing in..."
                    : "Secure Login"}

                </button>

              </form>

              {/* REGISTER */}

              <div className="mt-7 flex items-center gap-3">

                <div className="h-px flex-1 bg-[#e8ebef]" />

                <span className="text-[9px] uppercase tracking-[0.12em] text-[#b0b7c2]">
                  New trainer?
                </span>

                <div className="h-px flex-1 bg-[#e8ebef]" />

              </div>

              <button
                type="button"
                disabled={
                  isLoading
                }
                onClick={() =>
                  router.push(
                    "/register"
                  )
                }
                className="mt-5 flex h-11 w-full items-center justify-center rounded-lg border border-[#dfe4eb] bg-white text-xs font-semibold text-[#3c7da3] transition hover:border-[#3c7da3] hover:bg-[#f8fbfd]"
              >
                Create Trainer Account
              </button>

              {/* SECURITY NOTE */}

              <div className="mt-7 flex items-start gap-2.5">

                <div className="mt-0.5 text-[#9aa3b2]">
                  <ShieldIcon />
                </div>

                <p className="text-[9px] leading-4 text-[#98a2b3]">
                  Authorized personnel only. Your account
                  activity is protected and monitored for
                  security purposes.
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

// ============================================================
// ACE LOGO
// ============================================================

function AceLogo() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 100 100"
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="currentColor"
        strokeWidth="5"
      />

      <path
        d="M28 65 42 31h10l20 34h-11l-4-8H39l-3 8H28Z"
        fill="currentColor"
      />

      <path
        d="M43 49h11l-5-11-6 11Z"
        fill="white"
      />

      <path
        d="M62 31h12v34H62z"
        fill="currentColor"
      />
    </svg>
  );
}

// ============================================================
// SHIELD
// ============================================================

function ShieldIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />

      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}