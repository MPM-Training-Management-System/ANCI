import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import QRCode from "react-native-qrcode-svg";


// ============================================================
// TYPES
// ============================================================

type ParticipantQrCardProps = {
  participantCode: string;
  participantName: string;
  sessionOpen?: boolean;
};


// ============================================================
// COMPONENT
// ============================================================

export default function ParticipantQrCard({
  participantCode,
  participantName,
  sessionOpen = false,
}: ParticipantQrCardProps) {
  return (
    <View style={styles.card}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>

        <View style={styles.iconContainer}>
          <Ionicons
            name="qr-code-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <View style={styles.headerContent}>

          <Text style={styles.title}>
            Attendance QR
          </Text>

          <Text style={styles.subtitle}>
            Your permanent attendance QR
          </Text>

        </View>

      </View>


      {/* ======================================================
          QR CODE
      ====================================================== */}

      <View style={styles.qrContainer}>

        <QRCode
          value={participantCode}
          size={230}
          backgroundColor="#FFFFFF"
          color="#000000"
        />

      </View>


      {/* ======================================================
          PARTICIPANT
      ====================================================== */}

      <View style={styles.participantInfo}>

        <Text style={styles.label}>
          PARTICIPANT
        </Text>

        <Text style={styles.name}>
          {participantName}
        </Text>

      </View>


      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        style={[
          styles.statusContainer,
          sessionOpen
            ? styles.statusOpen
            : styles.statusClosed,
        ]}
      >

        <View
          style={[
            styles.statusIcon,
            sessionOpen
              ? styles.statusIconOpen
              : styles.statusIconClosed,
          ]}
        >
          <Ionicons
            name={
              sessionOpen
                ? "checkmark-circle"
                : "lock-closed"
            }
            size={17}
            color={
              sessionOpen
                ? "#15803D"
                : "#64748B"
            }
          />
        </View>

        <View style={styles.statusContent}>

          <Text style={styles.statusTitle}>
            {sessionOpen
              ? "Attendance is Open"
              : "Permanent QR Code"}
          </Text>

          <Text style={styles.statusText}>
            {sessionOpen
              ? "Show this QR to your trainer."
              : "This QR does not expire. It can be used when your trainer opens attendance."}
          </Text>

        </View>

      </View>


      {/* ======================================================
          INSTRUCTION
      ====================================================== */}

      <View style={styles.instruction}>

        <Ionicons
          name="scan-outline"
          size={17}
          color="#7C3AED"
        />

        <Text style={styles.instructionText}>
          Show this QR code to your trainer.
          Your trainer will scan it to record
          your attendance.
        </Text>

      </View>

    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  qrContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",

    width: 270,
    height: 270,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    borderRadius: 18,

    padding: 18,
  },

  participantInfo: {
    alignItems: "center",
    marginTop: 20,
  },

  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#64748B",
  },

  name: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 18,

    padding: 12,

    borderRadius: 12,
  },

  statusOpen: {
    backgroundColor: "#F0FDF4",
  },

  statusClosed: {
    backgroundColor: "#F8FAFC",
  },

  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",
  },

  statusIconOpen: {
    backgroundColor: "#DCFCE7",
  },

  statusIconClosed: {
    backgroundColor: "#E2E8F0",
  },

  statusContent: {
    flex: 1,
    marginLeft: 10,
  },

  statusTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  statusText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  instruction: {
    flexDirection: "row",
    alignItems: "flex-start",

    marginTop: 16,
    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  instructionText: {
    flex: 1,

    marginLeft: 8,

    fontSize: 12,
    lineHeight: 18,

    color: "#64748B",
  },

});