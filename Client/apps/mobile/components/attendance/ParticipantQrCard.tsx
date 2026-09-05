
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

  /**
   * Kept for compatibility with AttendanceScreen.
   * The QR card does not display session status anymore.
   */
  sessionOpen?: boolean;
};

// ============================================================
// COMPONENT
// ============================================================

export default function ParticipantQrCard({
  participantCode,
  participantName,
  sessionOpen: _sessionOpen,
}: ParticipantQrCardProps) {
  return (
    <View style={styles.card}>

      {/* ======================================================
          QR CODE
      ====================================================== */}

      <View style={styles.qrGlow}>
        <View style={styles.qrContainer}>
          <QRCode
            value={participantCode}
            size={230}
            backgroundColor="#FFFFFF"
            color="#000000"
          />
        </View>
      </View>

      {/* ======================================================
          PARTICIPANT NAME
      ====================================================== */}

      <View style={styles.participantInfo}>
        <Text style={styles.label}>
          PARTICIPANT
        </Text>

        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {participantName}
        </Text>
      </View>

    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // MAIN CARD
  // ==========================================================

  card: {
    width: "90%",

    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    // FIXED SPACING
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,

    marginHorizontal: 15,

    borderWidth: 1,
    borderColor: "#E8E3F8",

    shadowColor: "#64748B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 4,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 18,
  },

  iconContainer: {
    width: 48,
    height: 48,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F3E8FF",
  },

  title: {
    fontSize: 18,
    lineHeight: 23,

    fontWeight: "900",

    color: "#0F172A",

    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 3,

    fontSize: 11,
    lineHeight: 16,

    color: "#64748B",
  },

  // ==========================================================
  // QR
  // ==========================================================

  qrGlow: {
    alignSelf: "center",

    // Balanced outer spacing
    padding: 8,

    borderRadius: 24,

    backgroundColor: "#FFFFFF",
  },

  qrContainer: {
    width: 266,
    height: 266,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E8E3F8",

    borderRadius: 20,

    // QR breathing room
    padding: 17,
  },

  // ==========================================================
  // PARTICIPANT
  // ==========================================================

  participantInfo: {
    alignItems: "center",

    // Space between QR and participant label
    marginTop: 14,

    paddingHorizontal: 8,
  },

  label: {
    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1.6,

    color: "#94A3B8",
  },

  name: {
    marginTop: 5,

    fontSize: 17,
    lineHeight: 22,

    fontWeight: "900",

    color: "#0F172A",

    textAlign: "center",
  },

});

