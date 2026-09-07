import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

const actions = [
  {
    label: "My Training",
    icon: "school-outline" as const,
  },
  {
    label: "Schedule",
    icon: "calendar-outline" as const,
  },
  {
    label: "Attendance",
    icon: "checkmark-done-outline" as const,
  },
  {
    label: "Certificates",
    icon: "ribbon-outline" as const,
  },
];

export default function QuickActions() {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>
          Quick actions
        </Text>
      </View>

      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            style={({ pressed }) => [
              styles.item,
              pressed &&
                styles.itemPressed,
            ]}
          >
            <View style={styles.icon}>
              <Ionicons
                name={action.icon}
                size={21}
                color="#2563EB"
              />
            </View>

            <Text style={styles.label}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,

    marginBottom: 10,
  },

  title: {
    fontSize: 16,

    fontWeight: "800",

    color: "#0F172A",
  },

  grid: {
    paddingHorizontal: 20,

    flexDirection: "row",

    gap: 10,
  },

  item: {
    flex: 1,

    minHeight: 93,

    padding: 11,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    justifyContent: "space-between",
  },

  itemPressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  icon: {
    width: 36,
    height: 36,

    borderRadius: 11,

    backgroundColor: "#EEF4FF",

    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 9,

    fontWeight: "700",

    lineHeight: 12,

    color: "#334155",
  },
});