import React, { useMemo, useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

// ============================================================
// TYPES
// ============================================================

type AttendanceStatus =
  | "closed"
  | "ready"
  | "time-in"
  | "completed";

type AttendanceRecord = {
  id: string;
  date: string;
  training: string;
  timeIn: string;
  timeOut: string;
  status: "Present" | "Late" | "Absent";
};

// ============================================================
// MOCK SESSION
//
// true  = trainer opened attendance
// false = attendance is closed
//
// Change to false to test the locked state.
// ============================================================

const TRAINER_ATTENDANCE_OPEN = true;

// ============================================================
// MOCK TRAINING
// ============================================================

const TODAY_TRAINING = {
  id: "TRN-001",
  title: "Leadership Training",
  time: "9:00 AM - 4:00 PM",
  location: "Training Center",
  trainer: "Maria Santos",
};

// ============================================================
// MOCK PARTICIPANT
// ============================================================

const PARTICIPANT = {
  id: "PART-001",
  name: "Juan Dela Cruz",
};

// ============================================================
// MOCK ATTENDANCE HISTORY
// ============================================================

const ATTENDANCE_HISTORY: AttendanceRecord[] = [
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

// ============================================================
// SCREEN
// ============================================================

export default function AttendanceScreen() {
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus>(
      TRAINER_ATTENDANCE_OPEN
        ? "ready"
        : "closed",
    );

  const [timeIn, setTimeIn] = useState<string | null>(
    null,
  );

  const [timeOut, setTimeOut] = useState<string | null>(
    null,
  );

  // ==========================================================
  // DATE
  // ==========================================================

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );
  }, []);

  // ==========================================================
  // SESSION
  // ==========================================================

  const isAttendanceOpen =
    attendanceStatus !== "closed";

  const hasTimeIn =
    attendanceStatus === "time-in" ||
    attendanceStatus === "completed";

  const hasTimeOut =
    attendanceStatus === "completed";

  // ==========================================================
  // MANUAL TIME IN
  // ==========================================================

  function handleManualTimeIn() {
    if (!isAttendanceOpen) {
      Alert.alert(
        "Attendance Closed",
        "Your trainer has not opened the attendance session yet.",
      );

      return;
    }

    if (hasTimeIn) {
      Alert.alert(
        "Already Timed In",
        "Your Time In has already been recorded.",
      );

      return;
    }

    const recordedTime =
      new Date().toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      );

    setTimeIn(recordedTime);

    setAttendanceStatus("time-in");

    Alert.alert(
      "Time In Recorded",
      `Your attendance was recorded manually at ${recordedTime}.`,
    );
  }

  // ==========================================================
  // MANUAL TIME OUT
  // ==========================================================

  function handleManualTimeOut() {
    if (!isAttendanceOpen) {
      Alert.alert(
        "Attendance Closed",
        "Your trainer has not opened the attendance session.",
      );

      return;
    }

    if (!hasTimeIn) {
      Alert.alert(
        "Time In Required",
        "You need to record your Time In before recording your Time Out.",
      );

      return;
    }

    if (hasTimeOut) {
      Alert.alert(
        "Already Timed Out",
        "Your Time Out has already been recorded.",
      );

      return;
    }

    const recordedTime =
      new Date().toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      );

    setTimeOut(recordedTime);

    setAttendanceStatus("completed");

    Alert.alert(
      "Time Out Recorded",
      `Your attendance was completed at ${recordedTime}.`,
    );
  }

  // ==========================================================
  // RESET MOCK
  // ==========================================================

  function resetMockAttendance() {
    setTimeIn(null);
    setTimeOut(null);

    setAttendanceStatus(
      TRAINER_ATTENDANCE_OPEN
        ? "ready"
        : "closed",
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              Attendance
            </Text>

            <Text style={styles.subtitle}>
              Record your attendance for today's
              training session.
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

        {/* ====================================================
            ATTENDANCE SESSION STATUS
        ==================================================== */}

        <View
          style={[
            styles.sessionBanner,
            isAttendanceOpen
              ? styles.sessionOpen
              : styles.sessionClosed,
          ]}
        >
          <View
            style={[
              styles.sessionIcon,
              isAttendanceOpen
                ? styles.sessionIconOpen
                : styles.sessionIconClosed,
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

          <View style={styles.sessionInfo}>
            <Text
              style={[
                styles.sessionTitle,
                {
                  color: isAttendanceOpen
                    ? "#166534"
                    : "#334155",
                },
              ]}
            >
              {isAttendanceOpen
                ? "Attendance is Open"
                : "Attendance is Closed"}
            </Text>

            <Text
              style={[
                styles.sessionText,
                {
                  color: isAttendanceOpen
                    ? "#15803D"
                    : "#64748B",
                },
              ]}
            >
              {isAttendanceOpen
                ? `${TODAY_TRAINING.trainer} has opened attendance for this training.`
                : "Wait for your trainer to open the attendance session."}
            </Text>
          </View>

          {isAttendanceOpen && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                LIVE
              </Text>
            </View>
          )}
        </View>

        {/* ====================================================
            TODAY TRAINING
        ==================================================== */}

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
              {TODAY_TRAINING.title}
            </Text>

            <View style={styles.trainingDetails}>
              <View style={styles.detailRow}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color="#BFDBFE"
                />

                <Text style={styles.detailText}>
                  {TODAY_TRAINING.time}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color="#BFDBFE"
                />

                <Text style={styles.detailText}>
                  {TODAY_TRAINING.location}
                </Text>
              </View>
            </View>

            <View style={styles.trainerRow}>
              <Ionicons
                name="person-outline"
                size={13}
                color="#BFDBFE"
              />

              <Text style={styles.detailText}>
                Trainer:{" "}
                {TODAY_TRAINING.trainer}
              </Text>
            </View>
          </View>
        </View>

        {/* ====================================================
            PARTICIPANT QR
        ==================================================== */}

        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View style={styles.qrHeaderInfo}>
              <Text style={styles.qrTitle}>
                {hasTimeOut
                  ? "Attendance Complete"
                  : hasTimeIn
                    ? "Time Out QR"
                    : "Time In QR"}
              </Text>

              <Text style={styles.qrSubtitle}>
                {hasTimeOut
                  ? "Your attendance for today is complete."
                  : "Show this QR code to your trainer."}
              </Text>
            </View>

            <AttendanceBadge
              status={attendanceStatus}
            />
          </View>

          {/* ==================================================
              TIME IN QR
          ================================================== */}

          {!hasTimeIn && (
            <>
              <View style={styles.qrContainer}>
                <MockQRCode />

                <View style={styles.qrActionLabel}>
                  <Ionicons
                    name="log-in-outline"
                    size={16}
                    color="#16A34A"
                  />

                  <Text
                    style={styles.qrActionText}
                  >
                    TIME IN
                  </Text>
                </View>
              </View>

              <View style={styles.qrInstruction}>
                <Ionicons
                  name="scan-outline"
                  size={17}
                  color="#2563EB"
                />

                <Text
                  style={styles.qrInstructionText}
                >
                  Show this QR code to your
                  trainer. The trainer will scan
                  it to record your Time In.
                </Text>
              </View>
            </>
          )}

          {/* ==================================================
              TIME OUT QR
          ================================================== */}

          {hasTimeIn && !hasTimeOut && (
            <>
              <View style={styles.qrContainer}>
                <MockQRCode />

                <View
                  style={[
                    styles.qrActionLabel,
                    styles.qrTimeOutLabel,
                  ]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={16}
                    color="#2563EB"
                  />

                  <Text
                    style={[
                      styles.qrActionText,
                      styles.qrTimeOutText,
                    ]}
                  >
                    TIME OUT
                  </Text>
                </View>
              </View>

              <View style={styles.qrInstruction}>
                <Ionicons
                  name="scan-outline"
                  size={17}
                  color="#2563EB"
                />

                <Text
                  style={styles.qrInstructionText}
                >
                  Show this QR code to your
                  trainer before leaving. The
                  trainer will scan it to record
                  your Time Out.
                </Text>
              </View>
            </>
          )}

          {/* ==================================================
              COMPLETE
          ================================================== */}

          {hasTimeOut && (
            <View style={styles.completedBox}>
              <View style={styles.completedIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={42}
                  color="#16A34A"
                />
              </View>

              <Text
                style={styles.completedTitle}
              >
                Attendance Completed
              </Text>

              <Text
                style={styles.completedText}
              >
                Your Time In and Time Out have
                both been successfully recorded.
              </Text>
            </View>
          )}

          {/* ==================================================
              QR DETAILS
          ================================================== */}

          {isAttendanceOpen &&
            !hasTimeOut && (
              <View style={styles.qrDetails}>
                <View style={styles.qrDetail}>
                  <Text
                    style={styles.qrDetailLabel}
                  >
                    PARTICIPANT
                  </Text>

                  <Text
                    style={styles.qrDetailValue}
                  >
                    {PARTICIPANT.name}
                  </Text>
                </View>

                <View style={styles.qrDetail}>
                  <Text
                    style={styles.qrDetailLabel}
                  >
                    TRAINING
                  </Text>

                  <Text
                    style={styles.qrDetailValue}
                  >
                    {TODAY_TRAINING.id}
                  </Text>
                </View>
              </View>
            )}
        </View>

        {/* ====================================================
            MANUAL ATTENDANCE
        ==================================================== */}

        {isAttendanceOpen &&
          !hasTimeOut && (
            <View style={styles.manualSection}>
              <View style={styles.manualHeader}>
                <View style={styles.manualHeaderInfo}>
                  <Text
                    style={styles.sectionTitle}
                  >
                    Manual Attendance
                  </Text>

                  <Text
                    style={styles.manualSubtitle}
                  >
                    Available while your trainer
                    has attendance open.
                  </Text>
                </View>

                <View style={styles.manualBadge}>
                  <Ionicons
                    name="hand-left-outline"
                    size={12}
                    color="#D97706"
                  />

                  <Text
                    style={styles.manualBadgeText}
                  >
                    AVAILABLE
                  </Text>
                </View>
              </View>

              {/* TIME IN */}

              {!hasTimeIn && (
                <Pressable
                  style={({ pressed }) => [
                    styles.manualButton,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                  onPress={
                    handleManualTimeIn
                  }
                >
                  <View
                    style={
                      styles.manualButtonIcon
                    }
                  >
                    <Ionicons
                      name="log-in-outline"
                      size={22}
                      color="#16A34A"
                    />
                  </View>

                  <View
                    style={
                      styles.manualButtonInfo
                    }
                  >
                    <Text
                      style={
                        styles.manualButtonTitle
                      }
                    >
                      Time In Manually
                    </Text>

                    <Text
                      style={
                        styles.manualButtonText
                      }
                    >
                      Record your arrival without
                      using the QR code.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                  />
                </Pressable>
              )}

              {/* TIME OUT */}

              {hasTimeIn && !hasTimeOut && (
                <Pressable
                  style={({ pressed }) => [
                    styles.manualButton,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                  onPress={
                    handleManualTimeOut
                  }
                >
                  <View
                    style={[
                      styles.manualButtonIcon,
                      styles.manualTimeOutIcon,
                    ]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#2563EB"
                    />
                  </View>

                  <View
                    style={
                      styles.manualButtonInfo
                    }
                  >
                    <Text
                      style={
                        styles.manualButtonTitle
                      }
                    >
                      Time Out Manually
                    </Text>

                    <Text
                      style={
                        styles.manualButtonText
                      }
                    >
                      Record your departure without
                      using the QR code.
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                  />
                </Pressable>
              )}
            </View>
          )}

        {/* ====================================================
            TODAY ATTENDANCE
        ==================================================== */}

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>
            Today's Attendance
          </Text>

          <View style={styles.timeCards}>
            <TimeCard
              type="in"
              value={timeIn ?? "--:--"}
              status={
                timeIn
                  ? "Recorded"
                  : isAttendanceOpen
                    ? "Waiting"
                    : "Unavailable"
              }
            />

            <TimeCard
              type="out"
              value={timeOut ?? "--:--"}
              status={
                timeOut
                  ? "Recorded"
                  : timeIn
                    ? "Waiting"
                    : "Unavailable"
              }
            />
          </View>
        </View>

        {/* ====================================================
            ATTENDANCE HISTORY
        ==================================================== */}

        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Attendance History
            </Text>

            <Text style={styles.historySubtitle}>
              Your previous training attendance.
            </Text>
          </View>

          <View style={styles.historyCount}>
            <Text
              style={styles.historyCountText}
            >
              {ATTENDANCE_HISTORY.length}
            </Text>
          </View>
        </View>

        <View style={styles.historyList}>
          {ATTENDANCE_HISTORY.map(
            (record) => (
              <AttendanceHistoryItem
                key={record.id}
                record={record}
              />
            ),
          )}
        </View>

        {/* ====================================================
            SECURITY
        ==================================================== */}

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color="#16A34A"
            />
          </View>

          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>
              Secure Attendance
            </Text>

            <Text style={styles.securityText}>
              Your QR is generated for your
              participant account and current
              training session. Only your assigned
              trainer can scan it.
            </Text>
          </View>
        </View>

        {/* ====================================================
            MOCK RESET
        ==================================================== */}

        <Pressable
          style={styles.resetButton}
          onPress={resetMockAttendance}
        >
          <Ionicons
            name="refresh-outline"
            size={15}
            color="#94A3B8"
          />

          <Text style={styles.resetText}>
            Reset Mock Attendance
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// MOCK QR
// ============================================================
//
// UI MOCK ONLY.
// Later replace this with an actual QR generator.
//
// Payload should eventually contain:
//
// sessionId
// participantId
// action
//
// Example:
//
// {
//   sessionId: "ATT-SESSION-001",
//   participantId: "PART-001",
//   action: "TIME_IN"
// }
//
// ============================================================

function MockQRCode() {
  const blocks = [
    1, 1, 0, 1, 1, 1, 0, 1, 0, 1,
    0, 1, 1, 0, 1, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 0, 0, 1, 1, 1, 0,
    0, 1, 1, 0, 1, 1, 0, 1, 0, 1,
    1, 1, 0, 0, 1, 0, 1, 1, 0, 0,
    0, 1, 0, 1, 1, 0, 0, 1, 1, 1,
    1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
    0, 1, 1, 1, 0, 1, 0, 1, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 0, 1, 1,
    0, 1, 0, 1, 0, 1, 1, 1, 0, 0,
  ];

  return (
    <View style={styles.mockQr}>
      <View style={styles.qrFinderTopLeft}>
        <View style={styles.finderInner} />
      </View>

      <View style={styles.qrFinderTopRight}>
        <View style={styles.finderInner} />
      </View>

      <View style={styles.qrFinderBottomLeft}>
        <View style={styles.finderInner} />
      </View>

      <View style={styles.qrBlocks}>
        {blocks.map((block, index) => (
          <View
            key={index}
            style={[
              styles.qrBlock,
              block === 1
                ? styles.qrBlockFilled
                : styles.qrBlockEmpty,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================================
// ATTENDANCE BADGE
// ============================================================

function AttendanceBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  let label = "CLOSED";
  let backgroundColor = "#F1F5F9";
  let color = "#64748B";

  if (status === "ready") {
    label = "READY";
    backgroundColor = "#FEF3C7";
    color = "#D97706";
  }

  if (status === "time-in") {
    label = "TIME IN";
    backgroundColor = "#DCFCE7";
    color = "#16A34A";
  }

  if (status === "completed") {
    label = "DONE";
    backgroundColor = "#DBEAFE";
    color = "#2563EB";
  }

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor,
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

// ============================================================
// TIME CARD
// ============================================================

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

// ============================================================
// HISTORY ITEM
// ============================================================

function AttendanceHistoryItem({
  record,
}: {
  record: AttendanceRecord;
}) {
  const isPresent =
    record.status === "Present";

  const isLate =
    record.status === "Late";

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
      <View style={styles.historyDate}>
        <View style={styles.historyCalendar}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#2563EB"
          />
        </View>

        <Text
          style={styles.historyDateText}
        >
          {record.date}
        </Text>
      </View>

      <Text style={styles.historyTraining}>
        {record.training}
      </Text>

      <View style={styles.historyTimes}>
        <View style={styles.historyTime}>
          <Ionicons
            name="log-in-outline"
            size={14}
            color="#16A34A"
          />

          <View>
            <Text
              style={styles.historyTimeLabel}
            >
              TIME IN
            </Text>

            <Text
              style={styles.historyTimeValue}
            >
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
            <Text
              style={styles.historyTimeLabel}
            >
              TIME OUT
            </Text>

            <Text
              style={styles.historyTimeValue}
            >
              {record.timeOut}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.historyStatus,
          {
            backgroundColor:
              statusBackground,
          },
        ]}
      >
        <View
          style={[
            styles.historyStatusDot,
            {
              backgroundColor:
                statusColor,
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

// ============================================================
// STYLES
// ============================================================

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

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerInfo: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
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

  // ==========================================================
  // SESSION
  // ==========================================================

  sessionBanner: {
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 12,
  },

  sessionOpen: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },

  sessionClosed: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },

  sessionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sessionIconOpen: {
    backgroundColor: "#DCFCE7",
  },

  sessionIconClosed: {
    backgroundColor: "#E2E8F0",
  },

  sessionInfo: {
    flex: 1,
  },

  sessionTitle: {
    fontSize: 12,
    fontWeight: "800",
  },

  sessionText: {
    fontSize: 8,
    lineHeight: 13,
    marginTop: 2,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    marginLeft: 5,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 4,
  },

  liveText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#16A34A",
  },

  // ==========================================================
  // TRAINING
  // ==========================================================

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
    backgroundColor:
      "rgba(255,255,255,0.15)",
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
    letterSpacing: 0.8,
  },

  trainingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 3,
  },

  trainingDetails: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    flexWrap: "wrap",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  detailText: {
    color: "#DBEAFE",
    fontSize: 9,
  },

  // ==========================================================
  // QR CARD
  // ==========================================================

  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  qrHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  qrHeaderInfo: {
    flex: 1,
    paddingRight: 10,
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

  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 18,
  },

  mockQr: {
    width: 205,
    height: 205,
    backgroundColor: "#FFFFFF",
    borderRadius: 7,
    padding: 10,
    position: "relative",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  qrFinderTopLeft: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 47,
    height: 47,
    borderWidth: 7,
    borderColor: "#0F172A",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  qrFinderTopRight: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 47,
    height: 47,
    borderWidth: 7,
    borderColor: "#0F172A",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  qrFinderBottomLeft: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 47,
    height: 47,
    borderWidth: 7,
    borderColor: "#0F172A",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  finderInner: {
    width: 18,
    height: 18,
    backgroundColor: "#0F172A",
  },

  qrBlocks: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    paddingTop: 4,
  },

  qrBlock: {
    width: 15,
    height: 15,
  },

  qrBlockFilled: {
    backgroundColor: "#0F172A",
  },

  qrBlockEmpty: {
    backgroundColor: "#FFFFFF",
  },

  qrActionLabel: {
    marginTop: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#DCFCE7",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  qrActionText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#16A34A",
    letterSpacing: 0.8,
  },

  qrTimeOutLabel: {
    backgroundColor: "#DBEAFE",
  },

  qrTimeOutText: {
    color: "#2563EB",
  },

  qrInstruction: {
    marginTop: 12,
    padding: 11,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  qrInstructionText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 14,
    color: "#1E40AF",
    marginLeft: 7,
  },

  qrDetails: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 11,
  },

  qrDetail: {
    flex: 1,
  },

  qrDetailLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: "#94A3B8",
  },

  qrDetailValue: {
    fontSize: 9,
    fontWeight: "700",
    color: "#334155",
    marginTop: 2,
  },

  completedBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  completedIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  completedTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#166534",
    marginTop: 10,
  },

  completedText: {
    textAlign: "center",
    fontSize: 9,
    lineHeight: 14,
    color: "#15803D",
    marginTop: 4,
  },

  // ==========================================================
  // MANUAL
  // ==========================================================

  manualSection: {
    marginTop: 23,
  },

  manualHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  manualHeaderInfo: {
    flex: 1,
    paddingRight: 8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  manualSubtitle: {
    fontSize: 9,
    lineHeight: 14,
    color: "#94A3B8",
    marginTop: 3,
  },

  manualBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
  },

  manualBadgeText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#D97706",
  },

  manualButton: {
    minHeight: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  manualButtonIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  manualTimeOutIcon: {
    backgroundColor: "#DBEAFE",
  },

  manualButtonInfo: {
    flex: 1,
  },

  manualButtonTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  manualButtonText: {
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
    marginTop: 3,
  },

  buttonPressed: {
    opacity: 0.7,
  },

  // ==========================================================
  // TODAY
  // ==========================================================

  todaySection: {
    marginTop: 27,
  },

  timeCards: {
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

  // ==========================================================
  // HISTORY
  // ==========================================================

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

  // ==========================================================
  // SECURITY
  // ==========================================================

  securityCard: {
    marginTop: 18,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  securityIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
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

  // ==========================================================
  // MOCK RESET
  // ==========================================================

  resetButton: {
    marginTop: 18,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  resetText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
  },

  bottomSpace: {
    height: 30,
  },
});