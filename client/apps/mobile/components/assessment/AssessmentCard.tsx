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
} from "@repo/types";

interface Props {
  assessment: ParticipantAssessment;
  onPress?: () => void;
}

export default function AssessmentCard({
  assessment,
  onPress,
}: Props) {
  const completed =
    assessment.hasPassed;

  const attempted =
    assessment.attemptCount > 0;

  const status = completed
    ? "Completed"
    : attempted
      ? "In Progress"
      : "Available";

  return (
    <Pressable
      disabled={completed}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        completed &&
          styles.completedCard,
        pressed &&
          !completed &&
          styles.pressed,
      ]}
    >
      <View
        style={[
          styles.icon,
          completed &&
            styles.completedIcon,
        ]}
      >
        <Ionicons
          name={
            completed
              ? "checkmark-circle-outline"
              : "clipboard-outline"
          }
          size={22}
          color={
            completed
              ? "#16A34A"
              : "#2563EB"
          }
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              completed &&
                styles.completedText,
            ]}
            numberOfLines={2}
          >
            {assessment.title}
          </Text>

          <StatusBadge
            status={status}
          />
        </View>

        <Text
          style={styles.batch}
          numberOfLines={1}
        >
          Batch {assessment.batchCode}
        </Text>

        {!!assessment.description && (
          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {assessment.description}
          </Text>
        )}

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons
              name="help-circle-outline"
              size={13}
              color="#94A3B8"
            />

            <Text style={styles.metaText}>
              {assessment.questionCount}{" "}
              {assessment.questionCount === 1
                ? "question"
                : "questions"}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="flag-outline"
              size={13}
              color="#94A3B8"
            />

            <Text style={styles.metaText}>
              Passing:{" "}
              {assessment.passingPercentage}%
            </Text>
          </View>

          {assessment.attemptCount > 0 && (
            <View style={styles.metaItem}>
              <Ionicons
                name="repeat-outline"
                size={13}
                color="#94A3B8"
              />

              <Text style={styles.metaText}>
                {assessment.attemptCount}{" "}
                {assessment.attemptCount === 1
                  ? "attempt"
                  : "attempts"}
              </Text>
            </View>
          )}

          {assessment.latestPercentage !==
            null &&
            assessment.latestPercentage !==
              undefined && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="ribbon-outline"
                  size={13}
                  color={
                    assessment.hasPassed
                      ? "#16A34A"
                      : "#F59E0B"
                  }
                />

                <Text
                  style={[
                    styles.metaText,
                    assessment.hasPassed
                      ? styles.scoreText
                      : styles.latestScoreText,
                  ]}
                >
                  Latest:{" "}
                  {assessment.latestPercentage}%
                </Text>
              </View>
            )}
        </View>
      </View>

      {!completed && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#CBD5E1"
          style={styles.chevron}
        />
      )}
    </Pressable>
  );
}

function StatusBadge({
  status,
}: {
  status:
    | "Available"
    | "In Progress"
    | "Completed";
}) {
  let backgroundColor = "#DBEAFE";
  let color = "#1D4ED8";
  let icon:
    | keyof typeof Ionicons.glyphMap =
    "play-circle-outline";

  if (status === "Completed") {
    backgroundColor = "#DCFCE7";
    color = "#15803D";
    icon = "checkmark-circle-outline";
  }

  if (status === "In Progress") {
    backgroundColor = "#FEF3C7";
    color = "#B45309";
    icon = "play-circle-outline";
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={10}
        color={color}
      />

      <Text
        style={[
          styles.badgeText,
          {
            color,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    padding: 15,
    minHeight: 145,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  completedCard: {
    backgroundColor: "#F8FFFA",
  },

  icon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  completedIcon: {
    backgroundColor: "#DCFCE7",
  },

  content: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 4,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },

  title: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  completedText: {
    color: "#166534",
  },

  batch: {
    marginTop: 5,
    fontSize: 7.5,
    fontWeight: "700",
    color: "#2563EB",
  },

  description: {
    marginTop: 6,
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },

  meta: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 7,
    color: "#94A3B8",
  },

  scoreText: {
    color: "#16A34A",
    fontWeight: "800",
  },

  latestScoreText: {
    color: "#D97706",
    fontWeight: "800",
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  badgeText: {
    fontSize: 6.5,
    fontWeight: "800",
  },

  chevron: {
    marginTop: 12,
  },

  pressed: {
    opacity: 0.72,
  },
});