import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  fullName: string;
  userCode: string;
  role: string;
  status: string;
}

export default function ProfileHeader({
  fullName,
  userCode,
  role,
  status,
}: Props) {
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>
          {initials}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {fullName}
        </Text>

        <View style={styles.codeRow}>
          <Ionicons
            name="person-outline"
            size={13}
            color="#64748B"
          />

          <Text style={styles.code}>
            {userCode}
          </Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {role}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              {status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  initials: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  codeRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  code: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },

  badges: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#EFF6FF",
  },

  roleText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#2563EB",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#ECFDF5",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#047857",
  },
});