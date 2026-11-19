
"use client";

import {
  FormEvent,
  useRef,
  useState,
} from "react";

import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";

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

import type { LoginRequest } from "@repo/types";
import { authApi } from "@/lib/api";
import { auth } from "@/lib/auth";
import { notify, useGoogleAuth } from "@repo/hooks";

import Logo from "@/assets/image/ANCILOGO.png";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function LoginPage() {
  if (!GOOGLE_CLIENT_ID) {
    return <LoginPageContent />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  );
}

function LoginPageContent() {
  const router = useRouter();

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
const [turnstileToken, setTurnstileToken] = useState("");
const isTurnstileVerified = Boolean(turnstileToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    googleLogin,
    isLoading: isGoogleLoading,
    error: googleError,
  } = useGoogleAuth(authApi);

  const isAnyLoading = isLoading || isGoogleLoading;

  const displayError = error || googleError || null;

  // ============================================================
  // GOOGLE SUCCESS
  // ============================================================

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    setError(null);

    if (!credentialResponse.credential) {
      const message =
        "Google authentication failed. No ID token was returned.";

      setError(message);
      notify.error("Google authentication failed.");
      return;
    }

    try {
      const response = await googleLogin({
        idToken: credentialResponse.credential,
      });

      if (!response) {
        const message =
          "Unable to process Google authentication.";

        setError(message);
        notify.error(message);
        return;
      }

      // NEW GOOGLE USER
      if (
        response.requiresRegistration ||
        response.isNewUser
      ) {
        sessionStorage.setItem(
          "google_registration_id_token",
          credentialResponse.credential
        );

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

        notify.info(
          "Google account verified. Please complete your registration."
        );

        const params = new URLSearchParams();

        params.set("google", "1");
        params.set("email", response.email ?? "");
        params.set("firstName", response.firstName ?? "");
        params.set("lastName", response.lastName ?? "");
        params.set("fullName", response.fullName ?? "");
        params.set(
          "profileImageUrl",
          response.profileImageUrl ?? ""
        );

        router.push(`/register?${params.toString()}`);
        return;
      }

      // EXISTING GOOGLE USER
      if (!response.login) {
        const message =
          "Google login succeeded but no authentication data was returned.";

        setError(message);
        notify.error(message);
        return;
      }

      if (!response.login.token) {
        const message =
          "Google login succeeded but no authentication token was returned.";

        setError(message);
        notify.error(message);
        return;
      }

      if (!response.login.user) {
        const message =
          "Google login succeeded but no user information was returned.";

        setError(message);
        notify.error(message);
        return;
      }

      auth.saveToken(response.login.token);
      auth.saveUser(response.login.user);

      const role =
        response.login.user.role?.toLowerCase();

      const userStatus =
        response.login.user.status?.toLowerCase();

      // TRAINER
      if (role === "trainer") {
        if (!userStatus) {
          auth.logout();

          const message =
            "Your account status could not be determined.";

          setError(message);
          notify.error(message);
          return;
        }

        try {
          const application =
            await authApi.getMyTrainerApplication();

          const applicationStatus =
            application?.status?.toLowerCase();

          if (applicationStatus === "approved") {
            notify.success("Google login successful.");
            router.replace("/dashboard");
            return;
          }

          if (
            applicationStatus === "pending" ||
            applicationStatus === "underreview" ||
            applicationStatus === "under_review" ||
            applicationStatus === "rejected"
          ) {
            notify.info(
              "Your trainer application is still under review."
            );

            router.replace("/trainer-application");
            return;
          }

          notify.info(
            "Your trainer application is still being processed."
          );

          router.replace("/trainer-application");
          return;
        } catch (applicationError) {
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

      notify.success("Google login successful.");
      router.replace("/dashboard");
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

  // ============================================================
  // GOOGLE ERROR
  // ============================================================

  const handleGoogleError = () => {
    const message =
      "Google sign-in was cancelled or could not be completed.";

    setError(message);
    notify.error("Google sign-in failed. Please try again.");
  };

  // ============================================================
  // CUSTOM GOOGLE BUTTON
  // ============================================================

  const handleGoogleLogin = () => {
    setError(null);

    if (!GOOGLE_CLIENT_ID) {
      const message = "Google Sign-In is not configured.";

      setError(message);
      notify.error(message);
      return;
    }
    if (!isTurnstileVerified) {
  setError("Please complete the security verification first.");
  return;
}

    const googleContainer = googleButtonRef.current;

   

    if (!googleContainer) {
      notify.error(
        "Google Sign-In is not ready yet. Please try again."
      );
      return;
    }

    const googleIframe =
      googleContainer.querySelector("iframe");

    if (!googleIframe) {
      notify.error(
        "Google Sign-In is still loading. Please try again."
      );
      return;
    }

    const googleButton =
      googleContainer.querySelector(
        '[role="button"]'
      ) as HTMLElement | null;

    if (googleButton) {
      googleButton.click();
    }
  };

  // ============================================================
  // NORMAL LOGIN
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (!turnstileToken) {
  setError("Please complete the security verification.");
  return;
}

    try {
      setIsLoading(true);

      const request: LoginRequest = {
        email: cleanEmail,
        password,
         turnstileToken,
      };

      const response = await authApi.login(request);

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

      const role =
        response.user.role?.toLowerCase();

      const userStatus =
        response.user.status?.toLowerCase();

      // TRAINER LOGIN
      if (role === "trainer") {
        auth.saveToken(response.token);
        auth.saveUser(response.user);

        if (!userStatus) {
          auth.logout();

          const message =
            "Your account status could not be determined.";

          setError(message);
          notify.error(message);
          return;
        }

        try {
          const application =
            await authApi.getMyTrainerApplication();

          const applicationStatus =
            application?.status?.toLowerCase();

          if (applicationStatus === "approved") {
            notify.success("Trainer login successful.");
            router.replace("/dashboard");
            return;
          }

          if (
            applicationStatus === "pending" ||
            applicationStatus === "underreview" ||
            applicationStatus === "under_review" ||
            applicationStatus === "rejected"
          ) {
            notify.info(
              "Your trainer application is still under review."
            );

            router.replace("/trainer-application");
            return;
          }

          notify.info(
            "Your trainer application is still being processed."
          );

          router.replace("/trainer-application");
          return;
        } catch (applicationError) {
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

      // NORMAL USER
      auth.saveToken(response.token);
      auth.saveUser(response.user);

      notify.success("Login successful.");
      router.replace("/dashboard");
    } catch (loginError) {
      console.error("LOGIN ERROR:", loginError);

      const message =
        loginError instanceof Error
          ? loginError.message
          : "Unable to login. Please try again.";

      setError(message);
      notify.error(message);
    } finally {
      setIsLoading(false);
       setTurnstileToken("");
  turnstileRef.current?.reset();
    }
  };

  // ============================================================
  // UI
  // ============================================================

return (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f6fb] px-4 py-6 sm:px-8 sm:py-8">

    {/* BACKGROUND DECORATIONS */}
    <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-[#6FD1D7]/20 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-[#3B7597]/15 blur-3xl" />
    <div className="login-grid pointer-events-none absolute inset-0" />

    {/* CENTERED CONTAINER */}
    <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 items-stretch overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_25px_75px_rgba(0,43,92,0.13)] lg:min-h-[590px] lg:grid-cols-2">

      {/* LEFT: LOGIN FORM */}
      <section className="order-1 flex min-w-0 items-center justify-center px-6 py-9 sm:px-10 lg:px-12 lg:py-8">

        <div className="w-full max-w-[400px]">

          {/* MOBILE LOGO */}
          <Link
            href="/"
            className="mb-7 flex items-center justify-center gap-3 lg:hidden"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
              <Image
                src={Logo}
                alt="ACE NextGen Logo"
                width={48}
                height={48}
                priority
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#002b5c]">
                ACE NextGen
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#3B7597]">
                Consultancy Inc.
              </p>
            </div>
          </Link>

          {/* HEADER */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B7597]">
              Account Login
            </p>

            <h2 className="mt-2 font-[var(--font-jakarta)] text-3xl font-extrabold tracking-tight text-[#0b1c30] sm:text-4xl">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue to your ACE NextGen account.
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {displayError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <p>{displayError}</p>
            </div>
          )}

          {/* GOOGLE LOGIN */}
          <div className="relative h-12 w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={
  isAnyLoading ||
  !GOOGLE_CLIENT_ID ||
  !isTurnstileVerified
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

            {GOOGLE_CLIENT_ID && (
              <div
                ref={googleButtonRef}
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden opacity-0"
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="400"
                />
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium text-slate-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

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
                onChange={(event) => setEmail(event.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isAnyLoading}
                  placeholder="Enter your password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#fbfcfe] px-4 pr-12 text-sm text-[#0b1c30] outline-none transition placeholder:text-slate-400 focus:border-[#3B7597] focus:bg-white focus:ring-4 focus:ring-[#6FD1D7]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={isAnyLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            {/* SIGN IN BUTTON */}

            {/* CLOUDFLARE TURNSTILE */}
<div className="flex justify-center py-1">
  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
    <Turnstile
      ref={turnstileRef}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      onSuccess={(token) => {
        setTurnstileToken(token);
        setError(null);
      }}
      onExpire={() => setTurnstileToken("")}
      onError={() => {
        setTurnstileToken("");
        setError("Security verification failed. Please try again.");
      }}
      options={{
        theme: "light",
        size: "flexible",
      }}
    />
  ) : (
    <p className="text-xs text-red-500">
      Security verification is not configured.
    </p>
  )}
</div>
            <button
              type="submit"
             disabled={isAnyLoading || !isTurnstileVerified}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#002b5c] px-5 text-sm font-bold text-white shadow-lg shadow-[#002b5c]/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0d2142] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
  <>
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    Signing in...
  </>
) : !isTurnstileVerified ? (
  <>
    Complete Security Verification
    <ShieldCheck size={17} />
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
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#3B7597] transition hover:text-[#002b5c]"
            >
              Create an account
            </Link>
          </p>

          {/* SECURITY */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck size={13} />
            <span>
              Your account information is securely protected.
            </span>
          </div>
        </div>
      </section>

      {/* RIGHT: BRAND PANEL */}
      <section className="relative order-2 hidden min-w-0 overflow-hidden bg-gradient-to-br from-[#002b5c] via-[#0d2142] to-[#164e63] px-8 py-8 text-white lg:flex lg:items-center xl:px-10">

        {/* DECORATIVE CIRCLES */}
        <div className="absolute -right-32 -top-32 h-[350px] w-[350px] rounded-full border border-white/10" />
        <div className="absolute -right-20 -top-20 h-[250px] w-[250px] rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-[#6FD1D7]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] brand-grid" />

        {/* BRAND CONTENT */}
        <div className="relative z-10 mx-auto w-full max-w-lg">

          {/* LOGO */}
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg">
              <Image
                src={Logo}
                alt="ACE NextGen Logo"
                width={48}
                height={48}
                priority
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight text-white">
                ACE NextGen
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/60">
                Consultancy Inc.
              </p>
            </div>
          </Link>

          {/* HEADING */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#6FD1D7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6FD1D7]" />
              Your journey starts here
            </span>

            <h1 className="mt-5 font-[var(--font-jakarta)] text-3xl font-extrabold leading-[1.12] tracking-tight text-white xl:text-4xl">
              Building better people,
              <span className="mt-1 block text-[#6FD1D7]">
                stronger institutions.
              </span>
            </h1>

            <p className="mt-4 max-w-md text-xs leading-6 text-white/70">
              Access your ACE NextGen account to continue your
              training, manage your learning activities, view
              your certificates, and stay connected with your programs.
            </p>
          </div>

          {/* FEATURE CARDS */}
          <div className="mt-7 grid grid-cols-2 gap-3">

            <div className="feature-card rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6FD1D7]/15 text-[#6FD1D7]">
                <GraduationCap size={19} />
              </div>

              <p className="mt-3 text-xs font-bold text-white">
                Training and Development
              </p>

              <p className="mt-1 text-[10px] leading-4 text-white/50">
                Learn, grow, and improve your skills.
              </p>
            </div>

            <div className="feature-card feature-card-delay rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6FD1D7]/15 text-[#6FD1D7]">
                <ShieldCheck size={19} />
              </div>

              <p className="mt-3 text-xs font-bold text-white">
                Secure Account
              </p>

              <p className="mt-1 text-[10px] leading-4 text-white/50">
                Your account and information matter.
              </p>
            </div>

            <div className="feature-card feature-card-delay-two col-span-2 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6FD1D7]/15 text-[#6FD1D7]">
                <BriefcaseBusiness size={19} />
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  Professional Services
                </p>
                <p className="mt-1 text-[10px] leading-4 text-white/50">
                  Consultancy, mediation, and institutional support.
                </p>
              </div>
            </div>
          </div>

          {/* QUOTE */}
          <div className="mt-7 border-l-2 border-[#6FD1D7] pl-4">
            <p className="max-w-md text-xs italic leading-6 text-white/75">
              &ldquo;A commitment to developing people,
              strengthening institutions, and building a
              culture of peace.&rdquo;
            </p>

            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#6FD1D7]">
              ACE NextGen Consultancy Inc.
            </p>
          </div>
        </div>
      </section>
    </div>

    {/* STYLES */}
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
      }

      .brand-grid {
        background-image:
          linear-gradient(
            to right,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          );
        background-size: 45px 45px;
      }

      .feature-card {
        animation: floatCard 5s ease-in-out infinite;
      }

      .feature-card-delay {
        animation-delay: 0.8s;
      }

      .feature-card-delay-two {
        animation-delay: 1.5s;
      }

      @keyframes floatCard {
        0%, 100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-5px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .feature-card {
          animation: none;
        }
      }
    `}</style>
  </main>
);

}
