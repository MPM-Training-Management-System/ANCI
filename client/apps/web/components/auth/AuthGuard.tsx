"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { auth } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const pathname =
    usePathname();

  const hasRedirected =
    useRef(false);

  const [
    checking,
    setChecking,
  ] = useState(true);

  /*
   * ============================================================
   * PUBLIC ROUTES
   * ============================================================
   */
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  const isPublicRoute =
    publicRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );

  /*
   * ============================================================
   * FORCE LOGOUT
   * ============================================================
   */
  const forceLogout =
    useCallback(() => {
      /*
       * Prevent multiple redirects
       * when several requests return 401
       * at the same time.
       */
      if (hasRedirected.current) {
        return;
      }

      hasRedirected.current = true;

      console.log(
        "================================"
      );

      console.log(
        "AUTO LOGOUT"
      );

      console.log(
        "Invalid or expired session"
      );

      console.log(
        "================================"
      );

      /*
       * Clear token + user.
       */
      auth.logout();

      /*
       * Redirect.
       */
      if (
        typeof window !==
        "undefined"
      ) {
        window.location.replace(
          "/login"
        );
      }
    }, []);

  /*
   * ============================================================
   * LISTEN FOR API 401
   * ============================================================
   */
  useEffect(() => {
    /*
     * Don't listen on public pages.
     */
    if (isPublicRoute) {
      return;
    }

    const handleUnauthorized =
      () => {
        console.log(
          "AUTH GUARD: 401 EVENT RECEIVED"
        );

        forceLogout();
      };

    window.addEventListener(
      "auth:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized
      );
    };
  }, [
    isPublicRoute,
    forceLogout,
  ]);

  /*
   * ============================================================
   * INITIAL AUTH CHECK
   * ============================================================
   */
  useEffect(() => {
    /*
     * Public pages don't need auth.
     */
    if (isPublicRoute) {
      setChecking(false);
      return;
    }

    const token =
      auth.getToken();

    console.log(
      "========== AUTH CHECK =========="
    );

    console.log(
      "PATH:",
      pathname
    );

    console.log(
      "HAS TOKEN:",
      !!token
    );

    console.log(
      "USER:",
      auth.getUser()
    );

    console.log(
      "================================"
    );

    /*
     * No token.
     */
    if (!token) {
      forceLogout();
      return;
    }

    /*
     * Expired token.
     */
    if (
      auth.isTokenExpired()
    ) {
      console.log(
        "TOKEN IS ALREADY EXPIRED"
      );

      forceLogout();
      return;
    }

    /*
     * Token is okay.
     */
    setChecking(false);
  }, [
    pathname,
    isPublicRoute,
    forceLogout,
  ]);

  /*
   * ============================================================
   * PERIODIC TOKEN CHECK
   * ============================================================
   *
   * This handles the situation where:
   *
   * User stays on dashboard
   * ↓
   * Token expires
   * ↓
   * User doesn't click anything
   *
   * We still detect it.
   */
  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    const checkToken =
      () => {
        const token =
          auth.getToken();

        /*
         * Token removed.
         */
        if (!token) {
          console.log(
            "AUTH GUARD: NO TOKEN"
          );

          forceLogout();
          return;
        }

        /*
         * Token expired.
         */
        if (
          auth.isTokenExpired()
        ) {
          console.log(
            "================================"
          );

          console.log(
            "AUTH GUARD: TOKEN EXPIRED"
          );

          console.log(
            "AUTO LOGOUT"
          );

          console.log(
            "================================"
          );

          forceLogout();
        }
      };

    /*
     * Check immediately.
     */
    checkToken();

    /*
     * Check every 10 seconds.
     */
    const interval =
      window.setInterval(
        checkToken,
        10_000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    isPublicRoute,
    forceLogout,
  ]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#002b5c]/20 border-t-[#002b5c]" />

          <p className="text-sm text-gray-500">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * CONTENT
   * ============================================================
   */
  return (
    <>
      {children}
    </>
  );
}