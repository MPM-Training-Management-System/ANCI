
import {
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

import { AppAlert } from "@repo/ui-mobile";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";

import ParticipantQrCard from "./ParticipantQrCard";

import {
  useAttendance,
  useEnrollments,
} from "@repo/hooks";

import {
  attendanceApi,
  enrollmentApi,
  trainingBatchApi,
} from "@/api/api";

import type {
  AttendanceRecordDto,
  TrainingSession,
} from "@repo/types";

// ============================================================
// TYPES
// ============================================================

type AttendanceRecordWithExtraFields =
  AttendanceRecordDto & {
    attendanceSessionId?: string | null;
    date?: string;
    attendanceDate?: string;
    sessionDate?: string;
    createdAt?: string;
    mode?: string;
    trainingMode?: string;
  };

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
function getRecordDate(record: AttendanceRecordDto): string {
  const item = record as AttendanceRecordWithExtraFields & {
    attendanceDate?: string | null;
    sessionDate?: string | null;
    date?: string | null;
    createdAt?: string | null;
    timeIn?: string | null;
    timeOut?: string | null;
  };

  return (
    item.attendanceDate ??
    item.sessionDate ??
    item.date ??
    item.createdAt ??
    item.timeIn ??
    item.timeOut ??
    ""
  );
}

function getRecordMode(record: AttendanceRecordDto): string {
  const item = record as AttendanceRecordWithExtraFields;

  const mode = item.mode ?? item.trainingMode ?? "";

  if (String(mode).toLowerCase() === "online") {
    return "Online";
  }

  if (
    String(mode).toLowerCase() === "face-to-face" ||
    String(mode).toLowerCase() === "face to face"
  ) {
    return "Face-to-Face";
  }

  return mode || "Training Session";
}

function formatDate(value: string): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string | null): string {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusLabel(
  status: string | null | undefined
): string {
  switch (String(status ?? "").toLowerCase()) {
    case "present":
      return "Present";
    case "late":
      return "Late";
    case "absent":
      return "Absent";
    case "timeinonly":
      return "Time In Only";
    case "timeoutonly":
      return "Time Out Only";
    default:
      return status || "No Status";
  }
}

function getStatusIcon(
  status: string | null | undefined
): keyof typeof Ionicons.glyphMap {
  switch (String(status ?? "").toLowerCase()) {
    case "present":
      return "checkmark-circle";
    case "late":
      return "time";
    case "absent":
      return "close-circle";
    case "timeinonly":
      return "log-in-outline";
    case "timeoutonly":
      return "log-out-outline";
    default:
      return "information-circle-outline";
  }
}

// ============================================================
// SCREEN
// ============================================================

export default function AttendanceScreen() {
  // ==========================================================
  // ENROLLMENTS
  // ==========================================================

  const {
    enrollments,
    loadMyEnrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentError,
  } = useEnrollments(enrollmentApi);

  // ==========================================================
  // APP ALERT
  // ==========================================================

  const [appAlert, setAppAlert] = useState({
    visible: false,
    type: "info" as
      | "success"
      | "error"
      | "warning"
      | "info",
    title: "",
    message: "",
    confirmText: "OK",
    showCancel: false,
  });

  const [alertAction, setAlertAction] = useState<
    (() => void) | null
  >(null);

  const showAlert = (
    title: string,
    message: string,
    type:
      | "success"
      | "error"
      | "warning"
      | "info" = "info",
    confirmText = "OK",
    onConfirm?: () => void
  ) => {
    setAlertAction(() => onConfirm ?? null);

    setAppAlert({
      visible: true,
      type,
      title,
      message,
      confirmText,
      showCancel: false,
    });
  };

  const closeAlert = () => {
    const action = alertAction;

    setAlertAction(null);

    setAppAlert((prev) => ({
      ...prev,
      visible: false,
    }));

    action?.();
  };

  // ==========================================================
  // ATTENDANCE HOOK
  // ==========================================================

  const {
    batchAttendance,

    openSessionId,
    manualAttendanceOpen,

    isLoadingOpenSession,
    openSessionError,

    loadOpenAttendanceSession,
    refreshOpenAttendanceSession,

    loadBatchAttendance,
    refreshBatchAttendance,

    manualAttendance,
    isSubmitting,

    error: attendanceError,
  } = useAttendance(attendanceApi);

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [trainingSessions, setTrainingSessions] =
    useState<TrainingSession[]>([]);

  const [trainingSessionId, setTrainingSessionId] =
    useState<string | null>(null);

  const [isLoadingSchedule, setIsLoadingSchedule] =
    useState(false);

  const [trainingSessionError, setTrainingSessionError] =
    useState<Error | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [expandedHistoryId, setExpandedHistoryId] =
    useState<string | null>(null);

  // ==========================================================
  // OPTIMISTIC ATTENDANCE STATE
  //
  // This allows the buttons to update immediately after
  // the attendance API successfully records the action.
  // ==========================================================

  const [localTimeInAt, setLocalTimeInAt] =
    useState<string | null>(null);

  const [localTimeOutAt, setLocalTimeOutAt] =
    useState<string | null>(null);

  const [localAttendanceSessionId, setLocalAttendanceSessionId] =
    useState<string | null>(null);

  // Reset local attendance when a different session opens.

  useEffect(() => {
    setLocalTimeInAt(null);
    setLocalTimeOutAt(null);
    setLocalAttendanceSessionId(null);
  }, [openSessionId]);

  // ==========================================================
  // APPROVED ENROLLMENT
  // ==========================================================

  const approvedEnrollment = useMemo(() => {
    return enrollments.find((enrollment) => {
      const status = String(enrollment.status ?? "").toLowerCase();

      return status === "approved" || status === "active";
    });
  }, [enrollments]);

  // ==========================================================
  // IDS
  // ==========================================================

  const enrollmentId = approvedEnrollment?.id ?? null;

  const batchId = approvedEnrollment?.trainingBatchId ?? null;

  // ==========================================================
  // PARTICIPANT INFO
  // ==========================================================

  const participantName =
    approvedEnrollment?.participant?.fullName ?? "Participant";

  const participantCode =
    approvedEnrollment?.attendanceToken ?? "";

  // ==========================================================
  // LOAD ALL ATTENDANCE DATA
  // ==========================================================

  const loadAllAttendanceData = useCallback(async () => {
    try {
      console.log("ATTENDANCE SCREEN - AUTO FETCH START");

      // 1. LOAD ENROLLMENTS

      const currentEnrollments = await loadMyEnrollments();

      // 2. FIND APPROVED / ACTIVE ENROLLMENT

      const approved = currentEnrollments.find((enrollment) => {
        const status = String(enrollment.status ?? "").toLowerCase();

        return status === "approved" || status === "active";
      });

      const currentBatchId = approved?.trainingBatchId ?? null;

      // 3. NO APPROVED TRAINING

      if (!currentBatchId) {
        setTrainingSessions([]);
        setTrainingSessionId(null);

        console.log("NO APPROVED TRAINING");

        return;
      }

      // 4. LOAD PARTICIPANT SCHEDULE

      setIsLoadingSchedule(true);
      setTrainingSessionError(null);

      const schedule =
        await trainingBatchApi.getParticipantSchedule(
          currentBatchId
        );

      const sessions = Array.isArray(schedule) ? schedule : [];

      setTrainingSessions(sessions);

      console.log("PARTICIPANT SCHEDULE LOADED", {
        batchId: currentBatchId,
        numberOfSessions: sessions.length,
      });

      // 5. FIND OPEN ATTENDANCE SESSION

      let selectedSessionId: string | null = null;

      if (sessions.length > 0) {
        const openSessionResults = await Promise.all(
          sessions.map(async (session) => {
            try {
              const result =
                await attendanceApi.getOpenSession(
                  currentBatchId,
                  session.id
                );

              console.log("ATTENDANCE SESSION CHECK", {
                trainingSessionId: session.id,
                isOpen: result?.isOpen,
                attendanceSessionId:
                  result?.attendanceSessionId,
                manualAttendanceOpen:
                  result?.manualAttendanceOpen,
              });

              return {
                session,
                result,
              };
            } catch (error) {
              console.log(
                "FAILED TO CHECK ATTENDANCE SESSION",
                session.id,
                error
              );

              return {
                session,
                result: null,
              };
            }
          })
        );

        // Find the session that is actually open.

        const activeSession = openSessionResults.find(
          (item) =>
            item.result?.isOpen === true &&
            Boolean(item.result?.attendanceSessionId)
        );

        if (activeSession) {
          selectedSessionId = activeSession.session.id;

          console.log("ACTIVE ATTENDANCE SESSION FOUND", {
            trainingSessionId: selectedSessionId,
            attendanceSessionId:
              activeSession.result?.attendanceSessionId,
            manualAttendanceOpen:
              activeSession.result?.manualAttendanceOpen,
          });
        } else {
          // NO OPEN SESSION: SELECT A DISPLAY FALLBACK.

          const now = new Date();

          const today = sessions.find((session) => {
            if (!session.sessionDate) return false;

            const date = new Date(session.sessionDate);

            return (
              date.getFullYear() === now.getFullYear() &&
              date.getMonth() === now.getMonth() &&
              date.getDate() === now.getDate()
            );
          });

          const upcoming = sessions
            .filter((session) => {
              if (!session.sessionDate) return false;

              return (
                new Date(session.sessionDate).getTime() >=
                now.getTime()
              );
            })
            .sort(
              (a, b) =>
                new Date(a.sessionDate).getTime() -
                new Date(b.sessionDate).getTime()
            )[0];

          const latest = [...sessions].sort(
            (a, b) =>
              new Date(b.sessionDate).getTime() -
              new Date(a.sessionDate).getTime()
          )[0];

          const selected = today ?? upcoming ?? latest;

          selectedSessionId = selected?.id ?? null;

          console.log("NO OPEN ATTENDANCE SESSION", {
            fallbackTrainingSessionId: selectedSessionId,
          });
        }
      }

      // 6. SAVE SELECTED SESSION

      setTrainingSessionId(selectedSessionId);

      setIsLoadingSchedule(false);

      // 7. LOAD BATCH ATTENDANCE

      await loadBatchAttendance(currentBatchId);

      // 8. LOAD SELECTED SESSION STATE

      if (selectedSessionId) {
        await loadOpenAttendanceSession(
          currentBatchId,
          selectedSessionId
        );
      }

      console.log("ATTENDANCE SCREEN - AUTO FETCH COMPLETE", {
        batchId: currentBatchId,
        trainingSessionId: selectedSessionId,
      });
    } catch (error) {
      console.log("ATTENDANCE SCREEN AUTO FETCH ERROR", error);

      const normalized =
        error instanceof Error
          ? error
          : new Error("Failed to load attendance data.");

      setTrainingSessionError(normalized);
    } finally {
      setIsLoadingSchedule(false);
    }
  }, [
    loadMyEnrollments,
    loadBatchAttendance,
    loadOpenAttendanceSession,
  ]);

  // ==========================================================
  // AUTO FETCH WHEN SCREEN IS FOCUSED
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      console.log("ATTENDANCE SCREEN FOCUSED");

      void loadAllAttendanceData();
    }, [loadAllAttendanceData])
  );

  // ==========================================================
  // CURRENT ATTENDANCE
  //
  // Only use the record belonging to the CURRENT OPEN SESSION.
  // Previous sessions must not block a new Time In.
  // ==========================================================

  const todayAttendance = useMemo(() => {
    if (!openSessionId || !batchAttendance.length) {
      return null;
    }

    const records =
      batchAttendance as AttendanceRecordWithExtraFields[];

    console.log("CURRENT OPEN ATTENDANCE SESSION", {
      openSessionId,
      batchAttendanceCount: records.length,
    });

    const currentRecord = records
      .filter(
        (record) =>
          String(record.attendanceSessionId ?? "") ===
          String(openSessionId)
      )
      .sort((a, b) => {
        const timeA = a.timeIn
          ? new Date(a.timeIn).getTime()
          : 0;

        const timeB = b.timeIn
          ? new Date(b.timeIn).getTime()
          : 0;

        return timeB - timeA;
      })[0] ?? null;

    console.log("CURRENT SESSION RECORD", {
      record: currentRecord,
      timeIn: currentRecord?.timeIn,
      timeOut: currentRecord?.timeOut,
    });

    return currentRecord;
  }, [batchAttendance, openSessionId]);

  // ==========================================================
  // EFFECTIVE ATTENDANCE VALUES
  // ==========================================================

  const isLocalStateForCurrentSession =
    Boolean(
      openSessionId &&
      localAttendanceSessionId === openSessionId
    );

  const effectiveTimeIn =
    todayAttendance?.timeIn ??
    (isLocalStateForCurrentSession ? localTimeInAt : null);

  const effectiveTimeOut =
    todayAttendance?.timeOut ??
    (isLocalStateForCurrentSession ? localTimeOutAt : null);

  // ==========================================================
  // HISTORY
  // ==========================================================

  const history = useMemo(() => {
    return batchAttendance
      .filter(
        (record) =>
          Boolean(record.timeIn && record.timeOut)
      )
      .sort((a, b) => {
        const dateA = new Date(getRecordDate(a)).getTime();
        const dateB = new Date(getRecordDate(b)).getTime();

        return dateB - dateA;
      });
  }, [batchAttendance]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const attendanceSummary = useMemo(() => {
    const completed = batchAttendance.filter(
      (record) =>
        Boolean(record.timeIn && record.timeOut)
    );

    const present = completed.filter(
      (record) =>
        String(record.status).toLowerCase() === "present"
    ).length;

    const late = completed.filter(
      (record) =>
        String(record.status).toLowerCase() === "late"
    ).length;

    const absent = completed.filter(
      (record) =>
        String(record.status).toLowerCase() === "absent"
    ).length;

    return {
      total: completed.length,
      present,
      late,
      absent,
    };
  }, [batchAttendance]);

  // ==========================================================
  // SESSION STATE
  // ==========================================================

  const isSessionOpen = Boolean(openSessionId);

  const isManualAttendanceOpen = Boolean(
    openSessionId && manualAttendanceOpen
  );

  const hasTimedIn = Boolean(effectiveTimeIn);

  const hasTimedOut = Boolean(effectiveTimeOut);

  const canTimeIn = Boolean(
    enrollmentId &&
      openSessionId &&
      manualAttendanceOpen &&
      !hasTimedIn &&
      !isSubmitting
  );

  const canTimeOut = Boolean(
    enrollmentId &&
      openSessionId &&
      manualAttendanceOpen &&
      hasTimedIn &&
      !hasTimedOut &&
      !isSubmitting
  );

  // ==========================================================
  // ERROR
  // ==========================================================

  const rawError =
    attendanceError ??
    enrollmentError ??
    openSessionError ??
    trainingSessionError ??
    null;

  const errorMessage = getErrorMessage(rawError);

  // ==========================================================
  // TIME IN
  // ==========================================================

  const handleTimeIn = useCallback(async () => {
    if (!enrollmentId) {
      showAlert(
        "Unable to Time In",
        "Your enrollment could not be found."
      );
      return;
    }

    if (!openSessionId) {
      showAlert(
        "Attendance Closed",
        "The attendance session is currently closed."
      );
      return;
    }

    if (!manualAttendanceOpen) {
      showAlert(
        "Manual Attendance Closed",
        "The trainer has not opened manual attendance yet."
      );
      return;
    }

    if (hasTimedIn) {
      showAlert(
        "Already Timed In",
        "You have already recorded your Time In for this session."
      );
      return;
    }

    try {
      console.log("SUBMITTING TIME IN", {
        attendanceSessionId: openSessionId,
        enrollmentId,
        manualAttendanceOpen,
      });

      // Submit Time In to the backend.

      await manualAttendance({
        attendanceSessionId: openSessionId,
        action: "TimeIn",
      });

      // IMPORTANT:
      // Update local state immediately after successful API response.
      // Do not wait for the attendance refresh to finish.

      const submittedTime = new Date().toISOString();

      setLocalAttendanceSessionId(openSessionId);
      setLocalTimeInAt(submittedTime);
      setLocalTimeOutAt(null);

      showAlert(
        "Time In Successful",
        "Your attendance Time In has been recorded.",
        "success"
      );

      // Refresh backend data in the background.
      // A refresh error must not undo the successful Time In.

      if (batchId) {
        void refreshBatchAttendance(batchId).catch((error) => {
          console.log("BATCH ATTENDANCE REFRESH ERROR:", error);
        });
      }

      if (batchId && trainingSessionId) {
        void refreshOpenAttendanceSession(
          batchId,
          trainingSessionId
        ).catch((error) => {
          console.log("OPEN SESSION REFRESH ERROR:", error);
        });
      }
    } catch (err) {
      console.log("TIME IN ERROR:", err);

      showAlert(
        "Time In Failed",
        getErrorMessage(err) ??
          "Unable to record your Time In.",
        "error"
      );
    }
  }, [
    enrollmentId,
    openSessionId,
    manualAttendanceOpen,
    hasTimedIn,
    manualAttendance,
    batchId,
    trainingSessionId,
    refreshBatchAttendance,
    refreshOpenAttendanceSession,
  ]);

  // ==========================================================
  // TIME OUT
  // ==========================================================

  const handleTimeOut = useCallback(async () => {
    if (!enrollmentId) {
      showAlert(
        "Unable to Time Out",
        "Your enrollment could not be found."
      );
      return;
    }

    if (!openSessionId) {
      showAlert(
        "Attendance Closed",
        "The attendance session is currently closed."
      );
      return;
    }

    if (!manualAttendanceOpen) {
      showAlert(
        "Manual Attendance Closed",
        "The trainer has not opened manual attendance."
      );
      return;
    }

    if (!hasTimedIn) {
      showAlert(
        "Time In Required",
        "You must Time In before recording Time Out."
      );
      return;
    }

    if (hasTimedOut) {
      showAlert(
        "Already Timed Out",
        "You have already recorded your Time Out."
      );
      return;
    }

    try {
      console.log("SUBMITTING TIME OUT", {
        attendanceSessionId: openSessionId,
        enrollmentId,
      });

      // Submit Time Out to the backend.

      await manualAttendance({
        attendanceSessionId: openSessionId,
        action: "TimeOut",
      });

      // IMPORTANT:
      // Immediately update local state after successful API response.

      const submittedTime = new Date().toISOString();

      setLocalAttendanceSessionId(openSessionId);
      setLocalTimeOutAt(submittedTime);

      showAlert(
        "Time Out Successful",
        "Your attendance Time Out has been recorded.",
        "success"
      );

      // Refresh backend data in the background.

      if (batchId) {
        void refreshBatchAttendance(batchId).catch((error) => {
          console.log("BATCH ATTENDANCE REFRESH ERROR:", error);
        });
      }

      if (batchId && trainingSessionId) {
        void refreshOpenAttendanceSession(
          batchId,
          trainingSessionId
        ).catch((error) => {
          console.log("OPEN SESSION REFRESH ERROR:", error);
        });
      }
    } catch (err) {
      console.log("TIME OUT ERROR:", err);

      showAlert(
        "Time Out Failed",
        getErrorMessage(err) ??
          "Unable to record your Time Out.",
        "error"
      );
    }
  }, [
    enrollmentId,
    openSessionId,
    manualAttendanceOpen,
    hasTimedIn,
    hasTimedOut,
    manualAttendance,
    batchId,
    trainingSessionId,
    refreshBatchAttendance,
    refreshOpenAttendanceSession,
  ]);

  // ==========================================================
  // PULL TO REFRESH
  // ==========================================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await loadAllAttendanceData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadAllAttendanceData]);

  // ==========================================================
  // LOADING
  // ==========================================================

  const isInitialLoading =
    isLoadingEnrollments || isLoadingSchedule;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="qr-code-outline"
            size={26}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Attendance
          </Text>

          <Text style={styles.headerSubtitle}>
            Track your training attendance
          </Text>
        </View>
      </View>

      {/* LOADING */}

      {isInitialLoading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="small"
            color="#002B5C"
          />

          <Text style={styles.loadingText}>
            Loading attendance...
          </Text>
        </View>
      )}

      {/* ERROR */}

      {errorMessage && (
        <View style={styles.errorCard}>
          <Ionicons
            name="alert-circle-outline"
            size={22}
            color="#B42318"
          />

          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>
              Attendance Error
            </Text>

            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        </View>
      )}

      {/* NO APPROVED ENROLLMENT */}

      {!isInitialLoading && !approvedEnrollment && (
        <View style={styles.emptyCard}>
          <Ionicons
            name="school-outline"
            size={42}
            color="#002B5C"
          />

          <Text style={styles.emptyTitle}>
            No Approved Training
          </Text>

          <Text style={styles.emptyText}>
            You currently do not have an approved
            training enrollment.
          </Text>
        </View>
      )}

      {/* APPROVED ENROLLMENT CONTENT */}

      {approvedEnrollment && (
        <>
          {/* CURRENT ATTENDANCE */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Current Attendance
            </Text>

            <View style={styles.statusCard}>
              <View style={styles.statusIconContainer}>
                <Ionicons
                  name={
                    hasTimedOut
                      ? "checkmark-circle"
                      : hasTimedIn
                        ? "log-in-outline"
                        : todayAttendance
                          ? getStatusIcon(todayAttendance.status)
                          : "calendar-outline"
                  }
                  size={28}
                  color="#002B5C"
                />
              </View>

              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>
                  {hasTimedOut
                    ? "Attendance Completed"
                    : hasTimedIn
                      ? "Time In Recorded"
                      : todayAttendance
                        ? getStatusLabel(todayAttendance.status)
                        : "No Attendance Record"}
                </Text>

                <Text style={styles.statusSubtitle}>
                  {todayAttendance
                    ? `${formatDate(
                        getRecordDate(todayAttendance)
                      )} • ${getRecordMode(todayAttendance)}`
                    : hasTimedIn
                      ? "Your attendance Time In has been recorded for this session."
                      : isSessionOpen
                        ? "No attendance record has been recorded for this session."
                        : "No attendance record has been recorded for today."}
                </Text>

                {(hasTimedIn || hasTimedOut || todayAttendance) && (
                  <View style={styles.timeRow}>
                    <View style={styles.timeItem}>
                      <Ionicons
                        name="log-in-outline"
                        size={16}
                        color="#3B7597"
                      />

                      <View>
                        <Text style={styles.timeLabel}>
                          Time In
                        </Text>

                        <Text style={styles.timeValue}>
                          {formatTime(effectiveTimeIn)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timeItem}>
                      <Ionicons
                        name="log-out-outline"
                        size={16}
                        color="#3B7597"
                      />

                      <View>
                        <Text style={styles.timeLabel}>
                          Time Out
                        </Text>

                        <Text style={styles.timeValue}>
                          {formatTime(effectiveTimeOut)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* SESSION STATUS */}

          <View style={styles.sessionStatusCard}>
            <View style={styles.sessionStatusLeft}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isSessionOpen
                      ? "#12B76A"
                      : "#98A2B3",
                  },
                ]}
              />

              <View>
                <Text style={styles.sessionStatusTitle}>
                  Attendance Session
                </Text>

                <Text style={styles.sessionStatusSubtitle}>
                  {isLoadingOpenSession
                    ? "Checking session..."
                    : isSessionOpen
                      ? manualAttendanceOpen
                        ? "Open • Manual attendance enabled"
                        : "Open • QR scanning available"
                      : "Closed"}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.sessionStatusBadge,
                {
                  color: isSessionOpen
                    ? "#027A48"
                    : "#667085",
                },
              ]}
            >
              {isSessionOpen ? "OPEN" : "CLOSED"}
            </Text>
          </View>

          {/* PARTICIPANT QR */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              My Attendance QR
            </Text>

            {participantCode ? (
              <ParticipantQrCard
                participantCode={participantCode}
                participantName={participantName}
              />
            ) : (
              <View style={styles.qrUnavailableCard}>
                <Ionicons
                  name="qr-code-outline"
                  size={38}
                  color="#98A2B3"
                />

                <Text style={styles.qrUnavailableTitle}>
                  Attendance QR Unavailable
                </Text>

                <Text style={styles.qrUnavailableText}>
                  Your participant code could not be loaded.
                </Text>
              </View>
            )}
          </View>

          {/* MANUAL ATTENDANCE */}

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Manual Attendance
              </Text>

              <View
                style={[
                  styles.manualBadge,
                  {
                    backgroundColor: isManualAttendanceOpen
                      ? "#ECFDF3"
                      : "#F2F4F7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.manualBadgeText,
                    {
                      color: isManualAttendanceOpen
                        ? "#027A48"
                        : "#667085",
                    },
                  ]}
                >
                  {isManualAttendanceOpen ? "OPEN" : "CLOSED"}
                </Text>
              </View>
            </View>

            <View style={styles.manualCard}>
              <Text style={styles.manualDescription}>
                Time In and Time Out are available only
                when the trainer opens manual attendance.
              </Text>

              <View style={styles.manualButtons}>
                <Pressable
                  onPress={handleTimeIn}
                  disabled={!canTimeIn}
                  style={[
                    styles.attendanceButton,
                    styles.timeInButton,
                    !canTimeIn && styles.disabledButton,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name="log-in-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}

                  <Text style={styles.buttonText}>
                    Time In
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleTimeOut}
                  disabled={!canTimeOut}
                  style={[
                    styles.attendanceButton,
                    styles.timeOutButton,
                    !canTimeOut && styles.disabledButton,
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}

                  <Text style={styles.buttonText}>
                    Time Out
                  </Text>
                </Pressable>
              </View>

              {!isManualAttendanceOpen && (
                <Text style={styles.disabledReason}>
                  Manual attendance is currently closed
                  by the trainer.
                </Text>
              )}

              {hasTimedIn && !hasTimedOut && (
                <Text style={styles.disabledReason}>
                  You have already timed in. You can now
                  Time Out while manual attendance is open.
                </Text>
              )}

              {hasTimedOut && (
                <Text style={styles.completedReason}>
                  Your attendance for this session is complete.
                </Text>
              )}
            </View>
          </View>

          {/* SUMMARY */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Attendance Summary
            </Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {attendanceSummary.total}
                </Text>

                <Text style={styles.summaryLabel}>
                  Completed
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {attendanceSummary.present}
                </Text>

                <Text style={styles.summaryLabel}>
                  Present
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {attendanceSummary.late}
                </Text>

                <Text style={styles.summaryLabel}>
                  Late
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {attendanceSummary.absent}
                </Text>

                <Text style={styles.summaryLabel}>
                  Absent
                </Text>
              </View>
            </View>
          </View>

          {/* HISTORY */}

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Attendance History
              </Text>

              <Text style={styles.historyCount}>
                {history.length}
              </Text>
            </View>

            {history.length === 0 ? (
              <View style={styles.historyEmpty}>
                <Ionicons
                  name="time-outline"
                  size={34}
                  color="#98A2B3"
                />

                <Text style={styles.historyEmptyTitle}>
                  No completed attendance
                </Text>

                <Text style={styles.historyEmptyText}>
                  Completed Time In and Time Out records
                  will appear here.
                </Text>
              </View>
            ) : (
              history.map((record) => {
                const isExpanded =
                  expandedHistoryId === record.id;

                return (
                  <Pressable
                    key={record.id}
                    onPress={() =>
                      setExpandedHistoryId(
                        isExpanded ? null : record.id
                      )
                    }
                    style={styles.historyItem}
                  >
                    <View style={styles.historyMainRow}>
                      <View style={styles.historyIcon}>
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color="#027A48"
                        />
                      </View>

                      <View style={styles.historyMainContent}>
                        <Text style={styles.historyDate}>
                          {formatDate(getRecordDate(record))}
                        </Text>

                        <Text style={styles.historyMode}>
                          {getRecordMode(record)}
                        </Text>
                      </View>

                      <Ionicons
                        name={
                          isExpanded
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color="#667085"
                      />
                    </View>

                    {isExpanded && (
                      <View style={styles.historyDetails}>
                        <View style={styles.historyDetailRow}>
                          <Text style={styles.historyDetailLabel}>
                            Time In
                          </Text>

                          <Text style={styles.historyDetailValue}>
                            {formatTime(record.timeIn)}
                          </Text>
                        </View>

                        <View style={styles.historyDetailRow}>
                          <Text style={styles.historyDetailLabel}>
                            Time Out
                          </Text>

                          <Text style={styles.historyDetailValue}>
                            {formatTime(record.timeOut)}
                          </Text>
                        </View>

                        <View style={styles.historyDetailRow}>
                          <Text style={styles.historyDetailLabel}>
                            Status
                          </Text>

                          <Text style={styles.historyDetailValue}>
                            {getStatusLabel(record.status)}
                          </Text>
                        </View>

                        <View style={styles.historyDetailRow}>
                          <Text style={styles.historyDetailLabel}>
                            Method
                          </Text>

                          <Text style={styles.historyDetailValue}>
                            {record.method || "Manual"}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        </>
      )}

      {/* BOTTOM SPACING */}

      <View style={styles.bottomSpacing} />

      {/* APP ALERT */}

      <AppAlert
        visible={appAlert.visible}
        type={appAlert.type}
        title={appAlert.title}
        message={appAlert.message}
        confirmText={appAlert.confirmText}
        onConfirm={closeAlert}
        showCancel={false}
      />
    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#002B5C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#002B5C",
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#667085",
  },

  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#667085",
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FDA29B",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B42318",
    marginBottom: 3,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#912018",
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#002B5C",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#667085",
  },

  section: {
    marginBottom: 20,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#002B5C",
    marginBottom: 10,
  },

  statusCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
  },

  statusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#002B5C",
  },

  statusSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#667085",
  },

  timeRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 20,
  },

  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  timeLabel: {
    fontSize: 10,
    color: "#98A2B3",
  },

  timeValue: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#344054",
  },

  sessionStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },

  sessionStatusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  sessionStatusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#344054",
  },

  sessionStatusSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#667085",
  },

  sessionStatusBadge: {
    fontSize: 11,
    fontWeight: "800",
  },

  qrUnavailableCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 26,
  },

  qrUnavailableTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#344054",
  },

  qrUnavailableText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#667085",
  },

  manualBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  manualBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  manualCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
  },

  manualDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#667085",
    marginBottom: 15,
  },

  manualButtons: {
    flexDirection: "row",
    gap: 10,
  },

  attendanceButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  timeInButton: {
    backgroundColor: "#002B5C",
  },

  timeOutButton: {
    backgroundColor: "#3B7597",
  },

  disabledButton: {
    opacity: 0.4,
  },

  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  disabledReason: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 17,
    color: "#98A2B3",
    textAlign: "center",
  },

  completedReason: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 17,
    color: "#027A48",
    textAlign: "center",
    fontWeight: "600",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  summaryCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  summaryValue: {
    fontSize: 23,
    fontWeight: "800",
    color: "#002B5C",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 11,
    color: "#667085",
  },

  historyCount: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EEF4F8",
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: 5,
    fontSize: 11,
    fontWeight: "800",
    color: "#002B5C",
  },

  historyEmpty: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 26,
  },

  historyEmptyTitle: {
    marginTop: 9,
    fontSize: 14,
    fontWeight: "700",
    color: "#344054",
  },

  historyEmptyText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#667085",
  },

  historyItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  historyMainRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  historyMainContent: {
    flex: 1,
  },

  historyDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#344054",
  },

  historyMode: {
    marginTop: 3,
    fontSize: 11,
    color: "#667085",
  },

  historyDetails: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#EAECF0",
  },

  historyDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  historyDetailLabel: {
    fontSize: 12,
    color: "#667085",
  },

  historyDetailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#344054",
  },

  bottomSpacing: {
    height: 30,
  },
});
