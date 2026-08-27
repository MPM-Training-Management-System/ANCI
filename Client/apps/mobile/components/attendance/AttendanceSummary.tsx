import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  ParticipantAttendance,
} from "@/src/data/participant";

interface Props {
  attendance: ParticipantAttendance;
}

export default function AttendanceSummary({
  attendance,
}: Props) {
  const rate =
    attendance.total > 0
      ? Math.round(
          (attendance.present /
            attendance.total) *
            100
        )
      : 0;

  return (
    <View>
      <Text style={styles.title}>
        Attendance Summary
      </Text>

      <Text style={styles.subtitle}>
        Your training attendance overview.
      </Text>

      <View style={styles.card}>
        <View style={styles.rateContainer}>
          <Text style={styles.rate}>
            {rate}%
          </Text>

          <Text style={styles.rateLabel}>
            Attendance Rate
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stats}>
          <Stat
            value={attendance.present}
            label="Present"
            color="#16A34A"
          />

          <Stat
            value={attendance.late}
            label="Late"
            color="#D97706"
          />

          <Stat
            value={attendance.absent}
            label="Absent"
            color="#DC2626"
          />
        </View>
      </View>
    </View>
  );
}

function Stat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.statValue,
          { color },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginHorizontal: 20,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginHorizontal: 20,
    marginTop: 3,
    fontSize: 9,
    color: "#94A3B8",
  },

  card: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 17,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  rateContainer: {
    width: 90,
    alignItems: "center",
  },

  rate: {
    fontSize: 25,
    fontWeight: "900",
    color: "#2563EB",
  },

  rateLabel: {
    marginTop: 2,
    fontSize: 8,
    textAlign: "center",
    color: "#94A3B8",
  },

  divider: {
    width: 1,
    height: 48,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },

  stats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  stat: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    marginTop: 2,
    fontSize: 8,
    color: "#94A3B8",
  },
});