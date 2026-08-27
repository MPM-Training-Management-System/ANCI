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
} from "@/src/data/participantTraining";

interface Props {
  training: ParticipantTraining;
  onPress: () => void;
}

export default function TrainingCard({
  training,
  onPress,
}: Props) {
  const remainingSlots =
    training.slots -
    training.enrolled;

  const isFull =
    remainingSlots <= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons
            name="school-outline"
            size={21}
            color="#2563EB"
          />
        </View>

        <View
          style={[
            styles.modeBadge,
            training.mode === "Online" &&
              styles.onlineBadge,
            training.mode === "Face-to-Face" &&
              styles.faceToFaceBadge,
          ]}
        >
          <Text style={styles.modeText}>
            {training.mode}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>
        {training.title}
      </Text>

      <Text
        style={styles.description}
        numberOfLines={2}
      >
        {training.description}
      </Text>

      <View style={styles.infoRow}>
        <Ionicons
          name="person-outline"
          size={14}
          color="#64748B"
        />

        <Text style={styles.infoText}>
          {training.trainer}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="calendar-outline"
          size={14}
          color="#64748B"
        />

        <Text style={styles.infoText}>
          {training.schedule}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="time-outline"
          size={14}
          color="#64748B"
        />

        <Text style={styles.infoText}>
          {training.time}
        </Text>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.slotsLabel}>
            AVAILABLE SLOTS
          </Text>

          <Text
            style={[
              styles.slots,
              isFull && styles.fullSlots,
            ]}
          >
            {isFull
              ? "FULL"
              : `${remainingSlots} slots left`}
          </Text>
        </View>

        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>
            View Details
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#2563EB"
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  modeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  onlineBadge: {
    backgroundColor: "#EFF6FF",
  },

  faceToFaceBadge: {
    backgroundColor: "#F0FDF4",
  },

  modeText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#475569",
  },

  title: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  description: {
    marginTop: 5,
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
  },

  infoRow: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  infoText: {
    fontSize: 8,
    color: "#64748B",
  },

  footer: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  slotsLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  slots: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "800",
    color: "#16A34A",
  },

  fullSlots: {
    color: "#DC2626",
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewButtonText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#2563EB",
  },
});