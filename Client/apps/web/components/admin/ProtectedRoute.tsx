
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
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = () => {
      try {
        const token = auth.getToken();
        const user = auth.getUser();

        console.log("========== AUTH CHECK ==========");
        console.log("PATH:", pathname);
        console.log("HAS TOKEN:", !!token);
        console.log("USER:", user);
        console.log("================================");

        // =====================================================
        // NO TOKEN
        // =====================================================

        if (!token) {
          if (!cancelled) {
            setAuthorized(false);
            setChecking(false);
          }

          router.replace("/login");
          return;
        }

        // =====================================================
        // NO USER
        // =====================================================

        if (!user) {
          auth.logout();

          if (!cancelled) {
            setAuthorized(false);
            setChecking(false);
          }

          router.replace("/login");
          return;
        }

        // =====================================================
        // TRAINER ONLY
        // =====================================================

        const role =
          typeof user.role === "string"
            ? user.role.toLowerCase()
            : "";

        if (role !== "trainer") {
          auth.logout();

          if (!cancelled) {
            setAuthorized(false);
            setChecking(false);
          }

          router.replace("/login");
          return;
        }

        // =====================================================
        // TRAINER STATUS
        // =====================================================

        const isActive =
          user.isActive === true ||
          (
            typeof user.status === "string" &&
            user.status.toLowerCase() === "active"
          );

        // =====================================================
        // PENDING TRAINER
        // =====================================================

        if (!isActive) {
          const allowedRoutes = [
            "/trainer-application",
            "/setting",
          ];

          const isAllowed =
            allowedRoutes.some(
              (route) =>
                pathname === route ||
                pathname.startsWith(`${route}/`)
            );

          if (!isAllowed) {
            if (!cancelled) {
              setAuthorized(false);
              setChecking(false);
            }

            router.replace("/trainer-application");
            return;
          }
        }

        // =====================================================
        // AUTHORIZED
        // =====================================================

        if (!cancelled) {
          setAuthorized(true);
          setChecking(false);
        }

      } catch (error) {
        console.error(
          "AUTH CHECK ERROR:",
          error
        );

        auth.logout();

        if (!cancelled) {
          setAuthorized(false);
          setChecking(false);
        }

        router.replace("/login");
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  // =========================================================
  // CHECKING
  // =========================================================

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
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

  return <>{children}</>;
}

