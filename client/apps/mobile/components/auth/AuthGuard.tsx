
import {
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { auth } from "@/api/auth";

export function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  // =========================================================
  // ROUTE DETECTION
  // =========================================================

  const isAuthRoute = segments.some(
    (segment) =>
      segment === "login" ||
      segment === "register" ||
      segment === "otp-verification"
  );

  const isOnboardingRoute = segments.some(
    (segment) => segment === "(onboarding)"
  );

  const isTabsRoute = segments.some(
    (segment) => segment === "(tabs)"
  );

  // =========================================================
  // CHECK AUTHENTICATION
  // =========================================================

  const checkAuthentication = useCallback(
    async () => {
      try {
        const authenticated =
          await auth.isAuthenticated();

        setIsAuthenticated((previous) =>
          previous === authenticated
            ? previous
            : authenticated
        );

        return authenticated;
      } catch (error) {
        console.error(
          "AUTH GUARD CHECK ERROR:",
          error
        );

        setIsAuthenticated((previous) =>
          previous === false ? previous : false
        );

        return false;
      }
    },
    []
  );

  // =========================================================
  // INITIAL AUTH CHECK
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        console.log("AUTH GUARD: Initializing...");

        const authenticated =
          await auth.isAuthenticated();

        if (!mounted) {
          return;
        }

        setIsAuthenticated(authenticated);

        console.log(
          "AUTH GUARD: Authenticated:",
          authenticated
        );
      } catch (error) {
        console.error(
          "AUTH GUARD INITIALIZATION ERROR:",
          error
        );

        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // PERIODIC SESSION CHECK
  // =========================================================

  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    const interval = setInterval(() => {
      void checkAuthentication();
    }, 10_000);

    return () => {
      clearInterval(interval);
    };
  }, [
    isCheckingAuth,
    checkAuthentication,
  ]);

  // =========================================================
  // NAVIGATION
  // =========================================================

  useEffect(() => {
    // Wait for both authentication and navigation to be ready.
    if (
      isCheckingAuth ||
      !rootNavigationState?.key
    ) {
      return;
    }

    console.log("AUTH GUARD ROUTE CHECK", {
      isAuthenticated,
      isAuthRoute,
      isOnboardingRoute,
      isTabsRoute,
      segments,
    });

    // -------------------------------------------------------
    // NOT AUTHENTICATED
    // -------------------------------------------------------

    if (!isAuthenticated) {
      // Login, registration, and OTP are public routes.
      if (isAuthRoute) {
        return;
      }

      // Allow onboarding without a session.
      if (isOnboardingRoute) {
        return;
      }

      // Do not redirect if already on the login route.
      router.replace("/(auth)/login");
      return;
    }

    // -------------------------------------------------------
    // AUTHENTICATED
    // -------------------------------------------------------

    // Send authenticated users away from public auth screens.
    if (isAuthRoute || isOnboardingRoute) {
      router.replace("/(tabs)");
      return;
    }

    // An authenticated user already in tabs needs no redirect.
    if (isTabsRoute) {
      return;
    }
  }, [
    isAuthenticated,
    isCheckingAuth,
    isAuthRoute,
    isOnboardingRoute,
    isTabsRoute,
    rootNavigationState?.key,
    router,
    segments,
  ]);

  // AuthGuard does not wrap or replace the root navigator.
  return null;
}
