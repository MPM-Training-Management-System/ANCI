"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  Input,
  Spinner,
} from "@repo/ui/index";

import { authApi } from "@/lib/api";
import { auth } from "@/lib/auth";

import {
  notify,
  useLogin,
} from "@repo/hooks";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    login: loginUser,
    isLoading,
    error,
    reset,
  } = useLogin(authApi);

  const handleLogin = async () => {
    reset();

    if (!login.trim()) {
      notify.error("Please enter your institutional email.");
      return;
    }

    if (!password) {
      notify.error("Please enter your password.");
      return;
    }

    const data = await loginUser({
      email: login.trim(),
      password,
    });

    if (!data) {
      notify.error("Invalid email or password.");
      return;
    }

    const status = data.user?.status?.toLowerCase();
    const role = data.user?.role?.toLowerCase();

    /*
     * Only active administrators can access
     * the administrator control center.
     */
    if (status !== "active" || role !== "admin") {
      notify.error(
        "You are not authorized to access the administrator portal."
      );

      auth.logout();
      return;
    }

    // Save authenticated session
    auth.saveToken(data.token);
    auth.saveUser(data.user);

    // Remember-me preference
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    notify.success("Login successful.");

    router.replace("/dashboard");
  };

  return (
    <div
      className="
        w-full
        max-w-[440px]
        rounded-[28px]
        border
        border-slate-200/80
        bg-white
        shadow-[0_30px_80px_rgba(0,0,0,0.25)]
      "
    >
      {/* =====================================================
          FORM CONTAINER
      ====================================================== */}
      <div className="px-8 py-9 sm:px-10">
        {/* =================================================
            HEADER
        ================================================== */}
        <div className="mb-8">
          <div
            className="
              mb-4
              inline-flex
              items-center
              rounded-full
              border
              border-[#1670a8]/10
              bg-[#1670a8]/5
              px-3
              py-1.5
            "
          >
            <span
              className="
                mr-2
                h-1.5
                w-1.5
                rounded-full
                bg-teal-400
              "
            />

            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-[#1670a8]
              "
            >
              Secure Access Point
            </span>
          </div>

          <h1
            className="
              text-2xl
              font-extrabold
              tracking-tight
              text-slate-900
            "
          >
            Sign in to Control Center
          </h1>

          <p
            className="
              mt-2
              max-w-sm
              text-xs
              leading-5
              text-slate-500
            "
          >
            Use your authorized administrator credentials to
            access the ISTMS dashboard.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}
        {error && (
          <div
            className="
              mb-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-xs
              font-medium
              text-red-600
            "
          >
            {typeof error === "string"
              ? error
              : "Unable to sign in. Please check your credentials."}
          </div>
        )}

        {/* =================================================
            EMAIL
        ================================================== */}
        <div className="mb-5">
          <label
            htmlFor="login"
            className="
              mb-2
              block
              text-[9px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-slate-500
            "
          >
            Institutional Email
          </label>

          <Input
            id="login"
            type="email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="admin@acenextgen.com"
            disabled={isLoading}
            autoComplete="email"
            className="
              h-12
              rounded-xl
              border-slate-200
              bg-slate-50
              text-sm
              transition-all
              focus:border-[#1670a8]
              focus:bg-white
            "
          />
        </div>

        {/* =================================================
            PASSWORD
        ================================================== */}
        <div className="mb-5">
          <label
            htmlFor="password"
            className="
              mb-2
              block
              text-[9px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-slate-500
            "
          >
            Security Password
          </label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              className="
                h-12
                rounded-xl
                border-slate-200
                bg-slate-50
                pr-16
                text-sm
                transition-all
                focus:border-[#1670a8]
                focus:bg-white
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              disabled={isLoading}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                px-2
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
                transition-colors
                hover:text-[#1670a8]
                disabled:cursor-not-allowed
              "
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* =================================================
            REMEMBER ME
        ================================================== */}
        <div className="mb-7">
          <label
            htmlFor="rememberMe"
            className="
              flex
              cursor-pointer
              items-center
              gap-2
            "
          >
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
              disabled={isLoading}
              className="
                h-4
                w-4
                cursor-pointer
                rounded
                border-slate-300
                accent-[#1670a8]
                disabled:cursor-not-allowed
              "
            />

            <span className="text-[11px] text-slate-500">
              Keep session active for 30 days
            </span>
          </label>
        </div>

        {/* =================================================
            LOGIN BUTTON
        ================================================== */}
        <Button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="
            h-12
            w-full
            rounded-xl
            bg-[#1670a8]
            text-sm
            font-bold
            text-white
            shadow-[0_10px_25px_rgba(22,112,168,0.22)]
            transition-all
            hover:-translate-y-0.5
            hover:bg-[#126391]
            hover:shadow-[0_14px_30px_rgba(22,112,168,0.28)]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="h-4 w-4" />
              Authenticating...
            </span>
          ) : (
            "Access Control Center"
          )}
        </Button>

        {/* =================================================
            SECURITY DIVIDER
        ================================================== */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />

          <span
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-slate-400
            "
          >
            Secure Session
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* =================================================
            SECURITY NOTICE
        ================================================== */}
        <div
          className="
            rounded-xl
            border
            border-slate-100
            bg-slate-50
            px-4
            py-3
          "
        >
          <p
            className="
              text-center
              text-[10px]
              leading-4
              text-slate-400
            "
          >
            Authorized personnel only. Administrator activity
            is protected and monitored by the system.
          </p>
        </div>

        {/* Version */}
        <p
          className="
            mt-5
            text-center
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-slate-300
          "
        >
          ISTMS Control Center • Production
        </p>
      </div>
    </div>
  );
}