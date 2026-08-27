import React, {
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import ParticipantQrCard from "./ParticipantQrCard";
import AttendanceSessionCard from "./AttendanceSessionCard";
import AttendanceSummary from "./AttendanceSummary";
import AttendanceHistory from "./AttendanceHistory";

import {
  mockParticipant,
  type ParticipantAttendance,
} from "@/src/data/participant";

export default function AttendanceScreen() {
  /*
   * ============================================================
   * MOCK TRAINER ATTENDANCE STATE
   * ============================================================
   *
   * Temporary muna habang wala pa tayong backend
   * attendance-session endpoint.
   *
   * true  = trainer opened attendance
   * false = attendance closed
   *
   * Later magiging backend value ito.
   */

  const [isAttendanceOpen, setIsAttendanceOpen] =
    useState(true);

  /*
   * ============================================================
   * ATTENDANCE DATA
   * ============================================================
   *
   * ParticipantAttendance[] ang actual structure
   * ng participant.ts mo.
   */

  const [attendance, setAttendance] =
    useState<ParticipantAttendance[]>(
      mockParticipant.attendance ?? []
    );

  /*
   * ============================================================
   * CURRENT ATTENDANCE
   * ============================================================
   *
   * Since array ang attendance, kukunin natin
   * ang first/current record.
   *
   * Kung may current record na may timeIn/timeOut,
   * iyon ang gagamitin.
   */

  const today = useMemo(() => {
    if (attendance.length === 0) {
      return null;
    }

    const currentRecord =
      attendance.find(
        (item) =>
          item.timeIn ||
          item.timeOut
      );

    return (
      currentRecord ??
      attendance[0]
    );
  }, [attendance]);

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (!today) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.emptyContainer
        }
      >
        <View style={styles.emptyIcon}>
          <Ionicons
            name="calendar-outline"
            size={30}
            color="#94A3B8"
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Attendance Available
        </Text>

        <Text style={styles.emptyText}>
          Your attendance records will appear
          here once your trainer creates an
          attendance session.
        </Text>
      </ScrollView>
    );
  }

  /*
   * ============================================================
   * MODE
   * ============================================================
   */

  const isOnline =
    today.mode === "Online";

  /*
   * ============================================================
   * TIME IN
   * ============================================================
   */

  const handleTimeIn = () => {
    /*
     * Trainer must open attendance.
     */

    if (!isAttendanceOpen) {
      Alert.alert(
        "Attendance Closed",
        "Your trainer has not opened attendance yet."
      );

      return;
    }

    /*
     * Already timed in.
     */

    if (today.timeIn) {
      Alert.alert(
        "Already Timed In",
        `You already timed in at ${today.timeIn}.`
      );

      return;
    }

    const currentTime =
      getCurrentTime();

    setAttendance(
      (previous) =>
        previous.map(
          (item) => {
            if (
              item.id !== today.id
            ) {
              return item;
            }

            return {
              ...item,

              attendanceStatus:
                "Present",

              attendanceMethod:
                "TimeIn",

              timeIn:
                currentTime,
            };
          }
        )
    );

    Alert.alert(
      "Time In Successful",
      `Your attendance was recorded at ${currentTime}.`
    );
  };

  /*
   * ============================================================
   * TIME OUT
   * ============================================================
   */

  const handleTimeOut = () => {
    /*
     * Attendance must still be open.
     */

    if (!isAttendanceOpen) {
      Alert.alert(
        "Attendance Closed",
        "The attendance session is no longer open."
      );

      return;
    }

    /*
     * Time In required first.
     */

    if (!today.timeIn) {
      Alert.alert(
        "Time In Required",
        "You need to time in before you can time out."
      );

      return;
    }

    /*
     * Already timed out.
     */

    if (today.timeOut) {
      Alert.alert(
        "Already Timed Out",
        `You already timed out at ${today.timeOut}.`
      );

      return;
    }

    const currentTime =
      getCurrentTime();

    setAttendance(
      (previous) =>
        previous.map(
          (item) => {
            if (
              item.id !== today.id
            ) {
              return item;
            }

            return {
              ...item,

              timeOut:
                currentTime,
            };
          }
        )
    );

    Alert.alert(
      "Time Out Successful",
      `Your attendance was completed at ${currentTime}.`
    );
  };

  /*
   * ============================================================
   * QR INFORMATION
   * ============================================================
   *
   * Important:
   *
   * Participant does NOT scan trainer QR.
   *
   * Trainer scans participant QR.
   */

  const handleQrInfo = () => {
    Alert.alert(
      "Participant QR",
      "For face-to-face attendance, your trainer scans your participant QR code."
    );
  };

  /*
   * ============================================================
   * ATTENDANCE STATUS
   * ============================================================
   */

  const statusText =
    today.timeOut
      ? "Attendance completed"
      : today.timeIn
      ? "Currently present"
      : isAttendanceOpen
      ? "Ready to Time In"
      : "Waiting for trainer";

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            PARTICIPANT PORTAL
          </Text>

          <Text style={styles.title}>
            Attendance
          </Text>

          <Text style={styles.subtitle}>
            Manage your training attendance.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#2563EB"
          />
        </View>
      </View>

      {/* ======================================================
          TRAINER SESSION STATUS
      ====================================================== */}

      <View style={styles.sessionStatusCard}>
        <View
          style={[
            styles.sessionStatusIcon,
            isAttendanceOpen
              ? styles.openIcon
              : styles.closedIcon,
          ]}
        >
          <Ionicons
            name={
              isAttendanceOpen
                ? "radio-outline"
                : "lock-closed-outline"
            }
            size={20}
            color={
              isAttendanceOpen
                ? "#16A34A"
                : "#64748B"
            }
          />
        </View>

        <View
          style={styles.sessionStatusContent}
        >
          <Text
            style={
              styles.sessionStatusLabel
            }
          >
            TRAINER ATTENDANCE
          </Text>

          <Text
            style={
              styles.sessionStatusTitle
            }
          >
            {isAttendanceOpen
              ? "Attendance is Open"
              : "Attendance is Closed"}
          </Text>

          <Text
            style={
              styles.sessionStatusText
            }
          >
            {isAttendanceOpen
              ? "You may record your Time In and Time Out."
              : "Wait for your trainer to open the attendance session."}
          </Text>
        </View>

        <View
          style={[
            styles.openBadge,
            isAttendanceOpen
              ? styles.openBadgeActive
              : styles.openBadgeClosed,
          ]}
        >
          <Text
            style={[
              styles.openBadgeText,
              isAttendanceOpen
                ? styles.openBadgeTextActive
                : styles.openBadgeTextClosed,
            ]}
          >
            {isAttendanceOpen
              ? "OPEN"
              : "CLOSED"}
          </Text>
        </View>
      </View>

      {/* ======================================================
          TODAY'S SESSION
      ====================================================== */}

      <AttendanceSessionCard
        attendance={today}
        onTimeIn={handleTimeIn}
        onTimeOut={handleTimeOut}
      />

      {/* ======================================================
          CURRENT STATUS
      ====================================================== */}

      <View style={styles.currentStatusCard}>
        <View
          style={[
            styles.currentStatusIcon,
            today.timeIn
              ? styles.currentStatusActive
              : styles.currentStatusWaiting,
          ]}
        >
          <Ionicons
            name={
              today.timeIn
                ? "checkmark"
                : "time-outline"
            }
            size={17}
            color={
              today.timeIn
                ? "#16A34A"
                : "#D97706"
            }
          />
        </View>

        <View
          style={styles.currentStatusContent}
        >
          <Text
            style={styles.currentStatusLabel}
          >
            YOUR ATTENDANCE
          </Text>

          <Text
            style={styles.currentStatusValue}
          >
            {statusText}
          </Text>
        </View>
      </View>

      {/* ======================================================
          F2F QR
      ====================================================== */}

      {!isOnline &&
        isAttendanceOpen && (
          <View style={styles.section}>
            <ParticipantQrCard
              participantCode={
                mockParticipant.userCode
              }
              participantName={
                mockParticipant.fullName
              }
              sessionOpen={
                isAttendanceOpen
              }
            />

            <Pressable
              onPress={handleQrInfo}
              style={styles.qrNotice}
            >
              <View
                style={styles.qrNoticeIcon}
              >
                <Ionicons
                  name="scan-outline"
                  size={15}
                  color="#7C3AED"
                />
              </View>

              <View
                style={styles.qrNoticeContent}
              >
                <Text
                  style={
                    styles.qrNoticeTitle
                  }
                >
                  Optional QR Attendance
                </Text>

                <Text
                  style={
                    styles.qrNoticeText
                  }
                >
                  Your trainer scans your QR
                  code during face-to-face
                  training. You do not scan
                  the trainer's QR code.
                </Text>
              </View>
            </Pressable>
          </View>
        )}

      {/* ======================================================
          ONLINE
      ====================================================== */}

      {isOnline && (
        <View style={styles.section}>
          <View style={styles.onlineInfo}>
            <View
              style={styles.onlineIcon}
            >
              <Ionicons
                name="globe-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View
              style={styles.onlineContent}
            >
              <Text
                style={styles.onlineTitle}
              >
                Online Attendance
              </Text>

              <Text
                style={styles.onlineText}
              >
                When your trainer opens
                attendance, you can record
                your Time In and Time Out
                directly from this screen.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <View style={styles.section}>
        <AttendanceSummary
          attendance={today}
        />
      </View>

      {/* ======================================================
          HISTORY
      ====================================================== */}

      <View style={styles.section}>
        <AttendanceHistory
          history={attendance}
        />
      </View>

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <View style={styles.info}>
        <Ionicons
          name="shield-checkmark-outline"
          size={17}
          color="#2563EB"
        />

        <Text style={styles.infoText}>
          Attendance can only be recorded while
          the trainer's attendance session is
          open. Participants may use Time In and
          Time Out directly. For face-to-face
          training, the participant QR is an
          optional alternative for trainer
          scanning.
        </Text>
      </View>
    </ScrollView>
  );
}


/* ============================================================
   CURRENT TIME
============================================================ */

function getCurrentTime() {
  return new Date().toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#2563EB",
  },

  title: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SESSION STATUS */

  sessionStatusCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  sessionStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  openIcon: {
    backgroundColor: "#DCFCE7",
  },

  closedIcon: {
    backgroundColor: "#F1F5F9",
  },

  sessionStatusContent: {
    flex: 1,
    marginLeft: 9,
    paddingRight: 5,
  },

  sessionStatusLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  sessionStatusTitle: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "800",
    color: "#334155",
  },

  sessionStatusText: {
    marginTop: 2,
    fontSize: 6.5,
    lineHeight: 10,
    color: "#94A3B8",
  },

  openBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
  },

  openBadgeActive: {
    backgroundColor: "#DCFCE7",
  },

  openBadgeClosed: {
    backgroundColor: "#F1F5F9",
  },

  openBadgeText: {
    fontSize: 5.5,
    fontWeight: "900",
  },

  openBadgeTextActive: {
    color: "#15803D",
  },

  openBadgeTextClosed: {
    color: "#64748B",
  },

  /* CURRENT STATUS */

  currentStatusCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  currentStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  currentStatusActive: {
    backgroundColor: "#DCFCE7",
  },

  currentStatusWaiting: {
    backgroundColor: "#FEF3C7",
  },

  currentStatusContent: {
    marginLeft: 8,
  },

  currentStatusLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#94A3B8",
  },

  currentStatusValue: {
    marginTop: 2,
    fontSize: 8,
    fontWeight: "800",
    color: "#334155",
  },

  section: {
    marginTop: 20,
  },

  /* QR */

  qrNotice: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  qrNoticeIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  qrNoticeContent: {
    flex: 1,
    marginLeft: 8,
  },

  qrNoticeTitle: {
    fontSize: 8,
    fontWeight: "800",
    color: "#6B21A8",
  },

  qrNoticeText: {
    marginTop: 2,
    fontSize: 6.5,
    lineHeight: 10,
    color: "#9333EA",
  },

  /* ONLINE */

  onlineInfo: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    gap: 10,
  },

  onlineIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  onlineContent: {
    flex: 1,
  },

  onlineTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E40AF",
  },

  onlineText: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 14,
    color: "#475569",
  },

  /* INFO */

  info: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 14,
    color: "#64748B",
  },

  /* EMPTY */

  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
  },

  emptyText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 14,
    color: "#94A3B8",
  },
});