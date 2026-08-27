import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function AssessmentHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.eyebrow}>
          PARTICIPANT PORTAL
        </Text>

        <Text style={styles.title}>
          Assessments
        </Text>

        <Text style={styles.subtitle}>
          Test your knowledge and track your
          assessment results.
        </Text>
      </View>

      <View style={styles.icon}>
        <Ionicons
          name="clipboard-outline"
          size={21}
          color="#2563EB"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  textContainer: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#2563EB",
  },

  title: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#64748B",
  },

  icon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
});