import React from "react";

import {
  Pressable,
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
  answers: Record<number, number>;
  onBack: () => void;
}

export default function ExamResult({
  assessment,
  answers,
  onBack,
}: Props) {
  let correct = 0;

  assessment.questions.forEach(
    (question, index) => {
      if (
        answers[index] ===
        question.correctAnswer
      ) {
        correct++;
      }
    }
  );

  const total =
    assessment.questions.length;

  const score =
    Math.round(
      (correct / total) * 100
    );

  const passed =
    score >= assessment.passingScore;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.icon,
          passed
            ? styles.passIcon
            : styles.failIcon,
        ]}
      >
        <Ionicons
          name={
            passed
              ? "checkmark"
              : "close"
          }
          size={32}
          color="#FFFFFF"
        />
      </View>

      <Text style={styles.eyebrow}>
        ASSESSMENT COMPLETE
      </Text>

      <Text style={styles.title}>
        {passed
          ? "Great job!"
          : "Keep practicing!"}
      </Text>

      <Text style={styles.subtitle}>
        {passed
          ? "You successfully passed this assessment."
          : "You did not reach the passing score yet."}
      </Text>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>
          {score}%
        </Text>

        <Text style={styles.scoreLabel}>
          Your Score
        </Text>

        <View
          style={[
            styles.resultBadge,
            passed
              ? styles.passBadge
              : styles.failBadge,
          ]}
        >
          <Text
            style={[
              styles.resultText,
              passed
                ? styles.passText
                : styles.failText,
            ]}
          >
            {passed
              ? "PASSED"
              : "NOT PASSED"}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <ResultStat
          label="Questions"
          value={`${total}`}
        />

        <ResultStat
          label="Correct"
          value={`${correct}`}
        />

        <ResultStat
          label="Incorrect"
          value={`${total - correct}`}
        />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.passing}>
          Passing score:{" "}
          {assessment.passingScore}%
        </Text>

        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.button,
            pressed &&
              styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>
            Back to Assessments
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

function ResultStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },

  icon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  passIcon: {
    backgroundColor: "#16A34A",
  },

  failIcon: {
    backgroundColor: "#DC2626",
  },

  eyebrow: {
    marginTop: 20,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#2563EB",
  },

  title: {
    marginTop: 6,
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
  },

  scoreCard: {
    width: "100%",
    marginTop: 25,
    padding: 22,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  score: {
    fontSize: 45,
    fontWeight: "900",
    color: "#2563EB",
  },

  scoreLabel: {
    marginTop: 2,
    fontSize: 8,
    color: "#94A3B8",
  },

  resultBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  passBadge: {
    backgroundColor: "#DCFCE7",
  },

  failBadge: {
    backgroundColor: "#FEE2E2",
  },

  resultText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  passText: {
    color: "#15803D",
  },

  failText: {
    color: "#B91C1C",
  },

  stats: {
    width: "100%",
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 7,
    color: "#94A3B8",
  },

  bottom: {
    width: "100%",
    marginTop: "auto",
  },

  passing: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 8,
    color: "#94A3B8",
  },

  button: {
    height: 49,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  buttonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.72,
  },
});