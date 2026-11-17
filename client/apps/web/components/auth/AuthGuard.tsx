
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
  const pathname = usePathname();

  const hasRedirected = useRef(false);

  const [checking, setChecking] = useState(true);

  // PUBLIC ROUTES
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // FORCE LOGOUT
  const forceLogout = useCallback(() => {
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    auth.logout();

    window.location.replace("/login");
  }, []);

  // INITIAL AUTH CHECK
  useEffect(() => {
    // Public pages never require authentication.
    if (isPublicRoute) {
      hasRedirected.current = false;
      setChecking(false);
      return;
    }

    setChecking(true);

    const token = auth.getToken();

    if (!token || auth.isTokenExpired()) {
      forceLogout();
      return;
    }

    hasRedirected.current = false;
    setChecking(false);

  }, [pathname, isPublicRoute, forceLogout]);

  // LISTEN FOR API 401
  useEffect(() => {
    if (isPublicRoute) return;

    const handleUnauthorized = () => {
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
  }, [isPublicRoute, forceLogout]);

  // PERIODIC TOKEN CHECK
  useEffect(() => {
    if (isPublicRoute) return;

    const interval = window.setInterval(() => {
      const token = auth.getToken();

      if (!token || auth.isTokenExpired()) {
        forceLogout();
      }
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPublicRoute, forceLogout]);

  // IMPORTANT:
  // PUBLIC ROUTES MUST NEVER SHOW AUTH LOADING.
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // PROTECTED ROUTES
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

  return <>{children}</>;
}
