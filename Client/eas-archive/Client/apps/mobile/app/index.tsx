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

        // =================================================
        // KEEP LOADING SCREEN VISIBLE
        // =================================================
        //
        // LoadingScreen stays visible while this
        // initialization is happening.
        //
        // 5000 = 5 seconds
        //

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
        // CHECK SAVED TOKEN
        // =================================================

        const token =
          await auth.getToken();

        // =================================================
        // CHECK SAVED USER
        // =================================================

        const user =
          await auth.getUser();

        console.log(
          "SAVED TOKEN:",
          !!token
        );

        console.log(
          "SAVED USER:",
          user
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
            "SAVED USER IS NOT PARTICIPANT"
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
        // CHECK BIOMETRIC
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
        // BIOMETRIC ENABLED
        // =================================================

        if (biometricEnabled) {
          console.log(
            "BIOMETRIC LOGIN REQUIRED"
          );

          /**
           * IMPORTANT:
           *
           * Do NOT go directly to dashboard.
           *
           * LoginForm will automatically
           * trigger Face ID / Fingerprint.
           */

          router.replace(
            "/(auth)/login"
          );

          return;
        }

        // =================================================
        // BIOMETRIC NOT ENABLED
        // =================================================

        console.log(
          "BIOMETRIC LOGIN NOT ENABLED"
        );

   

        router.replace(
          "/(auth)/login"
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
          // Ignore logout cleanup errors.
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