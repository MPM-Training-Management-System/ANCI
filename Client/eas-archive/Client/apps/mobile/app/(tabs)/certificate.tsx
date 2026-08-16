import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function CertificateScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Certificates
        </Text>

        <Text style={styles.subtitle}>
          View your earned training certificates.
        </Text>

        {/* Certificate */}

        <View style={styles.certificateCard}>
          <View style={styles.certificateTop}>
            <View style={styles.ribbon}>
              <Ionicons
                name="ribbon"
                size={32}
                color="#D97706"
              />
            </View>

            <View style={styles.verified}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#16A34A"
              />

              <Text style={styles.verifiedText}>
                VERIFIED
              </Text>
            </View>
          </View>

          <Text style={styles.certificateLabel}>
            CERTIFICATE OF COMPLETION
          </Text>

          <Text style={styles.certificateTitle}>
            Leadership Training
          </Text>

          <View style={styles.line} />

          <Text style={styles.issued}>
            Issued to
          </Text>

          <Text style={styles.recipient}>
            Juan Dela Cruz
          </Text>

          <Text style={styles.date}>
            August 05, 2026
          </Text>

          <View style={styles.certificateBottom}>
            <Text style={styles.certificateId}>
              Certificate ID: CERT-26-0001
            </Text>

            <Ionicons
              name="qr-code-outline"
              size={32}
              color="#0F172A"
            />
          </View>
        </View>

        {/* Empty / More */}

        <Text style={styles.sectionTitle}>
          Certificate History
        </Text>

        <View style={styles.historyCard}>
          <View style={styles.historyIcon}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>
              Basic Training
            </Text>

            <Text style={styles.historyDate}>
              July 29, 2026
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#94A3B8"
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 110,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 25,
  },

  certificateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 28,
  },

  certificateTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ribbon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  verifiedText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#16A34A",
  },

  certificateLabel: {
    textAlign: "center",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#64748B",
    marginTop: 22,
  },

  certificateTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },

  line: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },

  issued: {
    textAlign: "center",
    fontSize: 10,
    color: "#94A3B8",
  },

  recipient: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 5,
  },

  date: {
    textAlign: "center",
    fontSize: 10,
    color: "#64748B",
    marginTop: 5,
  },

  certificateBottom: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 20,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  certificateId: {
    fontSize: 8,
    color: "#94A3B8",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  historyInfo: {
    flex: 1,
  },

  historyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  historyDate: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 3,
  },

  bottomSpace: {
    height: 30,
  },
});