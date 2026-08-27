import React from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  ParticipantCertificate,
} from "@/src/data/profile";

interface Props {
  certificate: ParticipantCertificate;
}

export default function CertificateCard({
  certificate,
}: Props) {
  const isIssued =
    certificate.status === "Issued";

  const handleView = () => {
    if (!isIssued) {
      Alert.alert(
        "Certificate Not Available",
        "Complete the remaining training requirements before your certificate becomes available."
      );

      return;
    }

    Alert.alert(
      "Certificate",
      `Certificate ${certificate.certificateNumber} is ready to view.`
    );
  };

  return (
    <View
      style={[
        styles.card,
        !isIssued && styles.pendingCard,
      ]}
    >
      <View style={styles.top}>
        <View
          style={[
            styles.iconBox,
            !isIssued && styles.pendingIconBox,
          ]}
        >
          <Ionicons
            name={
              isIssued
                ? "ribbon-outline"
                : "time-outline"
            }
            size={23}
            color={
              isIssued
                ? "#2563EB"
                : "#64748B"
            }
          />
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {certificate.status}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>
        {certificate.title}
      </Text>

      <Text style={styles.trainingTitle}>
        {certificate.trainingTitle}
      </Text>

      <Text style={styles.description}>
        {certificate.description}
      </Text>

      {isIssued && (
        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>
              Certificate No.
            </Text>

            <Text style={styles.detailValue}>
              {certificate.certificateNumber}
            </Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.detailLabel}>
              Issued
            </Text>

            <Text style={styles.detailValue}>
              {certificate.issuedDate}
            </Text>
          </View>
        </View>
      )}

      {certificate.score !== undefined &&
        isIssued && (
          <View style={styles.scoreRow}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color="#059669"
            />

            <Text style={styles.scoreText}>
              Final Score:{" "}
              {certificate.score}%
            </Text>
          </View>
        )}

      <Pressable
        onPress={handleView}
        style={({ pressed }) => [
          styles.button,
          !isIssued && styles.disabledButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={
            isIssued
              ? "document-text-outline"
              : "lock-closed-outline"
          }
          size={16}
          color={
            isIssued
              ? "#FFFFFF"
              : "#64748B"
          }
        />

        <Text
          style={[
            styles.buttonText,
            !isIssued &&
              styles.disabledButtonText,
          ]}
        >
          {isIssued
            ? "View Certificate"
            : "Complete Training"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  pendingCard: {
    backgroundColor: "#F8FAFC",
  },

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  pendingIconBox: {
    backgroundColor: "#F1F5F9",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#047857",
  },

  title: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  trainingTitle: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },

  description: {
    marginTop: 8,
    fontSize: 9,
    lineHeight: 15,
    color: "#64748B",
  },

  details: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
  },

  detail: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 7,
    fontWeight: "700",
    color: "#94A3B8",
  },

  detailValue: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "700",
    color: "#334155",
  },

  scoreRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  scoreText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#047857",
  },

  button: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  disabledButton: {
    backgroundColor: "#E2E8F0",
  },

  buttonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  disabledButtonText: {
    color: "#64748B",
  },

  pressed: {
    opacity: 0.8,
  },
});