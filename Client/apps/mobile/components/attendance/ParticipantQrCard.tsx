import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  participantCode: string;
  participantName: string;
  sessionOpen: boolean;
}

export default function ParticipantQrCard({
  participantCode,
  participantName,
  sessionOpen,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            OPTIONAL QR
          </Text>

          <Text style={styles.title}>
            Show your QR to your trainer
          </Text>

          <Text style={styles.description}>
            Your trainer can scan this QR instead
            of manually recording your attendance.
          </Text>
        </View>

        <View style={styles.qrIcon}>
          <Ionicons
            name="qr-code-outline"
            size={20}
            color="#2563EB"
          />
        </View>
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qr}>
          <QrPattern />
        </View>
      </View>

      <Text style={styles.name}>
        {participantName}
      </Text>

      <Text style={styles.code}>
        {participantCode}
      </Text>

      <View style={styles.instruction}>
        <Ionicons
          name={
            sessionOpen
              ? "information-circle-outline"
              : "lock-closed-outline"
          }
          size={16}
          color="#2563EB"
        />

        <Text style={styles.instructionText}>
          {sessionOpen
            ? "QR is optional. You can also use the Time In and Time Out buttons."
            : "QR attendance becomes available when the trainer opens the session."}
        </Text>
      </View>
    </View>
  );
}

function QrPattern() {
  const pattern = [
    "1111111001011111111",
    "1000001010011000001",
    "1011101001111011101",
    "1011101010101011101",
    "1011101001111011101",
    "1000001011011000001",
    "1111111010101111111",
    "0000000011010000000",
    "1010111110011010111",
    "0111001001100100100",
    "1101011110011110101",
    "0010110011101001110",
    "1111001110010111011",
    "0000001011100101001",
    "1111111010111110011",
    "1000001011001001010",
    "1011101000111110111",
    "1011101011010010100",
    "1011101001111011101",
  ];

  return (
    <View style={styles.pattern}>
      {pattern.map((row, rowIndex) =>
        row.split("").map(
          (cell, columnIndex) => (
            <View
              key={`${rowIndex}-${columnIndex}`}
              style={[
                styles.cell,
                cell === "1" &&
                  styles.filled,
              ]}
            />
          )
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
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
    letterSpacing: 1.1,
    color: "#2563EB",
  },

  title: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  description: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },

  qrIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  qrContainer: {
    marginTop: 18,
    alignItems: "center",
  },

  qr: {
    width: 190,
    height: 190,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  pattern: {
    width: 170,
    height: 170,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cell: {
    width: "5.263%",
    height: "5.263%",
    backgroundColor: "#FFFFFF",
  },

  filled: {
    backgroundColor: "#0F172A",
  },

  name: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  code: {
    marginTop: 3,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#64748B",
  },

  instruction: {
    marginTop: 14,
    padding: 11,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  instructionText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },
});