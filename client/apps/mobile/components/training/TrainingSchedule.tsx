"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  TrainingSession,
} from "@repo/types";

import {
  trainingBatchApi,
} from "@/api/api";

interface TrainingScheduleProps {
  trainingBatchId: string;
  refreshKey?: number;
}

type SessionStatus =
  | "ongoing"
  | "today"
  | "upcoming";

interface SessionInfo {
  session: TrainingSession;
  startDateTime: Date;
  endDateTime: Date;
  status: SessionStatus;
}

/**
 * Safely creates a local Date from a DateOnly value
 * such as:
 * 2026-10-08
 */
const getLocalDateParts = (
  value: string,
) => {
  const raw = String(value ?? "").slice(0, 10);

  const parts = raw.split("-");

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  return {
    year,
    month: month - 1,
    day,
  };
};

/**
 * Combines:
 *
 * sessionDate = 2026-10-08
 * startTime   = 09:00:00
 *
 * into a local Date.
 */
const buildDateTime = (
  dateValue: string,
  timeValue: string,
) => {
  const {
    year,
    month,
    day,
  } = getLocalDateParts(dateValue);

  const timeParts = String(
    timeValue ?? "00:00:00",
  ).split(":");

  const hour = Number(
    timeParts[0] ?? 0,
  );

  const minute = Number(
    timeParts[1] ?? 0,
  );

  const second = Number(
    String(
      timeParts[2] ?? "0",
    ).split(".")[0],
  );

  return new Date(
    year,
    month,
    day,
    hour,
    minute,
    second,
  );
};

const isSameDay = (
  first: Date,
  second: Date,
) => {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
};

const formatDate = (
  value: string,
) => {
  const date = buildDateTime(
    value,
    "00:00:00",
  );

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
};

const formatTime = (
  value: string,
) => {
  const timeParts = String(
    value ?? "00:00:00",
  ).split(":");

  const hour = Number(
    timeParts[0] ?? 0,
  );

  const minute = Number(
    timeParts[1] ?? 0,
  );

  const date = new Date();

  date.setHours(
    hour,
    minute,
    0,
    0,
  );

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
};

export default function TrainingSchedule({
  trainingBatchId,
  refreshKey = 0,
}: TrainingScheduleProps) {
  const [
    sessions,
    setSessions,
  ] = useState<TrainingSession[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  /**
   * FETCH TRAINING SCHEDULE
   */
  const loadSchedule = useCallback(
    async () => {
      if (!trainingBatchId) {
        setSessions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "================================",
        );

        console.log(
          "FETCHING PARTICIPANT SCHEDULE",
        );

        console.log(
          "Training Batch ID:",
          trainingBatchId,
        );

        const response =
          await trainingBatchApi.getParticipantSchedule(
            trainingBatchId,
          );

        console.log(
          "SCHEDULE RESPONSE:",
          response,
        );

        console.log(
          "SESSION COUNT:",
          response?.length ?? 0,
        );

        console.log(
          "================================",
        );

        setSessions(
          Array.isArray(response)
            ? response
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load participant schedule:",
          err,
        );

        setError(
          "Unable to load your upcoming session.",
        );

        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [trainingBatchId],
  );

  /**
   * FETCH WHEN COMPONENT LOADS
   * OR WHEN REFRESH KEY CHANGES
   */
  useEffect(() => {
    loadSchedule();
  }, [
    loadSchedule,
    refreshKey,
  ]);

  /**
   * FIND THE NEXT / CURRENT SESSION
   */
  const upcomingSession =
    useMemo<SessionInfo | null>(() => {
      if (!sessions.length) {
        return null;
      }

      const now = new Date();

      const processedSessions =
        sessions
          .map((session) => {
            const startDateTime =
              buildDateTime(
                session.sessionDate,
                session.startTime,
              );

            const endDateTime =
              buildDateTime(
                session.sessionDate,
                session.endTime,
              );

            let status: SessionStatus =
              "upcoming";

            if (
              now >= startDateTime &&
              now <= endDateTime
            ) {
              status = "ongoing";
            } else if (
              isSameDay(
                startDateTime,
                now,
              ) &&
              startDateTime > now
            ) {
              status = "today";
            }

            return {
              session,
              startDateTime,
              endDateTime,
              status,
            };
          })
          .sort(
            (a, b) =>
              a.startDateTime.getTime() -
              b.startDateTime.getTime(),
          );

      /**
       * First priority:
       * currently ongoing session
       */
      const ongoing =
        processedSessions.find(
          (item) =>
            item.status ===
            "ongoing",
        );

      if (ongoing) {
        return ongoing;
      }

      /**
       * Second priority:
       * nearest future session
       */
      const next =
        processedSessions.find(
          (item) =>
            item.startDateTime >
            now,
        );

      return next ?? null;
    }, [sessions]);

  /**
   * LOADING
   */
  if (isLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator
          size="small"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading upcoming session...
        </Text>
      </View>
    );
  }

  /**
   * ERROR
   */
  if (error) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color="#DC2626"
          />
        </View>

        <Text style={styles.emptyTitle}>
          Unable to Load Session
        </Text>

        <Text style={styles.emptyText}>
          {error}
        </Text>
      </View>
    );
  }

  /**
   * NO SESSIONS RETURNED BY API
   */
  if (sessions.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color="#64748B"
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Scheduled Session
        </Text>

        <Text style={styles.emptyText}>
          Your training schedule is not
          available yet.
        </Text>
      </View>
    );
  }

  /**
   * ALL SESSIONS ARE ALREADY FINISHED
   */
  if (!upcomingSession) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="checkmark-circle-outline"
            size={24}
            color="#16A34A"
          />
        </View>

        <Text style={styles.emptyTitle}>
          Training Sessions Completed
        </Text>

        <Text style={styles.emptyText}>
          All scheduled sessions for this
          training have already finished.
        </Text>
      </View>
    );
  }

  const {
    session,
    status,
  } = upcomingSession;

  const statusLabel =
    status === "ongoing"
      ? "ONGOING"
      : status === "today"
        ? "TODAY"
        : "UPCOMING";

  const statusIcon =
    status === "ongoing"
      ? "radio-button-on-outline"
      : "calendar-outline";

  return (
    <View style={styles.card}>
      {/* TOP */}
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <View style={styles.calendarIcon}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.label}>
              NEXT SESSION
            </Text>

            <Text style={styles.sessionTitle}>
              Session {session.sessionNumber}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            status === "ongoing" &&
              styles.ongoingBadge,
            status === "today" &&
              styles.todayBadge,
          ]}
        >
          <Ionicons
            name={statusIcon}
            size={13}
            color={
              status === "ongoing"
                ? "#15803D"
                : "#2563EB"
            }
          />

          <Text
            style={[
              styles.statusText,
              status === "ongoing" &&
                styles.ongoingText,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* DATE */}
      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Ionicons
            name="calendar-clear-outline"
            size={18}
            color="#64748B"
          />
        </View>

        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>
            Date
          </Text>

          <Text style={styles.detailValue}>
            {formatDate(
              session.sessionDate,
            )}
          </Text>
        </View>
      </View>

      {/* TIME */}
      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Ionicons
            name="time-outline"
            size={18}
            color="#64748B"
          />
        </View>

        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>
            Time
          </Text>

          <Text style={styles.detailValue}>
            {formatTime(
              session.startTime,
            )}{" "}
            -{" "}
            {formatTime(
              session.endTime,
            )}
          </Text>
        </View>
      </View>

      {/* DURATION */}
      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Ionicons
            name="hourglass-outline"
            size={18}
            color="#64748B"
          />
        </View>

        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>
            Duration
          </Text>

          <Text style={styles.detailValue}>
            {session.durationHours}{" "}
            {Number(
              session.durationHours,
            ) === 1
              ? "hour"
              : "hours"}
          </Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color="#64748B"
        />

        <Text style={styles.footerText}>
          Please be ready before the session
          starts.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
    alignItems: "center",
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 18,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  cardTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  calendarIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.7,
    marginBottom: 3,
  },

  sessionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
  },

  todayBadge: {
    backgroundColor: "#EFF6FF",
  },

  ongoingBadge: {
    backgroundColor: "#DCFCE7",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#2563EB",
    letterSpacing: 0.5,
  },

  ongoingText: {
    color: "#15803D",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  detailIcon: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },

  footerText: {
    flex: 1,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
});