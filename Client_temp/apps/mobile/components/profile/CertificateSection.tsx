import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import CertificateCard from "./CertificateCard";

import {
  ParticipantCertificate,
} from "@/src/data/profile";

interface Props {
  certificates: ParticipantCertificate[];
}

export default function CertificateSection({
  certificates,
}: Props) {
  const issuedCount =
    certificates.filter(
      (certificate) =>
        certificate.status === "Issued"
    ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Certificates
          </Text>

          <Text style={styles.subtitle}>
            Your training achievements
          </Text>
        </View>

        <View style={styles.countBox}>
          <Ionicons
            name="ribbon-outline"
            size={16}
            color="#2563EB"
          />

          <Text style={styles.count}>
            {issuedCount}
          </Text>
        </View>
      </View>

      {certificates.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="ribbon-outline"
              size={25}
              color="#94A3B8"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No certificates yet
          </Text>

          <Text style={styles.emptyText}>
            Complete your training and required
            assessments to receive a certificate.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {certificates.map(
            (certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
              />
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },

  header: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9,
    color: "#64748B",
  },

  countBox: {
    minWidth: 42,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  count: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  list: {
    gap: 12,
  },

  empty: {
    padding: 25,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },

  emptyText: {
    marginTop: 5,
    maxWidth: 280,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 15,
    color: "#94A3B8",
  },
});