"use client";

import { useSearchParams } from "next/navigation";

import RegisterForm from "./RegisterForm";
import TrainerRegistration from "@/app/(auth)/register/register";

export default function RegisterPageContent() {
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



  return (
    <div className="flex justify-center">
      <RegisterForm />
    </div>
  );
}