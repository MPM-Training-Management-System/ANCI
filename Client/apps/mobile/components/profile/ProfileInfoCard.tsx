import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  fullName: string;
  email: string;
  mobileNumber: string;
  memberSince: string;
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({
  icon,
  label,
  value,
}: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons
          name={icon}
          size={17}
          color="#2563EB"
        />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.label}>
          {label}
        </Text>

        <Text style={styles.value}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileInfoCard({
  fullName,
  email,
  mobileNumber,
  memberSince,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        Personal Information
      </Text>

      <InfoRow
        icon="person-outline"
        label="Full Name"
        value={fullName}
      />

      <InfoRow
        icon="mail-outline"
        label="Email Address"
        value={email}
      />

      <InfoRow
        icon="call-outline"
        label="Mobile Number"
        value={mobileNumber}
      />

      <InfoRow
        icon="calendar-outline"
        label="Member Since"
        value={memberSince}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionTitle: {
    marginBottom: 14,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  row: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  rowContent: {
    flex: 1,
    marginLeft: 11,
  },

  label: {
    fontSize: 8,
    fontWeight: "700",
    color: "#94A3B8",
  },

  value: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
});