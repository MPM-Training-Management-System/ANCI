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

import { useEnrollments } from "@repo/hooks";

import {
  enrollmentApi,
  trainingBatchApi,
} from "@/api/api";

import type {
  Enrollment,
  TrainingSession,
} from "@repo/types";

export default function ScheduleScreen() {
  // ============================================================
  // ENROLLMENTS
  // ============================================================

  const {
    enrollments,
    loadMyEnrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentError,
  } = useEnrollments(enrollmentApi);

  // ============================================================
  // SCHEDULE
  // ============================================================

  const [
    sessions,
    setSessions,
  ] = useState<TrainingSession[]>([]);

  const [
    isLoadingSchedule,
    setIsLoadingSchedule,
  ] = useState(false);

  const [
    scheduleError,
    setScheduleError,
  ] = useState<string | null>(null);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  // ============================================================
  // CURRENT APPROVED ENROLLMENT
  // ============================================================

  const currentEnrollment =
    useMemo(() => {
      const list =
        (enrollments ?? []) as Enrollment[];

      return (
        list.find(
          item =>
            String(item.status).toLowerCase() ===
            "approved",
        ) ?? null
      );
    }, [enrollments]);

  // ============================================================
  // BATCH ID
  // ============================================================

  const batchId =
    currentEnrollment?.trainingBatchId ?? null;

  // ============================================================
  // LOAD SCHEDULE
  // ============================================================

  const loadSchedule =
    useCallback(
      async () => {
        if (!batchId) {
          setSessions([]);
          return;
        }

        try {
          setIsLoadingSchedule(true);
          setScheduleError(null);

          const result =
            await trainingBatchApi.getParticipantSchedule(
              batchId,
            );

          setSessions(
            Array.isArray(result)
              ? result
              : [],
          );
        } catch (error) {
          console.error(
            "LOAD PARTICIPANT SCHEDULE ERROR:",
            error,
          );

          setSessions([]);

          setScheduleError(
            error instanceof Error
              ? error.message
              : "Unable to load your training schedule.",
          );
        } finally {
          setIsLoadingSchedule(false);
        }
      },
      [batchId],
    );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void loadMyEnrollments();
  }, [
    loadMyEnrollments,
  ]);

  // ============================================================
  // LOAD SCHEDULE AFTER ENROLLMENT
  // ============================================================

  useEffect(() => {
    if (!batchId) {
      setSessions([]);
      return;
    }

    void loadSchedule();
  }, [
    batchId,
    loadSchedule,
  ]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh =
    useCallback(
      async () => {
        try {
          setIsRefreshing(true);

          await loadMyEnrollments();

          await loadSchedule();
        } catch (error) {
          console.error(
            "SCHEDULE REFRESH ERROR:",
            error,
          );
        } finally {
          setIsRefreshing(false);
        }
      },
      [
        loadMyEnrollments,
        loadSchedule,
      ],
    );

  // ============================================================
  // SORT SESSIONS
  // ============================================================

  const sortedSessions =
    useMemo(() => {
      return [...sessions].sort(
        (a, b) => {
          if (
            a.sessionNumber !==
            b.sessionNumber
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
    }, [sessions]);

  // ============================================================
  // TODAY
  // ============================================================

  const todayKey =
    useMemo(() => {
      const now = new Date();

      return `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}-${String(
        now.getDate(),
      ).padStart(2, "0")}`;
    }, []);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate =
    (value: string) => {
      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return value;
      }

      return date.toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      );
    };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime =
    (value: string) => {
      const date =
        new Date(
          `1970-01-01T${value}`,
        );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return value;
      }

      return date.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        },
      );
    };

  // ============================================================
  // SESSION DATE KEY
  // ============================================================

  const getDateKey =
    (value: string) => {
      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return null;
      }

      return `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    isLoadingEnrollments ||
    isLoadingSchedule
  ) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <View
          style={styles.loadingIcon}
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />
        </View>

        <Text
          style={styles.loadingTitle}
        >
          Loading Schedule
        </Text>

        <Text
          style={styles.loadingText}
        >
          Loading your training schedule...
        </Text>
      </View>
    );
  }

  // ============================================================
  // ENROLLMENT ERROR
  // ============================================================

  if (
    enrollmentError &&
    !currentEnrollment
  ) {
    return (
      <View
        style={styles.emptyContainer}
      >
        <View
          style={styles.emptyIcon}
        >
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text
          style={styles.emptyTitle}
        >
          Unable to Load Schedule
        </Text>

        <Text
          style={styles.emptyText}
        >
          {String(enrollmentError)}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() =>
            void handleRefresh()
          }
        >
          <Text
            style={styles.retryButtonText}
          >
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  // ============================================================
  // NO APPROVED ENROLLMENT
  // ============================================================

  if (!currentEnrollment) {
    return (
      <View
        style={styles.emptyContainer}
      >
        <View
          style={styles.emptyIcon}
        >
          <Ionicons
            name="calendar-outline"
            size={30}
            color="#94A3B8"
          />
        </View>

        <Text
          style={styles.emptyTitle}
        >
          No Training Schedule
        </Text>

        <Text
          style={styles.emptyText}
        >
          Your training schedule will appear
          here after your enrollment has been
          approved.
        </Text>
      </View>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={
            isRefreshing
          }
          onRefresh={
            handleRefresh
          }
        />
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >
        <View>
          <Text
            style={styles.title}
          >
            My Schedule
          </Text>

          <Text
            style={styles.subtitle}
          >
            View your training sessions.
          </Text>
        </View>

        <Pressable
          onPress={() =>
            void handleRefresh()
          }
          disabled={
            isRefreshing
          }
          style={[
            styles.refreshButton,
            isRefreshing
              ? styles.refreshButtonDisabled
              : null,
          ]}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color="#2563EB"
          />
        </Pressable>
      </View>

      {/* ======================================================
          TRAINING
      ====================================================== */}

      <View
        style={styles.trainingCard}
      >
        <View
          style={styles.trainingIcon}
        >
          <Ionicons
            name="school-outline"
            size={20}
            color="#2563EB"
          />
        </View>

        <View
          style={styles.trainingContent}
        >
          <Text
            style={styles.trainingLabel}
          >
            TRAINING
          </Text>

          <Text
            style={styles.trainingName}
          >
            {currentEnrollment.programName}
          </Text>

          <Text
            style={styles.trainingBatch}
          >
            Batch {currentEnrollment.batchCode}
          </Text>
        </View>
      </View>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {scheduleError && (
        <View
          style={styles.errorCard}
        >
          <Ionicons
            name="alert-circle-outline"
            size={19}
            color="#DC2626"
          />

          <Text
            style={styles.errorText}
          >
            {scheduleError}
          </Text>
        </View>
      )}

      {/* ======================================================
          SCHEDULE COUNT
      ====================================================== */}

      <View
        style={styles.scheduleHeader}
      >
        <View>
          <Text
            style={styles.scheduleTitle}
          >
            Training Sessions
          </Text>

          <Text
            style={styles.scheduleSubtitle}
          >
            {sortedSessions.length}{" "}
            {sortedSessions.length === 1
              ? "session"
              : "sessions"}{" "}
            scheduled
          </Text>
        </View>

        <View
          style={styles.countBadge}
        >
          <Text
            style={styles.countBadgeText}
          >
            {sortedSessions.length}
          </Text>
        </View>
      </View>

      {/* ======================================================
          EMPTY SCHEDULE
      ====================================================== */}

      {sortedSessions.length === 0 ? (
        <View
          style={styles.noScheduleCard}
        >
          <View
            style={styles.noScheduleIcon}
          >
            <Ionicons
              name="calendar-outline"
              size={28}
              color="#94A3B8"
            />
          </View>

          <Text
            style={styles.noScheduleTitle}
          >
            No Schedule Yet
          </Text>

          <Text
            style={styles.noScheduleText}
          >
            Your trainer has not added any
            training sessions yet.
          </Text>
        </View>
      ) : (
        <>
          {/* ==================================================
              SESSIONS
          ================================================== */}

          {sortedSessions.map(
            (
              session,
              index,
            ) => {
              const isToday =
                getDateKey(
                  session.sessionDate,
                ) === todayKey;

              return (
                <View
                  key={
                    session.id
                  }
                  style={[
                    styles.sessionCard,
                    isToday
                      ? styles.sessionCardToday
                      : null,
                  ]}
                >
                  {/* SESSION NUMBER */}

                  <View
                    style={
                      styles.sessionNumber
                    }
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

                  {/* SESSION CONTENT */}

                  <View
                    style={
                      styles.sessionContent
                    }
                  >
                    <View
                      style={
                        styles.sessionTopRow
                      }
                    >
                      <View
                        style={
                          styles.sessionTitleContainer
                        }
                      >
                        <Text
                          style={
                            styles.sessionLabel
                          }
                        >
                          SESSION{" "}
                          {session.sessionNumber ||
                            index + 1}
                        </Text>

                        <Text
                          style={
                            styles.sessionDate
                          }
                        >
                          {formatDate(
                            session.sessionDate,
                          )}
                        </Text>
                      </View>

                      {isToday && (
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

                    {/* TIME */}

                    <View
                      style={
                        styles.sessionDetails
                      }
                    >
                      <View
                        style={
                          styles.detailItem
                        }
                      >
                        <View
                          style={
                            styles.detailIcon
                          }
                        >
                          <Ionicons
                            name="time-outline"
                            size={15}
                            color="#2563EB"
                          />
                        </View>

                        <View>
                          <Text
                            style={
                              styles.detailLabel
                            }
                          >
                            TIME
                          </Text>

                          <Text
                            style={
                              styles.detailValue
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
                      </View>

                      {/* DURATION */}

                      <View
                        style={
                          styles.detailItem
                        }
                      >
                        <View
                          style={
                            styles.detailIcon
                          }
                        >
                          <Ionicons
                            name="hourglass-outline"
                            size={15}
                            color="#2563EB"
                          />
                        </View>

                        <View>
                          <Text
                            style={
                              styles.detailLabel
                            }
                          >
                            DURATION
                          </Text>

                          <Text
                            style={
                              styles.detailValue
                            }
                          >
                            {
                              session.durationHours
                            }{" "}
                            hours
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            },
          )}
        </>
      )}

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <View
        style={styles.infoCard}
      >
        <Ionicons
          name="information-circle-outline"
          size={18}
          color="#2563EB"
        />

        <Text
          style={styles.infoText}
        >
          This schedule shows the training
          sessions assigned to your approved
          enrollment.
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    content: {
      paddingTop: 20,
      paddingBottom: 40,
    },

    // ========================================================
    // HEADER
    // ========================================================

    header: {
      paddingHorizontal: 20,
      marginBottom: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    title: {
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

    refreshButton: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
    },

    refreshButtonDisabled: {
      opacity: 0.45,
    },

    // ========================================================
    // TRAINING
    // ========================================================

    trainingCard: {
      marginHorizontal: 20,
      marginBottom: 18,
      padding: 14,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    trainingIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    trainingContent: {
      flex: 1,
      marginLeft: 11,
    },

    trainingLabel: {
      fontSize: 6,
      fontWeight: "900",
      letterSpacing: 0.9,
      color: "#94A3B8",
    },

    trainingName: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: "800",
      color: "#334155",
    },

    trainingBatch: {
      marginTop: 2,
      fontSize: 8,
      color: "#64748B",
    },

    // ========================================================
    // ERROR
    // ========================================================

    errorCard: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 12,
      borderRadius: 13,
      backgroundColor: "#FEF2F2",
      borderWidth: 1,
      borderColor: "#FECACA",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    errorText: {
      flex: 1,
      fontSize: 9,
      color: "#B91C1C",
    },

    // ========================================================
    // SCHEDULE HEADER
    // ========================================================

    scheduleHeader: {
      marginHorizontal: 20,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    scheduleTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#0F172A",
    },

    scheduleSubtitle: {
      marginTop: 2,
      fontSize: 8,
      color: "#64748B",
    },

    countBadge: {
      minWidth: 34,
      height: 30,
      paddingHorizontal: 9,
      borderRadius: 10,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    countBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#2563EB",
    },

    // ========================================================
    // SESSION
    // ========================================================

    sessionCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 13,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      flexDirection: "row",
    },

    sessionCardToday: {
      borderColor: "#93C5FD",
      backgroundColor: "#F8FBFF",
    },

    sessionNumber: {
      width: 36,
      height: 36,
      borderRadius: 11,
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

    sessionTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    sessionTitleContainer: {
      flex: 1,
    },

    sessionLabel: {
      fontSize: 6,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "#94A3B8",
    },

    sessionDate: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "800",
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
      marginTop: 12,
      flexDirection: "row",
      gap: 18,
    },

    detailItem: {
      flexDirection: "row",
      alignItems: "center",
    },

    detailIcon: {
      width: 27,
      height: 27,
      borderRadius: 8,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 6,
    },

    detailLabel: {
      fontSize: 5.5,
      fontWeight: "900",
      letterSpacing: 0.7,
      color: "#94A3B8",
    },

    detailValue: {
      marginTop: 2,
      fontSize: 8,
      fontWeight: "700",
      color: "#475569",
    },

    // ========================================================
    // EMPTY SCHEDULE
    // ========================================================

    noScheduleCard: {
      marginHorizontal: 20,
      padding: 28,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
    },

    noScheduleIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    noScheduleTitle: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "800",
      color: "#334155",
    },

    noScheduleText: {
      marginTop: 5,
      textAlign: "center",
      fontSize: 8,
      lineHeight: 13,
      color: "#94A3B8",
    },

    // ========================================================
    // INFO
    // ========================================================

    infoCard: {
      marginHorizontal: 20,
      marginTop: 8,
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

    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    loadingIcon: {
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    loadingTitle: {
      marginTop: 13,
      fontSize: 15,
      fontWeight: "800",
      color: "#334155",
    },

    loadingText: {
      marginTop: 5,
      fontSize: 9,
      textAlign: "center",
      color: "#94A3B8",
    },

    // ========================================================
    // EMPTY
    // ========================================================

    emptyContainer: {
      flex: 1,
      backgroundColor: "#F8FAFC",
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
      textAlign: "center",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 9,
      lineHeight: 14,
      textAlign: "center",
      color: "#94A3B8",
    },

    retryButton: {
      marginTop: 15,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: "#2563EB",
    },

    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },
  });