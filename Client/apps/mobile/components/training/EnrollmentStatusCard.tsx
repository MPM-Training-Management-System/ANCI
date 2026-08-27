import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  ParticipantEnrollment,
} from "@/src/data/participantEnrollment";

interface Props {
  enrollment: ParticipantEnrollment;

  onOpenTraining?: (
    enrollment: ParticipantEnrollment
  ) => void;
}

export default function EnrollmentStatusCard({
  enrollment,
  onOpenTraining,
}: Props) {
  const isPending =
    enrollment.status === "Pending";

  const isApproved =
    enrollment.status === "Approved";

  const isRejected =
    enrollment.status === "Rejected";

  const isCompleted =
    enrollment.status === "Completed";

  const icon = isPending
    ? "time-outline"
    : isApproved
    ? "checkmark-circle-outline"
    : isRejected
    ? "close-circle-outline"
    : isCompleted
    ? "ribbon-outline"
    : "document-outline";

  const iconColor = isPending
    ? "#D97706"
    : isApproved
    ? "#16A34A"
    : isRejected
    ? "#DC2626"
    : isCompleted
    ? "#7C3AED"
    : "#64748B";

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconBox,
          isApproved &&
            styles.approvedIcon,
          isRejected &&
            styles.rejectedIcon,
          isCompleted &&
            styles.completedIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>

      <Text style={styles.statusTitle}>
        {isPending
          ? "Enrollment Submitted"
          : isApproved
          ? "Enrollment Approved"
          : isRejected
          ? "Enrollment Rejected"
          : isCompleted
          ? "Training Completed"
          : "Enrollment"}
      </Text>

      <Text style={styles.trainingTitle}>
        {enrollment.trainingTitle}
      </Text>

      <Text style={styles.description}>
        {isPending
          ? "Your application is waiting for administrator review."
          : isApproved
          ? "Your enrollment has been approved. You can now access your training."
          : isRejected
          ? enrollment.rejectionReason ??
            "Your enrollment application was not approved."
          : isCompleted
          ? "You have successfully completed this training."
          : "Your enrollment information."}
      </Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>
          STATUS
        </Text>

        <View
          style={[
            styles.badge,
            isPending &&
              styles.pendingBadge,
            isApproved &&
              styles.approvedBadge,
            isRejected &&
              styles.rejectedBadge,
            isCompleted &&
              styles.completedBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isPending &&
                styles.pendingText,
              isApproved &&
                styles.approvedText,
              isRejected &&
                styles.rejectedText,
              isCompleted &&
                styles.completedText,
            ]}
          >
            {enrollment.status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Detail
          label="Trainer"
          value={enrollment.trainer}
        />

        <Detail
          label="Schedule"
          value={`${enrollment.schedule} • ${enrollment.time}`}
        />

        <Detail
          label="Mode"
          value={enrollment.mode}
        />

        <Detail
          label="Training Period"
          value={`${enrollment.startDate} – ${enrollment.endDate}`}
        />
      </View>

      {isApproved &&
        onOpenTraining && (
          <Pressable
            onPress={() =>
              onOpenTraining(
                enrollment
              )
            }
            style={styles.openButton}
          >
            <Text style={styles.openButtonText}>
              Open Training
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color="#FFFFFF"
            />
          </Pressable>
        )}
    </View>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  approvedIcon: {
    backgroundColor: "#DCFCE7",
  },

  rejectedIcon: {
    backgroundColor: "#FEE2E2",
  },

  completedIcon: {
    backgroundColor: "#F3E8FF",
  },

  statusTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },

  trainingTitle: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    color: "#475569",
  },

  description: {
    marginTop: 9,
    textAlign: "center",
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },

  statusRow: {
    width: "100%",
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#94A3B8",
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  approvedBadge: {
    backgroundColor: "#DCFCE7",
  },

  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },

  completedBadge: {
    backgroundColor: "#F3E8FF",
  },

  badgeText: {
    fontSize: 6,
    fontWeight: "900",
    color: "#64748B",
  },

  pendingText: {
    color: "#B45309",
  },

  approvedText: {
    color: "#15803D",
  },

  rejectedText: {
    color: "#B91C1C",
  },

  completedText: {
    color: "#7E22CE",
  },

  details: {
    width: "100%",
    marginTop: 15,
    gap: 9,
  },

  detail: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },

  detailLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#94A3B8",
  },

  detailValue: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "700",
    color: "#334155",
  },

  openButton: {
    width: "100%",
    height: 45,
    marginTop: 17,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  openButtonText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});