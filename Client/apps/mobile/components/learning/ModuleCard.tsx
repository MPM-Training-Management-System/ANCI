import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  LearningModule,
  LearningStatus,
} from "@/src/data/participant";

interface Props {
  module: LearningModule;
  number: number;
}

export default function ModuleCard({
  module,
  number,
}: Props) {
  const locked =
    module.status === "Locked";

  const completed =
    module.status === "Completed";

  const inProgress =
    module.status === "In Progress";

  const available =
    module.status === "Available";

  return (
    <Pressable
      disabled={locked}
      onPress={() => {}}
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
          styles.number,
          completed &&
            styles.completedNumber,
          inProgress &&
            styles.progressNumber,
          available &&
            styles.availableNumber,
          locked &&
            styles.lockedNumber,
        ]}
      >
        {completed ? (
          <Ionicons
            name="checkmark"
            size={17}
            color="#FFFFFF"
          />
        ) : locked ? (
          <Ionicons
            name="lock-closed"
            size={14}
            color="#94A3B8"
          />
        ) : (
          <Text
            style={[
              styles.numberText,
              available &&
                styles.availableNumberText,
            ]}
          >
            {number}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              locked &&
                styles.lockedTitle,
            ]}
            numberOfLines={2}
          >
            {module.title}
          </Text>

          <StatusBadge
            status={module.status}
          />
        </View>

        <Text
          style={[
            styles.description,
            locked &&
              styles.lockedDescription,
          ]}
          numberOfLines={2}
        >
          {module.description}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={12}
              color="#94A3B8"
            />

            <Text style={styles.metaText}>
              {module.duration}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="play-circle-outline"
              size={12}
              color="#94A3B8"
            />

            <Text style={styles.metaText}>
              {module.lessons} lessons
            </Text>
          </View>
        </View>

        {(inProgress || completed) && (
          <View style={styles.progress}>
            <View
              style={styles.progressHeader}
            >
              <Text
                style={styles.progressLabel}
              >
                Progress
              </Text>

              <Text
                style={styles.progressValue}
              >
                {module.progress}%
              </Text>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${module.progress}%`,
                  },
                  completed &&
                    styles.completedFill,
                ]}
              />
            </View>
          </View>
        )}
      </View>

      {!locked && (
        <Ionicons
          name="chevron-forward"
          size={17}
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
  status: LearningStatus;
}) {
  let backgroundColor = "#F1F5F9";
  let textColor = "#64748B";

  let icon:
    | keyof typeof Ionicons.glyphMap =
    "lock-closed-outline";

  if (status === "Completed") {
    backgroundColor = "#DCFCE7";
    textColor = "#15803D";
    icon = "checkmark-circle-outline";
  }

  if (status === "In Progress") {
    backgroundColor = "#DBEAFE";
    textColor = "#1D4ED8";
    icon = "play-circle-outline";
  }

  if (status === "Available") {
    backgroundColor = "#FEF3C7";
    textColor = "#B45309";
    icon = "flash-outline";
  }

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor },
      ]}
    >
      <Ionicons
        name={icon}
        size={10}
        color={textColor}
      />

      <Text
        style={[
          styles.statusText,
          { color: textColor },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 125,
    padding: 14,
    borderRadius: 19,
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

  number: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  completedNumber: {
    backgroundColor: "#16A34A",
  },

  progressNumber: {
    backgroundColor: "#2563EB",
  },

  availableNumber: {
    backgroundColor: "#FEF3C7",
  },

  lockedNumber: {
    backgroundColor: "#E2E8F0",
  },

  numberText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  availableNumberText: {
    color: "#B45309",
  },

  content: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 3,
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

  lockedTitle: {
    color: "#64748B",
  },

  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  statusText: {
    fontSize: 6.5,
    fontWeight: "800",
  },

  description: {
    marginTop: 6,
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },

  lockedDescription: {
    color: "#94A3B8",
  },

  meta: {
    marginTop: 8,
    flexDirection: "row",
    gap: 13,
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

  progress: {
    marginTop: 9,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 7,
    color: "#94A3B8",
  },

  progressValue: {
    fontSize: 7,
    fontWeight: "800",
    color: "#2563EB",
  },

  track: {
    height: 4,
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  completedFill: {
    backgroundColor: "#16A34A",
  },

  chevron: {
    marginTop: 12,
  },

  pressed: {
    opacity: 0.72,
  },
});