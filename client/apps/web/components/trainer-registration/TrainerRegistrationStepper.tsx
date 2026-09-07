"use client";

import { usePathname } from "next/navigation";

import { Stepper } from "@repo/ui/index";

const steps = [
  "Account",
  "Verify Email",
  "Personal Info",
  "Professional",
  "Profile",
  "Valid ID",
];

export default function TrainerRegistrationStepper() {
  const pathname = usePathname();

  let currentStep = 1;

  if (pathname.includes("/verify-otp")) {
    currentStep = 2;
  } else if (
    pathname.includes("/personal-info")
  ) {
    currentStep = 3;
  } else if (
    pathname.includes("/professional")
  ) {
    currentStep = 4;
  } else if (
    pathname.includes("/profile-image")
  ) {
    currentStep = 5;
  } else if (
    pathname.includes("/valid-id")
  ) {
    currentStep = 6;
  }

  return (
    <div className="mb-10">
      <Stepper
        steps={steps}
        currentStep={currentStep}
      />
    </div>
  );
}