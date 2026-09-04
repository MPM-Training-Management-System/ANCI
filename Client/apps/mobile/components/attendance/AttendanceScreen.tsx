import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Pressable,
  RefreshControl,
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

import { useEnrollments } from "@repo/hooks";
import {
  attendanceApi,
  enrollmentApi,
} from "@/api/api";

import type {
  Enrollment,
  AttendanceRecordDto,
} from "@repo/types";

// ============================================================
// ATTENDANCE UI TYPE
// ============================================================

type AttendanceItem = {
  id: string;
  date: string;
  mode: "Online" | "Face-to-Face";
  timeIn: string | null;
  timeOut: string | null;
  attendanceStatus: string;
  attendanceMethod: string | null;
};

// ============================================================
// COMPONENT
// ============================================================

export default function AttendanceScreen() {
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
  // ATTENDANCE
  // ============================================================

  const [
    attendance,
    setAttendance,
  ] = useState<AttendanceItem[]>([]);

  const [
    isLoadingAttendance,
    setIsLoadingAttendance,
  ] = useState(false);

  // ============================================================
  // REFRESH
  // ============================================================

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  // ============================================================
  // OPEN TRAINING SESSION
  //
  // This controls whether the trainer's training
  // attendance session is currently open.
  //
  // QR scanning by trainer depends on this state.
  //
  // It does NOT automatically mean manual attendance
  // is enabled.
  // ============================================================

  const [
    openSessionId,
    setOpenSessionId,
  ] = useState<string | null>(null);

  const [
    isLoadingOpenSession,
    setIsLoadingOpenSession,
  ] = useState(false);

  // ============================================================
  // MANUAL ATTENDANCE
  //
  // Separate from session.
  //
  // Session OPEN + Manual OPEN
  // = participant can Time In / Time Out.
  // ============================================================

  const [
    manualAttendanceOpen,
    setManualAttendanceOpen,
  ] = useState(false);

  // ============================================================
  // MANUAL ATTENDANCE SUBMIT
  // ============================================================

  const [
    isSubmittingAttendance,
    setIsSubmittingAttendance,
  ] = useState(false);

  // ============================================================
  // LOAD ENROLLMENTS
  // ============================================================

  useEffect(() => {
    void loadMyEnrollments();
  }, [
    loadMyEnrollments,
  ]);

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
            String(
              item.status
            ).toLowerCase() ===
            "approved"
        ) ?? null
      );
    }, [
      enrollments,
    ]);

  // ============================================================
  // ENROLLMENT DATA
  // ============================================================

  const enrollmentId =
    currentEnrollment?.id ?? null;

  const batchId =
    currentEnrollment?.trainingBatchId ??
    null;

  const attendanceToken =
    currentEnrollment?.attendanceToken ??
    null;

  const participantName =
    currentEnrollment?.participant
      ?.fullName ??
    "Participant";

  // ============================================================
  // PERMANENT QR AVAILABLE
  //
  // IMPORTANT:
  // QR display does NOT depend on an open session.
  //
  // The QR is permanent and belongs to the
  // participant's approved enrollment.
  // ============================================================

  const hasAttendanceQr =
    Boolean(
      currentEnrollment &&
        attendanceToken &&
        String(
          currentEnrollment.status
        ).toLowerCase() ===
          "approved"
    );

  // ============================================================
  // LOAD OPEN SESSION
  //
  // Backend response:
  //
  // {
  //   isOpen: boolean,
  //   attendanceSessionId: string | null,
  //   manualAttendanceOpen: boolean
  // }
  //
  // ============================================================

  const loadOpenAttendanceSession =
    useCallback(
      async () => {
        if (!batchId) {
          setOpenSessionId(null);
          setManualAttendanceOpen(false);

          return null;
        }

        try {
          setIsLoadingOpenSession(true);

          const result =
            await attendanceApi.getOpenSession(
              batchId
            );

          // ======================================================
          // SESSION CLOSED
          // ======================================================

          if (
            !result ||
            !result.isOpen ||
            !result.attendanceSessionId
          ) {
            setOpenSessionId(null);

            // Manual attendance cannot be open
            // if the training session is closed.
            setManualAttendanceOpen(false);

            return null;
          }

          // ======================================================
          // SESSION OPEN
          // ======================================================

          setOpenSessionId(
            result.attendanceSessionId
          );

          // ======================================================
          // MANUAL ATTENDANCE STATE
          // ======================================================

          setManualAttendanceOpen(
            Boolean(
              result.manualAttendanceOpen
            )
          );

          return result.attendanceSessionId;
        } catch (error) {
          console.error(
            "Failed to load open attendance session:",
            error
          );

          setOpenSessionId(null);
          setManualAttendanceOpen(false);

          return null;
        } finally {
          setIsLoadingOpenSession(false);
        }
      },
      [
        batchId,
      ]
    );

  // ============================================================
  // SESSION STATE
  // ============================================================

  const isSessionOpen =
    Boolean(openSessionId);

  // ============================================================
  // MANUAL ATTENDANCE STATE
  //
  // Even if backend accidentally returns manual=true
  // while session is closed, manual attendance remains
  // disabled on the client.
  // ============================================================

  const isManualAttendanceOpen =
    isSessionOpen &&
    manualAttendanceOpen;

  // ============================================================
  // LOAD ATTENDANCE RECORDS
  // ============================================================

  const loadAttendance =
    useCallback(
      async () => {
        if (!batchId) {
          setAttendance([]);

          return;
        }

        try {
          setIsLoadingAttendance(true);

          const records =
            await attendanceApi.getBatch(
              batchId
            );

          const mapped: AttendanceItem[] =
            (
              records ?? []
            ).map(
              (
                record: AttendanceRecordDto
              ) => {
                const rawRecord =
                  record as AttendanceRecordDto & {
                    date?: string;
                    attendanceDate?: string;
                    createdAt?: string;
                    mode?: string;
                  };

                return {
                  id:
                    String(
                      record.id
                    ),

                  date:
                    rawRecord.date ??
                    rawRecord.attendanceDate ??
                    rawRecord.createdAt ??
                    new Date().toISOString(),

                  mode:
                    rawRecord.mode ===
                    "Online"
                      ? "Online"
                      : "Face-to-Face",

                  timeIn:
                    record.timeIn
                      ? formatTime(
                          record.timeIn
                        )
                      : null,

                  timeOut:
                    record.timeOut
                      ? formatTime(
                          record.timeOut
                        )
                      : null,

                  attendanceStatus:
                    record.status ??
                    "Absent",

                  attendanceMethod:
                    record.method ??
                    null,
                };
              }
            );

          setAttendance(mapped);
        } catch (error) {
          console.error(
            "Failed to load attendance:",
            error
          );

          setAttendance([]);
        } finally {
          setIsLoadingAttendance(false);
        }
      },
      [
        batchId,
      ]
    );

  // ============================================================
  // INITIAL DATA LOAD
  //
  // No automatic polling.
  //
  // Session state is loaded:
  // - when enrollment/batch becomes available
  // - when user manually refreshes
  // - after Time In
  // - after Time Out
  // ============================================================

  useEffect(() => {
    if (!batchId) {
      setAttendance([]);
      setOpenSessionId(null);
      setManualAttendanceOpen(false);

      return;
    }

    void loadAttendance();
    void loadOpenAttendanceSession();
  }, [
    batchId,
    loadAttendance,
    loadOpenAttendanceSession,
  ]);

  // ============================================================
  // MANUAL REFRESH
  //
  // This is the ONLY refresh button behavior.
  //
  // No 5-second / 5-minute polling.
  // ============================================================

  const handleRefresh =
    useCallback(
      async () => {
        try {
          setIsRefreshing(true);

          await Promise.all([
            loadAttendance(),
            loadOpenAttendanceSession(),
            loadMyEnrollments(),
          ]);
        } catch (error) {
          console.error(
            "Attendance refresh failed:",
            error
          );
        } finally {
          setIsRefreshing(false);
        }
      },
      [
        loadAttendance,
        loadOpenAttendanceSession,
        loadMyEnrollments,
      ]
    );

  // ============================================================
  // TODAY ATTENDANCE
  // ============================================================

  const today =
    useMemo(() => {
      if (
        attendance.length ===
        0
      ) {
        return null;
      }

      const now =
        new Date();

      const currentDate =
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(
          now.getDate()
        ).padStart(2, "0")}`;

      const todayRecord =
        attendance.find(
          item => {
            const itemDate =
              new Date(
                item.date
              );

            if (
              Number.isNaN(
                itemDate.getTime()
              )
            ) {
              return false;
            }

            const itemDateString =
              `${itemDate.getFullYear()}-${String(
                itemDate.getMonth() + 1
              ).padStart(2, "0")}-${String(
                itemDate.getDate()
              ).padStart(2, "0")}`;

            return (
              itemDateString ===
              currentDate
            );
          }
        );

      return (
        todayRecord ??
        attendance.find(
          item =>
            item.timeIn ||
            item.timeOut
        ) ??
        attendance[0]
      );
    }, [
      attendance,
    ]);

  // ============================================================
  // TIME IN
  //
  // Manual attendance requires:
  //
  // Session OPEN
  // +
  // Manual Attendance OPEN
  //
  // ============================================================

  const handleTimeIn =
    async () => {
      if (!enrollmentId) {
        Alert.alert(
          "No Enrollment",
          "You do not have an approved training enrollment."
        );

        return;
      }

      // ========================================================
      // MANUAL ATTENDANCE MUST BE OPEN
      // ========================================================

      if (!isManualAttendanceOpen) {
        Alert.alert(
          "Manual Attendance Closed",
          isSessionOpen
            ? "Your trainer has not opened manual attendance yet."
            : "Your trainer has not opened the attendance session yet."
        );

        return;
      }

      // ========================================================
      // ALREADY TIME IN
      // ========================================================

      if (today?.timeIn) {
        Alert.alert(
          "Already Timed In",
          `You already timed in at ${today.timeIn}.`
        );

        return;
      }

      try {
        setIsSubmittingAttendance(
          true
        );

        // ======================================================
        // USE CURRENT SESSION ID
        // ======================================================

        const sessionId =
          openSessionId;

        if (!sessionId) {
          Alert.alert(
            "Attendance Closed",
            "The attendance session is no longer open."
          );

          return;
        }

        // ======================================================
        // SUBMIT
        // ======================================================

        await attendanceApi.manual({
          attendanceSessionId:
            sessionId,

          action:
            "TimeIn",
        });

        // ======================================================
        // REFRESH DATA AFTER ACTION
        //
        // This is an intentional request because the participant
        // just changed attendance.
        // ======================================================

        await loadAttendance();

        await loadOpenAttendanceSession();

        Alert.alert(
          "Time In Successful",
          "Your Time In has been recorded."
        );
      } catch (error) {
        console.error(
          "Time In failed:",
          error
        );

        Alert.alert(
          "Time In Failed",
          getErrorMessage(
            error,
            "Unable to record your Time In."
          )
        );
      } finally {
        setIsSubmittingAttendance(
          false
        );
      }
    };

  // ============================================================
  // TIME OUT
  //
  // Manual attendance requires:
  //
  // Session OPEN
  // +
  // Manual Attendance OPEN
  //
  // ============================================================

  const handleTimeOut =
    async () => {
      if (!enrollmentId) {
        Alert.alert(
          "No Enrollment",
          "You do not have an approved training enrollment."
        );

        return;
      }

      // ========================================================
      // TIME IN REQUIRED
      // ========================================================

      if (!today?.timeIn) {
        Alert.alert(
          "Time In Required",
          "You need to Time In before you can Time Out."
        );

        return;
      }

      // ========================================================
      // ALREADY TIME OUT
      // ========================================================

      if (today.timeOut) {
        Alert.alert(
          "Already Timed Out",
          `You already timed out at ${today.timeOut}.`
        );

        return;
      }

      // ========================================================
      // MANUAL ATTENDANCE MUST BE OPEN
      // ========================================================

      if (!isManualAttendanceOpen) {
        Alert.alert(
          "Manual Attendance Closed",
          isSessionOpen
            ? "Your trainer has closed manual attendance."
            : "Your trainer has closed the attendance session."
        );

        return;
      }

      try {
        setIsSubmittingAttendance(
          true
        );

        // ======================================================
        // USE CURRENT SESSION
        // ======================================================

        const sessionId =
          openSessionId;

        if (!sessionId) {
          Alert.alert(
            "Attendance Closed",
            "The attendance session is no longer open."
          );

          return;
        }

        // ======================================================
        // SUBMIT
        // ======================================================

        await attendanceApi.manual({
          attendanceSessionId:
            sessionId,

          action:
            "TimeOut",
        });

        // ======================================================
        // REFRESH AFTER ACTION
        // ======================================================

        await loadAttendance();

        await loadOpenAttendanceSession();

        Alert.alert(
          "Time Out Successful",
          "Your Time Out has been recorded."
        );
      } catch (error) {
        console.error(
          "Time Out failed:",
          error
        );

        Alert.alert(
          "Time Out Failed",
          getErrorMessage(
            error,
            "Unable to record your Time Out."
          )
        );
      } finally {
        setIsSubmittingAttendance(
          false
        );
      }
    };

  // ============================================================
  // QR INFORMATION
  // ============================================================

  const handleQrInfo =
    () => {
      Alert.alert(
        "Participant QR",
        "This is your permanent attendance QR. Your trainer scans it during face-to-face training."
      );
    };

  // ============================================================
  // STATUS
  // ============================================================

  const statusText =
    today?.timeOut
      ? "Attendance completed"
      : today?.timeIn
      ? "Currently present"
      : isManualAttendanceOpen
      ? "Ready to Time In"
      : isSessionOpen
      ? "Waiting for manual attendance"
      : "Waiting for trainer";

  // ============================================================
  // LOADING
  // ============================================================

  if (
    isLoadingEnrollments ||
    isLoadingAttendance
  ) {
    return (
      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="sync-outline"
            size={30}
            color="#2563EB"
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          Loading Attendance
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Loading your enrollment and
          attendance information...
        </Text>
      </ScrollView>
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
      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          Unable to Load Enrollment
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          {String(
            enrollmentError
          )}
        </Text>

        <Pressable
          style={
            styles.retryButton
          }
          onPress={() =>
            void loadMyEnrollments()
          }
        >
          <Text
            style={
              styles.retryButtonText
            }
          >
            Retry
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ============================================================
  // NO APPROVED ENROLLMENT
  // ============================================================

  if (!currentEnrollment) {
    return (
      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <Ionicons
            name="school-outline"
            size={30}
            color="#94A3B8"
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          No Approved Enrollment
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Your permanent attendance QR will
          appear here after your training
          enrollment has been approved.
        </Text>
      </ScrollView>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ScrollView
      style={
        styles.container
      }
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
        style={
          styles.header
        }
      >
        <View>
          <Text
            style={
              styles.title
            }
          >
            Attendance
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Manage your training attendance.
          </Text>
        </View>

        {/* ====================================================
            MANUAL REFRESH BUTTON
        ==================================================== */}

        <Pressable
          onPress={() =>
            void handleRefresh()
          }
          disabled={
            isRefreshing ||
            isLoadingOpenSession ||
            isSubmittingAttendance
          }
          style={[
            styles.refreshButton,
            (
              isRefreshing ||
              isLoadingOpenSession ||
              isSubmittingAttendance
            )
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
        style={
          styles.trainingCard
        }
      >
        <View
          style={
            styles.trainingIcon
          }
        >
          <Ionicons
            name="school-outline"
            size={19}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.trainingContent
          }
        >
          <Text
            style={
              styles.trainingLabel
            }
          >
            TRAINING
          </Text>

          <Text
            style={
              styles.trainingName
            }
          >
            {currentEnrollment.programName}
          </Text>

          <Text
            style={
              styles.trainingBatch
            }
          >
            Batch{" "}
            {currentEnrollment.batchCode}
          </Text>
        </View>
      </View>

      {/* ======================================================
          SESSION STATUS
      ====================================================== */}

      <View
        style={
          styles.sessionStatusCard
        }
      >
        <View
          style={[
            styles.sessionStatusIcon,
            isSessionOpen
              ? styles.openIcon
              : styles.closedIcon,
          ]}
        >
          <Ionicons
            name={
              isSessionOpen
                ? "radio-outline"
                : "lock-closed-outline"
            }
            size={20}
            color={
              isSessionOpen
                ? "#16A34A"
                : "#64748B"
            }
          />
        </View>

        <View
          style={
            styles.sessionStatusContent
          }
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
            {isSessionOpen
              ? "Attendance Session is Open"
              : "Attendance Session is Closed"}
          </Text>

          <Text
            style={
              styles.sessionStatusText
            }
          >
            {isSessionOpen
              ? "Your trainer has started the training attendance session."
              : "Wait for your trainer to start the attendance session."}
          </Text>
        </View>

        <View
          style={[
            styles.openBadge,
            isSessionOpen
              ? styles.openBadgeActive
              : styles.openBadgeClosed,
          ]}
        >
          <Text
            style={[
              styles.openBadgeText,
              isSessionOpen
                ? styles.openBadgeTextActive
                : styles.openBadgeTextClosed,
            ]}
          >
            {isSessionOpen
              ? "OPEN"
              : "CLOSED"}
          </Text>
        </View>
      </View>

      {/* ======================================================
          MANUAL ATTENDANCE
      ====================================================== */}

      <View
        style={
          styles.manualAttendanceCard
        }
      >
        <View
          style={
            styles.manualAttendanceHeader
          }
        >
          <View
            style={[
              styles.manualAttendanceIcon,
              isManualAttendanceOpen
                ? styles.manualOpenIcon
                : styles.manualClosedIcon,
            ]}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={
                isManualAttendanceOpen
                  ? "#16A34A"
                  : "#64748B"
              }
            />
          </View>

          <View
            style={
              styles.manualAttendanceHeaderText
            }
          >
            <Text
              style={
                styles.manualAttendanceLabel
              }
            >
              MANUAL ATTENDANCE
            </Text>

            <Text
              style={
                styles.manualAttendanceTitle
              }
            >
              {isManualAttendanceOpen
                ? "Manual Attendance is Open"
                : "Manual Attendance is Closed"}
            </Text>

            <Text
              style={
                styles.manualAttendanceDescription
              }
            >
              {isManualAttendanceOpen
                ? "You can now use Time In and Time Out."
                : isSessionOpen
                ? "Wait for your trainer to open manual attendance."
                : "Manual attendance becomes available after the trainer starts the session."}
            </Text>
          </View>

          <View
            style={[
              styles.manualBadge,
              isManualAttendanceOpen
                ? styles.manualBadgeOpen
                : styles.manualBadgeClosed,
            ]}
          >
            <Text
              style={[
                styles.manualBadgeText,
                isManualAttendanceOpen
                  ? styles.manualBadgeTextOpen
                  : styles.manualBadgeTextClosed,
              ]}
            >
              {isManualAttendanceOpen
                ? "OPEN"
                : "CLOSED"}
            </Text>
          </View>
        </View>

        {/* ====================================================
            MANUAL ACTIONS
        ==================================================== */}

        <View
          style={
            styles.manualAttendanceActions
          }
        >
          {/* TIME IN */}

          <Pressable
            style={[
              styles.manualButton,
              styles.timeInButton,
              (
                !isManualAttendanceOpen ||
                Boolean(today?.timeIn) ||
                isSubmittingAttendance
              )
                ? styles.manualButtonDisabled
                : null,
            ]}
            onPress={
              handleTimeIn
            }
            disabled={
              !isManualAttendanceOpen ||
              Boolean(today?.timeIn) ||
              isSubmittingAttendance
            }
          >
            <Ionicons
              name="log-in-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.manualButtonText
              }
            >
              {today?.timeIn
                ? `Timed In ${today.timeIn}`
                : "Time In"}
            </Text>
          </Pressable>

          {/* TIME OUT */}

          <Pressable
            style={[
              styles.manualButton,
              styles.timeOutButton,
              (
                !isManualAttendanceOpen ||
                !today?.timeIn ||
                Boolean(today?.timeOut) ||
                isSubmittingAttendance
              )
                ? styles.manualButtonDisabled
                : null,
            ]}
            onPress={
              handleTimeOut
            }
            disabled={
              !isManualAttendanceOpen ||
              !today?.timeIn ||
              Boolean(today?.timeOut) ||
              isSubmittingAttendance
            }
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.manualButtonText
              }
            >
              {today?.timeOut
                ? `Timed Out ${today.timeOut}`
                : "Time Out"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================
          TODAY ATTENDANCE RECORD
      ====================================================== */}

      {today && (
        <View
          style={
            styles.section
          }
        >
          <AttendanceSessionCard
            attendance={
              today as any
            }
            onTimeIn={
              handleTimeIn
            }
            onTimeOut={
              handleTimeOut
            }
          />
        </View>
      )}

      {/* ======================================================
          CURRENT STATUS
      ====================================================== */}

      {today && (
        <View
          style={
            styles.currentStatusCard
          }
        >
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
            style={
              styles.currentStatusContent
            }
          >
            <Text
              style={
                styles.currentStatusLabel
              }
            >
              YOUR ATTENDANCE
            </Text>

            <Text
              style={
                styles.currentStatusValue
              }
            >
              {statusText}
            </Text>
          </View>
        </View>
      )}

      {/* ======================================================
          PERMANENT QR
          ====================================================== */}

      <View
        style={
          styles.section
        }
      >
        {hasAttendanceQr ? (
          <>
            <ParticipantQrCard
              participantCode={
                attendanceToken!
              }
              participantName={
                participantName
              }
              sessionOpen={
                isSessionOpen
              }
            />

            <Pressable
              onPress={
                handleQrInfo
              }
              style={
                styles.qrNotice
              }
            >
              <View
                style={
                  styles.qrNoticeIcon
                }
              >
                <Ionicons
                  name="scan-outline"
                  size={15}
                  color="#7C3AED"
                />
              </View>

              <View
                style={
                  styles.qrNoticeContent
                }
              >
                <Text
                  style={
                    styles.qrNoticeTitle
                  }
                >
                  Permanent Participant QR
                </Text>

                <Text
                  style={
                    styles.qrNoticeText
                  }
                >
                  This QR code does not expire.
                  Show it to your trainer during
                  face-to-face training. Your trainer
                  will scan it to record your attendance.
                </Text>
              </View>
            </Pressable>
          </>
        ) : (
          <View
            style={
              styles.qrUnavailable
            }
          >
            <View
              style={
                styles.qrUnavailableIcon
              }
            >
              <Ionicons
                name="qr-code-outline"
                size={25}
                color="#94A3B8"
              />
            </View>

            <Text
              style={
                styles.qrUnavailableTitle
              }
            >
              Attendance QR Unavailable
            </Text>

            <Text
              style={
                styles.qrUnavailableText
              }
            >
              Your permanent attendance QR will
              appear once your approved enrollment
              has an attendance token.
            </Text>
          </View>
        )}
      </View>

      {/* ======================================================
          ONLINE
      ====================================================== */}

      {today?.mode ===
        "Online" && (
        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.onlineInfo
            }
          >
            <View
              style={
                styles.onlineIcon
              }
            >
              <Ionicons
                name="globe-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.onlineContent
              }
            >
              <Text
                style={
                  styles.onlineTitle
                }
              >
                Online Attendance
              </Text>

              <Text
                style={
                  styles.onlineText
                }
              >
                When your trainer opens manual
                attendance, you can record your
                Time In and Time Out directly
                from this screen.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      {today && (
        <View
          style={
            styles.section
          }
        >
          <AttendanceSummary
            attendance={
              today as any
            }
          />
        </View>
      )}

      {/* ======================================================
          HISTORY
      ====================================================== */}

      {attendance.length >
        0 && (
        <View
          style={
            styles.section
          }
        >
          <AttendanceHistory
            history={
              attendance as any
            }
          />
        </View>
      )}

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <View
        style={
          styles.info
        }
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={17}
          color="#2563EB"
        />

        <Text
          style={
            styles.infoText
          }
        >
          Your attendance QR is permanent and
          belongs to your approved enrollment.
          Your trainer scans the QR during
          face-to-face training. Manual Time In
          and Time Out are available only when
          your trainer opens manual attendance.
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================
// ERROR MESSAGE
// ============================================================

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }

  return fallback;
}

// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  // ==========================================================
  // TRAINING
  // ==========================================================

  trainingCard: {
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

  trainingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  trainingContent: {
    flex: 1,
    marginLeft: 10,
  },

  trainingLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  trainingName: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
  },

  trainingBatch: {
    marginTop: 2,
    fontSize: 7,
    color: "#64748B",
  },

  // ==========================================================
  // SESSION
  // ==========================================================

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

  // ==========================================================
  // MANUAL ATTENDANCE
  // ==========================================================

  manualAttendanceCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  manualAttendanceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  manualAttendanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  manualOpenIcon: {
    backgroundColor: "#DCFCE7",
  },

  manualClosedIcon: {
    backgroundColor: "#F1F5F9",
  },

  manualAttendanceHeaderText: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 4,
  },

  manualAttendanceLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  manualAttendanceTitle: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
  },

  manualAttendanceDescription: {
    marginTop: 2,
    fontSize: 7,
    lineHeight: 11,
    color: "#64748B",
  },

  manualBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
  },

  manualBadgeOpen: {
    backgroundColor: "#DCFCE7",
  },

  manualBadgeClosed: {
    backgroundColor: "#F1F5F9",
  },

  manualBadgeText: {
    fontSize: 5.5,
    fontWeight: "900",
  },

  manualBadgeTextOpen: {
    color: "#15803D",
  },

  manualBadgeTextClosed: {
    color: "#64748B",
  },

  manualAttendanceActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  manualButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  timeInButton: {
    backgroundColor: "#16A34A",
  },

  timeOutButton: {
    backgroundColor: "#2563EB",
  },

  manualButtonDisabled: {
    opacity: 0.35,
  },

  manualButtonText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  // ==========================================================
  // CURRENT STATUS
  // ==========================================================

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

  // ==========================================================
  // QR NOTICE
  // ==========================================================

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

  // ==========================================================
  // QR UNAVAILABLE
  // ==========================================================

  qrUnavailable: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  qrUnavailableIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  qrUnavailableTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    textAlign: "center",
  },

  qrUnavailableText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 8,
    lineHeight: 13,
    color: "#94A3B8",
  },

  // ==========================================================
  // ONLINE
  // ==========================================================

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

  // ==========================================================
  // INFO
  // ==========================================================

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

  // ==========================================================
  // RETRY
  // ==========================================================

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

  // ==========================================================
  // EMPTY
  // ==========================================================

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
    textAlign: "center",
  },

  emptyText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 14,
    color: "#94A3B8",
  },
});