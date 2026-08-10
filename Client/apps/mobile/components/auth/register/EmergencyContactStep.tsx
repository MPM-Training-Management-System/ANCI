import { useState } from "react";

import {
  Alert,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Button,
  FormSection,
  Input,
  AppBar,
} from "@repo/ui-mobile";

export type EmergencyContactData = {
  EmergencyContactName: string;
  EmergencyRelationship: string;
  EmergencyContactNumber: string;
};

interface Props {
  loading?: boolean;

  onComplete: (
    data: EmergencyContactData
  ) => void;

  onBack: () => void;
}

export default function EmergencyContactStep({
  loading = false,
  onComplete,
  onBack,
}: Props) {
  const [form, setForm] =
    useState<EmergencyContactData>({
      EmergencyContactName: "",
      EmergencyRelationship: "",
      EmergencyContactNumber: "",
    });

  const updateForm = (
    values: Partial<EmergencyContactData>
  ) => {
    setForm((current) => ({
      ...current,
      ...values,
    }));
  };

  const handleContinue = () => {
    if (!form.EmergencyContactName.trim()) {
      Alert.alert(
        "Required",
        "Please enter the emergency contact name."
      );
      return;
    }

    if (!form.EmergencyRelationship.trim()) {
      Alert.alert(
        "Required",
        "Please enter the relationship."
      );
      return;
    }

    if (!form.EmergencyContactNumber.trim()) {
      Alert.alert(
        "Required",
        "Please enter the emergency contact number."
      );
      return;
    }

    onComplete(form);
  };

  return (
    <View style={styles.container}>
      <AppBar
        title="Emergency Contact"
        subtitle="Provide someone we can contact in case of emergency."
        image={require("../../../assets/images/ANCILOGO.png")}
      />

      <FormSection title="Emergency Contact Details">

        {/* CONTACT NAME */}

        <Input
          label="Emergency Contact Name"
          required
          placeholder="Enter contact name"
          value={
            form.EmergencyContactName
          }
          onChangeText={(value) =>
            updateForm({
              EmergencyContactName: value,
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

        {/* RELATIONSHIP */}

        <Input
          label="Relationship"
          required
          placeholder="e.g. Mother, Father, Sibling"
          value={
            form.EmergencyRelationship
          }
          onChangeText={(value) =>
            updateForm({
              EmergencyRelationship: value,
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

        {/* CONTACT NUMBER */}

        <Input
          label="Emergency Contact Number"
          required
          placeholder="09XXXXXXXXX"
          value={
            form.EmergencyContactNumber
          }
          onChangeText={(value) =>
            updateForm({
              EmergencyContactNumber: value,
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

        <View style={styles.buttons}>

          <Button
            variant="secondary"
            disabled={loading}
            onPress={onBack}
            style={styles.backButton}
          >
            Back
          </Button>

          <Button
            variant="primary"
            loading={loading}
            disabled={loading}
            onPress={handleContinue}
            style={styles.continueButton}
          >
            Complete Registration
          </Button>

        </View>

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

  buttons: {
    marginTop: 24,
    gap: 12,
  },

  backButton: {
    borderRadius: 16,
  },

  continueButton: {
    borderRadius: 16,
  },
});