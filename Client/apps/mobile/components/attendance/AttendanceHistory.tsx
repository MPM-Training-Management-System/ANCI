import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  AttendanceRecord,
} from "@/src/data/participant";

interface Props {
  history: AttendanceRecord[];
}

export default function AttendanceHistory({
  history,
}: Props) {
  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Attendance History
          </Text>

          <Text style={styles.subtitle}>
            Your recent attendance records.
          </Text>
        </View>

        <View style={styles.count}>
          <Text style={styles.countText}>
            {history.length}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        {history.map(
          (record, index) => {
            const present =
              record.status === "Present";

            const late =
              record.status === "Late";

            return (
              <React.Fragment
                key={record.id}
              >
                <View style={styles.item}>
                  <View
                    style={[
                      styles.icon,
                      present &&
                        styles.presentIcon,
                      late &&
                        styles.lateIcon,
                    ]}
                  >
                    <Ionicons
                      name={
                        present
                          ? "checkmark"
                          : late
                          ? "time"
                          : "close"
                      }
                      size={16}
                      color={
                        present
                          ? "#16A34A"
                          : late
                          ? "#D97706"
                          : "#DC2626"
                      }
                    />
                  </View>

                  <View style={styles.content}>
                    <Text style={styles.session}>
                      {record.session}
                    </Text>

                    <Text style={styles.date}>
                      {record.date} •{" "}
                      {record.time}
                    </Text>

                    <Text style={styles.method}>
                      Method: {record.method}
                      {record.checkIn
                        ? ` • In ${record.checkIn}`
                        : ""}
                      {record.checkOut
                        ? ` • Out ${record.checkOut}`
                        : ""}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      present &&
                        styles.presentBadge,
                      late &&
                        styles.lateBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        present &&
                          styles.presentText,
                        late &&
                          styles.lateText,
                      ]}
                    >
                      {record.status}
                    </Text>
                  </View>
                </View>

                {index <
                  history.length - 1 && (
                  <View
                    style={styles.separator}
                  />
                )}
              </React.Fragment>
            );
          }
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9,
    color: "#94A3B8",
  },

  count: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  card: {
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  item: {
    minHeight: 78,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  icon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  presentIcon: {
    backgroundColor: "#DCFCE7",
  },

  lateIcon: {
    backgroundColor: "#FEF3C7",
  },

  content: {
    flex: 1,
  },

  session: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },

  date: {
    marginTop: 3,
    fontSize: 8,
    color: "#94A3B8",
  },

  method: {
    marginTop: 3,
    fontSize: 7,
    color: "#64748B",
  },

  badge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
  },

  presentBadge: {
    backgroundColor: "#DCFCE7",
  },

  lateBadge: {
    backgroundColor: "#FEF3C7",
  },

  badgeText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#DC2626",
  },

  presentText: {
    color: "#15803D",
  },

  lateText: {
    color: "#B45309",
  },

  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 47,
  },
});