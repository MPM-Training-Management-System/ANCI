"use client";

import { Card, CardContent, VStack } from "@repo/ui-mobile";

import PersonalInformationSection from "./PersonalInformationSection";
import ContactInformationSection from "./ContactInformationSection";
import AccountInformationSection from "./AccountInformationSection";
import AgreementSection from "./AgreementSection";
import RegisterActions from "./RegisterActions";
import { useState } from "react";
import { authApi } from "../../api/api";

export default function RegisterForm() {
      const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [middleName, setMiddleName] = useState("");
const [email, setEmail] = useState("");
const [mobileNumber, setMobileNumber] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [agreeTerms, setAgreeTerms] = useState(false);
const [agreePrivacy, setAgreePrivacy] = useState(false);
const [loading, setLoading] = useState(false);
const handleRegister = async () => {
  if (!agreeTerms || !agreePrivacy) {
    return;
  }

  const fullName = [
    firstName.trim(),
    middleName.trim(),
    lastName.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  try {
    setLoading(true);

    await authApi.register({
      fullName,
      email,
      mobileNumber,
      password,
    });

    console.log("Registration successful");
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  return (
    <Card>
      <CardContent>
        <VStack >

        

<PersonalInformationSection
    firstName={firstName}
    lastName={lastName}
    middleName={middleName}
    onFirstNameChange={setFirstName}
    onLastNameChange={setLastName}
    onMiddleNameChange={setMiddleName}
/>

          <ContactInformationSection
    email={email}
    mobileNumber={mobileNumber}
    onEmailChange={setEmail}
    onMobileNumberChange={setMobileNumber}
/>

          <AccountInformationSection
    password={password}
    confirmPassword={confirmPassword}
    onPasswordChange={setPassword}
    onConfirmPasswordChange={setConfirmPassword}
/>

          <AgreementSection
  agreeTerms={agreeTerms}
  agreePrivacy={agreePrivacy}
  onAgreeTermsChange={setAgreeTerms}
  onAgreePrivacyChange={setAgreePrivacy}
/>

          <RegisterActions
    loading={loading}
    disabled={
        !agreeTerms ||
        !agreePrivacy
    }
    onSubmit={handleRegister}
/>

        </VStack>
      </CardContent>
    </Card>
  );
}