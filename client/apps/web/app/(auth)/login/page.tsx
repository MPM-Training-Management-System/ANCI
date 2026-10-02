"use client";

import {
  FormEvent,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";

import type {
  LoginRequest,
} from "@repo/types";

import {
  authApi,
} from "@/lib/api";

import {
  auth,
} from "@/lib/auth";

import {
  notify,
  useGoogleAuth,
} from "@repo/hooks";

import Logo from "@/assets/image/ANCILOGO.png";


// ================================================================
// GOOGLE CLIENT ID
// ================================================================

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";


// ================================================================
// PAGE
// ================================================================

export default function LoginPage() {
  if (!GOOGLE_CLIENT_ID) {
    return <LoginPageContent />;
  }

  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
    >
      <LoginPageContent />
    </GoogleOAuthProvider>
  );
}


// ================================================================
// LOGIN PAGE CONTENT
// ================================================================

function LoginPageContent() {
  const router = useRouter();

  // ==============================================================
  // GOOGLE BUTTON REF
  // ==============================================================

  const googleButtonRef =
    useRef<HTMLDivElement>(null);


  // ==============================================================
  // FORM STATE
  // ==============================================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // ==============================================================
  // GOOGLE AUTH HOOK
  // ==============================================================

  const {
    googleLogin,
    isLoading: isGoogleLoading,
    error: googleError,
  } = useGoogleAuth(authApi);


  // ==============================================================
  // GOOGLE SUCCESS
  // ==============================================================

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    setError(null);


    // ------------------------------------------------------------
    // CHECK CREDENTIAL
    // ------------------------------------------------------------

    if (!credentialResponse.credential) {
      const message =
        "Google authentication failed. No ID token was returned.";

      setError(message);

      notify.error(
        "Google authentication failed."
      );

      return;
    }


    try {
      // ----------------------------------------------------------
      // SEND GOOGLE ID TOKEN TO BACKEND
      // ----------------------------------------------------------

      const response =
        await googleLogin({
          idToken:
            credentialResponse.credential,
        });


      // ----------------------------------------------------------
      // CHECK RESPONSE
      // ----------------------------------------------------------

      if (!response) {
        const message =
          "Unable to process Google authentication.";

        setError(message);

        notify.error(message);

        return;
      }


      // ==========================================================
      // NEW GOOGLE USER
      // ==========================================================

      if (
        response.requiresRegistration ||
        response.isNewUser
      ) {

        // --------------------------------------------------------
        // SAVE GOOGLE ID TOKEN
        // --------------------------------------------------------

        sessionStorage.setItem(
          "google_registration_id_token",
          credentialResponse.credential
        );


        // --------------------------------------------------------
        // VERIFY SAVED TOKEN
        // --------------------------------------------------------

        const savedGoogleIdToken =
          sessionStorage.getItem(
            "google_registration_id_token"
          );


        if (!savedGoogleIdToken) {
          const message =
            "Unable to start Google registration.";

          setError(message);

          notify.error(message);

          return;
        }


        // --------------------------------------------------------
        // NOTIFY
        // --------------------------------------------------------

        notify.info(
          "Google account verified. Please complete your registration."
        );


        // --------------------------------------------------------
        // BUILD REGISTER PARAMETERS
        // --------------------------------------------------------

        const params =
          new URLSearchParams();


        params.set(
          "google",
          "1"
        );


        params.set(
          "email",
          response.email ?? ""
        );


        params.set(
          "firstName",
          response.firstName ?? ""
        );


        params.set(
          "lastName",
          response.lastName ?? ""
        );


        params.set(
          "fullName",
          response.fullName ?? ""
        );


        params.set(
          "profileImageUrl",
          response.profileImageUrl ?? ""
        );


        // --------------------------------------------------------
        // REDIRECT
        // --------------------------------------------------------

        router.push(
          `/register?${params.toString()}`
        );

        return;
      }


      // ==========================================================
      // EXISTING GOOGLE USER
      // ==========================================================

      if (!response.login) {
        const message =
          "Google login succeeded but no authentication data was returned.";

        setError(message);

        notify.error(message);

        return;
      }


      // ----------------------------------------------------------
      // CHECK TOKEN
      // ----------------------------------------------------------

      if (!response.login.token) {
        const message =
          "Google login succeeded but no authentication token was returned.";

        setError(message);

        notify.error(message);

        return;
      }


      // ----------------------------------------------------------
      // CHECK USER
      // ----------------------------------------------------------

      if (!response.login.user) {
        const message =
          "Google login succeeded but no user information was returned.";

        setError(message);

        notify.error(message);

        return;
      }


      // ==========================================================
      // SAVE AUTH
      // ==========================================================

      auth.saveToken(
        response.login.token
      );

      auth.saveUser(
        response.login.user
      );


      // ==========================================================
      // USER ROLE
      // ==========================================================

      const role =
        response.login.user.role?.toLowerCase();

      const userStatus =
        response.login.user.status?.toLowerCase();


      // ==========================================================
      // TRAINER
      // ==========================================================

      if (role === "trainer") {

        // --------------------------------------------------------
        // CHECK USER STATUS
        // --------------------------------------------------------

        if (!userStatus) {
          auth.logout();

          const message =
            "Your account status could not be determined.";

          setError(message);

          notify.error(message);

          return;
        }


        try {
          // ------------------------------------------------------
          // GET TRAINER APPLICATION
          // ------------------------------------------------------

          const application =
            await authApi.getMyTrainerApplication();


          const applicationStatus =
            application?.status?.toLowerCase();


          // ======================================================
          // APPROVED
          // ======================================================

          if (
            applicationStatus ===
            "approved"
          ) {

            notify.success(
              "Google login successful."
            );

            router.replace(
              "/dashboard"
            );

            return;
          }


          // ======================================================
          // UNDER REVIEW
          // ======================================================

          if (
            applicationStatus ===
              "pending" ||

            applicationStatus ===
              "underreview" ||

            applicationStatus ===
              "under_review" ||

            applicationStatus ===
              "rejected"
          ) {

            notify.info(
              "Your trainer application is still under review."
            );

            router.replace(
              "/trainer-application"
            );

            return;
          }


          // ======================================================
          // OTHER STATUS
          // ======================================================

          notify.info(
            "Your trainer application is still being processed."
          );

          router.replace(
            "/trainer-application"
          );

          return;

        } catch (
          applicationError
        ) {

          console.error(
            "TRAINER APPLICATION ERROR:",
            applicationError
          );


          auth.logout();


          const message =
            "Unable to verify your trainer application.";

          setError(message);

          notify.error(message);

          return;
        }
      }


      // ==========================================================
      // OTHER USER ROLES
      // ==========================================================

      notify.success(
        "Google login successful."
      );

      router.replace(
        "/dashboard"
      );

    } catch (googleLoginError) {

      console.error(
        "GOOGLE LOGIN ERROR:",
        googleLoginError
      );


      const message =
        googleLoginError instanceof Error
          ? googleLoginError.message
          : "Unable to continue with Google. Please try again.";


      setError(message);

      notify.error(message);
    }
  };


  // ==============================================================
  // GOOGLE ERROR
  // ==============================================================

  const handleGoogleError = () => {
    const message =
      "Google sign-in was cancelled or could not be completed.";

    setError(message);

    notify.error(
      "Google sign-in failed. Please try again."
    );
  };


  // ==============================================================
  // CUSTOM GOOGLE BUTTON CLICK
  // ==============================================================

  const handleGoogleLogin = () => {
    setError(null);


    if (!GOOGLE_CLIENT_ID) {
      const message =
        "Google Sign-In is not configured.";

      setError(message);

      notify.error(message);

      return;
    }


    // ------------------------------------------------------------
    // FIND GOOGLE GENERATED BUTTON
    // ------------------------------------------------------------

    const googleContainer =
      googleButtonRef.current;


    if (!googleContainer) {
      notify.error(
        "Google Sign-In is not ready yet. Please try again."
      );

      return;
    }


    const googleIframe =
      googleContainer.querySelector(
        "iframe"
      );


    if (!googleIframe) {
      notify.error(
        "Google Sign-In is still loading. Please try again."
      );

      return;
    }


    // ------------------------------------------------------------
    // THE ACTUAL GOOGLE BUTTON IS THE TRANSPARENT OVERLAY
    // ------------------------------------------------------------

    const googleButton =
      googleContainer.querySelector(
        '[role="button"]'
      ) as HTMLElement | null;


    if (googleButton) {
      googleButton.click();
    }
  };


  // ==============================================================
  // NORMAL LOGIN
  // ==============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);


    // ------------------------------------------------------------
    // CLEAN EMAIL
    // ------------------------------------------------------------

    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    // ------------------------------------------------------------
    // EMAIL VALIDATION
    // ------------------------------------------------------------

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }


    // ------------------------------------------------------------
    // PASSWORD VALIDATION
    // ------------------------------------------------------------

    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }


    try {
      setIsLoading(true);


      // ----------------------------------------------------------
      // LOGIN REQUEST
      // ----------------------------------------------------------

      const request: LoginRequest = {
        email:
          cleanEmail,

        password,
      };


      const response =
        await authApi.login(
          request
        );


      // ----------------------------------------------------------
      // CHECK RESPONSE
      // ----------------------------------------------------------

      if (!response) {
        setError(
          "Unable to login. Please try again."
        );

        return;
      }


      // ----------------------------------------------------------
      // TOKEN
      // ----------------------------------------------------------

      if (!response.token) {
        setError(
          "Login succeeded but no authentication token was returned."
        );

        return;
      }


      // ----------------------------------------------------------
      // USER
      // ----------------------------------------------------------

      if (!response.user) {
        setError(
          "Login succeeded but no user information was returned."
        );

        return;
      }


      // ==========================================================
      // ROLE
      // ==========================================================

      const role =
        response.user.role?.toLowerCase();

      const userStatus =
        response.user.status?.toLowerCase();


      // ==========================================================
      // TRAINER
      // ==========================================================

      if (role === "trainer") {

        // --------------------------------------------------------
        // SAVE AUTH
        // --------------------------------------------------------

        auth.saveToken(
          response.token
        );

        auth.saveUser(
          response.user
        );


        // --------------------------------------------------------
        // CHECK STATUS
        // --------------------------------------------------------

        if (!userStatus) {
          auth.logout();

          const message =
            "Your account status could not be determined.";

          setError(message);

          notify.error(message);

          return;
        }


        try {
          // ------------------------------------------------------
          // GET APPLICATION
          // ------------------------------------------------------

          const application =
            await authApi.getMyTrainerApplication();


          const applicationStatus =
            application?.status?.toLowerCase();


          // ======================================================
          // APPROVED
          // ======================================================

          if (
            applicationStatus ===
            "approved"
          ) {

            notify.success(
              "Trainer login successful."
            );

            router.replace(
              "/dashboard"
            );

            return;
          }


          // ======================================================
          // UNDER REVIEW
          // ======================================================

          if (
            applicationStatus ===
              "pending" ||

            applicationStatus ===
              "underreview" ||

            applicationStatus ===
              "under_review" ||

            applicationStatus ===
              "rejected"
          ) {

            notify.info(
              "Your trainer application is still under review."
            );

            router.replace(
              "/trainer-application"
            );

            return;
          }


          // ======================================================
          // OTHER
          // ======================================================

          notify.info(
            "Your trainer application is still being processed."
          );

          router.replace(
            "/trainer-application"
          );

          return;

        } catch (
          applicationError
        ) {

          console.error(
            "TRAINER APPLICATION ERROR:",
            applicationError
          );


          auth.logout();


          const message =
            "Unable to verify your trainer application.";

          setError(message);

          notify.error(message);

          return;
        }
      }


      // ==========================================================
      // NORMAL USER
      // ==========================================================

      auth.saveToken(
        response.token
      );

      auth.saveUser(
        response.user
      );


      notify.success(
        "Login successful."
      );

      router.replace(
        "/dashboard"
      );

    } catch (loginError) {

      console.error(
        "LOGIN ERROR:",
        loginError
      );


      const message =
        loginError instanceof Error
          ? loginError.message
          : "Unable to login. Please try again.";


      setError(message);

      notify.error(message);

    } finally {
      setIsLoading(false);
    }
  };


  // ==============================================================
  // LOADING
  // ==============================================================

  const isAnyLoading =
    isLoading ||
    isGoogleLoading;


  const displayError =
    error ||
    googleError ||
    null;


  // ==============================================================
  // UI
  // ==============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9ff]">


      {/* ====================================================== */}
      {/* BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#6FD1D7]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-[#3B7597]/10 blur-3xl" />

      <div className="login-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="login-dot login-dot-one pointer-events-none" />

      <div className="login-dot login-dot-two pointer-events-none" />

      <div className="login-dot login-dot-three pointer-events-none" />


      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-10 sm:px-6 lg:px-8">

        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">


          {/* ================================================== */}
          {/* LEFT */}
          {/* ================================================== */}

          <section className="hidden lg:block">

            <div className="max-w-xl">


              {/* BRAND */}

              <Link
                href="/"
                className="mb-7 flex items-center gap-3"
              >

                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-[#002b5c]/15">

                  <Image
                    src={Logo}
                    alt="ACE NextGen Consultancy Inc. logo"
                    width={44}
                    height={44}
                    priority
                    className="h-full w-full object-contain"
                  />

                </div>


                <div>

                  <p className="text-sm font-extrabold tracking-tight text-[#002b5c]">
                    ACE NextGen
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#3B7597]">
                    Consultancy Inc.
                  </p>

                </div>

              </Link>


              {/* HEADING */}

              <h1 className="font-[var(--font-jakarta)] text-5xl font-extrabold leading-[1.08] tracking-tight text-[#0b1c30] xl:text-6xl">

                Welcome back to your

                <span className="mt-1 block text-[#2563eb]">
                  learning journey.
                </span>

              </h1>


              {/* DESCRIPTION */}

              <p className="mt-7 max-w-lg text-base leading-8 text-slate-600">

                Access your ACE NextGen account to continue your
                training, manage your learning activities, view
                your certificates, and stay connected with your
                programs.

              </p>


              {/* FEATURES */}

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">


                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dff7f8] text-[#002b5c]">

                    <GraduationCap size={18} />

                  </div>

                  <p className="mt-3 text-xs font-bold text-[#0b1c30]">
                    Training
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    Learn and develop
                  </p>

                </div>


                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f0f7] text-[#002b5c]">

                    <ShieldCheck size={18} />

                  </div>

                  <p className="mt-3 text-xs font-bold text-[#0b1c30]">
                    Secure
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    Protected account
                  </p>

                </div>


                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef7f8] text-[#002b5c]">

                    <BriefcaseBusiness size={18} />

                  </div>

                  <p className="mt-3 text-xs font-bold text-[#0b1c30]">
                    Services
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    Professional support
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* ================================================== */}
          {/* RIGHT */}
          {/* ================================================== */}

          <section className="flex w-full justify-center lg:justify-end">

            <div className="w-full max-w-[460px]">


              {/* MOBILE BRAND */}

              <Link
                href="/"
                className="mb-7 flex items-center justify-center gap-3 lg:hidden"
              >

                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-[#002b5c]/15">

                  <Image
                    src={Logo}
                    alt="ACE NextGen Consultancy Inc. logo"
                    width={44}
                    height={44}
                    priority
                    className="h-full w-full object-contain"
                  />

                </div>


                <div>

                  <p className="text-sm font-extrabold tracking-tight text-[#002b5c]">
                    ACE NextGen
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#3B7597]">
                    Consultancy Inc.
                  </p>

                </div>

              </Link>


              {/* ================================================= */}
              {/* CARD */}
              {/* ================================================= */}

              <div className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_25px_70px_rgba(0,43,92,0.10)] backdrop-blur-xl sm:p-8">


                {/* HEADER */}

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B7597]">
                    Account Login
                  </p>

                  <h2 className="mt-2 font-[var(--font-jakarta)] text-3xl font-extrabold tracking-tight text-[#0b1c30]">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to continue to your ACE NextGen account.
                  </p>

                </div>


                {/* ERROR */}

                {displayError && (

                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">

                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                    <p>
                      {displayError}
                    </p>

                  </div>

                )}


                {/* =================================================
                    GOOGLE CUSTOM BUTTON
                ================================================= */}

                <div className="relative mt-7 h-12 w-full">


                  {/* ------------------------------------------------
                      YOUR ORIGINAL DESIGN
                  ------------------------------------------------ */}

                  <button
                    type="button"
                    disabled={
                      isAnyLoading ||
                      !GOOGLE_CLIENT_ID
                    }
                    className="absolute inset-0 z-10 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#0b1c30] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >

                      <path
                        d="M21.805 12.23C21.805 11.55 21.745 10.86 21.625 10.2H12.2V14.04H17.59C17.37 15.28 16.65 16.33 15.57 17.01V19.5H18.79C20.68 17.76 21.805 15.19 21.805 12.23Z"
                        fill="#4285F4"
                      />

                      <path
                        d="M12.2 22C14.9 22 17.17 21.11 18.79 19.5L15.57 17.01C14.68 17.61 13.55 17.97 12.2 17.97C9.59 17.97 7.37 16.21 6.58 13.84H3.25V16.4C4.95 19.79 8.43 22 12.2 22Z"
                        fill="#34A853"
                      />

                      <path
                        d="M6.58 13.84C6.38 13.24 6.27 12.6 6.27 11.94C6.27 11.28 6.38 10.64 6.58 10.04V7.48H3.25C2.57 8.83 2.18 10.35 2.18 11.94C2.18 13.53 2.57 15.05 3.25 16.4L6.58 13.84Z"
                        fill="#FBBC05"
                      />

                      <path
                        d="M12.2 5.91C13.67 5.91 14.99 6.42 16.03 7.42L18.86 4.59C17.16 3 14.9 2 12.2 2C8.43 2 4.95 4.21 3.25 7.48L6.58 10.04C7.37 7.67 9.59 5.91 12.2 5.91Z"
                        fill="#EA4335"
                      />

                    </svg>


                    {isGoogleLoading
                      ? "Connecting..."
                      : "Continue with Google"}

                  </button>


                  {/* ------------------------------------------------
                      REAL GOOGLE LOGIN
                      TRANSPARENT OVERLAY
                  ------------------------------------------------ */}

                  {GOOGLE_CLIENT_ID && (

                    <div
                      ref={googleButtonRef}
                      className="absolute inset-0 z-20 overflow-hidden opacity-0"
                    >

                      <GoogleLogin
                        onSuccess={
                          handleGoogleSuccess
                        }
                        onError={
                          handleGoogleError
                        }
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width="460"
                      />

                    </div>

                  )}

                </div>


                {/* =================================================
                    DIVIDER
                ================================================= */}

                <div className="my-6 flex items-center gap-4">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-[11px] font-medium text-slate-400">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >


                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-[#0b1c30]"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      disabled={isAnyLoading}
                      placeholder="you@example.com"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 text-sm text-[#0b1c30] outline-none transition placeholder:text-slate-400 focus:border-[#3B7597] focus:bg-white focus:ring-4 focus:ring-[#6FD1D7]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>


                  {/* PASSWORD */}

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="text-sm font-bold text-[#0b1c30]"
                      >
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs font-bold text-[#3B7597] transition hover:text-[#002b5c]"
                      >
                        Forgot password?
                      </Link>

                    </div>


                    <div className="relative">

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        disabled={isAnyLoading}
                        placeholder="Enter your password"
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 pr-12 text-sm text-[#0b1c30] outline-none transition placeholder:text-slate-400 focus:border-[#3B7597] focus:bg-white focus:ring-4 focus:ring-[#6FD1D7]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />


                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) =>
                              !current
                          )
                        }
                        disabled={isAnyLoading}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#002b5c] disabled:opacity-50"
                      >

                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}

                      </button>

                    </div>

                  </div>


                  {/* LOGIN */}

                  <button
                    type="submit"
                    disabled={isAnyLoading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#002b5c] px-5 text-sm font-bold text-white shadow-lg shadow-[#002b5c]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0d2142] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isLoading ? (

                      <>

                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Signing in...

                      </>

                    ) : (

                      <>

                        Sign In

                        <ArrowRight
                          size={17}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />

                      </>

                    )}

                  </button>

                </form>


                {/* REGISTER */}

                <p className="mt-7 text-center text-sm text-slate-500">

                  Don't have an account?{" "}

                  <Link
                    href="/register"
                    className="font-bold text-[#3B7597] transition hover:text-[#002b5c]"
                  >
                    Create an account
                  </Link>

                </p>


                {/* SECURITY */}

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400">

                  <ShieldCheck size={13} />

                  <span>
                    Your account information is securely protected.
                  </span>

                </div>

              </div>

            </div>

          </section>

        </div>

      </div>


      {/* ====================================================== */}
      {/* STYLES */}
      {/* ====================================================== */}

      <style jsx>{`

        .login-grid {
          background-image:
            linear-gradient(
              to right,
              rgba(59, 117, 151, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(59, 117, 151, 0.045) 1px,
              transparent 1px
            );

          background-size: 55px 55px;

          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 20%,
            black 80%,
            transparent
          );
        }


        .login-dot {
          position: absolute;

          border-radius: 9999px;

          background: #6fd1d7;

          opacity: 0.45;

          animation:
            loginFloat 5s ease-in-out infinite;
        }


        .login-dot-one {
          left: 9%;

          top: 24%;

          width: 7px;

          height: 7px;
        }


        .login-dot-two {
          right: 12%;

          top: 17%;

          width: 5px;

          height: 5px;

          animation-delay: 1s;
        }


        .login-dot-three {
          right: 18%;

          bottom: 18%;

          width: 8px;

          height: 8px;

          background: #3b7597;

          animation-delay: 2s;
        }


        @keyframes loginFloat {

          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-14px);
          }

        }


        @media (max-width: 1023px) {

          .login-grid {
            background-size: 45px 45px;
          }

          .login-dot-one,
          .login-dot-two,
          .login-dot-three {
            opacity: 0.25;
          }

        }


        @media (max-width: 640px) {

          .login-grid {
            opacity: 0.18;
          }

          .login-dot-one {
            left: 8%;
            top: 12%;
          }

          .login-dot-two {
            right: 8%;
            top: 8%;
          }

          .login-dot-three {
            right: 10%;
            bottom: 8%;
          }

        }


        @media (prefers-reduced-motion: reduce) {

          .login-dot {
            animation: none;
          }

        }

      `}</style>

    </main>
  );
}