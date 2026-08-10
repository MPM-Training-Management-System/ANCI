import { useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Button,
  FormSection,
  Input,
  AppBar,
} from "@repo/ui-mobile";

export type PersonalInformationData = {
  FirstName: string;
  MiddleName: string;
  LastName: string;
  DateOfBirth: string;
  Gender: string;
  CivilStatus: string;
  MobileNumber: string;
  HomeAddress: string;
};

interface Props {
  email: string;
  loading?: boolean;

  onComplete: (
    data: PersonalInformationData
  ) => void;
}

export default function PersonalInformation({
  email,
  loading = false,
  onComplete,
}: Props) {
  const [form, setForm] =
    useState<PersonalInformationData>({
      FirstName: "",
      MiddleName: "",
      LastName: "",
      DateOfBirth: "",
      Gender: "",
      CivilStatus: "",
      MobileNumber: "",
      HomeAddress: "",
    });

  const updateForm = (
    values: Partial<PersonalInformationData>
  ) => {
    setForm((current) => ({
      ...current,
      ...values,
    }));
  };

  const handleContinue = () => {
    if (!form.FirstName.trim()) {
      Alert.alert(
        "Required",
        "Please enter your first name."
      );
      return;
    }

    if (!form.LastName.trim()) {
      Alert.alert(
        "Required",
        "Please enter your last name."
      );
      return;
    }

    if (!form.DateOfBirth.trim()) {
      Alert.alert(
        "Required",
        "Please enter your date of birth."
      );
      return;
    }

    if (!form.Gender.trim()) {
      Alert.alert(
        "Required",
        "Please select your gender."
      );
      return;
    }

    if (!form.CivilStatus.trim()) {
      Alert.alert(
        "Required",
        "Please select your civil status."
      );
      return;
    }

    if (!form.MobileNumber.trim()) {
      Alert.alert(
        "Required",
        "Please enter your mobile number."
      );
      return;
    }

    if (!form.HomeAddress.trim()) {
      Alert.alert(
        "Required",
        "Please enter your home address."
      );
      return;
    }

    onComplete(form);
  };

  return (
    <View style={styles.container}>
      <AppBar
        title="Personal Information"
        subtitle="Complete your participant profile."
        image={require("../../../assets/images/ANCILOGO.png")}
      />

      <FormSection title="Personal Details">

        {/* VERIFIED EMAIL */}

        <View style={styles.emailBox}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#16A34A"
          />

          <View style={styles.emailContent}>
            <Text style={styles.emailLabel}>
              Verified Email
            </Text>

            <Text style={styles.emailText}>
              {email}
            </Text>
          </View>
        </View>

        {/* FIRST NAME */}

        <Input
          label="First Name"
          required
          placeholder="Enter your first name"
          value={form.FirstName}
          onChangeText={(value) =>
            updateForm({
              FirstName: value,
            })
          }
          autoCapitalize="words"
          editable={!loading}
          leftIcon={
            <Ionicons
              name="person-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View style={styles.inputSpacing} />

        {/* MIDDLE NAME */}

        <Input
          label="Middle Name"
          placeholder="Enter your middle name"
          value={form.MiddleName}
          onChangeText={(value) =>
            updateForm({
              MiddleName: value,
            })
          }
          autoCapitalize="words"
          editable={!loading}
          leftIcon={
            <Ionicons
              name="person-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View style={styles.inputSpacing} />

        {/* LAST NAME */}

        <Input
          label="Last Name"
          required
          placeholder="Enter your last name"
          value={form.LastName}
          onChangeText={(value) =>
            updateForm({
              LastName: value,
            })
          }
          autoCapitalize="words"
          editable={!loading}
          leftIcon={
            <Ionicons
              name="person-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View style={styles.inputSpacing} />

        {/* DATE OF BIRTH */}

        <Input
          label="Date of Birth"
          required
          placeholder="YYYY-MM-DD"
          value={form.DateOfBirth}
          onChangeText={(value) =>
            updateForm({
              DateOfBirth: value,
            })
          }
          editable={!loading}
          leftIcon={
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View style={styles.inputSpacing} />

        {/* GENDER */}

        <Input
          label="Gender"
          required
          placeholder="Male / Female"
          value={form.Gender}
          onChangeText={(value) =>
            updateForm({
              Gender: value,
            })
          }
          editable={!loading}
          leftIcon={
            <Ionicons
              name="people-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View style={styles.inputSpacing} />

        {/* CIVIL STATUS */}

        <Input
          label="Civil Status"
          required
          placeholder="Single / Married / etc."
          value={form.CivilStatus}
          onChangeText={(value) =>
            updateForm({
              CivilStatus: value,
            })
          }
          editable={!loading}
          leftIcon={
            <Ionicons
              name="heart-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View style={styles.inputSpacing} />

        {/* MOBILE */}

        <Input
          label="Mobile Number"
          required
          placeholder="09XXXXXXXXX"
          value={form.MobileNumber}
          onChangeText={(value) =>
            updateForm({
              MobileNumber: value,
            })
          }
          keyboardType="phone-pad"
          editable={!loading}
          leftIcon={
            <Ionicons
              name="call-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <View style={styles.inputSpacing} />

        {/* HOME ADDRESS */}

        <Input
          label="Home Address"
          required
          placeholder="Enter your complete address"
          value={form.HomeAddress}
          onChangeText={(value) =>
            updateForm({
              HomeAddress: value,
            })
          }
          editable={!loading}
          leftIcon={
            <Ionicons
              name="location-outline"
              size={20}
              color="#64748B"
            />
          }
        />

        <Button
          variant="primary"
          loading={loading}
          disabled={loading}
          onPress={handleContinue}
          style={styles.button}
        >
          Continue
        </Button>

      </FormSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  inputSpacing: {
    height: 18,
  },

  emailBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 22,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  emailContent: {
    flex: 1,
    marginLeft: 10,
  },

  emailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  emailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },

  button: {
    marginTop: 24,
    borderRadius: 16,
  },
});