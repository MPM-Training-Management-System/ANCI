import React from "react";

import {
  Pressable,
  ScrollView,
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
  onStart: () => void;
}

export default function ExamInstructions({
  assessment,
  onStart,
}: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      <View style={styles.icon}>
        <Ionicons
          name="clipboard-outline"
          size={30}
          color="#2563EB"
        />
      </View>

      <Text style={styles.eyebrow}>
        ASSESSMENT
      </Text>

      <Text style={styles.title}>
        {assessment.title}
      </Text>

      <Text style={styles.description}>
        {assessment.description}
      </Text>

      <View style={styles.infoGrid}>
        <Info
          icon="help-circle-outline"
          label="Questions"
          value={`${assessment.questions.length}`}
        />

        <Info
          icon="time-outline"
          label="Duration"
          value={`${assessment.durationMinutes} min`}
        />

        <Info
          icon="ribbon-outline"
          label="Passing"
          value={`${assessment.passingScore}%`}
        />
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>
          Before you begin
        </Text>

        <Instruction
          text="Read each question carefully before selecting your answer."
        />

        <Instruction
          text="You can move between questions using the navigation buttons."
        />

        <Instruction
          text="Your assessment has a time limit."
        />

        <Instruction
          text="Make sure you have answered all questions before submitting."
        />

        <Instruction
          text="Once submitted, your answers cannot be changed."
        />
      </View>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.startText}>
          Start Assessment
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color="#FFFFFF"
        />
      </Pressable>
    </ScrollView>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.info}>
      <Ionicons
        name={icon}
        size={18}
        color="#2563EB"
      />

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function Instruction({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.instruction}>
      <View style={styles.check}>
        <Ionicons
          name="checkmark"
          size={11}
          color="#2563EB"
        />
      </View>

      <Text style={styles.instructionText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 20,
    paddingTop: 45,
    paddingBottom: 40,
  },

  icon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  eyebrow: {
    textAlign: "center",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#2563EB",
  },

  title: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  description: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
  },

  infoGrid: {
    marginTop: 24,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
  },

  info: {
    flex: 1,
    alignItems: "center",
  },

  infoLabel: {
    marginTop: 5,
    fontSize: 7,
    color: "#94A3B8",
  },

  infoValue: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  instructionsCard: {
    marginTop: 16,
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  instructionsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 13,
  },

  instruction: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  check: {
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  instructionText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
    color: "#475569",
  },

  startButton: {
    height: 50,
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  startText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.72,
  },
});