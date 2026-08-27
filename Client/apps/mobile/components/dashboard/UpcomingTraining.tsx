import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  ParticipantTraining,
} from "@/src/data/participant";

interface UpcomingTrainingProps {
  training?: ParticipantTraining | null;
}

export default function UpcomingTraining({
  training,
}: UpcomingTrainingProps) {
  if (!training) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="school-outline"
            size={21}
            color="#94A3B8"
          />
        </View>

        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>
            No training assigned
          </Text>

          <Text style={styles.emptyDescription}>
            Your assigned training program will
            appear here once available.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            CURRENT TRAINING
          </Text>

          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {training.title}
          </Text>

          <Text style={styles.code}>
            {training.code}
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            name="school-outline"
            size={22}
            color="#2563EB"
          />
        </View>
      </View>

      {/* DESCRIPTION */}
      <Text
        style={styles.description}
        numberOfLines={3}
      >
        {training.description}
      </Text>

      {/* TRAINER */}
      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="person-outline"
            size={15}
            color="#2563EB"
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>
            TRAINER
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={1}
          >
            {training.trainerName}
          </Text>

          <Text
            style={styles.infoSubValue}
            numberOfLines={1}
          >
            {training.trainerSpecialization}
          </Text>
        </View>
      </View>

      {/* DATE */}
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <View style={styles.smallIcon}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color="#64748B"
            />
          </View>

          <View>
            <Text style={styles.smallLabel}>
              START DATE
            </Text>

            <Text style={styles.smallValue}>
              {training.startDate}
            </Text>
          </View>
        </View>

        <View style={styles.dateItem}>
          <View style={styles.smallIcon}>
            <Ionicons
              name="flag-outline"
              size={13}
              color="#64748B"
            />
          </View>

          <View>
            <Text style={styles.smallLabel}>
              END DATE
            </Text>

            <Text style={styles.smallValue}>
              {training.endDate}
            </Text>
          </View>
        </View>
      </View>

      {/* PROGRESS */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Training Progress
          </Text>

          <Text style={styles.progressPercentage}>
            {training.progress}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  Math.max(training.progress, 0),
                  100
                )}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            {training.status}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.viewButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.viewButtonText}>
            View Training
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#2563EB"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    padding: 17,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#2563EB",
  },

  title: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  code: {
    marginTop: 4,
    fontSize: 7,
    fontWeight: "700",
    color: "#94A3B8",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  description: {
    marginTop: 13,
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
  },

  infoCard: {
    marginTop: 15,
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 9,
  },

  infoLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  infoValue: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "800",
    color: "#334155",
  },

  infoSubValue: {
    marginTop: 1,
    fontSize: 7,
    color: "#64748B",
  },

  dateRow: {
    marginTop: 15,
    flexDirection: "row",
    gap: 10,
  },

  dateItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  smallIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  smallLabel: {
    fontSize: 5.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#94A3B8",
  },

  smallValue: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: "700",
    color: "#475569",
  },

  progressSection: {
    marginTop: 17,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 7,
    fontWeight: "700",
    color: "#64748B",
  },

  progressPercentage: {
    fontSize: 8,
    fontWeight: "900",
    color: "#2563EB",
  },

  progressTrack: {
    height: 6,
    marginTop: 7,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  footer: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
  },

  statusText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#64748B",
  },

  viewButton: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewButtonText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#2563EB",
  },

  pressed: {
    opacity: 0.7,
  },

  emptyCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyContent: {
    flex: 1,
    marginLeft: 11,
  },

  emptyTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
  },

  emptyDescription: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 13,
    color: "#94A3B8",
  },
});