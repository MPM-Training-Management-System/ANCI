import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  attendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
};

export default function AttendanceSummary({
  attendance,
}: Props) {
  const attendanceRate =
    Math.round(
      (attendance.present /
        attendance.total) *
        100
    );

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>
          Attendance
        </Text>

        <Text style={styles.rate}>
          {attendanceRate}% attendance
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.main}>
          <View style={styles.circle}>
            <Text style={styles.circleValue}>
              {attendanceRate}%
            </Text>

            <Text style={styles.circleLabel}>
              Present
            </Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <View
                style={[
                  styles.statIcon,
                  styles.presentIcon,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={15}
                  color="#16A34A"
                />
              </View>

              <View>
                <Text
                  style={styles.statValue}
                >
                  {attendance.present}
                </Text>

                <Text
                  style={styles.statLabel}
                >
                  Present
                </Text>
              </View>
            </View>

            <View style={styles.stat}>
              <View
                style={[
                  styles.statIcon,
                  styles.lateIcon,
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={15}
                  color="#D97706"
                />
              </View>

              <View>
                <Text
                  style={styles.statValue}
                >
                  {attendance.late}
                </Text>

                <Text
                  style={styles.statLabel}
                >
                  Late
                </Text>
              </View>
            </View>

            <View style={styles.stat}>
              <View
                style={[
                  styles.statIcon,
                  styles.absentIcon,
                ]}
              >
                <Ionicons
                  name="close"
                  size={15}
                  color="#DC2626"
                />
              </View>

              <View>
                <Text
                  style={styles.statValue}
                >
                  {attendance.absent}
                </Text>

                <Text
                  style={styles.statLabel}
                >
                  Absent
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,

    marginBottom: 10,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  title: {
    fontSize: 16,

    fontWeight: "800",

    color: "#0F172A",
  },

  rate: {
    fontSize: 10,

    fontWeight: "700",

    color: "#16A34A",
  },

  card: {
    marginHorizontal: 20,

    padding: 17,

    borderRadius: 19,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  main: {
    flexDirection: "row",

    alignItems: "center",
  },

  circle: {
    width: 88,
    height: 88,

    borderRadius: 44,

    backgroundColor: "#EEF4FF",

    borderWidth: 7,
    borderColor: "#BFDBFE",

    alignItems: "center",
    justifyContent: "center",
  },

  circleValue: {
    fontSize: 19,

    fontWeight: "900",

    color: "#2563EB",
  },

  circleLabel: {
    marginTop: 1,

    fontSize: 8,

    color: "#64748B",
  },

  stats: {
    flex: 1,

    marginLeft: 19,

    gap: 9,
  },

  stat: {
    flexDirection: "row",

    alignItems: "center",

    gap: 9,
  },

  statIcon: {
    width: 28,
    height: 28,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",
  },

  presentIcon: {
    backgroundColor: "#DCFCE7",
  },

  lateIcon: {
    backgroundColor: "#FEF3C7",
  },

  absentIcon: {
    backgroundColor: "#FEE2E2",
  },

  statValue: {
    fontSize: 12,

    fontWeight: "800",

    color: "#0F172A",
  },

  statLabel: {
    fontSize: 8,

    color: "#64748B",
  },
});