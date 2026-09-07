import { useEffect } from "react";

import { useRouter } from "expo-router";

import LoadingScreen from "@/src/screens/LoadingScreen";
import { auth } from "@/api/auth";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        console.log(
          "================================"
        );

        console.log(
          "INITIALIZING ANCI"
        );

        console.log(
          "================================"
        );

        // =================================================
        // LOADING SCREEN
        // =================================================

        await new Promise((resolve) =>
          setTimeout(resolve, 5000)
        );

        if (!mounted) {
          return;
        }

        console.log(
          "LOADING SCREEN FINISHED"
        );

        // =================================================
        // CHECK TOKEN
        // =================================================

        const token =
          await auth.getToken();

        // =================================================
        // CHECK USER
        // =================================================

        const user =
          await auth.getUser();

        // =================================================
        // CHECK ONBOARDING
        // =================================================

        const onboardingCompleted =
          await auth.isOnboardingCompleted();

        console.log(
          "HAS TOKEN:",
          !!token
        );

        console.log(
          "HAS USER:",
          !!user
        );

        console.log(
          "ONBOARDING COMPLETED:",
          onboardingCompleted
        );

        if (!mounted) {
          return;
        }

        // =================================================
        // NO SESSION
        // =================================================

        if (!token || !user) {
          console.log(
            "NO SAVED SESSION"
          );

          // -------------------------------------------------
          // FIRST TIME USER
          // -------------------------------------------------

          if (!onboardingCompleted) {
            console.log(
              "FIRST TIME USER"
            );

            router.replace(
              "/(onboarding)"
            );

            return;
          }

          // -------------------------------------------------
          // RETURNING USER
          // -------------------------------------------------

          console.log(
            "RETURNING USER → LOGIN"
          );

          router.replace(
            "/(auth)/login"
          );

          return;
        }

        // =================================================
        // ROLE CHECK
        // =================================================

        const role =
          user.role ??
          user.Role;

        console.log(
          "SAVED USER ROLE:",
          role
        );

        if (
          !role ||
          role.toLowerCase() !==
            "participant"
        ) {
          console.log(
            "USER IS NOT PARTICIPANT"
          );

          await auth.logout();

          if (!mounted) {
            return;
          }

          router.replace(
            "/(auth)/login"
          );

          return;
        }

        // =================================================
        // ACTIVE CHECK
        // =================================================

        if (!user.isActive) {
          console.log(
            "ACCOUNT IS NOT ACTIVE"
          );

          await auth.logout();

          if (!mounted) {
            return;
          }

          router.replace(
            "/(auth)/login"
          );

          return;
        }

        // =================================================
        // VALID PARTICIPANT SESSION
        // =================================================

        console.log(
          "VALID PARTICIPANT SESSION"
        );

        // =================================================
        // BIOMETRIC
        // =================================================

        const biometricEnabled =
          await auth.isBiometricEnabled();

        console.log(
          "BIOMETRIC ENABLED:",
          biometricEnabled
        );

        if (!mounted) {
          return;
        }

        // =================================================
        // BIOMETRIC LOGIN
        // =================================================

        if (biometricEnabled) {
          console.log(
            "BIOMETRIC LOGIN REQUIRED"
          );

          router.replace(
            "/(auth)/login"
          );

          return;
        }

        // =================================================
        // DIRECT DASHBOARD
        // =================================================

        console.log(
          "GOING TO PARTICIPANT DASHBOARD"
        );

        router.replace(
          "/(tabs)"
        );

      } catch (error) {
        console.error(
          "APP INITIALIZATION ERROR:",
          error
        );

        if (!mounted) {
          return;
        }

        try {
          await auth.logout();
        } catch {
          // Ignore cleanup error.
        }

        router.replace(
          "/(auth)/login"
        );
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [router]);

  return <LoadingScreen />;
}