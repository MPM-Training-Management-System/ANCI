import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Input,
} from "@repo/ui-mobile";

export default function PersonalInformationStep() {
  const [firstName, setFirstName] =
    useState("");

  const [middleName, setMiddleName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [suffix, setSuffix] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  const [civilStatus, setCivilStatus] =
    useState("");

  const [nationality, setNationality] =
    useState("Filipino");

  const [email, setEmail] =
    useState("");

  const [mobileNumber, setMobileNumber] =
    useState("");

  const [province, setProvince] =
    useState("");

  const [city, setCity] =
    useState("");

  const [barangay, setBarangay] =
    useState("");

  const [zipCode, setZipCode] =
    useState("");

  const [address, setAddress] =
    useState("");

  const age = useMemo(() => {
    if (!birthDate) return "";

    const birth = new Date(birthDate);
    const today = new Date();

    let years =
      today.getFullYear() -
      birth.getFullYear();

    const month =
      today.getMonth() -
      birth.getMonth();

    if (
      month < 0 ||
      (month === 0 &&
        today.getDate() <
          birth.getDate())
    ) {
      years--;
    }

    return years.toString();
  }, [birthDate]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        styles.container
      }
    >
      <Input
        label="First Name"
        required
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Juan"
      />

      <Input
        label="Middle Name"
        value={middleName}
        onChangeText={setMiddleName}
        placeholder="Santos"
      />

      <Input
        label="Last Name"
        required
        value={lastName}
        onChangeText={setLastName}
        placeholder="Dela Cruz"
      />

      <Input
        label="Suffix"
        value={suffix}
        onChangeText={setSuffix}
        placeholder="Jr."
      />

      {/* TODO:
          Replace with Select component
      */}
      <Input
        label="Gender"
        required
        value={gender}
        onChangeText={setGender}
        placeholder="Male / Female"
      />

      {/* TODO:
          Replace with DatePicker
      */}
      <Input
        label="Birth Date"
        required
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="Age"
        editable={false}
        value={age}
      />

      <Input
        label="Civil Status"
        value={civilStatus}
        onChangeText={
          setCivilStatus
        }
        placeholder="Single"
      />

      <Input
        label="Nationality"
        value={nationality}
        onChangeText={
          setNationality
        }
      />

      <View style={styles.divider} />

      <Input
        label="Email Address"
        required
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="example@email.com"
      />

      <Input
        label="Mobile Number"
        required
        value={mobileNumber}
        onChangeText={
          setMobileNumber
        }
        keyboardType="phone-pad"
        placeholder="09XXXXXXXXX"
      />

      {/* TODO:
          Replace with Philippine Address Selector
      */}

      <Input
        label="Province"
        required
        value={province}
        onChangeText={setProvince}
      />

      <Input
        label="City / Municipality"
        required
        value={city}
        onChangeText={setCity}
      />

      <Input
        label="Barangay"
        required
        value={barangay}
        onChangeText={setBarangay}
      />

      <Input
        label="ZIP Code"
        value={zipCode}
        onChangeText={setZipCode}
        keyboardType="numeric"
      />

      <Input
        label="Street Address"
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
        placeholder="House No. / Street / Subdivision"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
});