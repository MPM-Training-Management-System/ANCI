"use client";

import {
  useState,
} from "react";

import {
  Button,
  Checkbox,
  Input,
  Spinner,
} from "@repo/ui/index";

import {
  useRouter,
} from "next/navigation";

import {
  authApi,
} from "@/lib/api";

import {
  auth,
} from "@/lib/auth";

import {
  notify,
  useLogin,
} from "@repo/hooks";

export default function LoginPage() {

  // =========================================================
  // ROUTER
  // =========================================================

  const router =
    useRouter();

  // =========================================================
  // FORM
  // =========================================================

  const [
    login,
    setLogin,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  // =========================================================
  // UI
  // =========================================================

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    rememberMe,
    setRememberMe,
  ] = useState(false);

  // =========================================================
  // LOGIN HOOK
  // =========================================================

  const {
    login: loginUser,
    isLoading,
    error,
    reset,
  } = useLogin(
    authApi
  );

  // =========================================================
  // HANDLE LOGIN
  // =========================================================

  const handleLogin =
    async () => {

      reset();

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      if (!login.trim()) {
        notify.error(
          "Please enter your institutional email."
        );

        return;
      }

      if (!password) {
        notify.error(
          "Please enter your password."
        );

        return;
      }

      // -----------------------------------------------------
      // LOGIN
      // -----------------------------------------------------

      const data =
        await loginUser({
          email:
            login,

          password:
            password,
        });

      // -----------------------------------------------------
      // LOGIN FAILED
      // -----------------------------------------------------

      if (!data) {
        notify.error(
          "Invalid email or password."
        );

        return;
      }

      if (data.user.status === "Active"){
         auth.saveToken(data.token);

auth.saveUser(
  data.user
);  
 if (
        data.user?.role ===
        "Admin"
      ) {

        notify.success(
          "Login successful."
        );

        // ---------------------------------------------------
        // REMEMBER ME
        // ---------------------------------------------------

        if (rememberMe) {

          localStorage.setItem(
            "rememberMe",
            "true"
          );

        } else {

          localStorage.removeItem(
            "rememberMe"
          );

        }

        // ---------------------------------------------------
        // ADMIN DASHBOARD
        // ---------------------------------------------------

        router.push(
          "/dashboard"
        );

        return;
      }
      }

      notify.error(
        "You are not authorized to access the administrator portal."
      );

      auth.logout();

    };

 
  return (
    <main className="min-h-screen bg-slate-100">

      <div className="flex min-h-screen items-center justify-center px-5 py-10">

        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">

            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">

              Secure Access Point

            </span>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">

              Administrator Login

            </h1>

            <p className="mt-1 text-sm text-slate-500">

              Access your ISTMS dashboard.

            </p>

          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (

            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              {error}

            </div>

          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={(event) => {

              event.preventDefault();

              handleLogin();

            }}
            className="space-y-6"
          >

            {/* ===============================================
                EMAIL
            =============================================== */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
              >

                Institutional Email

              </label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={
                  login
                }
                onChange={(event) =>
                  setLogin(
                    event.target.value
                  )
                }
                placeholder="admin@acenextgen.com"
                disabled={
                  isLoading
                }
                className="w-full rounded-lg bg-slate-100 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-400"
              />

            </div>

            {/* ===============================================
                PASSWORD
            =============================================== */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
              >

                Security Password

              </label>

              <div className="relative">

                <Input
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
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="••••••••"
                  disabled={
                    isLoading
                  }
                  className="w-full rounded-lg bg-slate-100 px-4 py-3 pr-16 outline-none focus:ring-2 focus:ring-teal-400"
                />

                <button
                  type="button"
                  disabled={
                    isLoading
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-teal-700 disabled:opacity-50"
                >

                  {showPassword
                    ? "Hide"
                    : "Show"}

                </button>

              </div>

            </div>

            {/* ===============================================
                REMEMBER ME
            =============================================== */}

            <div className="flex items-center gap-3">

              <Checkbox
                checked={
                  rememberMe
                }
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
                disabled={
                  isLoading
                }
              />

              <label className="text-sm text-slate-600">

                Keep session active for 30 days

              </label>

            </div>

            {/* ===============================================
                LOGIN BUTTON
            =============================================== */}

            <Button
              type="submit"
              disabled={
                isLoading
              }
              variant="primary"
              className="w-full rounded-lg py-4 font-bold transition hover:bg-secondary"
            >

              {isLoading ? (

                <span className="flex items-center justify-center">

                  <Spinner
                    size="md"
                    className="mr-2"
                  />

                  Signing in...

                </span>

              ) : (

                "Secure Login"

              )}

            </Button>

          </form>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-8 border-t pt-8 text-center">

            <p className="text-[10px] uppercase tracking-widest text-slate-400">

              Authorized Personnel Only • All
              activity monitored

            </p>

          </div>

        </div>

      </div>

    </main>
  );
}