import { SafeAreaView } from "react-native";
import { router } from "expo-router";

import {
  Screen,
  VStack,
} from "@repo/ui-mobile";

import { LoginHeader } from "../../components/auth/LoginHeader";
import { LoginForm } from "../../components/auth/LoginForm";
import LoginFooter from "../../components/auth/LoginFooter";

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Screen>
        <VStack
          spacing={32}
          justify="space-between"
          style={{ flex: 1 }}
        >
          <VStack spacing={32}>
            <LoginHeader />

            <LoginForm />
          </VStack>

          <LoginFooter
            onRegister={() =>
              router.push("/(auth)/register")
            }
          />
        </VStack>
      </Screen>
    </SafeAreaView>
  );
}