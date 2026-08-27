import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  title: string;
  trainer: string;
  progress: number;
  status: string;
}

export default function CurrentTrainingCard({
  title,
  trainer,
  progress,
  status,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            CURRENT TRAINING
          </Text>

          <Text style={styles.title}>
            {title}
          </Text>
        </View>

        <View style={styles.iconBox}>
          <Ionicons
            name="school-outline"
            size={20}
            color="#2563EB"
          />
        </View>
      </View>

      <View style={styles.trainerRow}>
        <Ionicons
          name="person-outline"
          size={14}
          color="#64748B"
        />

        <Text style={styles.trainer}>
          Trainer: {trainer}
        </Text>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          Training Progress
        </Text>

        <Text style={styles.progressValue}>
          {progress}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(
                Math.max(progress, 0),
                100
              )}%`,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.status}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            {status}
          </Text>
        </View>

        <Text style={styles.remaining}>
          {100 - progress}% remaining
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  title: {
    marginTop: 5,
    maxWidth: 260,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  trainerRow: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  trainer: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "600",
  },

  progressHeader: {
    marginTop: 17,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },

  progressValue: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  progressTrack: {
    height: 8,
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },

  footer: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#10B981",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#047857",
  },

  remaining: {
    fontSize: 8,
    color: "#94A3B8",
  },
});