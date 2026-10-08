"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  useParticipant,
  useEnrollments,
  useTrainingBatches,
  useLearningMaterials,
  useLearningProgress,
  useWrittenAssessment,
} from "@repo/hooks";

import type {
  Service,
  TrainingSession,
} from "@repo/types";

import {
  mockParticipant,
  mockAssessments,
} from "@/src/data/participant";

import {
  participantProfileApi,
  enrollmentApi,
  trainingBatchApi,
  learningMaterialApi,
  learningProgressApi,
  serviceApi,
  apiClient,
} from "@/api/api";

/* ============================================================
   TYPES
============================================================ */

type ModuleCompletion = {
  completed: number;
  total: number;
};

type CurrentTrainingHeroProps = {
  programName: string;
  batchCode: string;
  trainerName: string;
  trainingDate: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  isProgressLoading: boolean;
  assessmentId?: string | null;
};

type StatCardProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
};

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

type ServiceCardProps = {
  service: Service;
  width: number;
  onRequest: (service: Service) => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatSessionTime(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(
    `1970-01-01T${value}`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDateOnly(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

function isSameDate(
  first: Date,
  second: Date,
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}
function getAssessmentId(
  assessment: any,
): string | null {
  if (!assessment) {
    return null;
  }

  const possibleIds = [
    assessment.id,
    assessment.assessmentId,
    assessment.assessmentID,
    assessment.writtenAssessmentId,
    assessment.writtenAssessmentID,

    assessment.assessment?.id,
    assessment.assessment?.assessmentId,

    assessment.writtenAssessment?.id,
    assessment.writtenAssessment?.assessmentId,
  ];

  const validId =
    possibleIds.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== "",
    );

  return validId
    ? String(validId)
    : null;
}

/* ============================================================
   SERVICE ICON
============================================================ */

function getServiceIcon(
  category?: string,
): React.ComponentProps<typeof Ionicons>["name"] {
  const value =
    category?.toLowerCase() ?? "";

  if (
    value.includes("training") ||
    value.includes("development") ||
    value.includes("education")
  ) {
    return "school-outline";
  }

  if (
    value.includes("mediation") ||
    value.includes("conflict") ||
    value.includes("resolution")
  ) {
    return "hand-left-outline";
  }

  if (
    value.includes("consult") ||
    value.includes("advisory")
  ) {
    return "shield-checkmark-outline";
  }

  if (
    value.includes("management") ||
    value.includes("organizational")
  ) {
    return "layers-outline";
  }

  return "sparkles-outline";
}

/* ============================================================
   CURRENT TRAINING HERO
============================================================ */

function CurrentTrainingHero({
  programName,
  batchCode,
  trainerName,
  trainingDate,
  progress,
  completedModules,
  totalModules,
  isProgressLoading,
  assessmentId,
}: CurrentTrainingHeroProps) {
  const safeProgress = Math.max(
    0,
    Math.min(100, progress),
  );

  const allModulesCompleted =
    safeProgress === 100 &&
    totalModules > 0;

  const glowAnimation =
    useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            glowAnimation,
            {
              toValue: 1,
              duration: 2800,
              useNativeDriver: true,
            },
          ),
          Animated.timing(
            glowAnimation,
            {
              toValue: 0,
              duration: 2800,
              useNativeDriver: true,
            },
          ),
        ]),
      );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [glowAnimation]);

  const glowTranslateX =
    glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-30, 35],
    });

  const glowTranslateY =
    glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [10, -15],
    });

  const handleWrittenExam = () => {
    if (!assessmentId) {
      console.log(
        "TAKE EXAM: No assessment ID available.",
      );
      return;
    }

    console.log(
      "TAKE EXAM: Opening assessment:",
      assessmentId,
    );

    router.push(
      `/assessment/${assessmentId}` as any,
    );
  };

  return (
    <View style={styles.trainingHero}>
      {/* DECORATIVE GLOW */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.trainingHeroGlow,
          {
            transform: [
              {
                translateX:
                  glowTranslateX,
              },
              {
                translateY:
                  glowTranslateY,
              },
            ],
          },
        ]}
      />

      <View
        style={styles.trainingHeroGlowTwo}
        pointerEvents="none"
      />

      <View style={styles.trainingHeroInner}>
        {/* TOP */}

        <View style={styles.trainingHeroTop}>
          <View style={styles.trainingHeroIcon}>
            <Ionicons
              name="school-outline"
              size={18}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.trainingHeroTopText
            }
          >
            <Text
              style={
                styles.trainingHeroEyebrow
              }
            >
              CURRENT TRAINING
            </Text>

            <View
              style={styles.activeRow}
            >
              <View
                style={styles.activeDot}
              />

              <Text
                style={styles.activeText}
              >
                ACTIVE TRAINING
              </Text>
            </View>
          </View>

          <View
            style={styles.approvedBadge}
          >
            <Ionicons
              name="checkmark-circle"
              size={10}
              color="#86EFAC"
            />

            <Text
              style={
                styles.approvedBadgeText
              }
            >
              APPROVED
            </Text>
          </View>
        </View>

        {/* TITLE */}

        <View
          style={styles.trainingHeroInfo}
        >
          <Text
            style={styles.trainingHeroTitle}
            numberOfLines={2}
          >
            {programName}
          </Text>

          <View style={styles.batchRow}>
            <Ionicons
              name="layers-outline"
              size={11}
              color="#AFC3D5"
            />

            <Text
              style={styles.batchText}
            >
              {batchCode}
            </Text>
          </View>
        </View>

        {/* META */}

        <View
          style={styles.trainingMetaRow}
        >
          <View
            style={styles.trainingMetaItem}
          >
            <Ionicons
              name="person-outline"
              size={12}
              color="#91A9BE"
            />

            <View
              style={
                styles.trainingMetaText
              }
            >
              <Text
                style={
                  styles.trainingMetaLabel
                }
              >
                TRAINER
              </Text>

              <Text
                style={
                  styles.trainingMetaValue
                }
                numberOfLines={1}
              >
                {trainerName}
              </Text>
            </View>
          </View>

          <View
            style={styles.trainingMetaItem}
          >
            <Ionicons
              name="calendar-outline"
              size={12}
              color="#91A9BE"
            />

            <View
              style={
                styles.trainingMetaText
              }
            >
              <Text
                style={
                  styles.trainingMetaLabel
                }
              >
                SCHEDULE
              </Text>

              <Text
                style={
                  styles.trainingMetaValue
                }
                numberOfLines={1}
              >
                {trainingDate}
              </Text>
            </View>
          </View>
        </View>

        {/* PROGRESS */}

        <View
          style={styles.compactProgress}
        >
          <View
            style={
              styles.compactProgressHeader
            }
          >
            <Text
              style={
                styles.compactProgressLabel
              }
            >
              MODULE PROGRESS
            </Text>

            <Text
              style={
                styles.compactProgressValue
              }
            >
              {isProgressLoading
                ? "—"
                : `${safeProgress}%`}
            </Text>
          </View>

          <View
            style={styles.compactProgressTrack}
          >
            <View
              style={[
                styles.compactProgressFill,
                {
                  width: `${safeProgress}%`,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.compactProgressBottom
            }
          >
            <Text
              style={
                styles.compactProgressModules
              }
            >
              {isProgressLoading
                ? "Loading modules..."
                : `${completedModules} of ${totalModules} modules completed`}
            </Text>

            {allModulesCompleted ? (
              <Pressable
                onPress={
                  handleWrittenExam
                }
                style={({ pressed }) => [
                  styles.compactExamButton,
                  pressed &&
                    styles.compactExamButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.compactExamButtonText
                  }
                >
                  Take Exam
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={11}
                  color="#002B5C"
                />
              </Pressable>
            ) : (
              <Text
                style={
                  styles.unlockText
                }
              >
                Exam unlocks at 100%
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   NO CURRENT TRAINING
============================================================ */

function NoCurrentTraining({
  onBrowse,
}: {
  onBrowse: () => void;
}) {
  return (
    <View style={styles.noTrainingCard}>
      <View style={styles.noTrainingIcon}>
        <Ionicons
          name="school-outline"
          size={24}
          color="#002B5C"
        />
      </View>

      <View style={styles.noTrainingContent}>
        <Text style={styles.noTrainingTitle}>
          No Current Training
        </Text>

        <Text style={styles.noTrainingText}>
          You do not have an approved training
          enrollment yet.
        </Text>

        <Pressable
          onPress={onBrowse}
          style={styles.browseButton}
        >
          <Text
            style={styles.browseButtonText}
          >
            Browse Training
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/* ============================================================
   SERVICE CARD
============================================================ */

function ServiceCard({
  service,
  width,
  onRequest,
}: ServiceCardProps) {
  const iconName = getServiceIcon(
    service.category,
  );

  const requirements = [
    ...(service.requirements ?? []),
  ].sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder,
  );

  return (
    <View
      style={[
        styles.serviceCard,
        {
          width,
        },
      ]}
    >
      <View
        style={
          styles.serviceImageContainer
        }
      >
        {service.imageUrl ? (
          <Image
            source={{
              uri: service.imageUrl,
            }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={
              styles.serviceImagePlaceholder
            }
          >
            <Ionicons
              name={iconName}
              size={46}
              color="#6FD1D7"
            />
          </View>
        )}

        <View
          style={styles.serviceImageOverlay}
        />

        <View
          style={styles.serviceCategoryBadge}
        >
          <Ionicons
            name={iconName}
            size={10}
            color="#002B5C"
          />

          <Text
            style={
              styles.serviceCategoryBadgeText
            }
            numberOfLines={1}
          >
            {service.requiresTraining
              ? "TRAINING-BASED"
              : service.category ||
                "PROFESSIONAL SERVICE"}
          </Text>
        </View>

        <View
          style={styles.serviceTitleOverlay}
        >
          <Text
            style={styles.serviceCodeOverlay}
            numberOfLines={1}
          >
            {service.serviceCode}
          </Text>

          <Text
            style={
              styles.serviceTitleOverlayText
            }
            numberOfLines={2}
          >
            {service.name}
          </Text>

          <Text
            style={
              styles.serviceCategoryOverlayText
            }
            numberOfLines={1}
          >
            {service.category ||
              "Professional Service"}
          </Text>
        </View>
      </View>

      <View style={styles.serviceContent}>
        <Text
          style={styles.serviceDescription}
          numberOfLines={3}
        >
          {service.description ||
            "Professional service provided by ACE NextGen Consultancy Inc."}
        </Text>

        {requirements.length > 0 && (
          <View
            style={styles.serviceRequirements}
          >
            <Text
              style={
                styles.serviceRequirementsLabel
              }
            >
              REQUIREMENTS
            </Text>

            {requirements
              .slice(0, 2)
              .map((requirement) => (
                <View
                  key={requirement.id}
                  style={
                    styles.serviceRequirementRow
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.serviceRequirementText
                    }
                    numberOfLines={1}
                  >
                    {requirement.name}

                    {requirement.isRequired && (
                      <Text
                        style={
                          styles.requiredMark
                        }
                      >
                        {" "}
                        *
                      </Text>
                    )}
                  </Text>
                </View>
              ))}
          </View>
        )}

        <Pressable
          onPress={() =>
            onRequest(service)
          }
          style={({ pressed }) => [
            styles.serviceRequestButton,
            pressed &&
              styles.serviceRequestButtonPressed,
          ]}
        >
          <Text
            style={
              styles.serviceRequestButtonText
            }
          >
            Request this service
          </Text>

          <View
            style={
              styles.serviceRequestArrow
            }
          >
            <Ionicons
              name="arrow-forward"
              size={14}
              color="#FFFFFF"
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================
   TODAY / UPCOMING SESSION
============================================================ */

function TrainingSessionCard({
  session,
  isToday,
}: {
  session: TrainingSession | null;
  isToday: boolean;
}) {
  if (!session) {
    return (
      <View style={styles.noSessionDashboardCard}>
        <View
          style={styles.noSessionDashboardIcon}
        >
          <Ionicons
            name="calendar-clear-outline"
            size={22}
            color="#64748B"
          />
        </View>

        <View
          style={
            styles.noSessionDashboardContent
          }
        >
          <Text
            style={
              styles.noSessionDashboardTitle
            }
          >
            No Upcoming Session
          </Text>

          <Text
            style={
              styles.noSessionDashboardText
            }
          >
            You currently have no upcoming
            training session.
          </Text>
        </View>
      </View>
    );
  }

  const sessionDate = new Date(
    session.sessionDate,
  );

  const formattedDate =
    sessionDate.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

  return (
    <View
      style={styles.sessionDashboardCard}
    >
      <View
        style={styles.sessionDashboardTop}
      >
        <View
          style={
            styles.sessionDashboardBadge
          }
        >
          <View
            style={
              styles.sessionDashboardBadgeDot
            }
          />

          <Text
            style={
              styles.sessionDashboardBadgeText
            }
          >
            {isToday
              ? "TODAY'S SESSION"
              : "UPCOMING SESSION"}
          </Text>
        </View>

        <View
          style={
            styles.sessionNumberBadge
          }
        >
          <Text
            style={
              styles.sessionNumberBadgeText
            }
          >
            SESSION{" "}
            {session.sessionNumber}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.sessionDashboardMain
        }
      >
        <View
          style={
            styles.sessionDashboardDateIcon
          }
        >
          <Ionicons
            name="calendar"
            size={20}
            color="#002B5C"
          />
        </View>

        <View
          style={
            styles.sessionDashboardInfo
          }
        >
          <Text
            style={
              styles.sessionDashboardDate
            }
          >
            {formattedDate}
          </Text>

          <View
            style={
              styles.sessionDashboardDetails
            }
          >
            <View
              style={
                styles.sessionDashboardDetail
              }
            >
              <Ionicons
                name="time-outline"
                size={13}
                color="#64748B"
              />

              <Text
                style={
                  styles.sessionDashboardDetailText
                }
              >
                {formatSessionTime(
                  session.startTime,
                )}{" "}
                -{" "}
                {formatSessionTime(
                  session.endTime,
                )}
              </Text>
            </View>

            <View
              style={
                styles.sessionDashboardDetail
              }
            >
              <Ionicons
                name="hourglass-outline"
                size={13}
                color="#64748B"
              />

              <Text
                style={
                  styles.sessionDashboardDetailText
                }
              >
                {session.durationHours} hrs
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={styles.sessionDashboardFooter}
      >
        <Ionicons
          name={
            isToday
              ? "information-circle-outline"
              : "calendar-outline"
          }
          size={14}
          color="#2563EB"
        />

        <Text
          style={
            styles.sessionDashboardFooterText
          }
        >
          {isToday
            ? "Your training session is scheduled today."
            : "Make sure to check your schedule before the session."}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   PARTICIPANT DASHBOARD
============================================================ */

export default function ParticipantDashboard() {
  const { width: screenWidth } =
    useWindowDimensions();

  const serviceCardWidth = Math.max(
    280,
    screenWidth - 36,
  );

  const {
    profile,
    refreshProfile,
  } = useParticipant(
    participantProfileApi,
  );

  const {
    enrollments,
    refreshMyEnrollments,
  } = useEnrollments(
    enrollmentApi,
  );

  const { batches } =
    useTrainingBatches(
      trainingBatchApi,
    );

  const {
    loadLearningMaterials,
    loadModules,
    isLoading:
      learningMaterialsLoading,
  } = useLearningMaterials(
    learningMaterialApi,
  );

  const {
    getMaterialProgress,
    isLoading: progressLoading,
  } = useLearningProgress(
    learningProgressApi,
  );

  const {
    loadByBatchIdParticipantAssessment,
  } = useWrittenAssessment(apiClient);

  const [services, setServices] =
    useState<Service[]>([]);

  const [
    servicesLoading,
    setServicesLoading,
  ] = useState(true);

  const [
    servicesError,
    setServicesError,
  ] = useState<string | null>(
    null,
  );

  const [
    serviceSlideIndex,
    setServiceSlideIndex,
  ] = useState(0);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    moduleCompletion,
    setModuleCompletion,
  ] = useState<ModuleCompletion>({
    completed: 0,
    total: 0,
  });

  const [participantAssessments, setParticipantAssessments] =
    useState<any[]>([]);

  /* ============================================================
     TRAINING SESSIONS STATE
  ============================================================ */

  const [
    trainingSessions,
    setTrainingSessions,
  ] = useState<TrainingSession[]>(
    [],
  );

  const [
    sessionsLoading,
    setSessionsLoading,
  ] = useState(false);

  const enrollmentsLoadedRef =
    useRef(false);

  const progressLoadedForBatchRef =
    useRef<string | null>(null);

  const progressLoadingRef =
    useRef(false);

  /* ============================================================
     LOAD SERVICES
  ============================================================ */

  const loadServices = useCallback(
    async () => {
      try {
        setServicesLoading(true);
        setServicesError(null);

        const result =
          await serviceApi.getAll();

        const activeServices =
          Array.isArray(result)
            ? result.filter(
                (service) =>
                  service.isActive,
              )
            : [];

        setServices(activeServices);
        setServiceSlideIndex(0);
      } catch (error) {
        console.error(
          "FAILED TO LOAD SERVICES:",
          error,
        );

        setServicesError(
          "Unable to load available services.",
        );

        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  /* ============================================================
     LOAD ENROLLMENTS
  ============================================================ */

  useEffect(() => {
    if (enrollmentsLoadedRef.current) {
      return;
    }

    enrollmentsLoadedRef.current =
      true;

    refreshMyEnrollments().catch(
      (error) => {
        console.error(
          "FAILED TO LOAD MY ENROLLMENTS:",
          error,
        );

        enrollmentsLoadedRef.current =
          false;
      },
    );
  }, [refreshMyEnrollments]);

  /* ============================================================
     CURRENT ENROLLMENT
  ============================================================ */

  const currentEnrollment =
    useMemo(() => {
      return (
        enrollments.find(
          (enrollment: any) =>
            String(
              enrollment?.status ?? "",
            ).toLowerCase() ===
            "approved",
        ) ?? null
      );
    }, [enrollments]);

  /* ============================================================
     CURRENT BATCH ID
  ============================================================ */

  const currentTrainingBatchId =
    currentEnrollment?.trainingBatchId
      ? String(
          currentEnrollment.trainingBatchId,
        )
      : null;

  /* ============================================================
     CURRENT BATCH
  ============================================================ */

  const currentBatch =
    useMemo(() => {
      if (!currentTrainingBatchId) {
        return null;
      }

      return (
        batches.find(
          (batch: any) =>
            String(batch?.id) ===
            currentTrainingBatchId,
        ) ?? null
      );
    }, [
      batches,
      currentTrainingBatchId,
    ]);

  /* ============================================================
     TRAINER
  ============================================================ */

  const currentTrainer =
    currentBatch?.trainer ?? null;

  const trainerName = useMemo(() => {
    if (!currentTrainer) {
      return "Trainer not assigned";
    }

    const trainer =
      currentTrainer as any;

    const firstName =
      trainer?.firstName ?? "";

    const lastName =
      trainer?.lastName ?? "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    return (
      fullName ||
      trainer?.fullName ||
      trainer?.name ||
      "Trainer assigned"
    );
  }, [currentTrainer]);

  /* ============================================================
     PROGRAM
  ============================================================ */

  const programName =
    (currentEnrollment as any)
      ?.programName ??
    (currentBatch as any)
      ?.programName ??
    (currentBatch as any)
      ?.trainingProgram?.name ??
    "Current Training";

  /* ============================================================
     BATCH CODE
  ============================================================ */

  const batchCode =
    (currentEnrollment as any)
      ?.batchCode ??
    (currentBatch as any)?.batchCode ??
    "Training Batch";

  /* ============================================================
     TRAINING DATE
  ============================================================ */

  const trainingDateText =
    useMemo(() => {
      const batch =
        currentBatch as any;

      const startDate =
        batch?.startDate;

      const endDate =
        batch?.endDate;

      if (!startDate && !endDate) {
        return "Training schedule";
      }

      if (
        startDate &&
        endDate
      ) {
        return `${formatDate(
          startDate,
        )} - ${formatDate(endDate)}`;
      }

      if (startDate) {
        return `Starts ${formatDate(
          startDate,
        )}`;
      }

      return "Training schedule";
    }, [currentBatch]);

  /* ============================================================
     LOAD TRAINING SESSIONS
     
     IMPORTANT:
     This depends ONLY on the stable batch ID.
     No setState inside useMemo.
  ============================================================ */

  const loadTrainingSessions =
    useCallback(
      async (batchId: string) => {
        if (!batchId) {
          setTrainingSessions([]);
          return;
        }

        try {
          setSessionsLoading(true);

          const result =
            await trainingBatchApi.getParticipantSchedule(
              batchId,
            );

          setTrainingSessions(
            Array.isArray(result)
              ? result
              : [],
          );
        } catch (error) {
          console.error(
            "FAILED TO LOAD TRAINING SESSIONS:",
            error,
          );

          setTrainingSessions([]);
        } finally {
          setSessionsLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    if (!currentTrainingBatchId) {
      setTrainingSessions([]);
      setSessionsLoading(false);
      return;
    }

    void loadTrainingSessions(
      currentTrainingBatchId,
    );
  }, [
    currentTrainingBatchId,
    loadTrainingSessions,
  ]);

  /* ============================================================
     TODAY SESSION
  ============================================================ */

  const todaySession =
    useMemo(() => {
      if (
        trainingSessions.length ===
        0
      ) {
        return null;
      }

      const today = new Date();

      const sessionsToday =
        trainingSessions.filter(
          (session) => {
            const date =
              new Date(
                session.sessionDate,
              );

            return isSameDate(
              date,
              today,
            );
          },
        );

      return (
        [...sessionsToday].sort(
          (a, b) =>
            a.sessionNumber -
            b.sessionNumber,
        )[0] ?? null
      );
    }, [trainingSessions]);

  /* ============================================================
     UPCOMING SESSION
  ============================================================ */

  const upcomingSession =
    useMemo(() => {
      if (
        trainingSessions.length ===
        0
      ) {
        return null;
      }

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0,
      );

      const futureSessions =
        trainingSessions.filter(
          (session) => {
            const date =
              new Date(
                session.sessionDate,
              );

            date.setHours(
              0,
              0,
              0,
              0,
            );

            return date > today;
          },
        );

      return (
        [...futureSessions].sort(
          (a, b) =>
            new Date(
              a.sessionDate,
            ).getTime() -
            new Date(
              b.sessionDate,
            ).getTime(),
        )[0] ?? null
      );
    }, [trainingSessions]);

  /* ============================================================
     FEATURED SESSION
  ============================================================ */

  const featuredSession =
    todaySession ??
    upcomingSession;

  const featuredSessionIsToday =
    todaySession !== null;

  /* ============================================================
     LOAD LEARNING PROGRESS
  ============================================================ */

  const loadDashboardProgress =
    useCallback(
      async (
        batchId: string,
        force = false,
      ) => {
        if (!batchId) {
          setModuleCompletion({
            completed: 0,
            total: 0,
          });

          return;
        }

        if (
          progressLoadingRef.current
        ) {
          return;
        }

        if (
          !force &&
          progressLoadedForBatchRef.current ===
            batchId
        ) {
          return;
        }

        try {
          progressLoadingRef.current =
            true;

          const materials =
            await loadLearningMaterials(
              batchId,
            );

          const loadedMaterials =
            Array.isArray(materials)
              ? materials
              : [];

          if (
            loadedMaterials.length ===
            0
          ) {
            setModuleCompletion({
              completed: 0,
              total: 0,
            });

            progressLoadedForBatchRef.current =
              batchId;

            return;
          }

          const material =
            loadedMaterials[0];

          if (!material?.id) {
            setModuleCompletion({
              completed: 0,
              total: 0,
            });

            progressLoadedForBatchRef.current =
              batchId;

            return;
          }

          const loadedModules =
            await loadModules(
              String(material.id),
            );

          const courseModules =
            Array.isArray(
              loadedModules,
            )
              ? loadedModules
              : [];

          if (
            courseModules.length ===
            0
          ) {
            setModuleCompletion({
              completed: 0,
              total: 0,
            });

            progressLoadedForBatchRef.current =
              batchId;

            return;
          }

          const materialProgress =
            await getMaterialProgress(
              String(material.id),
            );

          const progressModules =
            Array.isArray(
              materialProgress?.modules,
            )
              ? materialProgress.modules
              : [];

          let completed = 0;

          courseModules.forEach(
            (module: any) => {
              const moduleProgress =
                progressModules.find(
                  (item: any) =>
                    String(
                      item?.moduleId,
                    ) ===
                    String(module?.id),
                );

              if (!moduleProgress) {
                return;
              }

              const totalSections =
                Number(
                  moduleProgress?.totalSections ??
                    0,
                );

              const completedSections =
                Number(
                  moduleProgress?.completedSections ??
                    0,
                );

              if (
                totalSections > 0 &&
                completedSections >=
                  totalSections
              ) {
                completed += 1;
              }
            },
          );

          setModuleCompletion({
            completed,
            total: courseModules.length,
          });

          progressLoadedForBatchRef.current =
            batchId;
        } catch (error) {
          console.error(
            "FAILED TO LOAD DASHBOARD PROGRESS:",
            error,
          );

          setModuleCompletion({
            completed: 0,
            total: 0,
          });
        } finally {
          progressLoadingRef.current =
            false;
        }
      },
      [
        loadLearningMaterials,
        loadModules,
        getMaterialProgress,
      ],
    );

 const loadAssessments = useCallback(
  async (batchId: string) => {
    if (!batchId) {
      console.log(
        "ASSESSMENT: No batch ID available",
      );

      setParticipantAssessments([]);
      return;
    }

    try {
      console.log(
        "================================",
      );
      console.log(
        "ASSESSMENT: Loading for batch:",
        batchId,
      );

      const result =
        await loadByBatchIdParticipantAssessment(
          batchId,
        );

      console.log(
        "ASSESSMENT: RAW API RESULT:",
        JSON.stringify(result, null, 2),
      );

      let assessments: any[] = [];

      if (Array.isArray(result)) {
        assessments = result;
      } else if (
        Array.isArray((result as any)?.data)
      ) {
        assessments = (result as any).data;
      } else if (
        Array.isArray((result as any)?.items)
      ) {
        assessments = (result as any).items;
      } else if (
        Array.isArray(
          (result as any)?.assessments,
        )
      ) {
        assessments =
          (result as any).assessments;
      } else if (
        (result as any)?.data
      ) {
        assessments = [
          (result as any).data,
        ];
      } else if (result) {
        assessments = [result];
      }

      console.log(
        "ASSESSMENT: NORMALIZED:",
        JSON.stringify(
          assessments,
          null,
          2,
        ),
      );

      setParticipantAssessments(
        assessments,
      );

      console.log(
        "ASSESSMENT: COUNT:",
        assessments.length,
      );

      assessments.forEach(
        (assessment, index) => {
          console.log(
            `ASSESSMENT ${index}:`,
            JSON.stringify(
              assessment,
              null,
              2,
            ),
          );

          console.log(
            `ASSESSMENT ${index} ID CANDIDATES:`,
            {
              id: assessment?.id,
              assessmentId:
                assessment?.assessmentId,
              writtenAssessmentId:
                assessment?.writtenAssessmentId,
              writtenAssessmentID:
                assessment?.writtenAssessmentID,
              assessmentID:
                assessment?.assessmentID,
            },
          );
        },
      );

      console.log(
        "================================",
      );
    } catch (error) {
      console.error(
        "ASSESSMENT: FAILED TO LOAD:",
        error,
      );

      setParticipantAssessments([]);
    }
  },
  [
    loadByBatchIdParticipantAssessment,
  ],
);
 const availableAssessmentId =
  useMemo(() => {
    if (
      !Array.isArray(
        participantAssessments,
      ) ||
      participantAssessments.length === 0
    ) {
      console.log(
        "TAKE EXAM: No participant assessments loaded.",
      );

      return null;
    }

    for (
      const assessment of participantAssessments
    ) {
      const id =
        getAssessmentId(
          assessment,
        );

      if (id) {
        console.log(
          "TAKE EXAM: Found assessment ID:",
          id,
        );

        return id;
      }
    }

    console.log(
      "TAKE EXAM: Assessments exist but no ID was found:",
      JSON.stringify(
        participantAssessments,
        null,
        2,
      ),
    );

    return null;
  }, [
    participantAssessments,
  ]);

  /* ============================================================
     LOAD PROGRESS WHEN BATCH CHANGES
  ============================================================ */

  useEffect(() => {
    if (!currentTrainingBatchId) {
      setModuleCompletion({
        completed: 0,
        total: 0,
      });

      progressLoadedForBatchRef.current =
        null;

      return;
    }

    void loadDashboardProgress(
      currentTrainingBatchId,
    );
  }, [
    currentTrainingBatchId,
    loadDashboardProgress,
  ]);

  useEffect(() => {
    if (!currentTrainingBatchId || courseCompletionPercentage < 100) {
      setParticipantAssessments([]);
      return;
    }

    void loadAssessments(currentTrainingBatchId);
  }, [
    currentTrainingBatchId,
    
    loadAssessments,
  ]);

  /* ============================================================
     SERVICE SCROLL
  ============================================================ */

  const handleServiceScroll =
    useCallback(
      (
        event: NativeSyntheticEvent<NativeScrollEvent>,
      ) => {
        if (!serviceCardWidth) {
          return;
        }

        const offsetX =
          event.nativeEvent
            .contentOffset.x;

        const index = Math.round(
          offsetX /
            serviceCardWidth,
        );

        setServiceSlideIndex(
          Math.max(
            0,
            Math.min(
              index,
              Math.max(
                services.length - 1,
                0,
              ),
            ),
          ),
        );
      },
      [
        serviceCardWidth,
        services.length,
      ],
    );

  /* ============================================================
     REQUEST SERVICE
  ============================================================ */

  const handleRequestService = (
    service: Service,
  ) => {
    router.push(
      `/services/request?serviceId=${service.id}` as any,
    );
  };

  /* ============================================================
     REFRESH
  ============================================================ */

  const onRefresh =
    useCallback(async () => {
      try {
        setRefreshing(true);

        progressLoadedForBatchRef.current =
          null;

        await refreshProfile();

        const latestEnrollments =
          await refreshMyEnrollments();

        await loadServices();

        const approvedEnrollment =
          Array.isArray(
            latestEnrollments,
          )
            ? latestEnrollments.find(
                (enrollment: any) =>
                  String(
                    enrollment?.status ??
                      "",
                  ).toLowerCase() ===
                  "approved",
              )
            : null;

        const batchId =
          approvedEnrollment?.trainingBatchId
            ? String(
                approvedEnrollment.trainingBatchId,
              )
            : null;

        if (batchId) {
          await Promise.all([
            loadDashboardProgress(
              batchId,
              true,
            ),
            loadTrainingSessions(
              batchId,
            ),
          ]);
        } else {
          setModuleCompletion({
            completed: 0,
            total: 0,
          });

          setTrainingSessions([]);
        }
      } catch (error) {
        console.error(
          "FAILED TO REFRESH PARTICIPANT DASHBOARD:",
          error,
        );
      } finally {
        setRefreshing(false);
      }
    }, [
      refreshProfile,
      refreshMyEnrollments,
      loadServices,
      loadDashboardProgress,
      loadTrainingSessions,
    ]);

  /* ============================================================
     DASHBOARD DATA
  ============================================================ */

  const courseCompletionPercentage =
    moduleCompletion.total > 0
      ? Math.round(
          (moduleCompletion.completed /
            moduleCompletion.total) *
            100,
        )
      : 0;

  const participant =
    mockParticipant;

  const statistics =
    participant.statistics;

  const attendance =
    participant.attendance;

  const assessments =
    mockAssessments;

  const completedAssessments =
    assessments.filter(
      (assessment) =>
        assessment.status ===
        "Completed",
    ).length;

  const upcomingAttendance =
    attendance.find(
      (item) =>
        item.attendanceOpen ===
        true,
    );

  const firstName =
    profile?.firstName?.trim() ||
    participant.fullName
      ?.split(" ")[0] ||
    "Participant";

  const profileImage =
    profile?.profileImageUrl ??
    null;

  const greeting =
    getGreeting();

  const profileInitial =
    firstName
      .charAt(0)
      .toUpperCase() || "P";

  return (
    <View style={styles.screen}>
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#002B5C"
            colors={["#002B5C"]}
          />
        }
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.topHeader}>
          <Pressable
            style={
              styles.profileHeaderArea
            }
            onPress={() => {
              router.push(
                "/profile" as any,
              );
            }}
          >
            <View
              style={styles.profileAvatar}
            >
              {profileImage ? (
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={
                    styles.profileAvatarImage
                  }
                />
              ) : (
                <Text
                  style={
                    styles.profileAvatarText
                  }
                >
                  {profileInitial}
                </Text>
              )}
            </View>

            <View
              style={styles.greetingArea}
            >
              <Text
                style={styles.greetingText}
              >
                {greeting}
              </Text>

              <Text
                style={styles.greetingName}
                numberOfLines={1}
              >
                {firstName}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed &&
                styles.notificationButtonPressed,
            ]}
            onPress={() => {
              router.push(
                "/notifications" as any,
              );
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color="#002B5C"
            />

            <View
              style={
                styles.notificationDot
              }
            />
          </Pressable>
        </View>

        {/* =====================================================
            PENDING ACCOUNT
        ===================================================== */}

        {profile?.status ===
          "Pending" && (
          <View
            style={styles.pendingCard}
          >
            <View
              style={styles.pendingIcon}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color="#B45309"
              />
            </View>

            <View
              style={styles.pendingContent}
            >
              <Text
                style={
                  styles.pendingTitle
                }
              >
                Account under review
              </Text>

              <Text
                style={styles.pendingText}
              >
                Your participant account is
                currently pending
                administrator approval.
              </Text>
            </View>
          </View>
        )}

        {/* =====================================================
            YOUR TRAINING
        ===================================================== */}

        <SectionTitle
          title="Your Training"
          subtitle="Current assigned program"
        />

        {currentEnrollment ? (
          <CurrentTrainingHero
            programName={programName}
            batchCode={batchCode}
            trainerName={trainerName}
            trainingDate={
              trainingDateText
            }
            progress={
              courseCompletionPercentage
            }
            completedModules={
              moduleCompletion.completed
            }
            totalModules={
              moduleCompletion.total
            }
            isProgressLoading={
              progressLoading ||
              learningMaterialsLoading
            }
            assessmentId={availableAssessmentId}
          />
        ) : (
          <NoCurrentTraining
            onBrowse={() =>
              router.push(
                "/training" as any,
              )
            }
          />
        )}

        {/* =====================================================
            TODAY / UPCOMING SESSION
        ===================================================== */}

        <SectionTitle
          title={
            todaySession
              ? "Today's Session"
              : "Upcoming Session"
          }
          subtitle={
            todaySession
              ? "Your scheduled training for today"
              : "Your next scheduled training"
          }
        />

        {sessionsLoading ? (
          <View
            style={
              styles.sessionLoadingCard
            }
          >
            <ActivityIndicator
              size="small"
              color="#002B5C"
            />

            <Text
              style={
                styles.sessionLoadingText
              }
            >
              Loading training session...
            </Text>
          </View>
        ) : (
          <TrainingSessionCard
            session={featuredSession}
            isToday={
              featuredSessionIsToday
            }
          />
        )}

        {/* =====================================================
            SERVICES
        ===================================================== */}

        <SectionTitle
          title="Services Overview"
          subtitle="Explore our professional services"
        />

        {servicesLoading ? (
          <View
            style={
              styles.servicesLoadingCard
            }
          >
            <ActivityIndicator
              size="small"
              color="#002B5C"
            />

            <Text
              style={
                styles.servicesLoadingText
              }
            >
              Loading available services...
            </Text>
          </View>
        ) : servicesError ? (
          <View
            style={
              styles.servicesEmptyCard
            }
          >
            <View
              style={
                styles.servicesEmptyIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color="#2563EB"
              />
            </View>

            <Text
              style={
                styles.servicesEmptyTitle
              }
            >
              Unable to Load Services
            </Text>

            <Text
              style={
                styles.servicesEmptyText
              }
            >
              {servicesError}
            </Text>
          </View>
        ) : services.length === 0 ? (
          <View
            style={
              styles.servicesEmptyCard
            }
          >
            <View
              style={
                styles.servicesEmptyIcon
              }
            >
              <Ionicons
                name="layers-outline"
                size={25}
                color="#2563EB"
              />
            </View>

            <Text
              style={
                styles.servicesEmptyTitle
              }
            >
              No Services Available
            </Text>

            <Text
              style={
                styles.servicesEmptyText
              }
            >
              There are currently no active
              services available.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={
                false
              }
              decelerationRate="fast"
              snapToInterval={
                serviceCardWidth
              }
              snapToAlignment="start"
              onScroll={
                handleServiceScroll
              }
              scrollEventThrottle={16}
            >
              {services.map(
                (service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    width={
                      serviceCardWidth
                    }
                    onRequest={
                      handleRequestService
                    }
                  />
                ),
              )}
            </ScrollView>

            {services.length > 1 && (
              <View
                style={
                  styles.servicePagination
                }
              >
                {services.map(
                  (service, index) => (
                    <View
                      key={service.id}
                      style={[
                        styles.serviceDot,
                        index ===
                          serviceSlideIndex &&
                          styles.serviceDotActive,
                      ]}
                    />
                  ),
                )}
              </View>
            )}
          </>
        )}

        {/* =====================================================
            ATTENDANCE
        ===================================================== */}

        <SectionTitle
          title="Attendance"
          subtitle="Your latest attendance status"
        />

        <View
          style={styles.attendanceCard}
        >
          <View
            style={styles.attendanceIcon}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#002B5C"
            />
          </View>

          <View
            style={
              styles.attendanceContent
            }
          >
            <Text
              style={
                styles.attendanceTitle
              }
            >
              Attendance Rate
            </Text>

            <Text
              style={
                styles.attendanceValue
              }
            >
              {statistics.attendanceRate}%
            </Text>

            <Text
              style={
                styles.attendanceSubtitle
              }
            >
              {upcomingAttendance
                ? "Attendance is currently open."
                : "No attendance session is currently open."}
            </Text>
          </View>

          <View
            style={
              styles.attendanceStatus
            }
          >
            <View
              style={[
                styles.attendanceStatusDot,
                {
                  backgroundColor:
                    upcomingAttendance
                      ? "#22C55E"
                      : "#CBD5E1",
                },
              ]}
            />

            <Text
              style={
                styles.attendanceStatusText
              }
            >
              {upcomingAttendance
                ? "OPEN"
                : "CLOSED"}
            </Text>
          </View>
        </View>

        {/* =====================================================
            RECENT ACTIVITY
        ===================================================== */}

        <SectionTitle
          title="Recent Activity"
          subtitle="Your latest training activities"
        />

        <View
          style={styles.activityCard}
        >
          <View
            style={styles.activityItem}
          >
            <View
              style={
                styles.activityIcon
              }
            >
              <Ionicons
                name="book-outline"
                size={17}
                color="#002B5C"
              />
            </View>

            <View
              style={
                styles.activityContent
              }
            >
              <Text
                style={
                  styles.activityTitle
                }
              >
                Learning Progress
              </Text>

              <Text
                style={
                  styles.activityText
                }
              >
                You have completed{" "}
                {moduleCompletion.completed}{" "}
                of{" "}
                {moduleCompletion.total}{" "}
                modules.
              </Text>
            </View>
          </View>

          <View
            style={styles.activityDivider}
          />

          <View
            style={styles.activityItem}
          >
            <View
              style={
                styles.activityIcon
              }
            >
              <Ionicons
                name="clipboard-outline"
                size={17}
                color="#002B5C"
              />
            </View>

            <View
              style={
                styles.activityContent
              }
            >
              <Text
                style={
                  styles.activityTitle
                }
              >
                Assessments
              </Text>

              <Text
                style={
                  styles.activityText
                }
              >
                {completedAssessments}{" "}
                assessment
                {completedAssessments !==
                1
                  ? "s"
                  : ""}{" "}
                completed.
              </Text>
            </View>
          </View>
        </View>

        <View
          style={styles.bottomSpacing}
        />
      </ScrollView>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 30,
  },

  /* ============================================================
     HEADER
  ============================================================ */

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  profileHeaderArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E7EEF5",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },

  profileAvatarText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#002B5C",
  },

  greetingArea: {
    marginLeft: 11,
    flex: 1,
    minWidth: 0,
  },

  greetingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#718096",
  },

  greetingName: {
    marginTop: 1,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    color: "#002B5C",
  },

  notificationButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E7EDF3",
    position: "relative",
  },

  notificationButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  /* ============================================================
     SECTION
  ============================================================ */

  sectionTitleContainer: {
    marginBottom: 10,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#002B5C",
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 9.5,
    color: "#8A98A8",
  },

  /* ============================================================
     COMPACT TRAINING HERO
  ============================================================ */

  trainingHero: {
    position: "relative",
    backgroundColor: "#002B5C",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 19,
    borderWidth: 1,
    borderColor:
      "rgba(111,209,215,0.18)",
  },

  trainingHeroInner: {
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  trainingHeroGlow: {
    position: "absolute",
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: "#3B7597",
    opacity: 0.25,
    top: -65,
    right: -25,
  },

  trainingHeroGlowTwo: {
    position: "absolute",
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: "#6FD1D7",
    opacity: 0.1,
    bottom: -45,
    left: 45,
  },

  trainingHeroTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  trainingHeroIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor:
      "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  trainingHeroTopText: {
    marginLeft: 9,
    flex: 1,
  },

  trainingHeroEyebrow: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#9BB1C4",
  },

  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 4,
  },

  activeText: {
    fontSize: 6.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#AFC3D5",
  },

  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor:
      "rgba(34,197,94,0.14)",
  },

  approvedBadgeText: {
    marginLeft: 3,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: "#86EFAC",
  },

  trainingHeroInfo: {
    paddingTop: 9,
  },

  trainingHeroTitle: {
    fontSize: 15.5,
    lineHeight: 19,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  batchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  batchText: {
    marginLeft: 4,
    fontSize: 7.5,
    fontWeight: "700",
    color: "#AFC3D5",
  },

  trainingMetaRow: {
    flexDirection: "row",
    paddingTop: 10,
    gap: 13,
  },

  trainingMetaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  trainingMetaText: {
    marginLeft: 5,
    flex: 1,
    minWidth: 0,
  },

  trainingMetaLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#70899F",
  },

  trainingMetaValue: {
    marginTop: 2,
    fontSize: 7.5,
    fontWeight: "700",
    color: "#E2EBF2",
  },

  compactProgress: {
    marginTop: 10,
  },

  compactProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  compactProgressLabel: {
    fontSize: 5.8,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#7892A8",
  },

  compactProgressValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6FD1D7",
  },

  compactProgressTrack: {
    height: 4,
    marginTop: 4,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor:
      "rgba(255,255,255,0.12)",
  },

  compactProgressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#6FD1D7",
  },

  compactProgressBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },

  compactProgressModules: {
    flex: 1,
    fontSize: 6.5,
    color: "#9EB5C8",
  },

  unlockText: {
    fontSize: 6,
    fontWeight: "600",
    color: "#7892A8",
  },

  compactExamButton: {
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  compactExamButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  compactExamButtonText: {
    fontSize: 6.5,
    fontWeight: "900",
    color: "#002B5C",
  },

  /* ============================================================
     NO TRAINING
  ============================================================ */

  noTrainingCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    marginBottom: 19,
  },

  noTrainingIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#EAF2F9",
    alignItems: "center",
    justifyContent: "center",
  },

  noTrainingContent: {
    flex: 1,
    marginLeft: 11,
  },

  noTrainingTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#002B5C",
  },

  noTrainingText: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 13,
    color: "#718096",
  },

  browseButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#002B5C",
  },

  browseButtonText: {
    marginRight: 5,
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* ============================================================
     TODAY / UPCOMING SESSION
  ============================================================ */

  sessionLoadingCard: {
    height: 105,
    marginBottom: 19,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    alignItems: "center",
    justifyContent: "center",
  },

  sessionLoadingText: {
    marginTop: 7,
    fontSize: 8,
    color: "#718096",
  },

  sessionDashboardCard: {
    marginBottom: 19,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3EAF0",
  },

  sessionDashboardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sessionDashboardBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EAF7F0",
  },

  sessionDashboardBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 5,
  },

  sessionDashboardBadgeText: {
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#15803D",
  },

  sessionNumberBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },

  sessionNumberBadgeText: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#64748B",
  },

  sessionDashboardMain: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },

  sessionDashboardDateIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EAF2F9",
    alignItems: "center",
    justifyContent: "center",
  },

  sessionDashboardInfo: {
    flex: 1,
    marginLeft: 10,
  },

  sessionDashboardDate: {
    fontSize: 12,
    fontWeight: "900",
    color: "#002B5C",
  },

  sessionDashboardDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 11,
    marginTop: 6,
  },

  sessionDashboardDetail: {
    flexDirection: "row",
    alignItems: "center",
  },

  sessionDashboardDetailText: {
    marginLeft: 4,
    fontSize: 7.5,
    fontWeight: "700",
    color: "#64748B",
  },

  sessionDashboardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F5",
  },

  sessionDashboardFooterText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 7.5,
    lineHeight: 11,
    color: "#718096",
  },

  noSessionDashboardCard: {
    minHeight: 90,
    marginBottom: 19,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    flexDirection: "row",
    alignItems: "center",
  },

  noSessionDashboardIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  noSessionDashboardContent: {
    flex: 1,
    marginLeft: 10,
  },

  noSessionDashboardTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#334155",
  },

  noSessionDashboardText: {
    marginTop: 3,
    fontSize: 7.5,
    lineHeight: 11,
    color: "#94A3B8",
  },

  /* ============================================================
     SERVICES
  ============================================================ */

  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6EBF0",
    marginRight: 0,
    shadowColor: "#002B5C",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  serviceImageContainer: {
    height: 155,
    backgroundColor: "#0D2142",
    position: "relative",
    overflow: "hidden",
  },

  serviceImage: {
    width: "100%",
    height: "100%",
  },

  serviceImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D2142",
  },

  serviceImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(0,0,0,0.34)",
  },

  serviceCategoryBadge: {
    position: "absolute",
    top: 11,
    left: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.94)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    maxWidth: "72%",
  },

  serviceCategoryBadgeText: {
    marginLeft: 4,
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#002B5C",
  },

  serviceTitleOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },

  serviceCodeOverlay: {
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#B8E9EC",
    marginBottom: 3,
  },

  serviceTitleOverlayText: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor:
      "rgba(0,0,0,0.35)",
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  serviceCategoryOverlayText: {
    marginTop: 3,
    fontSize: 7.5,
    fontWeight: "600",
    color: "#D8E4ED",
  },

  serviceContent: {
    padding: 12,
  },

  serviceDescription: {
    fontSize: 8,
    lineHeight: 12,
    color: "#64748B",
  },

  serviceRequirements: {
    marginTop: 9,
  },

  serviceRequirementsLabel: {
    marginBottom: 5,
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  serviceRequirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  serviceRequirementText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 7.5,
    lineHeight: 10,
    color: "#64748B",
  },

  requiredMark: {
    color: "#EF4444",
    fontWeight: "900",
  },

  serviceRequestButton: {
    marginTop: 9,
    minHeight: 37,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "#002B5C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  serviceRequestButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  serviceRequestButtonText: {
    flex: 1,
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  serviceRequestArrow: {
    width: 25,
    height: 25,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.12)",
  },

  servicePagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
    marginBottom: 22,
    gap: 5,
  },

  serviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
  },

  serviceDotActive: {
    width: 18,
    backgroundColor: "#002B5C",
  },

  servicesLoadingCard: {
    height: 260,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },

  servicesLoadingText: {
    marginTop: 10,
    fontSize: 9,
    fontWeight: "600",
    color: "#718096",
  },

  servicesEmptyCard: {
    minHeight: 210,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    marginBottom: 23,
  },

  servicesEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EAF2F9",
    alignItems: "center",
    justifyContent: "center",
  },

  servicesEmptyTitle: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "900",
    color: "#002B5C",
  },

  servicesEmptyText: {
    marginTop: 4,
    fontSize: 8.5,
    lineHeight: 13,
    textAlign: "center",
    color: "#718096",
  },

  /* ============================================================
     ATTENDANCE
  ============================================================ */

  attendanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 23,
    borderWidth: 1,
    borderColor: "#E9EEF3",
  },

  attendanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EAF2F9",
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceContent: {
    flex: 1,
    marginLeft: 10,
  },

  attendanceTitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#718096",
  },

  attendanceValue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "900",
    color: "#002B5C",
  },

  attendanceSubtitle: {
    marginTop: 2,
    fontSize: 7.5,
    color: "#8A98A8",
  },

  attendanceStatus: {
    alignItems: "flex-end",
  },

  attendanceStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginBottom: 4,
  },

  attendanceStatusText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#64748B",
  },

  /* ============================================================
     RECENT ACTIVITY
  ============================================================ */

  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E9EEF3",
  },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EAF2F9",
    alignItems: "center",
    justifyContent: "center",
  },

  activityContent: {
    flex: 1,
    marginLeft: 10,
  },

  activityTitle: {
    fontSize: 9,
    fontWeight: "900",
    color: "#002B5C",
  },

  activityText: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 12,
    color: "#7B8794",
  },

  activityDivider: {
    height: 1,
    backgroundColor: "#EEF2F5",
  },

  /* ============================================================
     PENDING
  ============================================================ */

  pendingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8EB",
    borderWidth: 1,
    borderColor: "#F7DCA7",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },

  pendingIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FFF0C9",
    alignItems: "center",
    justifyContent: "center",
  },

  pendingContent: {
    flex: 1,
    marginLeft: 10,
  },

  pendingTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#92400E",
  },

  pendingText: {
    marginTop: 2,
    fontSize: 8,
    lineHeight: 12,
    color: "#A16207",
  },

  bottomSpacing: {
    height: 30,
  },
});