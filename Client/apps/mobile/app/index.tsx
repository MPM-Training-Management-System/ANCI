import { useEffect } from "react";
import { router } from "expo-router";

import LoadingScreen from "@/src/screens/LoadingScreen";

export default function Index() {
  useEffect(() => {
  const timer = setTimeout(() => {
    router.replace("/(onboarding)");
  }, 5000);

  return () => clearTimeout(timer);
}, []);

  return <LoadingScreen />;
}