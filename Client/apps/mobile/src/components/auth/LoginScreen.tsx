import {
  SafeArea,
  Screen,
  Spacer,
  VStack,
} from "@repo/ui-mobile";
import { router } from "expo-router";
import { LoginHeader } from "./LoginHeader";
import { LoginForm } from "./LoginForm";
import LoginFooter from "./LoginFooter";

export default function LoginScreen() {
  return (
    <SafeArea>

      <Screen>

         <VStack spacing={32}>

          <LoginHeader />

          <Spacer size={24} />

          <LoginForm />

          <Spacer size={24} />

          <LoginFooter
  onRegister={() =>
    router.push("/screens/auth/register")
  }
/>

        </VStack>

      </Screen>

    </SafeArea>
  );
}