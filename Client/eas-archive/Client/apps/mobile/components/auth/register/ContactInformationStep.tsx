import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
} from "react-native";

import { Input } from "@repo/ui-mobile";

export default function ContactInformationStep() {
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Input
        label="Email Address"
        required
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="juan@email.com"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        label="Mobile Number"
        required
        keyboardType="phone-pad"
        placeholder="09XXXXXXXXX"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />

      {/* TODO: Replace with Philippine Address Picker */}

      <Input
        label="Province"
        required
        placeholder="Rizal"
        value={province}
        onChangeText={setProvince}
      />

      <Input
        label="City / Municipality"
        required
        placeholder="Montalban"
        value={city}
        onChangeText={setCity}
      />

      <Input
        label="Barangay"
        required
        placeholder="San Jose"
        value={barangay}
        onChangeText={setBarangay}
      />

      <Input
        label="ZIP Code"
        keyboardType="numeric"
        placeholder="1860"
        value={zipCode}
        onChangeText={setZipCode}
      />

      <Input
        label="Street Address"
        placeholder="Blk 1 Lot 2, Example Street"
        multiline
        numberOfLines={3}
        value={streetAddress}
        onChangeText={setStreetAddress}
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