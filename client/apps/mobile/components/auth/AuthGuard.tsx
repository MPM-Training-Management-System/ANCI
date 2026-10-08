import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";

import { auth } from "@/api/auth";

export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const segments = useSegments();

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  /*
   * =========================================================
   * CHECK AUTHENTICATION
   * =========================================================
   *
   * This checks the SecureStore for the current JWT.
   */
  const checkAuthentication = async () => {
    try {
      const authenticated =
        await auth.isAuthenticated();

      console.log(
        "AUTH GUARD - AUTHENTICATED:",
        authenticated,
      );

      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error(
        "AUTH GUARD ERROR:",
        error,
      );

      setIsAuthenticated(false);
    }
  };

  /*
   * =========================================================
   * INITIAL AUTH CHECK
   * =========================================================
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log(
          "================================",
        );

        console.log(
          "AUTH GUARD INITIALIZING",
        );

        console.log(
          "================================",
        );

        const authenticated =
          await auth.isAuthenticated();

        console.log(
          "AUTH GUARD INITIAL AUTH:",
          authenticated,
        );

        if (!mounted) {
          return;
        }

        setIsAuthenticated(
          authenticated,
        );
      } catch (error) {
        console.error(
          "AUTH GUARD INITIALIZATION ERROR:",
          error,
        );

        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * PERIODIC TOKEN CHECK
   * =========================================================
   *
   * Check every 10 seconds whether the JWT is still valid.
   */
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
  }, [isCheckingAuth]);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */
  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    const currentSegment =
      segments[0];

    const isAuthRoute =
      currentSegment === "(auth)";

    const isOnboardingRoute =
      currentSegment === "(onboarding)";

    const isTabsRoute =
      currentSegment === "(tabs)";

    console.log(
      "================================",
    );

    console.log(
      "AUTH GUARD NAVIGATION CHECK",
    );

    console.log(
      "AUTHENTICATED:",
      isAuthenticated,
    );

    console.log(
      "CURRENT SEGMENT:",
      currentSegment,
    );

    console.log(
      "================================",
    );

    /*
     * =======================================================
     * NOT AUTHENTICATED
     * =======================================================
     */
    if (!isAuthenticated) {
      /*
       * Allow login/register routes.
       */
      if (isAuthRoute) {
        return;
      }

      /*
       * Allow onboarding.
       */
      if (isOnboardingRoute) {
        return;
      }

      /*
       * Anything else requires authentication.
       */
      if (!isTabsRoute) {
        console.log(
          "AUTH GUARD → LOGIN",
        );

        router.replace(
          "/(auth)/login",
        );
      }

      return;
    }

    /*
     * =======================================================
     * AUTHENTICATED
     * =======================================================
     *
     * If the user already has a valid token but is currently
     * on the login/register route, send them directly to tabs.
     */
    if (
      isAuthenticated &&
      isAuthRoute
    ) {
      console.log(
        "AUTH GUARD → USER AUTHENTICATED",
      );

      console.log(
        "AUTH GUARD → REDIRECTING TO TABS",
      );

      router.replace(
        "/(tabs)",
      );

      return;
    }

    /*
     * =======================================================
     * AUTHENTICATED + ONBOARDING
     * =======================================================
     *
     * An authenticated user should not stay on onboarding.
     */
    if (
      isAuthenticated &&
      isOnboardingRoute
    ) {
      console.log(
        "AUTH GUARD → AUTHENTICATED USER",
      );

      console.log(
        "AUTH GUARD → REDIRECTING TO TABS",
      );

      router.replace(
        "/(tabs)",
      );

      return;
    }
  }, [
    isAuthenticated,
    isCheckingAuth,
    segments,
    router,
  ]);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  return <>{children}</>;
}