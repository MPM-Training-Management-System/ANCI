"use client";

import {
  H3,
  Body,
  Divider,
  Input,
  VStack,
} from "@repo/ui-mobile";

interface PersonalInformationSectionProps {
  firstName: string;
  lastName: string;
  middleName: string;

  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onMiddleNameChange: (value: string) => void;
}

export default function PersonalInformationSection({
  firstName,
  lastName,
  middleName,
  onFirstNameChange,
  onLastNameChange,
  onMiddleNameChange,
}: PersonalInformationSectionProps) {
  return (
    <VStack >

      <VStack >
        <H3>
          Personal Information
        </H3>

        <Body color="muted">
          Enter your basic personal information.
        </Body>
      </VStack>

      <Input
        label="First Name"
        placeholder="Enter first name"
        value={firstName}
        onChangeText={onFirstNameChange}
      />

      <Input
        label="Last Name"
        placeholder="Enter last name"
        value={lastName}
        onChangeText={onLastNameChange}
      />

      <Input
        label="Middle Name (Optional)"
        placeholder="Enter middle name"
        value={middleName}
        onChangeText={onMiddleNameChange}
      />

      <Divider />

    </VStack>
  );
}