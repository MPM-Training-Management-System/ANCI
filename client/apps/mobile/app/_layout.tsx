import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />

          <Stack.Screen name="(onboarding)" />

          <Stack.Screen name="(auth)/login/index" />

          <Stack.Screen name="(auth)/register/index" />

          <Stack.Screen name="(auth)/otp-verification/index" />

          <Stack.Screen name="(tabs)" />

          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </AuthGuard>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}