import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type AttendanceStatus =
  | "pending"
  | "time-in"
  | "time-out";

type AttendanceRecord = {
  id: string;
  date: string;
  training: string;
  timeIn: string;
  timeOut: string;
  status: "Present" | "Late" | "Absent";
};

const attendanceHistory: AttendanceRecord[] = [
  {
    id: "ATT-001",
    date: "August 05, 2026",
    training: "Leadership Training",
    timeIn: "08:54 AM",
    timeOut: "05:02 PM",
    status: "Present",
  },
  {
    id: "ATT-002",
    date: "July 29, 2026",
    training: "Basic Training",
    timeIn: "09:12 AM",
    timeOut: "04:58 PM",
    status: "Late",
  },
  {
    id: "ATT-003",
    date: "July 22, 2026",
    training: "Communication Skills",
    timeIn: "08:48 AM",
    timeOut: "05:01 PM",
    status: "Present",
  },
  {
    id: "ATT-004",
    date: "July 15, 2026",
    training: "Team Development",
    timeIn: "08:57 AM",
    timeOut: "05:00 PM",
    status: "Present",
  },
];

export default function AttendanceScreen() {
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus>("pending");

  const today = new Date();

  const currentDate = useMemo(() => {
    return today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const handleGenerateTimeIn = () => {
    setAttendanceStatus("time-in");
  };

  const handleGenerateTimeOut = () => {
    setAttendanceStatus("time-out");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* =========================================
            HEADER
        ========================================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Attendance
            </Text>

            <Text style={styles.subtitle}>
              Manage your training attendance
            </Text>
          </View>

          <View style={styles.calendarIcon}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#2563EB"
            />
          </View>
        </View>

        {/* =========================================
            TODAY'S TRAINING
        ========================================= */}

        <View style={styles.trainingCard}>
          <View style={styles.trainingIcon}>
            <Ionicons
              name="school-outline"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.trainingInfo}>
            <Text style={styles.trainingLabel}>
              TODAY'S TRAINING
            </Text>

            <Text style={styles.trainingTitle}>
              Leadership Training
            </Text>

            <View style={styles.trainingDetails}>
              <View style={styles.detailRow}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color="#BFDBFE"
                />

                <Text style={styles.detailText}>
                  9:00 AM
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color="#BFDBFE"
                />

                <Text style={styles.detailText}>
                  Training Center
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =========================================
            QR CARD
        ========================================= */}

        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View>
              <Text style={styles.qrTitle}>
                Attendance QR
              </Text>

              <Text style={styles.qrSubtitle}>
                Let your trainer scan this code
              </Text>
            </View>

            <AttendanceBadge
              status={attendanceStatus}
            />
          </View>

          {/* QR */}

          <View style={styles.qrWrapper}>
            <FakeQRCode />
          </View>

          <Text style={styles.scanInstruction}>
            Ask your trainer to scan this QR code
          </Text>

          <Text style={styles.dateText}>
            {currentDate}
          </Text>
        </View>

        {/* =========================================
            TODAY'S STATUS
        ========================================= */}

        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>
            Today's Attendance
          </Text>

          <View style={styles.timeRow}>
            {/* TIME IN */}

            <TimeCard
              type="in"
              value={
                attendanceStatus === "pending"
                  ? "--:--"
                  : "08:54 AM"
              }
              status={
                attendanceStatus === "pending"
                  ? "Waiting"
                  : "Recorded"
              }
            />

            {/* TIME OUT */}

            <TimeCard
              type="out"
              value={
                attendanceStatus === "time-out"
                  ? "05:02 PM"
                  : "--:--"
              }
              status={
                attendanceStatus === "time-out"
                  ? "Recorded"
                  : "Waiting"
              }
            />
          </View>
        </View>

        {/* =========================================
            ACTION BUTTON
        ========================================= */}

        {attendanceStatus === "pending" && (
          <Pressable
            style={styles.primaryButton}
            onPress={handleGenerateTimeIn}
          >
            <Ionicons
              name="qr-code-outline"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Generate Time In QR
            </Text>
          </Pressable>
        )}

        {attendanceStatus === "time-in" && (
          <Pressable
            style={styles.timeOutButton}
            onPress={handleGenerateTimeOut}
          >
            <Ionicons
              name="qr-code-outline"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Generate Time Out QR
            </Text>
          </Pressable>
        )}

        {attendanceStatus === "time-out" && (
          <View style={styles.completedCard}>
            <View style={styles.completedIcon}>
              <Ionicons
                name="checkmark"
                size={24}
                color="#16A34A"
              />
            </View>

            <View style={styles.completedInfo}>
              <Text style={styles.completedTitle}>
                Attendance Completed
              </Text>

              <Text style={styles.completedText}>
                Your time in and time out have been
                recorded successfully.
              </Text>
            </View>
          </View>
        )}

        {/* =========================================
            ATTENDANCE HISTORY
        ========================================= */}

        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Attendance History
            </Text>

            <Text style={styles.historySubtitle}>
              Your previous training attendance
            </Text>
          </View>

          <View style={styles.historyCount}>
            <Text style={styles.historyCountText}>
              {attendanceHistory.length}
            </Text>
          </View>
        </View>

        {/* History List */}

        <View style={styles.historyList}>
          {attendanceHistory.map((record) => (
            <AttendanceHistoryItem
              key={record.id}
              record={record}
            />
          ))}
        </View>

        {/* =========================================
            SECURITY
        ========================================= */}

        <View style={styles.securityCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={21}
            color="#16A34A"
          />

          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>
              Secure Attendance
            </Text>

            <Text style={styles.securityText}>
              Your attendance QR is generated for your
              account and current training session.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* =====================================================
   ATTENDANCE BADGE
===================================================== */

function AttendanceBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  let label = "NOT RECORDED";
  let background = "#FEF3C7";
  let color = "#D97706";

  if (status === "time-in") {
    label = "TIME IN";
    background = "#DCFCE7";
    color = "#16A34A";
  }

  if (status === "time-out") {
    label = "TIME OUT";
    background = "#DBEAFE";
    color = "#2563EB";
  }

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: background,
        },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text
        style={[
          styles.statusText,
          {
            color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/* =====================================================
   TIME CARD
===================================================== */

function TimeCard({
  type,
  value,
  status,
}: {
  type: "in" | "out";
  value: string;
  status: string;
}) {
  const isTimeIn = type === "in";

  return (
    <View style={styles.timeCard}>
      <View
        style={[
          styles.timeIcon,
          isTimeIn
            ? styles.timeInIcon
            : styles.timeOutIcon,
        ]}
      >
        <Ionicons
          name={
            isTimeIn
              ? "log-in-outline"
              : "log-out-outline"
          }
          size={21}
          color={
            isTimeIn
              ? "#16A34A"
              : "#2563EB"
          }
        />
      </View>

      <Text style={styles.timeLabel}>
        {isTimeIn ? "TIME IN" : "TIME OUT"}
      </Text>

      <Text style={styles.timeValue}>
        {value}
      </Text>

      <Text style={styles.timeStatus}>
        {status}
      </Text>
    </View>
  );
}

/* =====================================================
   HISTORY ITEM
===================================================== */

function AttendanceHistoryItem({
  record,
}: {
  record: AttendanceRecord;
}) {
  const isPresent = record.status === "Present";
  const isLate = record.status === "Late";

  const statusColor = isPresent
    ? "#16A34A"
    : isLate
      ? "#D97706"
      : "#DC2626";

  const statusBackground = isPresent
    ? "#DCFCE7"
    : isLate
      ? "#FEF3C7"
      : "#FEE2E2";

  return (
    <View style={styles.historyItem}>
      {/* Date */}

      <View style={styles.historyDate}>
        <View style={styles.historyCalendar}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#2563EB"
          />
        </View>

        <Text style={styles.historyDateText}>
          {record.date}
        </Text>
      </View>

      {/* Training */}

      <Text style={styles.historyTraining}>
        {record.training}
      </Text>

      {/* Time */}

      <View style={styles.historyTimes}>
        <View style={styles.historyTime}>
          <Ionicons
            name="log-in-outline"
            size={14}
            color="#16A34A"
          />

          <View>
            <Text style={styles.historyTimeLabel}>
              TIME IN
            </Text>

            <Text style={styles.historyTimeValue}>
              {record.timeIn}
            </Text>
          </View>
        </View>

        <View style={styles.historyTime}>
          <Ionicons
            name="log-out-outline"
            size={14}
            color="#2563EB"
          />

          <View>
            <Text style={styles.historyTimeLabel}>
              TIME OUT
            </Text>

            <Text style={styles.historyTimeValue}>
              {record.timeOut}
            </Text>
          </View>
        </View>
      </View>

      {/* Status */}

      <View
        style={[
          styles.historyStatus,
          {
            backgroundColor: statusBackground,
          },
        ]}
      >
        <View
          style={[
            styles.historyStatusDot,
            {
              backgroundColor: statusColor,
            },
          ]}
        />

        <Text
          style={[
            styles.historyStatusText,
            {
              color: statusColor,
            },
          ]}
        >
          {record.status}
        </Text>
      </View>
    </View>
  );
}

/* =====================================================
   FAKE QR
===================================================== */

function FakeQRCode() {
  return (
    <View style={styles.qrCode}>
      <View style={styles.qrCornerTopLeft}>
        <View style={styles.qrCornerInner} />
      </View>

      <View style={styles.qrCornerTopRight}>
        <View style={styles.qrCornerInner} />
      </View>

      <View style={styles.qrCornerBottomLeft}>
        <View style={styles.qrCornerInner} />
      </View>

      <View style={styles.qrPattern}>
        <View style={styles.square1} />
        <View style={styles.square2} />
        <View style={styles.square3} />
        <View style={styles.square4} />
        <View style={styles.square5} />
        <View style={styles.square6} />
        <View style={styles.square7} />
        <View style={styles.square8} />
        <View style={styles.square9} />
      </View>
    </View>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  calendarIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  trainingCard: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  trainingIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  trainingInfo: {
    flex: 1,
  },

  trainingLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#BFDBFE",
    letterSpacing: 1,
  },

  trainingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 3,
  },

  trainingDetails: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  detailText: {
    color: "#DBEAFE",
    fontSize: 9,
  },

  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  qrHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  qrTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  qrSubtitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 7,
    fontWeight: "800",
  },

  qrWrapper: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  qrCode: {
    width: 205,
    height: 205,
    backgroundColor: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
  },

  qrCornerTopLeft: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 48,
    height: 48,
    borderWidth: 7,
    borderColor: "#0F172A",
  },

  qrCornerTopRight: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 48,
    height: 48,
    borderWidth: 7,
    borderColor: "#0F172A",
  },

  qrCornerBottomLeft: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 48,
    height: 48,
    borderWidth: 7,
    borderColor: "#0F172A",
  },

  qrCornerInner: {
    position: "absolute",
    left: 7,
    right: 7,
    top: 7,
    bottom: 7,
    backgroundColor: "#0F172A",
  },

  qrPattern: {
    position: "absolute",
    left: 72,
    top: 72,
    width: 90,
    height: 90,
  },

  square1: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "#0F172A",
    left: 0,
    top: 0,
  },

  square2: {
    position: "absolute",
    width: 14,
    height: 14,
    backgroundColor: "#0F172A",
    left: 30,
    top: 0,
  },

  square3: {
    position: "absolute",
    width: 24,
    height: 24,
    backgroundColor: "#0F172A",
    right: 0,
    top: 0,
  },

  square4: {
    position: "absolute",
    width: 14,
    height: 30,
    backgroundColor: "#0F172A",
    left: 0,
    top: 35,
  },

  square5: {
    position: "absolute",
    width: 22,
    height: 18,
    backgroundColor: "#0F172A",
    left: 35,
    top: 35,
  },

  square6: {
    position: "absolute",
    width: 17,
    height: 25,
    backgroundColor: "#0F172A",
    right: 3,
    top: 35,
  },

  square7: {
    position: "absolute",
    width: 24,
    height: 20,
    backgroundColor: "#0F172A",
    left: 0,
    bottom: 0,
  },

  square8: {
    position: "absolute",
    width: 15,
    height: 25,
    backgroundColor: "#0F172A",
    left: 34,
    bottom: 0,
  },

  square9: {
    position: "absolute",
    width: 28,
    height: 18,
    backgroundColor: "#0F172A",
    right: 0,
    bottom: 3,
  },

  scanInstruction: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    marginTop: 14,
  },

  dateText: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 4,
  },

  timeSection: {
    marginTop: 22,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  timeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
  },

  timeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  timeInIcon: {
    backgroundColor: "#DCFCE7",
  },

  timeOutIcon: {
    backgroundColor: "#DBEAFE",
  },

  timeLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748B",
  },

  timeValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 3,
  },

  timeStatus: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 2,
  },

  primaryButton: {
    height: 53,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 18,
  },

  timeOutButton: {
    height: 53,
    borderRadius: 16,
    backgroundColor: "#0F766E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 18,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  completedCard: {
    marginTop: 18,
    backgroundColor: "#DCFCE7",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  completedIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  completedInfo: {
    flex: 1,
  },

  completedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },

  completedText: {
    fontSize: 10,
    lineHeight: 15,
    color: "#15803D",
    marginTop: 3,
  },

  historyHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  historySubtitle: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 3,
  },

  historyCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  historyCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
  },

  historyList: {
    gap: 10,
  },

  historyItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  historyDate: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyCalendar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  historyDateText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },

  historyTraining: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 10,
  },

  historyTimes: {
    flexDirection: "row",
    gap: 25,
    marginTop: 12,
  },

  historyTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  historyTimeLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: "#94A3B8",
  },

  historyTimeValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    marginTop: 1,
  },

  historyStatus: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 12,
  },

  historyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  historyStatusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  securityCard: {
    marginTop: 18,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  securityInfo: {
    flex: 1,
    marginLeft: 9,
  },

  securityTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },

  securityText: {
    fontSize: 9,
    lineHeight: 14,
    color: "#15803D",
    marginTop: 2,
  },

  bottomSpace: {
    height: 25,
  },
});