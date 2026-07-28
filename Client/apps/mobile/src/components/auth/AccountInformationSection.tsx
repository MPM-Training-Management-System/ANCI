"use client";

import {
  Body,
  Divider,
  H3,
  PasswordInput,
  VStack,
} from "@repo/ui-mobile";

interface AccountInformationSectionProps {
  password: string;
  confirmPassword: string;

  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

export default function AccountInformationSection({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
}: AccountInformationSectionProps) {
  return (
    <VStack>

      <VStack>
        <H3>
          Account Information
        </H3>

        <Body color="muted">
          Create a secure password for your account.
        </Body>
      </VStack>

      <PasswordInput
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={onPasswordChange}
      />

      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
      />

      <Divider />

    </VStack>
  );
}