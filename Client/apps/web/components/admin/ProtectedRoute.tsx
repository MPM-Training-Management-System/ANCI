"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { auth } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: Props) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    authorized,
    setAuthorized,
  ] = useState(false);

  const [
    checking,
    setChecking,
  ] = useState(true);

  useEffect(() => {
    const token =
      auth.getToken();

    const user =
      auth.getUser();

    // =======================================================
    // NO TOKEN
    // =======================================================

    if (!token) {
      router.replace(
        "/login"
      );

      return;
    }

    // =======================================================
    // NO USER
    // =======================================================

    if (!user) {
      auth.logout();

      router.replace(
        "/login"
      );

      return;
    }

    // =======================================================
    // TRAINER ONLY
    // =======================================================

    const role =
      user?.role?.toLowerCase();

    if (
      role !== "trainer"
    ) {
      auth.logout();

      router.replace(
        "/login"
      );

      return;
    }

    // =======================================================
    // TRAINER STATUS
    // =======================================================

    const isActive =
      user?.isActive === true ||
      user?.status?.toLowerCase() ===
        "active";

    // =======================================================
    // PENDING TRAINER
    // =======================================================

    if (!isActive) {

      /*
       * These are the only pages
       * a pending trainer can access.
       */

      const allowedRoutes = [
        "/trainer-application",
        "/setting",
      ];

      const isAllowed =
        allowedRoutes.some(
          (route) =>
            pathname === route ||
            pathname.startsWith(
              `${route}/`
            )
        );

      if (!isAllowed) {
        router.replace(
          "/trainer-application"
        );

        return;
      }
    }

    // =======================================================
    // AUTHORIZED
    // =======================================================

    setAuthorized(true);
    setChecking(false);

  }, [
    pathname,
    router,
  ]);

  // =========================================================
  // CHECKING
  // =========================================================

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Checking account...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // UNAUTHORIZED
  // =========================================================

  if (!authorized) {
    return null;
  }

  return (
    <>
      {children}
    </>
  );
}