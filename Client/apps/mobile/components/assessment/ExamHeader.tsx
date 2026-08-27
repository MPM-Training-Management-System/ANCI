import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  ParticipantAssessment,
} from "@/src/data/participant";

interface Props {
  assessment: ParticipantAssessment;
  secondsLeft: number;
}

export default function ExamHeader({
  assessment,
  secondsLeft,
}: Props) {
  const minutes =
    Math.floor(secondsLeft / 60);

  const seconds =
    secondsLeft % 60;

  const time =
    `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

  const warning =
    secondsLeft <= 60;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.label}>
          ASSESSMENT
        </Text>

        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {assessment.title}
        </Text>
      </View>

      <View
        style={[
          styles.timer,
          warning && styles.warning,
        ]}
      >
        <Ionicons
          name="time-outline"
          size={14}
          color={
            warning
              ? "#DC2626"
              : "#2563EB"
          }
        />

        <Text
          style={[
            styles.timerText,
            warning &&
              styles.warningText,
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  titleContainer: {
    flex: 1,
    marginRight: 12,
  },

  label: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  title: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  timer: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  timerText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#2563EB",
  },

  warning: {
    backgroundColor: "#FEE2E2",
  },

  warningText: {
    color: "#DC2626",
  },
});