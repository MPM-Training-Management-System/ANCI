"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { trainingBatchApi } from "@/api/api";

import type { TrainingSession } from "@repo/types";

interface TrainingScheduleProps {
  trainingBatchId: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function TrainingSchedule({
  trainingBatchId,
}: TrainingScheduleProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return {
      month: today.getMonth(),
      year: today.getFullYear(),
    };
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    if (!trainingBatchId) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      const result =
        await trainingBatchApi.getParticipantSchedule(
          trainingBatchId,
        );

      setSessions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(
        "LOAD TRAINING SCHEDULE ERROR:",
        error,
      );

      setSessions([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load training schedule.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [trainingBatchId]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadSchedule();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadSchedule]);

  const getDateKey = useCallback((value: string) => {
    const date = new Date(value);

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}`;
  }, []);

  const todayKey = useMemo(() => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(
      2,
      "0",
    )}`;
  }, []);

  const sessionDateKeys = useMemo(() => {
    const map = new Map<string, TrainingSession[]>();

    for (const session of sessions) {
      const key = getDateKey(session.sessionDate);

      const existing = map.get(key) ?? [];

      map.set(key, [...existing, session]);
    }

    return map;
  }, [sessions, getDateKey]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      currentMonth.year,
      currentMonth.month,
      1,
    );

    const lastDay = new Date(
      currentMonth.year,
      currentMonth.month + 1,
      0,
    );

    const firstWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{
      day: number | null;
      dateKey: string | null;
    }> = [];

    for (let i = 0; i < firstWeekday; i++) {
      days.push({
        day: null,
        dateKey: null,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${currentMonth.year}-${String(
        currentMonth.month + 1,
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      days.push({
        day,
        dateKey,
      });
    }

    while (days.length % 7 !== 0) {
      days.push({
        day: null,
        dateKey: null,
      });
    }

    return days;
  }, [currentMonth]);

  const selectedSessions = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return [...(sessionDateKeys.get(selectedDate) ?? [])].sort(
      (a, b) => {
        if (
          a.sessionNumber !== b.sessionNumber
        ) {
          return (
            a.sessionNumber -
            b.sessionNumber
          );
        }

        return (
          new Date(a.sessionDate).getTime() -
          new Date(b.sessionDate).getTime()
        );
      },
    );
  }, [selectedDate, sessionDateKeys]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) =>
        new Date(a.sessionDate).getTime() -
        new Date(b.sessionDate).getTime(),
    );
  }, [sessions]);

  const firstSessionDate = sortedSessions[0]
    ? new Date(sortedSessions[0].sessionDate)
    : null;

  const lastSessionDate = sortedSessions[
    sortedSessions.length - 1
  ]
    ? new Date(
        sortedSessions[
          sortedSessions.length - 1
        ].sessionDate,
      )
    : null;

  const changeMonth = useCallback((direction: number) => {
    setCurrentMonth((current) => {
      const date = new Date(
        current.year,
        current.month + direction,
        1,
      );

      return {
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    });

    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();

    setCurrentMonth({
      month: today.getMonth(),
      year: today.getFullYear(),
    });

    setSelectedDate(todayKey);
  }, [todayKey]);

  const formatTime = useCallback((value: string) => {
    const date = new Date(
      `1970-01-01T${value}`,
    );

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }, []);

  const formatSelectedDate = useCallback(
    (value: string) => {
      const date = new Date(
        `${value}T00:00:00`,
      );

      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    },
    [],
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="small"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading schedule...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="calendar"
              size={20}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.title}>
              Training Schedule
            </Text>

            <Text style={styles.subtitle}>
              Your assigned training sessions
            </Text>
          </View>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {sessions.length}
          </Text>

          <Text style={styles.countLabel}>
            sessions
          </Text>
        </View>
      </View>

      {/* ERROR */}

      {error && (
        <View style={styles.errorCard}>
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {/* EMPTY */}

      {!error && sessions.length === 0 && (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="calendar-outline"
              size={30}
              color="#94A3B8"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No Schedule Yet
          </Text>

          <Text style={styles.emptyText}>
            No training sessions have been
            scheduled yet.
          </Text>
        </View>
      )}

      {/* CALENDAR */}

      {!error && sessions.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
        >
          <View style={styles.calendarCard}>
            {/* MONTH HEADER */}

            <View style={styles.monthHeader}>
              <Pressable
                onPress={() => changeMonth(-1)}
                style={styles.monthButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color="#334155"
                />
              </Pressable>

              <View style={styles.monthCenter}>
                <Text style={styles.monthTitle}>
                  {MONTHS[currentMonth.month]}
                </Text>

                <Text style={styles.yearText}>
                  {currentMonth.year}
                </Text>
              </View>

              <Pressable
                onPress={() => changeMonth(1)}
                style={styles.monthButton}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#334155"
                />
              </Pressable>
            </View>

            {/* TODAY BUTTON */}

            <Pressable
              onPress={goToToday}
              style={styles.todayButton}
            >
              <Ionicons
                name="locate-outline"
                size={14}
                color="#2563EB"
              />

              <Text style={styles.todayButtonText}>
                Today
              </Text>
            </Pressable>

            {/* WEEK DAYS */}

            <View style={styles.weekRow}>
              {DAYS.map((day) => (
                <View
                  key={day}
                  style={styles.weekDay}
                >
                  <Text style={styles.weekDayText}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* CALENDAR DAYS */}

            <View style={styles.daysGrid}>
              {calendarDays.map(
                ({ day, dateKey }, index) => {
                  if (!day || !dateKey) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={styles.dayCell}
                      />
                    );
                  }

                  const daySessions =
                    sessionDateKeys.get(
                      dateKey,
                    ) ?? [];

                  const hasSession =
                    daySessions.length > 0;

                  const isToday =
                    dateKey === todayKey;

                  const isSelected =
                    dateKey === selectedDate;

                  return (
                    <Pressable
                      key={dateKey}
                      onPress={() =>
                        setSelectedDate(
                          dateKey,
                        )
                      }
                      style={[
                        styles.dayCell,
                        isSelected &&
                          styles.selectedDayCell,
                      ]}
                    >
                      <View
                        style={[
                          styles.dayNumber,
                          isToday &&
                            styles.todayCircle,
                          isSelected &&
                            styles.selectedDayNumber,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumberText,
                            isToday &&
                              styles.todayNumberText,
                            isSelected &&
                              styles.selectedDayNumberText,
                          ]}
                        >
                          {day}
                        </Text>
                      </View>

                      {hasSession && (
                        <View
                          style={[
                            styles.sessionDot,
                            isSelected &&
                              styles.selectedSessionDot,
                          ]}
                        />
                      )}

                      {hasSession && (
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.sessionCount,
                            isSelected &&
                              styles.selectedSessionCount,
                          ]}
                        >
                          {daySessions.length}
                          {daySessions.length ===
                          1
                            ? " session"
                            : " sessions"}
                        </Text>
                      )}
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* LEGEND */}

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendToday} />

                <Text style={styles.legendText}>
                  Today
                </Text>
              </View>

              <View style={styles.legendItem}>
                <View style={styles.legendSession} />

                <Text style={styles.legendText}>
                  Training session
                </Text>
              </View>
            </View>
          </View>

          {/* SELECTED DAY */}

          {selectedDate && (
            <View style={styles.selectedSection}>
              <View style={styles.selectedHeader}>
                <View>
                  <Text style={styles.selectedLabel}>
                    SELECTED DATE
                  </Text>

                  <Text style={styles.selectedTitle}>
                    {formatSelectedDate(
                      selectedDate,
                    )}
                  </Text>
                </View>

                <View
                  style={styles.selectedCount}
                >
                  <Text
                    style={styles.selectedCountText}
                  >
                    {selectedSessions.length}
                  </Text>
                </View>
              </View>

              {selectedSessions.length === 0 ? (
                <View style={styles.noSessionCard}>
                  <Ionicons
                    name="calendar-clear-outline"
                    size={24}
                    color="#94A3B8"
                  />

                  <Text
                    style={styles.noSessionText}
                  >
                    No training session on this
                    date.
                  </Text>
                </View>
              ) : (
                selectedSessions.map(
                  (session, index) => (
                    <View
                      key={session.id}
                      style={styles.sessionCard}
                    >
                      <View
                        style={styles.sessionNumber}
                      >
                        <Text
                          style={
                            styles.sessionNumberText
                          }
                        >
                          {session.sessionNumber ||
                            index + 1}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.sessionContent
                        }
                      >
                        <View
                          style={
                            styles.sessionTop
                          }
                        >
                          <View
                            style={
                              styles.sessionTitleWrap
                            }
                          >
                            <Text
                              style={
                                styles.sessionLabel
                              }
                            >
                              TRAINING SESSION
                            </Text>

                            <Text
                              style={
                                styles.sessionTitle
                              }
                            >
                              Session{" "}
                              {session.sessionNumber ||
                                index + 1}
                            </Text>
                          </View>

                          {selectedDate ===
                            todayKey && (
                            <View
                              style={
                                styles.todayBadge
                              }
                            >
                              <Text
                                style={
                                  styles.todayBadgeText
                                }
                              >
                                TODAY
                              </Text>
                            </View>
                          )}
                        </View>

                        <View
                          style={
                            styles.sessionDetails
                          }
                        >
                          <View
                            style={styles.detailItem}
                          >
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color="#2563EB"
                            />

                            <Text
                              style={
                                styles.detailText
                              }
                            >
                              {formatTime(
                                session.startTime,
                              )}{" "}
                              -{" "}
                              {formatTime(
                                session.endTime,
                              )}
                            </Text>
                          </View>

                          <View
                            style={styles.detailItem}
                          >
                            <Ionicons
                              name="hourglass-outline"
                              size={16}
                              color="#2563EB"
                            />

                            <Text
                              style={
                                styles.detailText
                              }
                            >
                              {
                                session.durationHours
                              }{" "}
                              hrs
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ),
                )
              )}
            </View>
          )}

          {/* TRAINING PERIOD */}

          {firstSessionDate &&
            lastSessionDate && (
              <View style={styles.periodCard}>
                <View style={styles.periodIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#2563EB"
                  />
                </View>

                <View style={styles.periodContent}>
                  <Text style={styles.periodLabel}>
                    TRAINING PERIOD
                  </Text>

                  <Text style={styles.periodText}>
                    {firstSessionDate.toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}{" "}
                    -{" "}
                    {lastSessionDate.toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </Text>
                </View>
              </View>
            )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginHorizontal: 20,
  },

  header: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9,
    color: "#94A3B8",
  },

  countBadge: {
    minWidth: 58,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2563EB",
  },

  countLabel: {
    marginTop: 1,
    fontSize: 7,
    fontWeight: "700",
    color: "#64748B",
  },

  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    overflow: "hidden",
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  monthCenter: {
    alignItems: "center",
  },

  monthTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },

  yearText: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
  },

  todayButton: {
    alignSelf: "center",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  todayButtonText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },

  weekRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 5,
  },

  weekDay: {
    width: "14.2857%",
    alignItems: "center",
  },

  weekDayText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.2857%",
    minHeight: 58,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 6,
    borderRadius: 12,
  },

  selectedDayCell: {
    backgroundColor: "#EFF6FF",
  },

  dayNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  todayCircle: {
    backgroundColor: "#2563EB",
  },

  selectedDayNumber: {
    backgroundColor: "#DBEAFE",
  },

  dayNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },

  todayNumberText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  selectedDayNumberText: {
    color: "#2563EB",
    fontWeight: "900",
  },

  sessionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginTop: 3,
  },

  selectedSessionDot: {
    backgroundColor: "#1D4ED8",
  },

  sessionCount: {
    marginTop: 2,
    fontSize: 5.5,
    fontWeight: "700",
    color: "#64748B",
  },

  selectedSessionCount: {
    color: "#2563EB",
  },

  legend: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendToday: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },

  legendSession: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#60A5FA",
  },

  legendText: {
    fontSize: 8,
    color: "#64748B",
    fontWeight: "600",
  },

  selectedSection: {
    marginTop: 14,
  },

  selectedHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#94A3B8",
  },

  selectedTitle: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },

  selectedCount: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedCountText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#2563EB",
  },

  sessionCard: {
    marginBottom: 10,
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
  },

  sessionNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sessionNumberText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#2563EB",
  },

  sessionContent: {
    flex: 1,
    marginLeft: 11,
  },

  sessionTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  sessionTitleWrap: {
    flex: 1,
  },

  sessionLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  sessionTitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "900",
    color: "#334155",
  },

  todayBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
  },

  todayBadgeText: {
    fontSize: 6,
    fontWeight: "900",
    color: "#15803D",
  },

  sessionDetails: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  detailText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
  },

  noSessionCard: {
    padding: 22,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  noSessionText: {
    marginTop: 8,
    fontSize: 9,
    color: "#94A3B8",
    textAlign: "center",
  },

  periodCard: {
    marginTop: 14,
    marginBottom: 20,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  periodIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  periodContent: {
    marginLeft: 10,
    flex: 1,
  },

  periodLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  periodText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
  },

  loading: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 25,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 8,
    fontSize: 9,
    color: "#94A3B8",
  },

  errorCard: {
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  errorText: {
    flex: 1,
    fontSize: 8,
    color: "#B91C1C",
  },

  empty: {
    padding: 28,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "900",
    color: "#334155",
  },

  emptyText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#94A3B8",
    lineHeight: 15,
  },
});