"use client";

import { Image } from "react-native";

import {
  Body,
  H1,
  Spacer,
  VStack,
} from "@repo/ui-mobile";

export default function RegisterHeader() {
  return (
    <VStack
     style={{
        alignItems: "center",
        marginBottom: 32,
      }}
    >
      {/* <Image
        source={require("@/assets/images/logo.png")}
        style={{
          width: 90,
          height: 90,
        }}
        resizeMode="contain"
      /> */}

      <Spacer size={4} />

      <H1 align="center">
        Create Account
      </H1>

      <Body
        align="center"
        color="muted"
      >
        Create your participant account to
        access trainings, attendance,
        examinations, and certificates.
      </Body>
    </VStack>
  );
}