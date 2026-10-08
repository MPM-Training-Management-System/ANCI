import {
  useCallback,
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

function getErrorMessage(
  error: unknown
): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}


function getRecordDate(
  record: AttendanceRecordDto
): string {
  const item =
    record as AttendanceRecordWithExtraFields;

  return (
    item.attendanceDate ??
    item.sessionDate ??
    item.date ??
    item.createdAt ??
    ""
  );
}


function getRecordMode(
  record: AttendanceRecordDto
): string {
  const item =
    record as AttendanceRecordWithExtraFields;

  const mode =
    item.mode ??
    item.trainingMode ??
    "";

  if (
    String(mode).toLowerCase() ===
    "online"
  ) {
    return "Online";
  }

  if (
    String(mode).toLowerCase() ===
      "face-to-face" ||
    String(mode).toLowerCase() ===
      "face to face"
  ) {
    return "Face-to-Face";
  }

  return mode || "Training Session";
}


function formatDate(
  value: string
): string {
  if (!value) {
    return "Date unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


function formatTime(
  value: string | null
): string {
  if (!value) {
    return "--";
  }

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


function getStatusLabel(
  status: string | null | undefined
): string {
  switch (
    String(status ?? "").toLowerCase()
  ) {
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
  switch (
    String(status ?? "").toLowerCase()
  ) {
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
    isLoading:
      isLoadingEnrollments,
    error:
      enrollmentError,
  } = useEnrollments(
    enrollmentApi
  );


  // ==========================================================
  // APP ALERT
  // ==========================================================

  const [
    appAlert,
    setAppAlert,
  ] = useState({
    visible: false,
    type:
      "info" as
        | "success"
        | "error"
        | "warning"
        | "info",
    title: "",
    message: "",
    confirmText: "OK",
    showCancel: false,
  });

  const [
    alertAction,
    setAlertAction,
  ] = useState<
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
    setAlertAction(
      () =>
        onConfirm ??
        null
    );

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
    const action =
      alertAction;

    setAlertAction(null);

    setAppAlert(
      (prev) => ({
        ...prev,
        visible: false,
      })
    );

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

    error:
      attendanceError,
  } = useAttendance(
    attendanceApi
  );


  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [
    trainingSessions,
    setTrainingSessions,
  ] = useState<TrainingSession[]>(
    []
  );

  const [
    trainingSessionId,
    setTrainingSessionId,
  ] = useState<string | null>(
    null
  );

  const [
    isLoadingSchedule,
    setIsLoadingSchedule,
  ] = useState(false);

  const [
    trainingSessionError,
    setTrainingSessionError,
  ] = useState<Error | null>(
    null
  );

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    expandedHistoryId,
    setExpandedHistoryId,
  ] = useState<string | null>(
    null
  );


  // ==========================================================
  // APPROVED ENROLLMENT
  // ==========================================================

  const approvedEnrollment =
    useMemo(() => {
      return enrollments.find(
        (enrollment) => {
          const status =
            String(
              enrollment.status ?? ""
            ).toLowerCase();

          return (
            status === "approved" ||
            status === "active"
          );
        }
      );
    }, [
      enrollments,
    ]);


  // ==========================================================
  // IDS
  // ==========================================================

  const enrollmentId =
    approvedEnrollment?.id ??
    null;

  const batchId =
    approvedEnrollment?.trainingBatchId ??
    null;


  // ==========================================================
  // PARTICIPANT INFO
  // ==========================================================

  const participantName =
    approvedEnrollment?.participant
      ?.fullName ??
    "Participant";

  const participantCode =
    approvedEnrollment?.attendanceToken ??
    "";


  // ==========================================================
  // LOAD ALL ATTENDANCE DATA
  //
  // IMPORTANT:
  // This is now the MAIN fetching function.
  //
  // Every time the Attendance screen becomes focused,
  // this function runs again.
  // ==========================================================

  const loadAllAttendanceData =
    useCallback(
      async () => {
        try {
          console.log(
            "========================================"
          );

          console.log(
            "ATTENDANCE SCREEN - AUTO FETCH START"
          );

          console.log(
            "========================================"
          );


          // ==================================================
          // 1. LOAD ENROLLMENTS
          // ==================================================

          const currentEnrollments =
            await loadMyEnrollments();


          // ==================================================
          // 2. FIND APPROVED / ACTIVE ENROLLMENT
          // ==================================================

          const approved =
            currentEnrollments.find(
              (enrollment) => {
                const status =
                  String(
                    enrollment.status ??
                      ""
                  ).toLowerCase();

                return (
                  status ===
                    "approved" ||
                  status ===
                    "active"
                );
              }
            );


          const currentBatchId =
            approved
              ?.trainingBatchId ??
            null;


          // ==================================================
          // NO APPROVED TRAINING
          // ==================================================

          if (!currentBatchId) {
            setTrainingSessions(
              []
            );

            setTrainingSessionId(
              null
            );

            console.log(
              "ATTENDANCE SCREEN - NO APPROVED TRAINING"
            );

            return;
          }


          // ==================================================
          // 3. LOAD PARTICIPANT SCHEDULE
          // ==================================================

          setIsLoadingSchedule(
            true
          );

          setTrainingSessionError(
            null
          );


          const schedule =
            await trainingBatchApi
              .getParticipantSchedule(
                currentBatchId
              );


          const sessions =
            Array.isArray(
              schedule
            )
              ? schedule
              : [];


          setTrainingSessions(
            sessions
          );


          console.log(
            "========================================"
          );

          console.log(
            "PARTICIPANT SCHEDULE LOADED"
          );

          console.log(
            "batchId:",
            currentBatchId
          );

          console.log(
            "number of sessions:",
            sessions.length
          );

          console.log(
            "========================================"
          );


          // ==================================================
          // 4. FIND ACTUALLY OPEN ATTENDANCE SESSION
          // ==================================================

          let selectedSessionId:
            string | null = null;


          if (
            sessions.length > 0
          ) {

            console.log(
              "CHECKING ALL TRAINING SESSIONS..."
            );


            const openSessionResults =
              await Promise.all(
                sessions.map(
                  async (
                    session
                  ) => {
                    try {

                      const result =
                        await attendanceApi
                          .getOpenSession(
                            currentBatchId,
                            session.id
                          );


                      console.log(
                        "ATTENDANCE SESSION CHECK",
                        {
                          trainingSessionId:
                            session.id,

                          isOpen:
                            result?.isOpen,

                          attendanceSessionId:
                            result?.attendanceSessionId,

                          manualAttendanceOpen:
                            result?.manualAttendanceOpen,
                        }
                      );


                      return {
                        session,
                        result,
                      };

                    } catch (
                      error
                    ) {

                      console.log(
                        "FAILED TO CHECK ATTENDANCE SESSION",
                        {
                          trainingSessionId:
                            session.id,

                          error,
                        }
                      );


                      return {
                        session,
                        result:
                          null,
                      };
                    }
                  }
                )
              );


            // =================================================
            // FIND OPEN SESSION
            // =================================================

            const activeSession =
              openSessionResults.find(
                (item) =>
                  item.result
                    ?.isOpen ===
                    true &&
                  Boolean(
                    item.result
                      ?.attendanceSessionId
                  )
              );


            if (
              activeSession
            ) {

              selectedSessionId =
                activeSession
                  .session.id;


              console.log(
                "========================================"
              );

              console.log(
                "ACTIVE ATTENDANCE SESSION FOUND"
              );

              console.log(
                "trainingSessionId:",
                selectedSessionId
              );

              console.log(
                "attendanceSessionId:",
                activeSession
                  .result
                  ?.attendanceSessionId
              );

              console.log(
                "manualAttendanceOpen:",
                activeSession
                  .result
                  ?.manualAttendanceOpen
              );

              console.log(
                "========================================"
              );

            } else {

              // ===============================================
              // NO OPEN SESSION
              // FIND FALLBACK SESSION
              // ===============================================

              const now =
                new Date();


              // ===============================================
              // TODAY
              // ===============================================

              const today =
                sessions.find(
                  (session) => {

                    if (
                      !session.sessionDate
                    ) {
                      return false;
                    }


                    const date =
                      new Date(
                        session.sessionDate
                      );


                    return (
                      date.getFullYear() ===
                        now.getFullYear() &&
                      date.getMonth() ===
                        now.getMonth() &&
                      date.getDate() ===
                        now.getDate()
                    );
                  }
                );


              // ===============================================
              // UPCOMING
              // ===============================================

              const upcoming =
                sessions
                  .filter(
                    (
                      session
                    ) => {

                      if (
                        !session.sessionDate
                      ) {
                        return false;
                      }


                      return (
                        new Date(
                          session.sessionDate
                        ).getTime() >=
                        now.getTime()
                      );
                    }
                  )
                  .sort(
                    (
                      a,
                      b
                    ) =>
                      new Date(
                        a.sessionDate
                      ).getTime() -
                      new Date(
                        b.sessionDate
                      ).getTime()
                  )[0];


              // ===============================================
              // LATEST
              // ===============================================

              const latest =
                [
                  ...sessions,
                ].sort(
                  (
                    a,
                    b
                  ) =>
                    new Date(
                      b.sessionDate
                    ).getTime() -
                    new Date(
                      a.sessionDate
                    ).getTime()
                )[0];


              const selected =
                today ??
                upcoming ??
                latest;


              selectedSessionId =
                selected?.id ??
                null;


              console.log(
                "========================================"
              );

              console.log(
                "NO OPEN ATTENDANCE SESSION"
              );

              console.log(
                "Fallback trainingSessionId:",
                selectedSessionId
              );

              console.log(
                "========================================"
              );
            }
          }


          // ==================================================
          // SAVE SELECTED TRAINING SESSION
          // ==================================================

          setTrainingSessionId(
            selectedSessionId
          );


          // ==================================================
          // SCHEDULE LOADING FINISHED
          // ==================================================

          setIsLoadingSchedule(
            false
          );


          // ==================================================
          // 5. LOAD ATTENDANCE RECORDS
          // ==================================================

          console.log(
            "LOADING BATCH ATTENDANCE..."
          );


          await loadBatchAttendance(
            currentBatchId
          );


          // ==================================================
          // 6. LOAD OPEN ATTENDANCE SESSION
          // ==================================================

          if (
            selectedSessionId
          ) {

            console.log(
              "LOADING OPEN ATTENDANCE SESSION..."
            );


            await loadOpenAttendanceSession(
              currentBatchId,
              selectedSessionId
            );
          }


          console.log(
            "========================================"
          );

          console.log(
            "ATTENDANCE SCREEN - AUTO FETCH COMPLETE"
          );

          console.log(
            "batchId:",
            currentBatchId
          );

          console.log(
            "trainingSessionId:",
            selectedSessionId
          );

          console.log(
            "========================================"
          );

        } catch (
          error
        ) {

          console.log(
            "========================================"
          );

          console.log(
            "ATTENDANCE SCREEN AUTO FETCH ERROR"
          );

          console.log(
            error
          );

          console.log(
            "========================================"
          );


          const normalized =
            error instanceof Error
              ? error
              : new Error(
                  "Failed to load attendance data."
                );


          setTrainingSessionError(
            normalized
          );

        } finally {

          setIsLoadingSchedule(
            false
          );
        }
      },
      [
        loadMyEnrollments,
        loadBatchAttendance,
        loadOpenAttendanceSession,
      ]
    );


  // ==========================================================
  // AUTO FETCH WHEN SCREEN IS FOCUSED
  //
  // THIS IS THE MAIN FIX.
  // ==========================================================

  useFocusEffect(
    useCallback(
      () => {
        console.log(
          "========================================"
        );

        console.log(
          "ATTENDANCE SCREEN FOCUSED"
        );

        console.log(
          "FETCHING LATEST ATTENDANCE DATA..."
        );

        console.log(
          "========================================"
        );

        void loadAllAttendanceData();
      },
      [
        loadAllAttendanceData,
      ]
    )
  );


  // ==========================================================
  // CURRENT ATTENDANCE
  // ==========================================================

  const todayAttendance =
    useMemo(() => {

      if (
        !batchAttendance.length
      ) {

        console.log(
          "MOBILE - NO ATTENDANCE RECORDS"
        );

        return null;
      }


      console.log(
        "========================================"
      );

      console.log(
        "MOBILE - CURRENT ATTENDANCE RECORD"
      );

      console.log(
        "attendance records:",
        batchAttendance
      );


      // ------------------------------------------------------
      // Get latest attendance record with Time In.
      // ------------------------------------------------------

      const recordsWithTimeIn =
        batchAttendance.filter(
          (record) =>
            Boolean(
              record.timeIn
            )
        );


      const currentRecord =
        [
          ...recordsWithTimeIn,
        ].sort(
          (
            a,
            b
          ) => {

            const timeA =
              a.timeIn
                ? new Date(
                    a.timeIn
                  ).getTime()
                : 0;


            const timeB =
              b.timeIn
                ? new Date(
                    b.timeIn
                  ).getTime()
                : 0;


            return (
              timeB - timeA
            );
          }
        )[0] ??
        null;


      console.log(
        "found record:",
        currentRecord
      );

      console.log(
        "timeIn:",
        currentRecord?.timeIn
      );

      console.log(
        "timeOut:",
        currentRecord?.timeOut
      );

      console.log(
        "hasTimeIn:",
        Boolean(
          currentRecord?.timeIn
        )
      );

      console.log(
        "hasTimeOut:",
        Boolean(
          currentRecord?.timeOut
        )
      );

      console.log(
        "========================================"
      );


      return currentRecord;

    }, [
      batchAttendance,
    ]);


  // ==========================================================
  // HISTORY
  // ==========================================================

  const history =
    useMemo(() => {

      return batchAttendance
        .filter(
          (record) =>
            Boolean(
              record.timeIn &&
                record.timeOut
            )
        )
        .sort(
          (
            a,
            b
          ) => {

            const dateA =
              new Date(
                getRecordDate(
                  a
                )
              ).getTime();


            const dateB =
              new Date(
                getRecordDate(
                  b
                )
              ).getTime();


            return (
              dateB -
              dateA
            );
          }
        );

    }, [
      batchAttendance,
    ]);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const attendanceSummary =
    useMemo(() => {

      const completed =
        batchAttendance.filter(
          (record) =>
            Boolean(
              record.timeIn &&
                record.timeOut
            )
        );


      const present =
        completed.filter(
          (record) =>
            String(
              record.status
            ).toLowerCase() ===
            "present"
        ).length;


      const late =
        completed.filter(
          (record) =>
            String(
              record.status
            ).toLowerCase() ===
            "late"
        ).length;


      const absent =
        completed.filter(
          (record) =>
            String(
              record.status
            ).toLowerCase() ===
            "absent"
        ).length;


      return {
        total:
          completed.length,

        present,

        late,

        absent,
      };

    }, [
      batchAttendance,
    ]);


  // ==========================================================
  // SESSION STATE
  // ==========================================================

  const isSessionOpen =
    Boolean(
      openSessionId
    );


  const isManualAttendanceOpen =
    Boolean(
      openSessionId &&
        manualAttendanceOpen
    );


  const hasTimedIn =
    Boolean(
      todayAttendance?.timeIn
    );


  const hasTimedOut =
    Boolean(
      todayAttendance?.timeOut
    );


  const canTimeIn =
    Boolean(
      enrollmentId &&
        openSessionId &&
        manualAttendanceOpen &&
        !hasTimedIn &&
        !isSubmitting
    );


  const canTimeOut =
    Boolean(
      enrollmentId &&
        openSessionId &&
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


  const errorMessage =
    getErrorMessage(
      rawError
    );


  // ==========================================================
  // TIME IN
  // ==========================================================

  const handleTimeIn =
    useCallback(
      async () => {

        if (
          !enrollmentId
        ) {

          showAlert(
            "Unable to Time In",
            "Your enrollment could not be found."
          );

          return;
        }


        if (
          !openSessionId
        ) {

          showAlert(
            "Attendance Closed",
            "The attendance session is currently closed."
          );

          return;
        }


        if (
          !manualAttendanceOpen
        ) {

          showAlert(
            "Manual Attendance Closed",
            "The trainer has not opened manual attendance yet."
          );

          return;
        }


        if (
          todayAttendance?.timeIn
        ) {

          showAlert(
            "Already Timed In",
            "You have already recorded your Time In."
          );

          return;
        }


        try {

          console.log(
            "========================================"
          );

          console.log(
            "MOBILE - SUBMITTING TIME IN"
          );

          console.log(
            "attendanceSessionId:",
            openSessionId
          );

          console.log(
            "enrollmentId:",
            enrollmentId
          );

          console.log(
            "manualAttendanceOpen:",
            manualAttendanceOpen
          );

          console.log(
            "========================================"
          );


          await manualAttendance({
            attendanceSessionId:
              openSessionId,

            action:
              "TimeIn",
          });


          console.log(
            "TIME IN SUCCESSFUL"
          );


          // --------------------------------------------------
          // REFRESH ATTENDANCE RECORDS
          // --------------------------------------------------

          if (
            batchId
          ) {

            await refreshBatchAttendance(
              batchId
            );
          }


          // --------------------------------------------------
          // REFRESH OPEN SESSION
          // --------------------------------------------------

          if (
            batchId &&
            trainingSessionId
          ) {

            await refreshOpenAttendanceSession(
              batchId,
              trainingSessionId
            );
          }


          console.log(
            "ATTENDANCE DATA REFRESHED"
          );


          showAlert(
            "Time In Successful",
            "Your attendance Time In has been recorded.",
            "success"
          );

        } catch (
          err
        ) {

          console.log(
            "TIME IN ERROR:",
            err
          );


          showAlert(
            "Time In Failed",
            getErrorMessage(
              err
            ) ??
              "Unable to record your Time In.",
            "error"
          );
        }

      },
      [
        enrollmentId,
        openSessionId,
        manualAttendanceOpen,
        todayAttendance,
        manualAttendance,
        batchId,
        trainingSessionId,
        refreshBatchAttendance,
        refreshOpenAttendanceSession,
      ]
    );


  // ==========================================================
  // TIME OUT
  // ==========================================================

  const handleTimeOut =
    useCallback(
      async () => {

        console.log(
          "========================================"
        );

        console.log(
          "MOBILE - TIME OUT PRESSED"
        );

        console.log(
          "enrollmentId:",
          enrollmentId
        );

        console.log(
          "openSessionId:",
          openSessionId
        );

        console.log(
          "manualAttendanceOpen:",
          manualAttendanceOpen
        );

        console.log(
          "todayAttendance:",
          todayAttendance
        );

        console.log(
          "timeIn:",
          todayAttendance?.timeIn
        );

        console.log(
          "timeOut:",
          todayAttendance?.timeOut
        );

        console.log(
          "========================================"
        );


        if (
          !enrollmentId
        ) {

          showAlert(
            "Unable to Time Out",
            "Your enrollment could not be found."
          );

          return;
        }


        if (
          !openSessionId
        ) {

          showAlert(
            "Attendance Closed",
            "The attendance session is currently closed."
          );

          return;
        }


        if (
          !manualAttendanceOpen
        ) {

          showAlert(
            "Manual Attendance Closed",
            "The trainer has not opened manual attendance."
          );

          return;
        }


        if (
          !todayAttendance?.timeIn
        ) {

          showAlert(
            "Time In Required",
            "You must Time In before recording Time Out."
          );

          return;
        }


        if (
          todayAttendance.timeOut
        ) {

          showAlert(
            "Already Timed Out",
            "You have already recorded your Time Out."
          );

          return;
        }


        try {

          console.log(
            "SUBMITTING TIME OUT..."
          );


          await manualAttendance({
            attendanceSessionId:
              openSessionId,

            action:
              "TimeOut",
          });


          console.log(
            "TIME OUT API SUCCESSFUL"
          );


          // --------------------------------------------------
          // REFRESH ATTENDANCE RECORD
          // --------------------------------------------------

          if (
            batchId
          ) {

            await refreshBatchAttendance(
              batchId
            );
          }


          // --------------------------------------------------
          // REFRESH SESSION
          // --------------------------------------------------

          if (
            batchId &&
            trainingSessionId
          ) {

            await refreshOpenAttendanceSession(
              batchId,
              trainingSessionId
            );
          }


          console.log(
            "TIME OUT DATA REFRESHED"
          );


          showAlert(
            "Time Out Successful",
            "Your attendance Time Out has been recorded.",
            "success"
          );

        } catch (
          err
        ) {

          console.log(
            "TIME OUT ERROR:",
            err
          );


          showAlert(
            "Time Out Failed",
            getErrorMessage(
              err
            ) ??
              "Unable to record your Time Out.",
            "error"
          );
        }

      },
      [
        enrollmentId,
        openSessionId,
        manualAttendanceOpen,
        todayAttendance,
        manualAttendance,
        batchId,
        trainingSessionId,
        refreshBatchAttendance,
        refreshOpenAttendanceSession,
      ]
    );


  // ==========================================================
  // PULL TO REFRESH
  // ==========================================================

  const handleRefresh =
    useCallback(
      async () => {

        setIsRefreshing(
          true
        );


        try {

          await loadAllAttendanceData();

        } finally {

          setIsRefreshing(
            false
          );
        }

      },
      [
        loadAllAttendanceData,
      ]
    );


  // ==========================================================
  // LOADING
  // ==========================================================

  const isInitialLoading =
    isLoadingEnrollments ||
    isLoadingSchedule;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.contentContainer
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
      showsVerticalScrollIndicator={
        false
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

        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="qr-code-outline"
            size={26}
            color="#FFFFFF"
          />
        </View>


        <View
          style={
            styles.headerTextContainer
          }
        >

          <Text
            style={
              styles.headerTitle
            }
          >
            Attendance
          </Text>


          <Text
            style={
              styles.headerSubtitle
            }
          >
            Track your training attendance
          </Text>

        </View>

      </View>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {isInitialLoading && (
        <View
          style={
            styles.loadingCard
          }
        >

          <ActivityIndicator
            size="small"
            color="#002B5C"
          />


          <Text
            style={
              styles.loadingText
            }
          >
            Loading attendance...
          </Text>

        </View>
      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMessage && (
        <View
          style={
            styles.errorCard
          }
        >

          <Ionicons
            name="alert-circle-outline"
            size={22}
            color="#B42318"
          />


          <View
            style={
              styles.errorContent
            }
          >

            <Text
              style={
                styles.errorTitle
              }
            >
              Attendance Error
            </Text>


            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage}
            </Text>

          </View>

        </View>
      )}


      {/* ======================================================
          NO APPROVED ENROLLMENT
      ====================================================== */}

      {!isInitialLoading &&
        !approvedEnrollment && (
          <View
            style={
              styles.emptyCard
            }
          >

            <Ionicons
              name="school-outline"
              size={42}
              color="#002B5C"
            />


            <Text
              style={
                styles.emptyTitle
              }
            >
              No Approved Training
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              You currently do not have an approved
              training enrollment.
            </Text>

          </View>
        )}


      {/* ======================================================
          APPROVED ENROLLMENT CONTENT
      ====================================================== */}

      {approvedEnrollment && (
        <>

          {/* ==================================================
              CURRENT ATTENDANCE
          ================================================== */}

          <View
            style={
              styles.section
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Current Attendance
            </Text>


            <View
              style={
                styles.statusCard
              }
            >

              <View
                style={
                  styles.statusIconContainer
                }
              >

                <Ionicons
                  name={
                    todayAttendance
                      ? getStatusIcon(
                          todayAttendance.status
                        )
                      : "calendar-outline"
                  }
                  size={28}
                  color="#002B5C"
                />

              </View>


              <View
                style={
                  styles.statusContent
                }
              >

                <Text
                  style={
                    styles.statusTitle
                  }
                >
                  {todayAttendance
                    ? getStatusLabel(
                        todayAttendance.status
                      )
                    : "No Attendance Record"}
                </Text>


                <Text
                  style={
                    styles.statusSubtitle
                  }
                >
                  {todayAttendance
                    ? `${formatDate(
                        getRecordDate(
                          todayAttendance
                        )
                      )} • ${getRecordMode(
                        todayAttendance
                      )}`
                    : "No attendance record has been recorded for today."}
                </Text>


                {todayAttendance && (
                  <View
                    style={
                      styles.timeRow
                    }
                  >

                    <View
                      style={
                        styles.timeItem
                      }
                    >

                      <Ionicons
                        name="log-in-outline"
                        size={16}
                        color="#3B7597"
                      />


                      <View>
                        <Text
                          style={
                            styles.timeLabel
                          }
                        >
                          Time In
                        </Text>


                        <Text
                          style={
                            styles.timeValue
                          }
                        >
                          {formatTime(
                            todayAttendance.timeIn
                          )}
                        </Text>
                      </View>

                    </View>


                    <View
                      style={
                        styles.timeItem
                      }
                    >

                      <Ionicons
                        name="log-out-outline"
                        size={16}
                        color="#3B7597"
                      />


                      <View>
                        <Text
                          style={
                            styles.timeLabel
                          }
                        >
                          Time Out
                        </Text>


                        <Text
                          style={
                            styles.timeValue
                          }
                        >
                          {formatTime(
                            todayAttendance.timeOut
                          )}
                        </Text>
                      </View>

                    </View>

                  </View>
                )}

              </View>

            </View>

          </View>


          {/* ==================================================
              SESSION STATUS
          ================================================== */}

          <View
            style={
              styles.sessionStatusCard
            }
          >

            <View
              style={
                styles.sessionStatusLeft
              }
            >

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      isSessionOpen
                        ? "#12B76A"
                        : "#98A2B3",
                  },
                ]}
              />


              <View>

                <Text
                  style={
                    styles.sessionStatusTitle
                  }
                >
                  Attendance Session
                </Text>


                <Text
                  style={
                    styles.sessionStatusSubtitle
                  }
                >
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
                  color:
                    isSessionOpen
                      ? "#027A48"
                      : "#667085",
                },
              ]}
            >
              {isSessionOpen
                ? "OPEN"
                : "CLOSED"}
            </Text>

          </View>


          {/* ==================================================
              PARTICIPANT QR
          ================================================== */}

          <View
            style={
              styles.section
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              My Attendance QR
            </Text>


            {participantCode ? (
              <ParticipantQrCard
                participantCode={
                  participantCode
                }
                participantName={
                  participantName
                }
              />
            ) : (
              <View
                style={
                  styles.qrUnavailableCard
                }
              >

                <Ionicons
                  name="qr-code-outline"
                  size={38}
                  color="#98A2B3"
                />


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
                  Your participant code could not
                  be loaded.
                </Text>

              </View>
            )}

          </View>


          {/* ==================================================
              MANUAL ATTENDANCE
          ================================================== */}

          <View
            style={
              styles.section
            }
          >

            <View
              style={
                styles.sectionHeaderRow
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Manual Attendance
              </Text>


              <View
                style={[
                  styles.manualBadge,
                  {
                    backgroundColor:
                      isManualAttendanceOpen
                        ? "#ECFDF3"
                        : "#F2F4F7",
                  },
                ]}
              >

                <Text
                  style={[
                    styles.manualBadgeText,
                    {
                      color:
                        isManualAttendanceOpen
                          ? "#027A48"
                          : "#667085",
                    },
                  ]}
                >
                  {isManualAttendanceOpen
                    ? "OPEN"
                    : "CLOSED"}
                </Text>

              </View>

            </View>


            <View
              style={
                styles.manualCard
              }
            >

              <Text
                style={
                  styles.manualDescription
                }
              >
                Time In and Time Out are available
                only when the trainer opens manual
                attendance.
              </Text>


              <View
                style={
                  styles.manualButtons
                }
              >

                <Pressable
                  onPress={
                    handleTimeIn
                  }
                  disabled={
                    !canTimeIn
                  }
                  style={[
                    styles.attendanceButton,
                    styles.timeInButton,
                    !canTimeIn &&
                      styles.disabledButton,
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


                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Time In
                  </Text>

                </Pressable>


                <Pressable
                  onPress={
                    handleTimeOut
                  }
                  disabled={
                    !canTimeOut
                  }
                  style={[
                    styles.attendanceButton,
                    styles.timeOutButton,
                    !canTimeOut &&
                      styles.disabledButton,
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


                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Time Out
                  </Text>

                </Pressable>

              </View>


              {!isManualAttendanceOpen && (
                <Text
                  style={
                    styles.disabledReason
                  }
                >
                  Manual attendance is currently
                  closed by the trainer.
                </Text>
              )}


              {todayAttendance?.timeIn &&
                !todayAttendance?.timeOut && (
                  <Text
                    style={
                      styles.disabledReason
                    }
                  >
                    You have already timed in.
                    Time Out when manual attendance
                    is available.
                  </Text>
                )}


              {todayAttendance?.timeOut && (
                <Text
                  style={
                    styles.completedReason
                  }
                >
                  Your attendance for today is
                  complete.
                </Text>
              )}

            </View>

          </View>


          {/* ==================================================
              SUMMARY
          ================================================== */}

          <View
            style={
              styles.section
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Attendance Summary
            </Text>


            <View
              style={
                styles.summaryGrid
              }
            >

              <View
                style={
                  styles.summaryCard
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    attendanceSummary.total
                  }
                </Text>


                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Completed
                </Text>

              </View>


              <View
                style={
                  styles.summaryCard
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    attendanceSummary.present
                  }
                </Text>


                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Present
                </Text>

              </View>


              <View
                style={
                  styles.summaryCard
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    attendanceSummary.late
                  }
                </Text>


                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Late
                </Text>

              </View>


              <View
                style={
                  styles.summaryCard
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    attendanceSummary.absent
                  }
                </Text>


                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Absent
                </Text>

              </View>

            </View>

          </View>


          {/* ==================================================
              HISTORY
          ================================================== */}

          <View
            style={
              styles.section
            }
          >

            <View
              style={
                styles.sectionHeaderRow
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Attendance History
              </Text>


              <Text
                style={
                  styles.historyCount
                }
              >
                {history.length}
              </Text>

            </View>


            {history.length === 0 ? (

              <View
                style={
                  styles.historyEmpty
                }
              >

                <Ionicons
                  name="time-outline"
                  size={34}
                  color="#98A2B3"
                />


                <Text
                  style={
                    styles.historyEmptyTitle
                  }
                >
                  No completed attendance
                </Text>


                <Text
                  style={
                    styles.historyEmptyText
                  }
                >
                  Completed Time In and Time Out
                  records will appear here.
                </Text>

              </View>

            ) : (

              history.map(
                (record) => {

                  const isExpanded =
                    expandedHistoryId ===
                    record.id;


                  return (
                    <Pressable
                      key={
                        record.id
                      }
                      onPress={() =>
                        setExpandedHistoryId(
                          isExpanded
                            ? null
                            : record.id
                        )
                      }
                      style={
                        styles.historyItem
                      }
                    >

                      <View
                        style={
                          styles.historyMainRow
                        }
                      >

                        <View
                          style={
                            styles.historyIcon
                          }
                        >

                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#027A48"
                          />

                        </View>


                        <View
                          style={
                            styles.historyMainContent
                          }
                        >

                          <Text
                            style={
                              styles.historyDate
                            }
                          >
                            {formatDate(
                              getRecordDate(
                                record
                              )
                            )}
                          </Text>


                          <Text
                            style={
                              styles.historyMode
                            }
                          >
                            {getRecordMode(
                              record
                            )}
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
                        <View
                          style={
                            styles.historyDetails
                          }
                        >

                          <View
                            style={
                              styles.historyDetailRow
                            }
                          >

                            <Text
                              style={
                                styles.historyDetailLabel
                              }
                            >
                              Time In
                            </Text>


                            <Text
                              style={
                                styles.historyDetailValue
                              }
                            >
                              {formatTime(
                                record.timeIn
                              )}
                            </Text>

                          </View>


                          <View
                            style={
                              styles.historyDetailRow
                            }
                          >

                            <Text
                              style={
                                styles.historyDetailLabel
                              }
                            >
                              Time Out
                            </Text>


                            <Text
                              style={
                                styles.historyDetailValue
                              }
                            >
                              {formatTime(
                                record.timeOut
                              )}
                            </Text>

                          </View>


                          <View
                            style={
                              styles.historyDetailRow
                            }
                          >

                            <Text
                              style={
                                styles.historyDetailLabel
                              }
                            >
                              Status
                            </Text>


                            <Text
                              style={
                                styles.historyDetailValue
                              }
                            >
                              {getStatusLabel(
                                record.status
                              )}
                            </Text>

                          </View>


                          <View
                            style={
                              styles.historyDetailRow
                            }
                          >

                            <Text
                              style={
                                styles.historyDetailLabel
                              }
                            >
                              Method
                            </Text>


                            <Text
                              style={
                                styles.historyDetailValue
                              }
                            >
                              {record.method ||
                                "Manual"}
                            </Text>

                          </View>

                        </View>
                      )}

                    </Pressable>
                  );
                }
              )

            )}

          </View>

        </>
      )}


      {/* ======================================================
          BOTTOM SPACING
      ====================================================== */}

      <View
        style={
          styles.bottomSpacing
        }
      />


      {/* ======================================================
          APP ALERT
      ====================================================== */}

      <AppAlert
        visible={
          appAlert.visible
        }
        type={
          appAlert.type
        }
        title={
          appAlert.title
        }
        message={
          appAlert.message
        }
        confirmText={
          appAlert.confirmText
        }
        onConfirm={
          closeAlert
        }
        showCancel={
          false
        }
      />

    </ScrollView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    // --------------------------------------------------------
    // CONTAINER
    // --------------------------------------------------------

    container: {
      flex: 1,
      backgroundColor:
        "#F7F9FB",
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 48,
      paddingBottom: 80,
    },


    // --------------------------------------------------------
    // HEADER
    // --------------------------------------------------------

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    headerIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor:
        "#002B5C",
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


    // --------------------------------------------------------
    // LOADING
    // --------------------------------------------------------

    loadingCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },

    loadingText: {
      marginLeft: 10,
      fontSize: 14,
      color: "#667085",
    },


    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    errorCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor:
        "#FEF3F2",
      borderWidth: 1,
      borderColor:
        "#FDA29B",
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


    // --------------------------------------------------------
    // EMPTY
    // --------------------------------------------------------

    emptyCard: {
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
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


    // --------------------------------------------------------
    // SECTION
    // --------------------------------------------------------

    section: {
      marginBottom: 20,
    },

    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#002B5C",
      marginBottom: 10,
    },


    // --------------------------------------------------------
    // CURRENT STATUS
    // --------------------------------------------------------

    statusCard: {
      flexDirection: "row",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 16,
    },

    statusIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        "#EEF4F8",
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


    // --------------------------------------------------------
    // SESSION STATUS
    // --------------------------------------------------------

    sessionStatusCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
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


    // --------------------------------------------------------
    // QR
    // --------------------------------------------------------

    qrUnavailableCard: {
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
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


    // --------------------------------------------------------
    // MANUAL ATTENDANCE
    // --------------------------------------------------------

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
      backgroundColor:
        "#FFFFFF",
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
      backgroundColor:
        "#002B5C",
    },

    timeOutButton: {
      backgroundColor:
        "#3B7597",
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


    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    summaryCard: {
      width: "48%",
      flexGrow: 1,
      backgroundColor:
        "#FFFFFF",
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


    // --------------------------------------------------------
    // HISTORY
    // --------------------------------------------------------

    historyCount: {
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor:
        "#EEF4F8",
      textAlign: "center",
      textAlignVertical:
        "center",
      paddingTop: 5,
      fontSize: 11,
      fontWeight: "800",
      color: "#002B5C",
    },

    historyEmpty: {
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
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
      backgroundColor:
        "#FFFFFF",
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
      backgroundColor:
        "#ECFDF3",
      alignItems: "center",
      justifyContent:
        "center",
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
      borderTopColor:
        "#EAECF0",
    },

    historyDetailRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
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


    // --------------------------------------------------------
    // BOTTOM
    // --------------------------------------------------------

    bottomSpacing: {
      height: 30,
    },
  });