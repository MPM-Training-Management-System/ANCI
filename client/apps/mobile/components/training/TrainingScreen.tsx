"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  useEnrollments,
  useTrainingBatches,
} from "@repo/hooks";

import type {
  TrainingBatch,
  TrainingSession,
} from "@repo/types";

import {
  enrollmentApi,
  trainingBatchApi,
} from "@/api/api";

import TrainingCard from "./TrainingCard";
import TrainingDetails from "./TrainingDetails";

import EnrollmentForm, {
  type EnrollmentFormData,
} from "./EnrollmentForm";

import EnrollmentReview from "./EnrollmentReview";
import EnrollmentStatusCard from "./EnrollmentStatusCard";

// ==========================================================
// SCREEN
// ==========================================================

type Screen =
  | "available"
  | "enrollment"
  | "active";

// ==========================================================
// FLOW
// ==========================================================

type Flow =
  | "none"
  | "details"
  | "form"
  | "review";

// ==========================================================
// ACTIVE SESSION VIEW
// ==========================================================

type ActiveSessionView =
  | "upcoming"
  | "completed";

// ==========================================================
// COMPONENT
// ==========================================================

export default function TrainingScreen() {
  // ========================================================
  // SCREEN STATE
  // ========================================================

  const [
    screen,
    setScreen,
  ] = useState<Screen>("available");

  const [
    flow,
    setFlow,
  ] = useState<Flow>("none");

  const [
    selectedTrainingId,
    setSelectedTrainingId,
  ] = useState<string | null>(null);

  // ========================================================
  // ACTIVE SESSION VIEW
  // ========================================================

  const [
    activeSessionView,
    setActiveSessionView,
  ] = useState<ActiveSessionView>(
    "upcoming"
  );

  // ========================================================
  // ENROLLMENT FORM DATA
  // ========================================================

  const [
    formData,
    setFormData,
  ] = useState<EnrollmentFormData>({
    participantName: "",
    email: "",
    mobileNumber: "",
    documents: [],
  });

  // ========================================================
  // TRAINING BATCHES
  // ========================================================

  const {
    batches,
    isLoading,
    error,
    refresh,
  } = useTrainingBatches(
    trainingBatchApi
  );

  // ========================================================
  // ENROLLMENTS
  // ========================================================

  const {
    enrollments,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
    createEnrollment,
    isSubmitting,
    refreshMyEnrollments,
  } = useEnrollments(
    enrollmentApi
  );

  // ========================================================
  // LOAD MY ENROLLMENTS
  // ========================================================

  useEffect(() => {
    refreshMyEnrollments().catch(
      (error) => {
        console.error(
          "FAILED TO LOAD MY ENROLLMENTS:",
          error
        );
      }
    );
  }, [
    refreshMyEnrollments,
  ]);

  // ========================================================
  // AVAILABLE TRAINING BATCHES
  // ========================================================

  const availableBatches =
    useMemo(() => {
      return batches.filter(
        (batch) => {
          const status =
            String(
              batch.status
            ).toLowerCase();

          return (
            status === "published" &&
            batch.enrolledCount <
              batch.capacity
          );
        }
      );
    }, [batches]);

  // ========================================================
  // SELECTED TRAINING
  // ========================================================

  const selectedTraining =
    useMemo(() => {
      if (
        !selectedTrainingId
      ) {
        return null;
      }

      return (
        batches.find(
          (batch) =>
            batch.id ===
            selectedTrainingId
        ) ?? null
      );
    }, [
      batches,
      selectedTrainingId,
    ]);

  // ========================================================
  // APPROVED / ACTIVE ENROLLMENTS
  // ========================================================

  const activeEnrollments =
    useMemo(() => {
      return enrollments.filter(
        (enrollment) =>
          String(
            enrollment.status
          ).toLowerCase() ===
          "approved"
      );
    }, [enrollments]);

  // ========================================================
  // OPEN TRAINING
  // ========================================================

  const openTraining = (
    training: TrainingBatch
  ) => {
    setSelectedTrainingId(
      training.id
    );

    setFlow("details");
  };

  // ========================================================
  // BACK TO MAIN
  // ========================================================

  const backToMain = () => {
    setSelectedTrainingId(
      null
    );

    setFlow("none");
  };

  // ========================================================
  // START ENROLLMENT
  // ========================================================

  const startEnrollment = () => {
    if (!selectedTraining) {
      return;
    }

    const activeEnrollment =
      enrollments.find(
        (enrollment) => {
          const status =
            String(
              enrollment.status
            ).toLowerCase();

          return (
            status === "pending" ||
            status ===
              "documentsrequired" ||
            status ===
              "underreview" ||
            status ===
              "needscorrection" ||
            status === "approved"
          );
        }
      );

    if (activeEnrollment) {
      const status =
        String(
          activeEnrollment.status
        ).toLowerCase();

      if (
        status === "approved"
      ) {
        Alert.alert(
          "Already Enrolled",
          `You already have an approved enrollment in ${activeEnrollment.programName} (${activeEnrollment.batchCode}). You can enroll in another training after completing your current training.`
        );

        return;
      }

      if (
        status === "needscorrection"
      ) {
        Alert.alert(
          "Correction Required",
          `Your enrollment in ${activeEnrollment.programName} (${activeEnrollment.batchCode}) requires correction. Please complete your current enrollment first.`
        );

        return;
      }

      if (
        status === "underreview"
      ) {
        Alert.alert(
          "Enrollment Under Review",
          `Your enrollment in ${activeEnrollment.programName} (${activeEnrollment.batchCode}) is currently being reviewed.`
        );

        return;
      }

      if (
        status ===
        "documentsrequired"
      ) {
        Alert.alert(
          "Documents Required",
          `Please complete the required documents for your current enrollment in ${activeEnrollment.programName}.`
        );

        return;
      }

      Alert.alert(
        "Enrollment Already Submitted",
        `You already have an active enrollment in ${activeEnrollment.programName} (${activeEnrollment.batchCode}). Please wait for the administrator to review your application.`
      );

      return;
    }

    if (
      selectedTraining.enrolledCount >=
      selectedTraining.capacity
    ) {
      Alert.alert(
        "Training Full",
        "This training batch is already full."
      );

      return;
    }

    setFlow("form");
  };

  // ========================================================
  // FORM CONTINUE
  // ========================================================

  const handleFormContinue = (
    data: EnrollmentFormData
  ) => {
    setFormData(data);

    setFlow("review");
  };

  // ========================================================
  // SUBMIT ENROLLMENT
  // ========================================================

  const handleSubmitEnrollment =
    async () => {
      if (!selectedTraining) {
        Alert.alert(
          "No Training Selected",
          "Please select a training batch first."
        );

        return;
      }

      if (isSubmitting) {
        return;
      }

      const existingEnrollment =
        enrollments.find(
          (enrollment) =>
            enrollment.trainingBatchId ===
            selectedTraining.id
        );

      if (existingEnrollment) {
        const status =
          String(
            existingEnrollment.status
          ).toLowerCase();

        if (
          status === "pending"
        ) {
          Alert.alert(
            "Already Submitted",
            "You have already submitted an enrollment application for this training batch."
          );

          return;
        }

        if (
          status === "approved"
        ) {
          Alert.alert(
            "Already Enrolled",
            "You are already enrolled in this training batch."
          );

          return;
        }

        if (
          status === "completed"
        ) {
          Alert.alert(
            "Training Completed",
            "You have already completed this training batch."
          );

          return;
        }

        if (
          status === "rejected"
        ) {
          Alert.alert(
            "Enrollment Rejected",
            "You already have an enrollment application for this training batch."
          );

          return;
        }

        Alert.alert(
          "Already Submitted",
          "You already have an enrollment for this training batch."
        );

        return;
      }

      if (
        selectedTraining.enrolledCount >=
        selectedTraining.capacity
      ) {
        Alert.alert(
          "Training Full",
          "This training batch is already full."
        );

        return;
      }

      if (
        !formData.documents ||
        formData.documents.length === 0
      ) {
        Alert.alert(
          "Required Documents",
          "Please upload the required documents before submitting."
        );

        return;
      }

      try {
        const enrollment =
          await createEnrollment({
            trainingBatchId:
              selectedTraining.id,
          });

        console.log(
          "ENROLLMENT CREATED:",
          enrollment.id
        );

        for (
          const document
          of formData.documents
        ) {
          const uploadData =
            new FormData();

          uploadData.append(
            "RequirementId",
            document.requirementId
          );

          uploadData.append(
            "File",
            {
              uri:
                document.file.uri,

              name:
                document.file.name,

              type:
                document.file.type ??
                "application/octet-stream",
            } as any
          );

          await enrollmentApi.uploadDocument(
            enrollment.id,
            uploadData
          );
        }

        await refreshMyEnrollments();

        await refresh();

        Alert.alert(
          "Enrollment Submitted",
          "Your enrollment application and required documents have been submitted successfully. It is now pending administrator review.",
          [
            {
              text: "OK",

              onPress: () => {
                setSelectedTrainingId(
                  null
                );

                setFlow("none");

                setScreen(
                  "enrollment"
                );

                setFormData({
                  participantName:
                    "",
                  email: "",
                  mobileNumber:
                    "",
                  documents: [],
                });
              },
            },
          ]
        );
      } catch (error) {
        console.error(
          "SUBMIT ENROLLMENT ERROR:",
          error
        );

        Alert.alert(
          "Enrollment Failed",
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your enrollment."
        );
      }
    };

  // ========================================================
  // OPEN APPROVED TRAINING
  // ========================================================

  const openApprovedTraining = (
    enrollment: any
  ) => {
    Alert.alert(
      "Training Ready",
      `Opening ${
        enrollment.trainingTitle ??
        enrollment.programName ??
        "your training"
      }.`
    );
  };

  // ========================================================
  // ENROLLMENT FORM
  // ========================================================

  if (
    flow === "form" &&
    selectedTraining
  ) {
    return (
      <EnrollmentForm
        training={
          selectedTraining
        }
        initialData={
          formData
        }
        onBack={() =>
          setFlow(
            "details"
          )
        }
        onContinue={
          handleFormContinue
        }
      />
    );
  }

  // ========================================================
  // ENROLLMENT REVIEW
  // ========================================================

  if (
    flow === "review" &&
    selectedTraining
  ) {
    return (
      <EnrollmentReview
        training={
          selectedTraining
        }
        formData={
          formData
        }
        onBack={() =>
          setFlow("form")
        }
        onSubmit={
          handleSubmitEnrollment
        }
        isSubmitting={
          isSubmitting
        }
      />
    );
  }

  // ========================================================
  // TRAINING DETAILS
  // ========================================================

  if (
    flow === "details" &&
    selectedTraining
  ) {
    const alreadyEnrolled =
      enrollments.some(
        (enrollment) =>
          enrollment.trainingBatchId ===
          selectedTraining.id
      );

    return (
      <TrainingDetails
        training={
          selectedTraining
        }
        alreadyEnrolled={
          alreadyEnrolled
        }
        onBack={
          backToMain
        }
        onEnroll={
          startEnrollment
        }
      />
    );
  }

  // ========================================================
  // LOADING
  // ========================================================

  if (
    screen === "available" &&
    isLoading
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading training programs...
        </Text>
      </View>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (
    screen === "available" &&
    error
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#DC2626"
        />

        <Text
          style={
            styles.errorTitle
          }
        >
          Unable to load training
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Please check your connection
          and try again.
        </Text>

        <Pressable
          onPress={
            refresh
          }
          style={
            styles.retryButton
          }
        >
          <Text
            style={
              styles.retryText
            }
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // ========================================================
  // MAIN SCREEN
  // ========================================================

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
            isLoading ||
            enrollmentsLoading
          }
          onRefresh={
            async () => {
              await Promise.all([
                refresh(),
                refreshMyEnrollments(),
              ]);
            }
          }
          tintColor="#2563EB"
          colors={[
            "#2563EB",
          ]}
        />
      }
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View>
          <Text
            style={
              styles.headerTitle
            }
          >
            Training
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Find and manage your training
            programs.
          </Text>
        </View>

        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="school-outline"
            size={20}
            color="#2563EB"
          />
        </View>
      </View>

      {/* ==================================================
          MAIN TABS
      ================================================== */}

      <View
        style={
          styles.segment
        }
      >
        <SegmentButton
          active={
            screen ===
            "available"
          }
          icon="search-outline"
          label="Available"
          onPress={() =>
            setScreen(
              "available"
            )
          }
        />

        <SegmentButton
          active={
            screen ===
            "enrollment"
          }
          icon="document-text-outline"
          label="My Enrollment"
          onPress={() =>
            setScreen(
              "enrollment"
            )
          }
        />

        <SegmentButton
          active={
            screen ===
            "active"
          }
          icon="school-outline"
          label="Active"
          onPress={() =>
            setScreen("active")
          }
        />
      </View>

      {/* ==================================================
          AVAILABLE
      ================================================== */}

      {screen ===
        "available" && (
        <>
          <View
            style={
              styles.summary
            }
          >
            <View>
              <Text
                style={
                  styles.summaryLabel
                }
              >
                AVAILABLE TRAININGS
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {
                  availableBatches.length
                }
              </Text>
            </View>

            <View
              style={
                styles.summaryIcon
              }
            >
              <Ionicons
                name="library-outline"
                size={22}
                color="#2563EB"
              />
            </View>
          </View>

          {availableBatches.length ===
          0 ? (
            <EmptyState
              title="No Training Available"
              description="There are currently no published training batches available."
            />
          ) : (
            availableBatches.map(
              (batch) => (
                <TrainingCard
                  key={
                    batch.id
                  }
                  training={
                    batch
                  }
                  onPress={() =>
                    openTraining(
                      batch
                    )
                  }
                />
              )
            )
          )}
        </>
      )}

      {/* ==================================================
          MY ENROLLMENT
      ================================================== */}

      {screen ===
        "enrollment" && (
        <>
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              My Enrollment
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Track your training
              applications.
            </Text>
          </View>

          {enrollmentsError ? (
            <EmptyState
              title="Unable to Load Enrollment"
              description="Please pull down to refresh and try again."
            />
          ) : enrollments.length ===
            0 ? (
            <EmptyState
              title="No Enrollment Yet"
              description="Choose a training program and submit an enrollment application."
            />
          ) : (
            enrollments.map(
              (enrollment) => (
                <EnrollmentStatusCard
                  key={
                    enrollment.id
                  }
                  enrollment={
                    enrollment
                  }
                  onOpenTraining={
                    openApprovedTraining
                  }
                />
              )
            )
          )}
        </>
      )}

      {/* ==================================================
          ACTIVE
      ================================================== */}

      {screen ===
        "active" && (
        <>
          <View
            style={
              styles.activeSectionHeader
            }
          >
            <View
              style={
                styles.activeSectionHeaderText
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Active Training
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                View your upcoming and
                completed sessions.
              </Text>
            </View>

            {activeEnrollments.length >
              0 && (
              <View
                style={
                  styles.activeStatusBadge
                }
              >
                <View
                  style={
                    styles.activeStatusDot
                  }
                />

                <Text
                  style={
                    styles.activeStatusText
                  }
                >
                  ACTIVE
                </Text>
              </View>
            )}
          </View>

          {activeEnrollments.length ===
          0 ? (
            <EmptyState
              title="No Active Training"
              description="Once your enrollment is approved, your training will appear here."
            />
          ) : (
            <>
              {/* ========================================
                  UPCOMING / COMPLETED TABS
              ======================================== */}

              <View
                style={
                  styles.sessionSegment
                }
              >
                <Pressable
                  onPress={() =>
                    setActiveSessionView(
                      "upcoming"
                    )
                  }
                  style={[
                    styles.sessionSegmentButton,
                    activeSessionView ===
                      "upcoming" &&
                      styles.sessionSegmentButtonActive,
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={
                      activeSessionView ===
                      "upcoming"
                        ? "#2563EB"
                        : "#94A3B8"
                    }
                  />

                  <Text
                    style={[
                      styles.sessionSegmentText,
                      activeSessionView ===
                        "upcoming" &&
                        styles.sessionSegmentTextActive,
                    ]}
                  >
                    Upcoming
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setActiveSessionView(
                      "completed"
                    )
                  }
                  style={[
                    styles.sessionSegmentButton,
                    activeSessionView ===
                      "completed" &&
                      styles.sessionSegmentButtonActive,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={14}
                    color={
                      activeSessionView ===
                      "completed"
                        ? "#16A34A"
                        : "#94A3B8"
                    }
                  />

                  <Text
                    style={[
                      styles.sessionSegmentText,
                      activeSessionView ===
                        "completed" &&
                        styles.sessionSegmentTextCompleted,
                    ]}
                  >
                    Completed
                  </Text>
                </Pressable>
              </View>

              {activeEnrollments.map(
                (enrollment) => (
                  <ActiveTrainingCard
                    key={
                      enrollment.id
                    }
                    enrollment={
                      enrollment
                    }
                    view={
                      activeSessionView
                    }
                  />
                )
              )}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

// ==========================================================
// ACTIVE TRAINING CARD
// ==========================================================

function ActiveTrainingCard({
  enrollment,
  view,
}: {
  enrollment: any;
  view: ActiveSessionView;
}) {
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
  ] = useState<string | null>(
    null
  );

  // ========================================================
  // FETCH SCHEDULE
  // ========================================================

  const loadSessions =
    React.useCallback(
      async () => {
        if (
          !enrollment?.trainingBatchId
        ) {
          setSessions([]);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setError(null);

          const result =
            await trainingBatchApi.getParticipantSchedule(
              enrollment.trainingBatchId
            );

          console.log(
            "PARTICIPANT SCHEDULE FETCHED:",
            {
              trainingBatchId:
                enrollment.trainingBatchId,
              result,
            }
          );

          setSessions(
            Array.isArray(result)
              ? result
              : []
          );
        } catch (error) {
          console.error(
            "LOAD ACTIVE TRAINING SESSIONS ERROR:",
            error
          );

          setSessions([]);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load training sessions."
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        enrollment?.trainingBatchId,
      ]
    );

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  // ========================================================
  // BUILD LOCAL DATE + TIME
  //
  // IMPORTANT:
  // sessionDate is DateOnly
  // startTime/endTime are TimeOnly
  //
  // We do NOT use:
  // new Date("2026-10-08")
  //
  // because that can cause timezone shifting.
  // ========================================================

  const buildDateTime = (
    dateValue: string,
    timeValue: string
  ) => {
    const rawDate =
      String(
        dateValue
      ).slice(0, 10);

    const [
      year,
      month,
      day,
    ] =
      rawDate
        .split("-")
        .map(Number);

    const [
      hour = "0",
      minute = "0",
      secondRaw = "0",
    ] =
      String(
        timeValue ??
          "00:00:00"
      ).split(":");

    const second = Number(
      String(
        secondRaw
      ).split(".")[0] || "0"
    );

    return new Date(
      year,
      month - 1,
      day,
      Number(hour),
      Number(minute),
      second
    );
  };

  // ========================================================
  // CLASSIFY SESSIONS
  // ========================================================

  const classifiedSessions =
    useMemo(() => {
      const now =
        new Date();

      return sessions
        .map(
          (session) => {
            const start =
              buildDateTime(
                session.sessionDate,
                session.startTime
              );

            const end =
              buildDateTime(
                session.sessionDate,
                session.endTime
              );

            return {
              session,
              start,
              end,
            };
          }
        )
        .filter(
          (item) =>
            !Number.isNaN(
              item.start.getTime()
            )
        )
        .sort(
          (a, b) =>
            a.start.getTime() -
            b.start.getTime()
        )
        .map(
          (item) => {
            const isOngoing =
              now >=
                item.start &&
              now <=
                item.end;

            const isCompleted =
              now >
              item.end;

            return {
              ...item,
              isOngoing,
              isCompleted,
            };
          }
        );
    }, [sessions]);

  // ========================================================
  // UPCOMING SESSION
  //
  // TODAY IS INCLUDED.
  //
  // Example:
  //
  // Today:
  // 1:00 PM - 4:00 PM
  //
  // Current time:
  // 11:00 AM
  //
  // => UPCOMING
  //
  // Current time:
  // 2:00 PM
  //
  // => ONGOING
  //
  // Current time:
  // 5:00 PM
  //
  // => COMPLETED
  // ========================================================

  const upcomingSession =
    useMemo(() => {
      const now =
        new Date();

      const next =
        classifiedSessions.find(
          (item) =>
            item.end >= now
        );

      return (
        next ?? null
      );
    }, [
      classifiedSessions,
    ]);

  // ========================================================
  // COMPLETED SESSIONS
  // ========================================================

  const completedSessions =
    useMemo(() => {
      return classifiedSessions
        .filter(
          (item) =>
            item.isCompleted
        )
        .sort(
          (a, b) =>
            b.start.getTime() -
            a.start.getTime()
        );
    }, [
      classifiedSessions,
    ]);

  // ========================================================
  // FORMAT DATE
  // ========================================================

  const formatDate =
    (
      value: string
    ) => {
      const rawDate =
        String(
          value
        ).slice(0, 10);

      const [
        year,
        month,
        day,
      ] =
        rawDate
          .split("-")
          .map(Number);

      const date =
        new Date(
          year,
          month - 1,
          day
        );

      return date.toLocaleDateString(
        "en-US",
        {
          weekday:
            "long",
          month:
            "long",
          day:
            "numeric",
          year:
            "numeric",
        }
      );
    };

  // ========================================================
  // FORMAT TIME
  // ========================================================

  const formatTime =
    (
      value: string
    ) => {
      const [
        hour = "0",
        minute = "0",
      ] =
        String(
          value ??
            "00:00:00"
        ).split(":");

      const date =
        new Date();

      date.setHours(
        Number(hour),
        Number(minute),
        0,
        0
      );

      return date.toLocaleTimeString(
        "en-US",
        {
          hour:
            "numeric",
          minute:
            "2-digit",
        }
      );
    };

  // ========================================================
  // LOADING
  // ========================================================

  if (isLoading) {
    return (
      <View
        style={
          styles.upcomingCard
        }
      >
        <View
          style={
            styles.upcomingLoading
          }
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <Text
            style={
              styles.upcomingLoadingText
            }
          >
            Loading sessions...
          </Text>
        </View>
      </View>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (error) {
    return (
      <View
        style={
          styles.upcomingCard
        }
      >
        <View
          style={
            styles.upcomingError
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#DC2626"
          />

          <View
            style={
              styles.upcomingErrorContent
            }
          >
            <Text
              style={
                styles.upcomingErrorTitle
              }
            >
              Unable to load sessions
            </Text>

            <Text
              style={
                styles.upcomingErrorText
              }
            >
              Please pull down to refresh.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ========================================================
  // APPROVED TRAINING CARD
  // ========================================================

  return (
    <View
      style={
        styles.activeTrainingItem
      }
    >
      {/* ==================================================
          APPROVED TRAINING
      ================================================== */}

      <View
        style={
          styles.approvedCard
        }
      >
        <View
          style={
            styles.approvedHeader
          }
        >
          <View
            style={
              styles.approvedIcon
            }
          >
            <Ionicons
              name="checkmark"
              size={21}
              color="#16A34A"
            />
          </View>

          <View
            style={
              styles.approvedInfo
            }
          >
            <Text
              style={
                styles.approvedLabel
              }
            >
              ENROLLMENT APPROVED
            </Text>

            <Text
              style={
                styles.trainingName
              }
              numberOfLines={2}
            >
              {enrollment.programName ??
                enrollment.trainingTitle ??
                "Training Program"}
            </Text>

            <Text
              style={
                styles.batchCode
              }
            >
              Batch:{" "}
              {enrollment.batchCode ??
                "N/A"}
            </Text>
          </View>

          <View
            style={
              styles.activeCardBadge
            }
          >
            <View
              style={
                styles.activeCardDot
              }
            />

            <Text
              style={
                styles.activeCardBadgeText
              }
            >
              ACTIVE
            </Text>
          </View>
        </View>

        <View
          style={
            styles.approvedStatusRow
          }
        >
          <View
            style={
              styles.approvedStatusItem
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#16A34A"
            />

            <Text
              style={
                styles.approvedStatusText
              }
            >
              Approved
            </Text>
          </View>

          <View
            style={
              styles.approvedStatusItem
            }
          >
            <Ionicons
              name="school-outline"
              size={15}
              color="#2563EB"
            />

            <Text
              style={
                styles.approvedStatusText
              }
            >
              Training Active
            </Text>
          </View>
        </View>
      </View>

      {/* ==================================================
          SESSION VIEW
      ================================================== */}

      {view === "upcoming" ? (
        <View
          style={
            styles.upcomingSection
          }
        >
          <View
            style={
              styles.upcomingSectionHeader
            }
          >
            <View
              style={
                styles.upcomingSectionIcon
              }
            >
              <Ionicons
                name="time-outline"
                size={17}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.upcomingHeaderText
              }
            >
              <Text
                style={
                  styles.upcomingTitle
                }
              >
                Upcoming Session
              </Text>

              <Text
                style={
                  styles.upcomingSubtitle
                }
              >
                Your next scheduled training session
              </Text>
            </View>
          </View>

          {!upcomingSession ? (
            <View
              style={
                styles.noUpcomingCard
              }
            >
              <View
                style={
                  styles.noUpcomingIcon
                }
              >
                <Ionicons
                  name="calendar-clear-outline"
                  size={25}
                  color="#94A3B8"
                />
              </View>

              <Text
                style={
                  styles.noUpcomingTitle
                }
              >
                No Upcoming Session
              </Text>

              <Text
                style={
                  styles.noUpcomingText
                }
              >
                There are currently no
                upcoming training sessions
                scheduled for your batch.
              </Text>
            </View>
          ) : (
            <UpcomingSessionCard
              session={
                upcomingSession.session
              }
              isOngoing={
                upcomingSession.isOngoing
              }
              formatDate={
                formatDate
              }
              formatTime={
                formatTime
              }
            />
          )}
        </View>
      ) : (
        <View
          style={
            styles.upcomingSection
          }
        >
          <View
            style={
              styles.upcomingSectionHeader
            }
          >
            <View
              style={
                styles.completedSectionIcon
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color="#16A34A"
              />
            </View>

            <View
              style={
                styles.upcomingHeaderText
              }
            >
              <Text
                style={
                  styles.upcomingTitle
                }
              >
                Completed Sessions
              </Text>

              <Text
                style={
                  styles.upcomingSubtitle
                }
              >
                Your completed training sessions
              </Text>
            </View>
          </View>

          {completedSessions.length ===
          0 ? (
            <View
              style={
                styles.noUpcomingCard
              }
            >
              <View
                style={
                  styles.noUpcomingIcon
                }
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={25}
                  color="#94A3B8"
                />
              </View>

              <Text
                style={
                  styles.noUpcomingTitle
                }
              >
                No Completed Sessions
              </Text>

              <Text
                style={
                  styles.noUpcomingText
                }
              >
                Completed training sessions
                will appear here.
              </Text>
            </View>
          ) : (
            completedSessions.map(
              (item) => (
                <CompletedSessionCard
                  key={
                    item.session.id
                  }
                  session={
                    item.session
                  }
                  formatDate={
                    formatDate
                  }
                  formatTime={
                    formatTime
                  }
                />
              )
            )
          )}
        </View>
      )}
    </View>
  );
}

// ==========================================================
// UPCOMING SESSION CARD
// ==========================================================

function UpcomingSessionCard({
  session,
  isOngoing,
  formatDate,
  formatTime,
}: {
  session: TrainingSession;
  isOngoing: boolean;
  formatDate: (
    value: string
  ) => string;
  formatTime: (
    value: string
  ) => string;
}) {
  return (
    <View
      style={
        styles.upcomingCard
      }
    >
      <View
        style={
          styles.upcomingCardHeader
        }
      >
        <View
          style={
            styles.sessionNumberBadge
          }
        >
          <Text
            style={
              styles.sessionNumberText
            }
          >
            {session.sessionNumber ??
              1}
          </Text>
        </View>

        <View
          style={
            styles.upcomingCardHeaderText
          }
        >
          <Text
            style={
              styles.upcomingCardLabel
            }
          >
            TRAINING SESSION
          </Text>

          <Text
            style={
              styles.upcomingSessionTitle
            }
          >
            Session{" "}
            {session.sessionNumber ??
              1}
          </Text>
        </View>

        <View
          style={
            isOngoing
              ? styles.ongoingBadge
              : styles.todayBadge
          }
        >
          <View
            style={
              isOngoing
                ? styles.ongoingDot
                : styles.todayDot
            }
          />

          <Text
            style={
              isOngoing
                ? styles.ongoingBadgeText
                : styles.todayBadgeText
            }
          >
            {isOngoing
              ? "ONGOING"
              : "UPCOMING"}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.upcomingDetailRow
        }
      >
        <View
          style={
            styles.upcomingDetailIcon
          }
        >
          <Ionicons
            name="calendar-outline"
            size={17}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.upcomingDetailContent
          }
        >
          <Text
            style={
              styles.upcomingDetailLabel
            }
          >
            DATE
          </Text>

          <Text
            style={
              styles.upcomingDetailValue
            }
          >
            {formatDate(
              session.sessionDate
            )}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.upcomingDetailRow
        }
      >
        <View
          style={
            styles.upcomingDetailIcon
          }
        >
          <Ionicons
            name="time-outline"
            size={17}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.upcomingDetailContent
          }
        >
          <Text
            style={
              styles.upcomingDetailLabel
            }
          >
            TIME
          </Text>

          <Text
            style={
              styles.upcomingDetailValue
            }
          >
            {formatTime(
              session.startTime
            )}{" "}
            -{" "}
            {formatTime(
              session.endTime
            )}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.upcomingDetailRow
        }
      >
        <View
          style={
            styles.upcomingDetailIcon
          }
        >
          <Ionicons
            name="hourglass-outline"
            size={17}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.upcomingDetailContent
          }
        >
          <Text
            style={
              styles.upcomingDetailLabel
            }
          >
            DURATION
          </Text>

          <Text
            style={
              styles.upcomingDetailValue
            }
          >
            {session.durationHours}{" "}
            hours
          </Text>
        </View>
      </View>
    </View>
  );
}

// ==========================================================
// COMPLETED SESSION CARD
// ==========================================================

function CompletedSessionCard({
  session,
  formatDate,
  formatTime,
}: {
  session: TrainingSession;
  formatDate: (
    value: string
  ) => string;
  formatTime: (
    value: string
  ) => string;
}) {
  return (
    <View
      style={
        styles.completedCard
      }
    >
      <View
        style={
          styles.completedHeader
        }
      >
        <View
          style={
            styles.completedNumberBadge
          }
        >
          <Ionicons
            name="checkmark"
            size={17}
            color="#16A34A"
          />
        </View>

        <View
          style={
            styles.completedHeaderText
          }
        >
          <Text
            style={
              styles.completedLabel
            }
          >
            COMPLETED
          </Text>

          <Text
            style={
              styles.completedTitle
            }
          >
            Session{" "}
            {session.sessionNumber ??
              1}
          </Text>
        </View>

        <View
          style={
            styles.completedBadge
          }
        >
          <Text
            style={
              styles.completedBadgeText
            }
          >
            DONE
          </Text>
        </View>
      </View>

      <View
        style={
          styles.completedInfoRow
        }
      >
        <Ionicons
          name="calendar-outline"
          size={15}
          color="#64748B"
        />

        <Text
          style={
            styles.completedInfoText
          }
        >
          {formatDate(
            session.sessionDate
          )}
        </Text>
      </View>

      <View
        style={
          styles.completedInfoRow
        }
      >
        <Ionicons
          name="time-outline"
          size={15}
          color="#64748B"
        />

        <Text
          style={
            styles.completedInfoText
          }
        >
          {formatTime(
            session.startTime
          )}{" "}
          -{" "}
          {formatTime(
            session.endTime
          )}
        </Text>
      </View>

      <View
        style={
          styles.completedInfoRow
        }
      >
        <Ionicons
          name="hourglass-outline"
          size={15}
          color="#64748B"
        />

        <Text
          style={
            styles.completedInfoText
          }
        >
          {session.durationHours}{" "}
          hours
        </Text>
      </View>
    </View>
  );
}

// ==========================================================
// SEGMENT BUTTON
// ==========================================================

function SegmentButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;

  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
      style={[
        styles.segmentButton,
        active &&
          styles.segmentButtonActive,
      ]}
    >
      <Ionicons
        name={icon}
        size={13}
        color={
          active
            ? "#2563EB"
            : "#94A3B8"
        }
      />

      <Text
        style={[
          styles.segmentText,
          active &&
            styles.segmentTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ==========================================================
// EMPTY STATE
// ==========================================================

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View
      style={
        styles.empty
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name="document-outline"
          size={27}
          color="#94A3B8"
        />
      </View>

      <Text
        style={
          styles.emptyTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.emptyText
        }
      >
        {description}
      </Text>
    </View>
  );
}

// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    content: {
      paddingBottom: 90,
      marginTop: 30,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      marginBottom: 17,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    headerTitle: {
      marginTop: 4,
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: -0.7,
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 3,
      fontSize: 8,
      color: "#94A3B8",
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

    segment: {
      marginHorizontal: 20,
      marginBottom: 18,
      padding: 4,

      borderRadius: 15,

      backgroundColor: "#E2E8F0",

      flexDirection: "row",
    },

    segmentButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: 11,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 4,
    },

    segmentButtonActive: {
      backgroundColor: "#FFFFFF",
    },

    segmentText: {
      fontSize: 6.5,
      fontWeight: "700",
      color: "#64748B",
    },

    segmentTextActive: {
      color: "#2563EB",
    },

    summary: {
      marginHorizontal: 20,
      marginBottom: 17,
      padding: 15,

      borderRadius: 18,

      backgroundColor: "#EFF6FF",

      borderWidth: 1,
      borderColor: "#DBEAFE",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    summaryLabel: {
      fontSize: 6,
      fontWeight: "900",
      letterSpacing: 0.7,
      color: "#60A5FA",
    },

    summaryValue: {
      marginTop: 3,
      fontSize: 21,
      fontWeight: "900",
      color: "#1E3A8A",
    },

    summaryIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,

      backgroundColor: "#FFFFFF",

      alignItems: "center",
      justifyContent: "center",
    },

    sectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 15,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: "#0F172A",
    },

    sectionSubtitle: {
      marginTop: 4,
      fontSize: 8,
      color: "#94A3B8",
    },

    empty: {
      marginHorizontal: 20,
      marginTop: 25,
      padding: 30,

      borderRadius: 20,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E2E8F0",

      alignItems: "center",
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 19,

      backgroundColor: "#F1F5F9",

      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "800",
      color: "#334155",
    },

    emptyText: {
      marginTop: 5,
      textAlign: "center",
      fontSize: 8,
      lineHeight: 13,
      color: "#94A3B8",
    },

    // ======================================================
    // ACTIVE HEADER
    // ======================================================

    activeSectionHeader: {
      paddingHorizontal: 20,
      marginBottom: 15,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    activeSectionHeaderText: {
      flex: 1,
      paddingRight: 10,
    },

    activeStatusBadge: {
      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 9,
      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor: "#DCFCE7",
    },

    activeStatusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,

      backgroundColor: "#16A34A",

      marginRight: 5,
    },

    activeStatusText: {
      fontSize: 7,
      fontWeight: "900",
      color: "#15803D",
      letterSpacing: 0.4,
    },

    activeTrainingItem: {
      marginBottom: 8,
    },

    // ======================================================
    // SESSION SEGMENT
    // ======================================================

    sessionSegment: {
      marginHorizontal: 20,
      marginBottom: 15,

      padding: 4,

      borderRadius: 14,

      backgroundColor: "#E2E8F0",

      flexDirection: "row",
    },

    sessionSegmentButton: {
      flex: 1,

      minHeight: 36,

      borderRadius: 10,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 5,
    },

    sessionSegmentButtonActive: {
      backgroundColor: "#FFFFFF",
    },

    sessionSegmentText: {
      fontSize: 8,
      fontWeight: "800",
      color: "#94A3B8",
    },

    sessionSegmentTextActive: {
      color: "#2563EB",
    },

    sessionSegmentTextCompleted: {
      color: "#16A34A",
    },

    // ======================================================
    // APPROVED CARD
    // ======================================================

    approvedCard: {
      marginHorizontal: 20,

      padding: 16,

      borderRadius: 20,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#DCFCE7",

      shadowColor: "#0F172A",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.05,
      shadowRadius: 8,

      elevation: 2,
    },

    approvedHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    approvedIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,

      backgroundColor: "#DCFCE7",

      alignItems: "center",
      justifyContent: "center",
    },

    approvedInfo: {
      flex: 1,
      marginLeft: 11,
    },

    approvedLabel: {
      fontSize: 7,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "#16A34A",
    },

    trainingName: {
      marginTop: 3,
      fontSize: 15,
      fontWeight: "900",
      color: "#0F172A",
    },

    batchCode: {
      marginTop: 3,
      fontSize: 8,
      fontWeight: "600",
      color: "#94A3B8",
    },

    activeCardBadge: {
      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 8,
      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor: "#DCFCE7",

      marginLeft: 8,
    },

    activeCardDot: {
      width: 6,
      height: 6,
      borderRadius: 3,

      backgroundColor: "#16A34A",

      marginRight: 5,
    },

    activeCardBadgeText: {
      fontSize: 7,
      fontWeight: "900",
      color: "#15803D",
      letterSpacing: 0.4,
    },

    approvedStatusRow: {
      marginTop: 14,

      paddingVertical: 10,
      paddingHorizontal: 10,

      borderRadius: 12,

      backgroundColor: "#F8FAFC",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    approvedStatusItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    approvedStatusText: {
      fontSize: 8,
      fontWeight: "700",
      color: "#64748B",
    },

    // ======================================================
    // UPCOMING SECTION
    // ======================================================

    upcomingSection: {
      marginTop: 18,
    },

    upcomingSectionHeader: {
      marginHorizontal: 20,
      marginBottom: 10,

      flexDirection: "row",
      alignItems: "center",
    },

    upcomingSectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,

      backgroundColor: "#EFF6FF",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 9,
    },

    completedSectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,

      backgroundColor: "#DCFCE7",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 9,
    },

    upcomingHeaderText: {
      flex: 1,
    },

    upcomingTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: "#0F172A",
    },

    upcomingSubtitle: {
      marginTop: 2,
      fontSize: 7.5,
      color: "#94A3B8",
    },

    // ======================================================
    // UPCOMING CARD
    // ======================================================

    upcomingCard: {
      marginHorizontal: 20,

      padding: 15,

      borderRadius: 19,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#DBEAFE",

      shadowColor: "#0F172A",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.04,
      shadowRadius: 7,

      elevation: 2,
    },

    upcomingCardHeader: {
      flexDirection: "row",
      alignItems: "center",

      paddingBottom: 13,

      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },

    sessionNumberBadge: {
      width: 42,
      height: 42,
      borderRadius: 13,

      backgroundColor: "#EFF6FF",

      alignItems: "center",
      justifyContent: "center",
    },

    sessionNumberText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#2563EB",
    },

    upcomingCardHeaderText: {
      flex: 1,
      marginLeft: 10,
    },

    upcomingCardLabel: {
      fontSize: 6.5,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "#94A3B8",
    },

    upcomingSessionTitle: {
      marginTop: 3,
      fontSize: 14,
      fontWeight: "900",
      color: "#0F172A",
    },

    todayBadge: {
      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 8,
      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor: "#DCFCE7",

      marginLeft: 8,
    },

    todayDot: {
      width: 6,
      height: 6,
      borderRadius: 3,

      backgroundColor: "#16A34A",

      marginRight: 5,
    },

    todayBadgeText: {
      fontSize: 6.5,
      fontWeight: "900",
      color: "#15803D",
      letterSpacing: 0.5,
    },

    ongoingBadge: {
      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 8,
      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor: "#DBEAFE",

      marginLeft: 8,
    },

    ongoingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,

      backgroundColor: "#2563EB",

      marginRight: 5,
    },

    ongoingBadgeText: {
      fontSize: 6.5,
      fontWeight: "900",
      color: "#1D4ED8",
      letterSpacing: 0.5,
    },

    upcomingDetailRow: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 13,
    },

    upcomingDetailIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,

      backgroundColor: "#EFF6FF",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 10,
    },

    upcomingDetailContent: {
      flex: 1,
    },

    upcomingDetailLabel: {
      fontSize: 6.5,
      fontWeight: "900",
      letterSpacing: 0.7,
      color: "#94A3B8",
    },

    upcomingDetailValue: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: "800",
      color: "#334155",
    },

    // ======================================================
    // NO UPCOMING
    // ======================================================

    noUpcomingCard: {
      marginHorizontal: 20,

      padding: 25,

      borderRadius: 18,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E2E8F0",

      alignItems: "center",
    },

    noUpcomingIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,

      backgroundColor: "#F8FAFC",

      alignItems: "center",
      justifyContent: "center",
    },

    noUpcomingTitle: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: "900",
      color: "#334155",
    },

    noUpcomingText: {
      marginTop: 5,

      fontSize: 8.5,
      lineHeight: 14,

      textAlign: "center",

      color: "#94A3B8",
    },

    // ======================================================
    // COMPLETED CARD
    // ======================================================

    completedCard: {
      marginHorizontal: 20,
      marginBottom: 10,

      padding: 15,

      borderRadius: 18,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#DCFCE7",
    },

    completedHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    completedNumberBadge: {
      width: 40,
      height: 40,
      borderRadius: 12,

      backgroundColor: "#DCFCE7",

      alignItems: "center",
      justifyContent: "center",
    },

    completedHeaderText: {
      flex: 1,
      marginLeft: 10,
    },

    completedLabel: {
      fontSize: 6.5,
      fontWeight: "900",
      letterSpacing: 0.7,
      color: "#16A34A",
    },

    completedTitle: {
      marginTop: 3,
      fontSize: 13,
      fontWeight: "900",
      color: "#0F172A",
    },

    completedBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor: "#DCFCE7",
    },

    completedBadgeText: {
      fontSize: 6.5,
      fontWeight: "900",
      color: "#15803D",
      letterSpacing: 0.5,
    },

    completedInfoRow: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 11,

      gap: 8,
    },

    completedInfoText: {
      fontSize: 8.5,
      fontWeight: "700",
      color: "#64748B",
    },

    // ======================================================
    // LOADING
    // ======================================================

    upcomingLoading: {
      alignItems: "center",
      justifyContent: "center",

      paddingVertical: 18,
    },

    upcomingLoadingText: {
      marginTop: 8,
      fontSize: 8,
      color: "#94A3B8",
    },

    // ======================================================
    // ERROR
    // ======================================================

    upcomingError: {
      flexDirection: "row",
      alignItems: "center",

      padding: 12,

      borderRadius: 14,

      backgroundColor: "#FEF2F2",

      borderWidth: 1,
      borderColor: "#FECACA",
    },

    upcomingErrorContent: {
      flex: 1,
      marginLeft: 8,
    },

    upcomingErrorTitle: {
      fontSize: 9,
      fontWeight: "800",
      color: "#991B1B",
    },

    upcomingErrorText: {
      marginTop: 2,
      fontSize: 7.5,
      color: "#B91C1C",
    },

    // ======================================================
    // LOADING / ERROR
    // ======================================================

    loadingContainer: {
      flex: 1,

      backgroundColor: "#F8FAFC",

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 40,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 11,
      fontWeight: "700",
      color: "#64748B",
    },

    errorTitle: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: "900",
      color: "#0F172A",
    },

    errorText: {
      marginTop: 5,
      fontSize: 9,
      color: "#94A3B8",
      textAlign: "center",
    },

    retryButton: {
      marginTop: 18,

      paddingHorizontal: 20,
      paddingVertical: 10,

      borderRadius: 10,

      backgroundColor: "#2563EB",
    },

    retryText: {
      fontSize: 9,
      fontWeight: "800",
      color: "#FFFFFF",
    },
  });