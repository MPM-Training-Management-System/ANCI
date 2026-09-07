import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  TodayAttendance,
} from "@/src/data/participant";

interface Props {
  attendance: TodayAttendance;
  onTimeIn: () => void;
  onTimeOut: () => void;
}

export default function AttendanceSessionCard({
  attendance,
  onTimeIn,
  onTimeOut,
}: Props) {
  const isOnline =
    attendance.mode === "Online";

  const isOpen =
    attendance.sessionStatus === "Open";

  const timedIn =
    Boolean(attendance.timeIn);

  const timedOut =
    Boolean(attendance.timeOut);

  const complete =
    timedIn && timedOut;

  return (
    <View style={styles.card}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons
            name={
              isOnline
                ? "videocam-outline"
                : "business-outline"
            }
            size={21}
            color="#2563EB"
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>
            TODAY'S SESSION
          </Text>

          <Text style={styles.title}>
            {attendance.session}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isOpen
              ? styles.openBadge
              : styles.closedBadge,
          ]}
        >
          <View
            style={[
              styles.dot,
              isOpen
                ? styles.openDot
                : styles.closedDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              isOpen
                ? styles.openText
                : styles.closedText,
            ]}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </Text>
        </View>
      </View>

      {/* MODE */}

      <View style={styles.modeRow}>
        <View style={styles.modeBadge}>
          <Ionicons
            name={
              isOnline
                ? "globe-outline"
                : "location-outline"
            }
            size={13}
            color="#2563EB"
          />

          <Text style={styles.modeText}>
            {isOnline
              ? "Online Training"
              : "Face-to-Face Training"}
          </Text>
        </View>
      </View>

      {/* DETAILS */}

      <View style={styles.details}>
        <Detail
          icon="calendar-outline"
          text={attendance.date}
        />

        <Detail
          icon="time-outline"
          text={attendance.time}
        />

        <Detail
          icon={
            isOnline
              ? "videocam-outline"
              : "location-outline"
          }
          text={
            isOnline
              ? "Online Session"
              : attendance.venue
          }
        />

        <Detail
          icon="person-outline"
          text={`Trainer: ${attendance.trainer}`}
        />
      </View>

      {/* CLOSED */}

      {!isOpen && (
        <View style={styles.closedBox}>
          <Ionicons
            name="lock-closed-outline"
            size={19}
            color="#64748B"
          />

          <View style={styles.closedContent}>
            <Text style={styles.closedTitle}>
              Attendance is not open
            </Text>

            <Text style={styles.closedDescription}>
              Your trainer has not opened attendance
              for this session yet.
            </Text>
          </View>
        </View>
      )}

      {/* OPEN + NOT TIMED IN */}

      {isOpen && !timedIn && (
        <View style={styles.actionArea}>
          <View style={styles.note}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#2563EB"
            />

            <Text style={styles.noteText}>
              Attendance is open. You may time in
              directly from your phone.
            </Text>
          </View>

          <Pressable
            onPress={onTimeIn}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="log-in-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.buttonText}>
              Time In
            </Text>
          </Pressable>
        </View>
      )}

      {/* TIMED IN */}

      {isOpen &&
        timedIn &&
        !timedOut && (
          <View style={styles.timedArea}>
            <View style={styles.successBox}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark"
                  size={19}
                  color="#16A34A"
                />
              </View>

              <View style={styles.successContent}>
                <Text style={styles.successTitle}>
                  You're Timed In
                </Text>

                <Text style={styles.successText}>
                  Time In: {attendance.timeIn}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onTimeOut}
              style={({ pressed }) => [
                styles.timeOutButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#DC2626"
              />

              <Text style={styles.timeOutText}>
                Time Out
              </Text>
            </Pressable>
          </View>
        )}

      {/* COMPLETE */}

      {complete && (
        <View style={styles.completeBox}>
          <Ionicons
            name="checkmark-circle"
            size={27}
            color="#16A34A"
          />

          <Text style={styles.completeTitle}>
            Attendance Complete
          </Text>

          <Text style={styles.completeDescription}>
            Your attendance has been successfully
            recorded.
          </Text>

          <View style={styles.times}>
            <Time
              label="TIME IN"
              value={attendance.timeIn!}
            />

            <View style={styles.timeDivider} />

            <Time
              label="TIME OUT"
              value={attendance.timeOut!}
            />
          </View>
        </View>
      )}

      {/* F2F OPTIONAL QR NOTICE */}

      {isOpen &&
        !timedIn &&
        !isOnline && (
          <View style={styles.qrNotice}>
            <View style={styles.qrNoticeIcon}>
              <Ionicons
                name="qr-code-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <View style={styles.qrNoticeContent}>
              <Text style={styles.qrNoticeTitle}>
                QR is optional
              </Text>

              <Text style={styles.qrNoticeText}>
                You can use Time In above, or show
                your participant QR to your trainer
                if they prefer to scan you.
              </Text>
            </View>
          </View>
        )}
    </View>
  );
}

function Detail({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons
        name={icon}
        size={14}
        color="#64748B"
      />

      <Text style={styles.detailText}>
        {text}
      </Text>
    </View>
  );
}

function Time({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.time}>
      <Text style={styles.timeLabel}>
        {label}
      </Text>

      <Text style={styles.timeValue}>
        {value}
      </Text>
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
    alignItems: "center",
  },

  icon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  eyebrow: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#94A3B8",
  },

  title: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },

  openBadge: {
    backgroundColor: "#DCFCE7",
  },

  closedBadge: {
    backgroundColor: "#F1F5F9",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  openDot: {
    backgroundColor: "#16A34A",
  },

  closedDot: {
    backgroundColor: "#94A3B8",
  },

  statusText: {
    fontSize: 7,
    fontWeight: "900",
  },

  openText: {
    color: "#15803D",
  },

  closedText: {
    color: "#64748B",
  },

  modeRow: {
    marginTop: 14,
  },

  modeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF4FF",
  },

  modeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#2563EB",
  },

  details: {
    marginTop: 16,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 9,
  },

  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailText: {
    fontSize: 9,
    color: "#64748B",
  },

  closedBox: {
    marginTop: 16,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  closedContent: {
    flex: 1,
  },

  closedTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
  },

  closedDescription: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 13,
    color: "#94A3B8",
  },

  actionArea: {
    marginTop: 16,
  },

  note: {
    flexDirection: "row",
    gap: 7,
    alignItems: "flex-start",
    marginBottom: 10,
  },

  noteText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },

  primaryButton: {
    height: 49,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.75,
  },

  timedArea: {
    marginTop: 16,
  },

  successBox: {
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  successIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D",
  },

  successText: {
    marginTop: 3,
    fontSize: 8,
    color: "#64748B",
  },

  timeOutButton: {
    marginTop: 10,
    height: 49,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  timeOutText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#DC2626",
  },

  completeBox: {
    marginTop: 16,
    padding: 17,
    borderRadius: 17,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    alignItems: "center",
  },

  completeTitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#15803D",
  },

  completeDescription: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },

  times: {
    width: "100%",
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#DCFCE7",
    flexDirection: "row",
    alignItems: "center",
  },

  time: {
    flex: 1,
    alignItems: "center",
  },

  timeLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  timeValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  timeDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#DCFCE7",
  },

  qrNotice: {
    marginTop: 16,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    gap: 9,
  },

  qrNoticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  qrNoticeContent: {
    flex: 1,
  },

  qrNoticeTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
  },

  qrNoticeText: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 13,
    color: "#475569",
  },
});