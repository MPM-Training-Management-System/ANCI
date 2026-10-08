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
          "================================",
        );

        console.log(
          "INITIALIZING ANCI",
        );

        console.log(
          "================================",
        );

        // =================================================
        // LOADING SCREEN
        // =================================================

        await new Promise((resolve) =>
          setTimeout(resolve, 5000),
        );

        if (!mounted) {
          return;
        }

        console.log(
          "LOADING SCREEN FINISHED",
        );

        // =================================================
        // CHECK EXISTING TOKEN
        // =================================================

        const token =
          await auth.getToken();

        console.log(
          "HAS EXISTING TOKEN:",
          !!token,
        );

        if (!mounted) {
          return;
        }

        // =================================================
        // EXISTING SESSION
        // =================================================
        //
        // If a token already exists,
        // go directly to the participant dashboard.
        //
        // No onboarding check.
        // No login screen.
        // No biometric check.
        // No user check.
        //
        // =================================================

        if (
          token &&
          token.trim().length > 0
        ) {
          console.log(
            "EXISTING TOKEN FOUND",
          );

          console.log(
            "DIRECTLY GOING TO PARTICIPANT DASHBOARD",
          );

          router.replace(
            "/(tabs)",
          );

          return;
        }

        // =================================================
        // NO EXISTING TOKEN
        // =================================================

        console.log(
          "NO EXISTING TOKEN",
        );

        // =================================================
        // CHECK ONBOARDING
        // =================================================

        const onboardingCompleted =
          await auth.isOnboardingCompleted();

        console.log(
          "ONBOARDING COMPLETED:",
          onboardingCompleted,
        );

        if (!mounted) {
          return;
        }

        // =================================================
        // FIRST TIME USER
        // =================================================

        if (!onboardingCompleted) {
          console.log(
            "FIRST TIME USER → ONBOARDING",
          );

          router.replace(
            "/(onboarding)",
          );

          return;
        }

        // =================================================
        // RETURNING USER WITHOUT SESSION
        // =================================================

        console.log(
          "RETURNING USER WITHOUT TOKEN → LOGIN",
        );

        router.replace(
          "/(auth)/login",
        );
      } catch (error) {
        console.error(
          "APP INITIALIZATION ERROR:",
          error,
        );

        if (!mounted) {
          return;
        }

        try {
          await auth.logout();
        } catch {
          // Ignore cleanup error.
        }

        if (!mounted) {
          return;
        }

        router.replace(
          "/(auth)/login",
        );
      }
    };

    void initializeApp();

    return () => {
      mounted = false;
    };
  }, [router]);

  return <LoadingScreen />;
}