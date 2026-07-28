"use client";

import {
  Body,
  Divider,
  H3,
  Input,
  VStack,
} from "@repo/ui-mobile";

interface ContactInformationSectionProps {
  email: string;
  mobileNumber: string;

  onEmailChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
}

export default function ContactInformationSection({
  email,
  mobileNumber,
  onEmailChange,
  onMobileNumberChange,
}: ContactInformationSectionProps) {
  return (
    <VStack >

      <VStack >
        <H3>
          Contact Information
        </H3>

        <Body color="muted">
          Provide your email address and mobile number.
        </Body>
      </VStack>

      <Input
        label="Email Address"
        placeholder="juan@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={onEmailChange}
      />

      <Input
        label="Mobile Number"
        placeholder="09XXXXXXXXX"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={onMobileNumberChange}
      />

      <Divider />

    </VStack>
  );
}