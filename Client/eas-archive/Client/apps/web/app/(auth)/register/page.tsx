"use client";

import { useSearchParams } from "next/navigation";

import RegisterForm from "./RegisterForm";

import TrainerRegistration from "@/app/(auth)/register/register";

export default function RegisterPage() {
  const searchParams = useSearchParams();

  const step = searchParams.get("step");

  // ==========================================
  // TRAINER PROFILE REGISTRATION
  // ==========================================

  if (step === "trainer") {
    return (
      <div className="flex justify-center">
        <TrainerRegistration />
      </div>
    );
  }

  // ==========================================
  // ACCOUNT SETUP
  // ==========================================

  return (
    <div className="flex justify-center">
      <RegisterForm />
    </div>
  );
}