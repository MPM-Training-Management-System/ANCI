import React from "react";

import {
  useLocalSearchParams,
} from "expo-router";

import OtpVerification from "@/components/auth/OtpVerification";

export default function OtpVerificationPage() {

  const {
    email,
  } = useLocalSearchParams<{
    email?: string;
  }>();

  return (
    <OtpVerification
      email={email ?? ""}
    />
  );
}