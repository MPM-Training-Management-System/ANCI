"use client";
import { router } from "expo-router";
import {
  SafeArea,
  ScrollScreen,
  Spacer,
  VStack,
} from "@repo/ui-mobile";

import RegisterHeader from "../../components/auth/RegisterHeader";
import RegisterForm from "../../components/auth/RegisterForm";
import RegisterFooter from "../../components/auth/RegisterFooter";

export default function RegisterScreen() {
  return (
    <SafeArea>
      <ScrollScreen>
        <VStack >

          <RegisterHeader />

          <Spacer size={8} />

          <RegisterForm />

          <Spacer size={8} />

          <RegisterFooter
  onLogin={() => router.back()}
/>

        </VStack>
      </ScrollScreen>
    </SafeArea>
  );
}