import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
} from "expo-router";

import type {
  ParticipantAssessment,
} from "@/src/data/participant";

interface Props {
  assessment: ParticipantAssessment;
}

export default function AssessmentCard({
  assessment,
}: Props) {
  const locked =
    assessment.status === "Locked";

  const completed =
    assessment.status === "Completed";

  const inProgress =
    assessment.status === "In Progress";

  return (
    <Pressable
      disabled={locked}
      onPress={() =>
        router.push({
          pathname: "/assessment/[id]",
          params: {
            id: assessment.id,
          },
        })
      }
      style={({ pressed }) => [
        styles.card,
        locked && styles.lockedCard,
        pressed &&
          !locked &&
          styles.pressed,
      ]}
    >
      <View
        style={[
          styles.icon,
          completed &&
            styles.completedIcon,
          locked &&
            styles.lockedIcon,
        ]}
      >
        <Ionicons
          name={
            completed
              ? "checkmark-circle-outline"
              : locked
                ? "lock-closed-outline"
                : "clipboard-outline"
          }
          size={22}
          color={
            completed
              ? "#16A34A"
              : locked
                ? "#94A3B8"
                : "#2563EB"
          }
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              locked &&
                styles.lockedText,
            ]}
            numberOfLines={2}
          >
            {assessment.title}
          </Text>

          <StatusBadge
            status={assessment.status}
          />
        </View>

        <Text
          style={styles.module}
          numberOfLines={1}
        >
          {assessment.moduleTitle}
        </Text>

        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {assessment.description}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={13}
              color="#94A3B8"
            />

            <Text style={styles.metaText}>
              {assessment.durationMinutes} min
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="help-circle-outline"
              size={13}
              color="#94A3B8"
            />

            <Text style={styles.metaText}>
              {assessment.questions.length} questions
            </Text>
          </View>

          {completed &&
            assessment.score !==
              undefined && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="ribbon-outline"
                  size={13}
                  color="#16A34A"
                />

                <Text
                  style={[
                    styles.metaText,
                    styles.scoreText,
                  ]}
                >
                  {assessment.score}%
                </Text>
              </View>
            )}
        </View>
      </View>

      {!locked && (
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
  status: ParticipantAssessment["status"];
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

  if (status === "Locked") {
    backgroundColor = "#F1F5F9";
    color = "#64748B";
    icon = "lock-closed-outline";
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

  lockedCard: {
    backgroundColor: "#F8FAFC",
    opacity: 0.75,
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

  lockedIcon: {
    backgroundColor: "#E2E8F0",
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

  lockedText: {
    color: "#64748B",
  },

  module: {
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