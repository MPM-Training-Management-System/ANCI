import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
} from "react-native";

import { Input } from "@repo/ui-mobile";

export default function EmergencyContactStep() {
  const [
    emergencyContactName,
    setEmergencyContactName,
  ] = useState("");

  const [
    relationship,
    setRelationship,
  ] = useState("");

  const [
    emergencyContactNumber,
    setEmergencyContactNumber,
  ] = useState("");

  const [
    emergencyAddress,
    setEmergencyAddress,
  ] = useState("");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Input
        label="Emergency Contact Name"
        required
        placeholder="Juan Dela Cruz"
        value={emergencyContactName}
        onChangeText={setEmergencyContactName}
      />

      {/* Replace with Select later */}
      <Input
        label="Relationship"
        required
        placeholder="Father / Mother / Spouse"
        value={relationship}
        onChangeText={setRelationship}
      />

      <Input
        label="Mobile Number"
        required
        keyboardType="phone-pad"
        placeholder="09XXXXXXXXX"
        value={emergencyContactNumber}
        onChangeText={setEmergencyContactNumber}
      />

      <Input
        label="Address"
        placeholder="House No. / Street / City"
        multiline
        numberOfLines={3}
        value={emergencyAddress}
        onChangeText={setEmergencyAddress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 40,
  },
});