"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import type { LoginRequest } from "@repo/types";

import { authApi } from "@/lib/api";
import { auth } from "@/lib/auth";
import { notify } from "@repo/hooks";

import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";

export default function LoginPage() {
  const router = useRouter();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ============================================================
  // UI STATE
  // ============================================================

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);

      // --------------------------------------------------------
      // LOGIN REQUEST
      // --------------------------------------------------------

      const request: LoginRequest = {
        email: cleanEmail,
        password,
      };

      const response = await authApi.login(request);

      // --------------------------------------------------------
      // RESPONSE VALIDATION
      // --------------------------------------------------------

      if (!response) {
        setError("Unable to login. Please try again.");
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

      // --------------------------------------------------------
      // USER INFORMATION
      // --------------------------------------------------------

      const role = response.user.role?.toLowerCase();

      const isActive =
        response.user.status?.toLowerCase() === "active";

      // --------------------------------------------------------
      // TRAINER LOGIN
      // --------------------------------------------------------

      if (role === "trainer") {
        auth.saveToken(response.token);
        auth.saveUser(response.user);

        if (isActive) {
          notify.success("Trainer login successful.");

          router.replace("/dashboard");

          return;
        }

        notify.info(
          "Your trainer application is still under review."
        );

        router.replace("/trainer-application");

        return;
      }

      // --------------------------------------------------------
      // INVALID ROLE
      // --------------------------------------------------------

      auth.logout();

      setError("This portal is for trainers only.");

      notify.error("This portal is for trainers only.");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to login. Please check your credentials.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Landing Page Grid */}
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

        <a
          href="/"
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

          <div className="leading-none">
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
        </a>

        <div className="hidden items-center gap-2 sm:flex">

          <ShieldCheck className="h-3.5 w-3.5 text-[#C5A059]" />

          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
            Secure Trainer Access
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
            lg:grid-cols-[1.05fr_0.95fr]
          "
        >

          {/* ==================================================== */}
          {/* LEFT PRODUCT PREVIEW */}
          {/* ==================================================== */}

          <section
            className="
              relative
              overflow-hidden
              bg-[#f7fafc]
              px-7
              py-10
              sm:px-10
              lg:px-12
              lg:py-12
              xl:px-14
            "
          >

            {/* Background Glow */}
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
                  Trainer Workspace
                </span>
              </div>

              {/* Heading */}
              <h1
                className="
                  mt-7
                  max-w-[500px]
                  text-4xl
                  font-extrabold
                  leading-[1.08]
                  tracking-tight
                  text-[#002b5c]
                  sm:text-5xl
                "
              >
                Empower Every
                <br />
                <span className="text-[#C5A059]">
                  Learning Session.
                </span>
              </h1>

              <p className="mt-5 max-w-[500px] text-sm leading-7 text-gray-500">
                A dedicated workspace for trainers to manage
                training sessions, participants, attendance,
                learning activities, and assessments.
              </p>

              {/* ================================================= */}
              {/* PRODUCT DASHBOARD */}
              {/* ================================================= */}

              <div className="relative mt-9">

                {/* Dashboard Card */}
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[28px]
                    border
                    border-gray-100
                    bg-white
                    shadow-[0_20px_50px_rgba(0,43,92,0.10)]
                  "
                >

                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#002b5c]">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold text-[#002b5c]">
                          Training Management
                        </p>

                        <p className="mt-0.5 text-[8px] text-gray-400">
                          Trainer Dashboard
                        </p>
                      </div>

                    </div>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[7px] font-bold uppercase tracking-wider text-green-600">
                      Active
                    </span>

                  </div>

                  {/* Dashboard Stats */}
                  <div className="grid grid-cols-3 gap-3 p-5">

                    <DashboardStat
                      value="12"
                      label="Sessions"
                      icon={CalendarDays}
                    />

                    <DashboardStat
                      value="08"
                      label="Batches"
                      icon={Users}
                    />

                    <DashboardStat
                      value="248"
                      label="Participants"
                      icon={Users}
                    />

                  </div>

                  {/* Training Progress */}
                  <div className="px-5 pb-5">

                    <div className="rounded-2xl bg-[#f7fafc] p-4">

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-wider text-[#C5A059]">
                            Current Training
                          </p>

                          <p className="mt-1 text-[11px] font-extrabold text-[#002b5c]">
                            Leadership Development
                          </p>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                          <GraduationIcon />
                        </div>

                      </div>

                      <div className="mt-4">

                        <div className="flex justify-between">

                          <span className="text-[8px] text-gray-400">
                            Training Progress
                          </span>

                          <span className="text-[8px] font-bold text-[#002b5c]">
                            68%
                          </span>

                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">

                          <div
                            className="h-full rounded-full bg-[#C5A059]"
                            style={{ width: "68%" }}
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* Workflow */}
                  <div className="border-t border-gray-100 px-5 py-5">

                    <p className="mb-4 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      Training Workflow
                    </p>

                    <div className="grid grid-cols-4 gap-2">

                      <MiniStep
                        icon={Users}
                        label="Enroll"
                        active
                      />

                      <MiniStep
                        icon={CalendarDays}
                        label="Schedule"
                        active
                      />

                      <MiniStep
                        icon={QrCode}
                        label="Attend"
                        active
                      />

                      <MiniStep
                        icon={FileCheck2}
                        label="Assess"
                      />

                    </div>

                  </div>

                </div>

                {/* Floating Card */}
                <div
                  className="
                    absolute
                    -bottom-5
                    -right-4
                    hidden
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-3
                    shadow-xl
                    sm:block
                    xl:-right-7
                  "
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-[#002b5c]">
                        Attendance Recorded
                      </p>

                      <p className="mt-1 text-[7px] text-gray-400">
                        Training session
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* ================================================= */}
              {/* FEATURES */}
              {/* ================================================= */}

              <div className="mt-10 grid grid-cols-2 gap-3">

                <FeatureItem
                  icon={CalendarDays}
                  title="Training Schedule"
                />

                <FeatureItem
                  icon={QrCode}
                  title="Attendance"
                />

                <FeatureItem
                  icon={BookOpen}
                  title="Learning Materials"
                />

                <FeatureItem
                  icon={FileCheck2}
                  title="Assessment"
                />

              </div>

            </div>
          </section>

          {/* ==================================================== */}
          {/* RIGHT LOGIN */}
          {/* ==================================================== */}

          <section
            className="
              flex
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
              {/* TITLE */}
              {/* ================================================= */}

              <div className="mb-8">

                <div className="mb-4 flex items-center gap-3">

                  <span className="h-px w-8 bg-[#C5A059]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                    Trainer Portal
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
                  Welcome Back, Trainer.
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Sign in to manage your training workspace,
                  monitor participants, and continue delivering
                  professional learning experiences.
                </p>

              </div>

              {/* ================================================= */}
              {/* ERROR */}
              {/* ================================================= */}

              {error && (
                <div
                  className="
                    mb-6
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

                  <p>{error}</p>
                </div>
              )}

              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}
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

                {/* PASSWORD */}
                <div>

                  <label
                    htmlFor="password"
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
                    Password
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
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      disabled={isLoading}
                      placeholder="Enter your password"
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

                    <button
                      type="button"
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
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
                      "
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                </div>

                {/* REMEMBER / FORGOT */}
                <div className="flex items-center justify-between gap-4">

                  <label className="flex cursor-pointer items-center gap-2">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      disabled={isLoading}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked
                        )
                      }
                      className="
                        h-3.5
                        w-3.5
                        rounded
                        border-gray-300
                        text-[#002b5c]
                        focus:ring-[#C5A059]
                      "
                    />

                    <span className="text-[10px] text-gray-500">
                      Keep me signed in
                    </span>

                  </label>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      router.push("/forgot-password")
                    }
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
                    Forgot password?
                  </button>

                </div>

                {/* ================================================= */}
                {/* LOGIN */}
                {/* ================================================= */}

                <button
                  type="submit"
                  disabled={isLoading}
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

                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Secure Login

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

              </form>

              {/* ================================================= */}
              {/* REGISTER */}
              {/* ================================================= */}

              <div className="mt-8">

                <div className="flex items-center gap-3">

                  <div className="h-px flex-1 bg-gray-100" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-300">
                    New Trainer?
                  </span>

                  <div className="h-px flex-1 bg-gray-100" />

                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    router.push("/register")
                  }
                  className="
                    mt-4
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    text-xs
                    font-bold
                    text-[#002b5c]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-[#C5A059]
                    hover:bg-[#C5A059]/5
                    disabled:opacity-50
                  "
                >
                  Create Trainer Account

                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

              </div>

              {/* ================================================= */}
              {/* SECURITY */}
              {/* ================================================= */}

              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-gray-100
                  bg-gray-50
                  p-4
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
                      Secure Trainer Access
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-gray-400">
                      This portal is restricted to authorized
                      trainers. Your account activity is protected
                      for security purposes.
                    </p>

                  </div>

                </div>

              </div>

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
   DASHBOARD STAT
================================================================ */

function DashboardStat({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-3
        shadow-sm
      "
    >
      <div className="flex items-center justify-between">

        <span className="text-xl font-extrabold text-[#002b5c]">
          {value}
        </span>

        <Icon className="h-3.5 w-3.5 text-[#C5A059]" />

      </div>

      <p className="mt-1 text-[7px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
    </div>
  );
}

/* ================================================================
   MINI STEP
================================================================ */

function MiniStep({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="text-center">

      <div
        className={`
          mx-auto
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          ${
            active
              ? "bg-[#002b5c] text-white"
              : "bg-gray-100 text-gray-300"
          }
        `}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <p
        className={`
          mt-2
          text-[7px]
          font-bold
          ${
            active
              ? "text-[#002b5c]"
              : "text-gray-400"
          }
        `}
      >
        {label}
      </p>

    </div>
  );
}

/* ================================================================
   FEATURE ITEM
================================================================ */

function FeatureItem({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-3
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#002b5c]/5">
        <Icon className="h-3.5 w-3.5 text-[#002b5c]" />
      </div>

      <p className="text-[9px] font-bold text-[#002b5c]">
        {title}
      </p>

    </div>
  );
}

/* ================================================================
   GRADUATION ICON
================================================================ */

function GraduationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 text-[#C5A059]"
    >
      <path d="m2 10 10-5 10 5-10 5L2 10Z" />
      <path d="M6 12.5V17c3.5 2.5 8.5 2.5 12 0v-4.5" />
      <path d="M22 10v5" />
    </svg>
  );
}