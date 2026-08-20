import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

// ============================================================
// TYPES
// ============================================================

type AssessmentStatus =
  | "Available"
  | "Completed"
  | "Locked";

type Assessment = {
  id: string;
  title: string;
  training: string;
  description: string;
  questions: number;
  duration: number;
  passingScore: number;
  status: AssessmentStatus;
  score?: number;
};

// ============================================================
// MOCK DATA
// ============================================================

const ASSESSMENTS: Assessment[] = [
  {
    id: "ASM-001",
    title: "Leadership Final Assessment",
    training: "Leadership Training",
    description:
      "Evaluate your understanding of leadership, communication, decision-making, and team management.",
    questions: 10,
    duration: 15,
    passingScore: 80,
    status: "Available",
  },

  {
    id: "ASM-002",
    title: "Basic Training Assessment",
    training: "Basic Training",
    description:
      "Assessment for the completed Basic Training program.",
    questions: 10,
    duration: 15,
    passingScore: 80,
    status: "Completed",
    score: 90,
  },
];

// ============================================================
// SCREEN
// ============================================================

export default function AssessmentScreen() {
  const router = useRouter();

  function startAssessment(
    assessmentId: string,
  ) {
    router.push({
      pathname: "/assessment/[id]",
      params: {
        id: assessmentId,
      },
    });
  }

  function viewResult(
    assessmentId: string,
  ) {
    router.push({
      pathname: "/assessment/[id]",
      params: {
        id: assessmentId,
        mode: "result",
      },
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              Assessments
            </Text>

            <Text style={styles.subtitle}>
              Complete your training assessments
              and view your results.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="document-text-outline"
              size={27}
              color="#7C3AED"
            />
          </View>
        </View>

        {/* ====================================================
            AVAILABLE
        ==================================================== */}

        <Text style={styles.sectionTitle}>
          Available
        </Text>

        {ASSESSMENTS.filter(
          (assessment) =>
            assessment.status === "Available",
        ).map((assessment) => (
          <AvailableAssessmentCard
            key={assessment.id}
            assessment={assessment}
            onStart={() =>
              startAssessment(
                assessment.id,
              )
            }
          />
        ))}

        {/* ====================================================
            HISTORY
        ==================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            styles.historyTitle,
          ]}
        >
          Assessment History
        </Text>

        {ASSESSMENTS.filter(
          (assessment) =>
            assessment.status === "Completed",
        ).map((assessment) => (
          <HistoryAssessmentCard
            key={assessment.id}
            assessment={assessment}
            onPress={() =>
              viewResult(
                assessment.id,
              )
            }
          />
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// AVAILABLE ASSESSMENT CARD
// ============================================================

function AvailableAssessmentCard({
  assessment,
  onStart,
}: {
  assessment: Assessment;
  onStart: () => void;
}) {
  return (
    <View style={styles.availableCard}>
      {/* TOP */}

      <View style={styles.cardTop}>
        <View style={styles.assessmentIcon}>
          <Ionicons
            name="document-text"
            size={27}
            color="#7C3AED"
          />
        </View>

        <View style={styles.availableBadge}>
          <View style={styles.availableDot} />

          <Text style={styles.availableText}>
            AVAILABLE
          </Text>
        </View>
      </View>

      {/* TITLE */}

      <Text style={styles.assessmentTitle}>
        {assessment.title}
      </Text>

      <Text style={styles.trainingName}>
        {assessment.training}
      </Text>

      {/* DESCRIPTION */}

      <Text style={styles.description}>
        {assessment.description}
      </Text>

      {/* ====================================================
          INFORMATION
      ==================================================== */}

      <View style={styles.infoContainer}>
        <InfoItem
          icon="help-circle-outline"
          label="Questions"
          value={`${assessment.questions}`}
        />

        <InfoItem
          icon="time-outline"
          label="Duration"
          value={`${assessment.duration} min`}
        />

        <InfoItem
          icon="checkmark-circle-outline"
          label="Passing"
          value={`${assessment.passingScore}%`}
        />
      </View>

      {/* ====================================================
          START BUTTON
      ==================================================== */}

      <Pressable
        style={styles.startButton}
        onPress={onStart}
      >
        <Text style={styles.startButtonText}>
          Start Assessment
        </Text>

        <Ionicons
          name="arrow-forward"
          size={22}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

// ============================================================
// HISTORY CARD
// ============================================================

function HistoryAssessmentCard({
  assessment,
  onPress,
}: {
  assessment: Assessment;
  onPress: () => void;
}) {
  const passed =
    (assessment.score ?? 0) >=
    assessment.passingScore;

  return (
    <Pressable
      style={styles.historyCard}
      onPress={onPress}
    >
      <View style={styles.historyIcon}>
        <Ionicons
          name={
            passed
              ? "checkmark-circle"
              : "close-circle"
          }
          size={28}
          color={
            passed
              ? "#16A34A"
              : "#DC2626"
          }
        />
      </View>

      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>
          {assessment.title}
        </Text>

        <Text style={styles.historyTraining}>
          {assessment.training}
        </Text>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>
            Result
          </Text>

          <Text
            style={[
              styles.resultValue,
              {
                color: passed
                  ? "#16A34A"
                  : "#DC2626",
              },
            ]}
          >
            {assessment.score}% •{" "}
            {passed
              ? "PASSED"
              : "FAILED"}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={23}
        color="#94A3B8"
      />
    </Pressable>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <Ionicons
        name={icon}
        size={22}
        color="#7C3AED"
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

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 110,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  headerInfo: {
    flex: 1,
    paddingRight: 15,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
    marginTop: 5,
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
  },

  historyTitle: {
    marginTop: 31,
  },

  // ==========================================================
  // AVAILABLE CARD
  // ==========================================================

  availableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  assessmentIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },

  availableText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#16A34A",
  },

  assessmentTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 28,
  },

  trainingName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7C3AED",
    marginTop: 4,
  },

  description: {
    fontSize: 11,
    lineHeight: 19,
    color: "#64748B",
    marginTop: 17,
  },

  // ==========================================================
  // INFORMATION
  // ==========================================================

  infoContainer: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    paddingVertical: 15,
    flexDirection: "row",
  },

  infoItem: {
    flex: 1,
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 8,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 5,
  },

  infoValue: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "800",
    marginTop: 2,
  },

  // ==========================================================
  // START
  // ==========================================================

  startButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  // ==========================================================
  // HISTORY
  // ==========================================================

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  historyIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  historyInfo: {
    flex: 1,
  },


  historyTraining: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 3,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  resultLabel: {
    fontSize: 9,
    color: "#94A3B8",
  },

  resultValue: {
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 7,
  },

  bottomSpace: {
    height: 30,
  },
});