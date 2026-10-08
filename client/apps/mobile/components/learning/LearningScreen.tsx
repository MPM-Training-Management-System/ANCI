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
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import type { ParticipantAssessment } from "@repo/types";

import {
  useEnrollments,
  useLearningMaterials,
  useLearningProgress,
  useWrittenAssessment,
} from "@repo/hooks";

import {
  enrollmentApi,
  learningMaterialApi,
  learningProgressApi,
  apiClient,
} from "@/api/api";

/* =========================================================
   TYPES
========================================================= */

type ModuleCompletion = {
  completed: number;
  total: number;
};

type LearningFilter =
  | "all"
  | "modules"
  | "videos"
  | "assessments";

/* =========================================================
   HELPERS
========================================================= */

const getAssessmentId = (assessment: any): string | null => {
  const id =
    assessment?.id ??
    assessment?.assessmentId ??
    assessment?.writtenAssessmentId;

  return id ? String(id) : null;
};

const getAssessmentTitle = (assessment: any): string => {
  return (
    assessment?.title ??
    assessment?.name ??
    assessment?.assessmentTitle ??
    "Written Assessment"
  );
};

const getAssessmentDescription = (assessment: any): string => {
  return (
    assessment?.description ??
    assessment?.instructions ??
    "Complete the written assessment to evaluate your understanding of the training."
  );
};

const getAssessmentQuestionCount = (assessment: any): number => {
  return Number(
    assessment?.questionCount ??
      assessment?.totalQuestions ??
      assessment?.numberOfQuestions ??
      assessment?.questions?.length ??
      0,
  );
};

const getAssessmentPassingPercentage = (
  assessment: any,
): number => {
  return Number(
    assessment?.passingPercentage ??
      assessment?.passingScore ??
      assessment?.passingRate ??
      0,
  );
};

const getAssessmentPassed = (assessment: any): boolean => {
  return Boolean(
    assessment?.isPassed ??
      assessment?.passed ??
      assessment?.result?.isPassed ??
      false,
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function LearningScreen() {
  /* =======================================================
     HOOKS
  ======================================================= */

  const {
    enrollments,
    loadMyEnrollments,
    refreshMyEnrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentError,
  } = useEnrollments(enrollmentApi);

  const {
    learningMaterials,
    modules,
    loadLearningMaterials,
    loadModules,
    isLoading: isLoadingMaterials,
  } = useLearningMaterials(learningMaterialApi);

  const {
    progress,
    getMaterialProgress,
    isLoading: isProgressLoading,
    error: progressError,
  } = useLearningProgress(learningProgressApi);

  const {
    loadByBatchIdParticipantAssessment,
    isLoading: isAssessmentLoading,
    error: assessmentError,
  } = useWrittenAssessment(apiClient);

  /* =======================================================
     STATE
  ======================================================= */

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoadingModules, setIsLoadingModules] =
    useState(false);

  const [areModulesCompleted, setAreModulesCompleted] =
    useState(false);

  const [moduleCompletion, setModuleCompletion] =
    useState<ModuleCompletion>({
      completed: 0,
      total: 0,
    });

  const [participantAssessments, setParticipantAssessments] =
    useState<ParticipantAssessment[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<LearningFilter>("all");

  const hasLoadedInitialData = useRef(false);

  /* =======================================================
     APPROVED ENROLLMENT
  ======================================================= */

  const approvedEnrollment = useMemo(() => {
    return enrollments.find(
      (enrollment: any) =>
        String(enrollment?.status ?? "").toLowerCase() ===
        "approved",
    );
  }, [enrollments]);

  const trainingBatchId =
    approvedEnrollment?.trainingBatchId;

  /* =======================================================
     CURRENT TRAINING
  ======================================================= */

  const programName =
    (approvedEnrollment as any)?.programName ??
    (approvedEnrollment as any)?.trainingBatch?.programName ??
    "Current Training";

  const batchCode =
    (approvedEnrollment as any)?.batchCode ??
    (approvedEnrollment as any)?.trainingBatch?.batchCode ??
    "Training Batch";

  /* =======================================================
     CURRENT LEARNING MATERIAL
  ======================================================= */

  const currentLearningMaterial = useMemo(() => {
    if (
      !Array.isArray(learningMaterials) ||
      learningMaterials.length === 0
    ) {
      return null;
    }

    return learningMaterials[0];
  }, [learningMaterials]);

  /* =======================================================
     LOAD MODULES
     
     IMPORTANT:
     This fetches the modules created by ADMIN.
  ======================================================= */

  const loadCourseModules = useCallback(
    async (materialId: string) => {
      if (!materialId) {
        return [];
      }

      setIsLoadingModules(true);

      try {
        const result = await loadModules(materialId);

        return Array.isArray(result) ? result : [];
      } catch {
        return [];
      } finally {
        setIsLoadingModules(false);
      }
    },
    [loadModules],
  );

  /* =======================================================
     CHECK MODULE COMPLETION
  ======================================================= */

  const checkModuleCompletion = useCallback(
    async (
      materialId: string,
      loadedModules: any[],
    ) => {
      if (
        !materialId ||
        !Array.isArray(loadedModules) ||
        loadedModules.length === 0
      ) {
        setModuleCompletion({
          completed: 0,
          total: Array.isArray(loadedModules)
            ? loadedModules.length
            : 0,
        });

        setAreModulesCompleted(false);

        return false;
      }

      try {
        const materialProgress =
          await getMaterialProgress(materialId);

        const progressModules = Array.isArray(
          materialProgress?.modules,
        )
          ? materialProgress.modules
          : [];

        let completedCount = 0;

        loadedModules.forEach((module: any) => {
          const moduleProgress =
            progressModules.find(
              (item: any) =>
                String(item?.moduleId) ===
                String(module?.id),
            );

          if (!moduleProgress) {
            return;
          }

          const totalSections = Number(
            moduleProgress?.totalSections ?? 0,
          );

          const completedSections = Number(
            moduleProgress?.completedSections ?? 0,
          );

          if (
            totalSections > 0 &&
            completedSections >= totalSections
          ) {
            completedCount += 1;
          }
        });

        const allCompleted =
          loadedModules.length > 0 &&
          completedCount === loadedModules.length;

        setModuleCompletion({
          completed: completedCount,
          total: loadedModules.length,
        });

        setAreModulesCompleted(allCompleted);

        return allCompleted;
      } catch {
        setModuleCompletion({
          completed: 0,
          total: loadedModules.length,
        });

        setAreModulesCompleted(false);

        return false;
      }
    },
    [getMaterialProgress],
  );

  /* =======================================================
     LOAD ASSESSMENTS
     
     IMPORTANT:
     This fetches existing assessments for the batch.
  ======================================================= */

  const loadAssessments = useCallback(
    async (batchId: string) => {
      if (!batchId) {
        setParticipantAssessments([]);
        return;
      }

      try {
        const result =
          await loadByBatchIdParticipantAssessment(
            batchId,
          );

        if (Array.isArray(result)) {
          setParticipantAssessments(
            result as ParticipantAssessment[],
          );

          return;
        }

        const resultData =
          (result as any)?.data ??
          (result as any)?.items;

        if (Array.isArray(resultData)) {
          setParticipantAssessments(
            resultData as ParticipantAssessment[],
          );

          return;
        }

        setParticipantAssessments([]);
      } catch {
        setParticipantAssessments([]);
      }
    },
    [loadByBatchIdParticipantAssessment],
  );

  /* =======================================================
     LOAD DATA
     
     FLOW:
     
     1. Fetch enrollments
     2. Find approved enrollment
     3. Get training batch
     4. Fetch learning materials
     5. Get first material
     6. Fetch ADMIN-CREATED modules
     7. Check module progress
     8. If all completed, fetch assessments
  ======================================================= */

  const loadData = useCallback(async () => {
    try {
      const currentEnrollments =
        await loadMyEnrollments();

      const approved =
        currentEnrollments.find(
          (enrollment: any) =>
            String(
              enrollment?.status ?? "",
            ).toLowerCase() ===
            "approved",
        );

      const currentBatchId =
        approved?.trainingBatchId;

      if (!currentBatchId) {
        setAreModulesCompleted(false);

        setModuleCompletion({
          completed: 0,
          total: 0,
        });

        setParticipantAssessments([]);

        return;
      }

      /* -----------------------------------------------
         FETCH LEARNING MATERIALS
      ------------------------------------------------ */

      const materials =
        await loadLearningMaterials(
          currentBatchId,
        );

      const loadedMaterials =
        Array.isArray(materials)
          ? materials
          : [];

      if (
        loadedMaterials.length === 0
      ) {
        setModuleCompletion({
          completed: 0,
          total: 0,
        });

        setAreModulesCompleted(false);

        setParticipantAssessments([]);

        return;
      }

      const material =
        loadedMaterials[0];

      if (!material?.id) {
        return;
      }

      /* -----------------------------------------------
         FETCH ADMIN-CREATED MODULES
      ------------------------------------------------ */

      const loadedModules =
        await loadCourseModules(
          String(material.id),
        );

      /* -----------------------------------------------
         CHECK MODULE PROGRESS
      ------------------------------------------------ */

      const allCompleted =
        await checkModuleCompletion(
          String(material.id),
          loadedModules,
        );

      /* -----------------------------------------------
         FETCH ASSESSMENTS ONLY WHEN
         ALL MODULES ARE COMPLETED
      ------------------------------------------------ */

      if (allCompleted) {
        await loadAssessments(
          String(currentBatchId),
        );
      } else {
        setParticipantAssessments([]);
      }
    } catch {
      setAreModulesCompleted(false);

      setModuleCompletion({
        completed: 0,
        total: 0,
      });

      setParticipantAssessments([]);
    }
  }, [
    loadMyEnrollments,
    loadLearningMaterials,
    loadCourseModules,
    checkModuleCompletion,
    loadAssessments,
  ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (hasLoadedInitialData.current) {
      return;
    }

    hasLoadedInitialData.current = true;

    void loadData();

    // Intentionally only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     REFRESH
     
     IMPORTANT:
     Same fetching flow as initial loading.
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);

      const currentEnrollments =
        await refreshMyEnrollments();

      const approved =
        currentEnrollments.find(
          (enrollment: any) =>
            String(
              enrollment?.status ?? "",
            ).toLowerCase() ===
            "approved",
        );

      const currentBatchId =
        approved?.trainingBatchId;

      if (!currentBatchId) {
        setAreModulesCompleted(false);

        setModuleCompletion({
          completed: 0,
          total: 0,
        });

        setParticipantAssessments([]);

        return;
      }

      /* -----------------------------------------------
         FETCH MATERIALS AGAIN
      ------------------------------------------------ */

      const materials =
        await loadLearningMaterials(
          currentBatchId,
        );

      const loadedMaterials =
        Array.isArray(materials)
          ? materials
          : [];

      if (
        loadedMaterials.length === 0
      ) {
        setAreModulesCompleted(false);

        setModuleCompletion({
          completed: 0,
          total: 0,
        });

        setParticipantAssessments([]);

        return;
      }

      const material =
        loadedMaterials[0];

      if (!material?.id) {
        return;
      }

      /* -----------------------------------------------
         FETCH MODULES AGAIN
      ------------------------------------------------ */

      const loadedModules =
        await loadCourseModules(
          String(material.id),
        );

      /* -----------------------------------------------
         CHECK PROGRESS AGAIN
      ------------------------------------------------ */

      const allCompleted =
        await checkModuleCompletion(
          String(material.id),
          loadedModules,
        );

      /* -----------------------------------------------
         FETCH ASSESSMENTS IF COMPLETE
      ------------------------------------------------ */

      if (allCompleted) {
        await loadAssessments(
          String(currentBatchId),
        );
      } else {
        setParticipantAssessments([]);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refreshMyEnrollments,
    loadLearningMaterials,
    loadCourseModules,
    checkModuleCompletion,
    loadAssessments,
  ]);

  /* =======================================================
     COMPLETED MODULE IDS
  ======================================================= */

  const completedModuleIds = useMemo(() => {
    const ids = new Set<string>();

    const progressModules = Array.isArray(
      progress?.modules,
    )
      ? progress.modules
      : [];

    progressModules.forEach(
      (moduleProgress: any) => {
        const totalSections = Number(
          moduleProgress?.totalSections ?? 0,
        );

        const completedSections = Number(
          moduleProgress?.completedSections ?? 0,
        );

        if (
          totalSections > 0 &&
          completedSections >= totalSections &&
          moduleProgress?.moduleId
        ) {
          ids.add(
            String(moduleProgress.moduleId),
          );
        }
      },
    );

    return ids;
  }, [progress]);

  /* =======================================================
     OPEN MODULE
  ======================================================= */

  const handleOpenModule = useCallback(
    (module: any, index: number) => {
      if (!module?.id) {
        return;
      }

      if (index > 0) {
        const previousModule =
          modules[index - 1];

        if (!previousModule) {
          return;
        }

        const previousCompleted =
          completedModuleIds.has(
            String(previousModule.id),
          );

        if (!previousCompleted) {
          return;
        }
      }

      if (!currentLearningMaterial?.id) {
        return;
      }

      router.push({
        pathname: "/learning/module",
        params: {
          materialId: String(
            currentLearningMaterial.id,
          ),
          moduleId: String(module.id),
          moduleIndex: String(index),
        },
      });
    },
    [
      modules,
      completedModuleIds,
      currentLearningMaterial,
    ],
  );

  /* =======================================================
     MODULE STATUS
  ======================================================= */

  const isModuleCompleted = useCallback(
    (moduleId: string) => {
      return completedModuleIds.has(
        String(moduleId),
      );
    },
    [completedModuleIds],
  );

  const isModuleUnlocked = useCallback(
    (index: number) => {
      if (index === 0) {
        return true;
      }

      const previousModule =
        modules[index - 1];

      if (!previousModule) {
        return false;
      }

      return isModuleCompleted(
        String(previousModule.id),
      );
    },
    [modules, isModuleCompleted],
  );

  /* =======================================================
     PROGRESS
  ======================================================= */

  const courseCompletionPercentage =
    moduleCompletion.total > 0
      ? Math.round(
          (moduleCompletion.completed /
            moduleCompletion.total) *
            100,
        )
      : 0;

  /* =======================================================
     FILTER
  ======================================================= */

  const showModules =
    activeFilter === "all" ||
    activeFilter === "modules";

  const showVideos =
    activeFilter === "all" ||
    activeFilter === "videos";

  const showAssessments =
    activeFilter === "all" ||
    activeFilter === "assessments";

  /* =======================================================
     LOADING
  ======================================================= */

  const isInitialLoading =
    isLoadingEnrollments &&
    !approvedEnrollment &&
    !hasLoadedInitialData.current;

  if (isInitialLoading) {
    return (
      <View style={styles.centerState}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="small"
            color={COLORS.accent}
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading your training
        </Text>

        <Text style={styles.loadingText}>
          Please wait while we prepare your learning content.
        </Text>
      </View>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  const hasError =
    enrollmentError ||
    progressError ||
    assessmentError;

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
         
          <Text style={styles.pageTitle}>
            Learning Hub
          </Text>

          <Text style={styles.pageSubtitle}>
            Continue your training and complete each
            learning activity.
          </Text>
        </View>

        {/* =================================================
            ERROR
        ================================================= */}

        {hasError ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Unable to load some content
              </Text>

              <Text style={styles.errorText}>
                Pull down to refresh and try again.
              </Text>
            </View>
          </View>
        ) : null}
{/* =================================================
    TRAINING SUMMARY
================================================= */}

{approvedEnrollment ? (
  <View style={styles.summaryCard}>
    <View style={styles.summaryHeader}>
      <View style={styles.summaryIcon}>
        <Ionicons
          name="school-outline"
          size={21}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>
          CURRENT TRAINING
        </Text>

        <Text
          style={styles.summaryTitle}
          numberOfLines={2}
        >
          {programName}
        </Text>

        <Text style={styles.summaryBatch}>
          {batchCode}
        </Text>
      </View>

      <View style={styles.approvedBadge}>
        <View style={styles.approvedDot} />

        <Text style={styles.approvedText}>
          APPROVED
        </Text>
      </View>
    </View>

    <View style={styles.summaryDivider} />

    <View style={styles.summaryProgressRow}>
      <View style={styles.summaryProgressInfo}>
        <Text style={styles.summaryProgressLabel}>
          Course Progress
        </Text>

        <Text style={styles.summaryProgressValue}>
          {moduleCompletion.completed} of{" "}
          {moduleCompletion.total} modules completed
        </Text>
      </View>

      <Text style={styles.summaryPercentage}>
        {courseCompletionPercentage}%
      </Text>
    </View>

    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${courseCompletionPercentage}%`,
          },
        ]}
      />
    </View>
  </View>
) : null}

        {/* =================================================
            FILTER
        ================================================= */}

        <View style={styles.filterSection}>
          <Text style={styles.sectionEyebrow}>
            LEARNING CONTENT
          </Text>

          <Text style={styles.sectionTitle}>
            What would you like to learn?
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <FilterButton
              label="All"
              icon="grid-outline"
              active={activeFilter === "all"}
              onPress={() =>
                setActiveFilter("all")
              }
            />

            <FilterButton
              label="Modules"
              icon="book-outline"
              active={activeFilter === "modules"}
              onPress={() =>
                setActiveFilter("modules")
              }
            />

            <FilterButton
              label="Videos"
              icon="play-circle-outline"
              active={activeFilter === "videos"}
              onPress={() =>
                setActiveFilter("videos")
              }
            />

            <FilterButton
              label="Assessments"
              icon="document-text-outline"
              active={
                activeFilter === "assessments"
              }
              onPress={() =>
                setActiveFilter("assessments")
              }
            />
          </ScrollView>
        </View>


        {/* =================================================
            MODULES
        ================================================= */}

        {showModules ? (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  COURSE MODULES
                </Text>

                <Text style={styles.sectionTitle}>
                  Your learning path
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {modules.length}
                </Text>
              </View>
            </View>

            {isLoadingModules ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />

                <Text style={styles.inlineLoadingText}>
                  Loading modules...
                </Text>
              </View>
            ) : modules.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="book-outline"
                    size={24}
                    color={COLORS.secondary}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No modules available
                </Text>

                <Text style={styles.emptyText}>
                  Learning modules will appear here
                  once they are published.
                </Text>
              </View>
            ) : (
              <View style={styles.modulesList}>
                {modules.map(
                  (
                    module: any,
                    index: number,
                  ) => {
                    const completed =
                      isModuleCompleted(
                        String(module?.id),
                      );

                    const unlocked =
                      isModuleUnlocked(index);

                    const title =
                      module?.title ??
                      module?.name ??
                      `Module ${index + 1}`;

                    const description =
                      module?.description ??
                      module?.summary ??
                      "Complete this module as part of your training.";

                    return (
                      <View
                        key={
                          module?.id ??
                          `module-${index}`
                        }
                        style={[
                          styles.moduleCard,
                          !unlocked &&
                            styles.moduleCardLocked,
                          completed &&
                            styles.moduleCardCompleted,
                        ]}
                      >
                        <View style={styles.moduleTop}>
                          <View
                            style={[
                              styles.moduleNumber,
                              completed &&
                                styles.moduleNumberCompleted,
                              !unlocked &&
                                styles.moduleNumberLocked,
                            ]}
                          >
                            {completed ? (
                              <Ionicons
                                name="checkmark"
                                size={19}
                                color={COLORS.white}
                              />
                            ) : !unlocked ? (
                              <Ionicons
                                name="lock-closed-outline"
                                size={17}
                                color={COLORS.muted}
                              />
                            ) : (
                              <Text
                                style={
                                  styles.moduleNumberText
                                }
                              >
                                {String(
                                  index + 1,
                                ).padStart(2, "0")}
                              </Text>
                            )}
                          </View>

                          <View
                            style={
                              styles.moduleInfo
                            }
                          >
                            <View
                              style={
                                styles.moduleTitleRow
                              }
                            >
                              <Text
                                style={[
                                  styles.moduleTitle,
                                  !unlocked &&
                                    styles.moduleTitleLocked,
                                ]}
                                numberOfLines={2}
                              >
                                {title}
                              </Text>

                              {completed ? (
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
                                    COMPLETED
                                  </Text>
                                </View>
                              ) : unlocked ? (
                                <View
                                  style={
                                    styles.availableBadge
                                  }
                                >
                                  <View
                                    style={
                                      styles.availableDot
                                    }
                                  />

                                  <Text
                                    style={
                                      styles.availableBadgeText
                                    }
                                  >
                                    AVAILABLE
                                  </Text>
                                </View>
                              ) : (
                                <View
                                  style={
                                    styles.lockedBadge
                                  }
                                >
                                  <Text
                                    style={
                                      styles.lockedBadgeText
                                    }
                                  >
                                    LOCKED
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text
                              style={[
                                styles.moduleDescription,
                                !unlocked &&
                                  styles.moduleDescriptionLocked,
                              ]}
                              numberOfLines={3}
                            >
                              {description}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.moduleBottom
                          }
                        >
                          <View
                            style={
                              styles.moduleMeta
                            }
                          >
                            <Ionicons
                              name={
                                completed
                                  ? "checkmark-circle-outline"
                                  : unlocked
                                    ? "play-circle-outline"
                                    : "lock-closed-outline"
                              }
                              size={16}
                              color={
                                completed
                                  ? COLORS.secondary
                                  : unlocked
                                    ? COLORS.primary
                                    : COLORS.muted
                              }
                            />

                            <Text
                              style={[
                                styles.moduleStatus,
                                completed &&
                                  styles.moduleStatusCompleted,
                                !unlocked &&
                                  styles.moduleStatusLocked,
                              ]}
                            >
                              {completed
                                ? "Module completed"
                                : unlocked
                                  ? "Ready to learn"
                                  : "Complete the previous module first"}
                            </Text>
                          </View>

                          <Pressable
                            disabled={!unlocked}
                            onPress={() =>
                              handleOpenModule(
                                module,
                                index,
                              )
                            }
                            style={({ pressed }) => [
                              styles.moduleButton,
                              completed &&
                                styles.moduleButtonCompleted,
                              !unlocked &&
                                styles.moduleButtonLocked,
                              pressed &&
                                unlocked &&
                                styles.pressed,
                            ]}
                          >
                            <Text
                              style={[
                                styles.moduleButtonText,
                                completed &&
                                  styles.moduleButtonTextCompleted,
                                !unlocked &&
                                  styles.moduleButtonTextLocked,
                              ]}
                            >
                              {completed
                                ? "Review"
                                : unlocked
                                  ? "Open"
                                  : "Locked"}
                            </Text>

                            <Ionicons
                              name={
                                unlocked
                                  ? "arrow-forward"
                                  : "lock-closed-outline"
                              }
                              size={15}
                              color={
                                completed
                                  ? COLORS.primary
                                  : unlocked
                                    ? COLORS.white
                                    : COLORS.muted
                              }
                            />
                          </Pressable>
                        </View>
                      </View>
                    );
                  },
                )}
              </View>
            )}

            {modules.length > 0 &&
            !areModulesCompleted ? (
              <View style={styles.progressNotice}>
                <View style={styles.progressNoticeIcon}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.progressNoticeContent}>
                  <Text
                    style={
                      styles.progressNoticeTitle
                    }
                  >
                    Keep going
                  </Text>

                  <Text
                    style={
                      styles.progressNoticeText
                    }
                  >
                    Complete the modules in order.
                    The next module will unlock after
                    the previous one is completed.
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* =================================================
            VIDEOS
        ================================================= */}

        {showVideos ? (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  LEARNING VIDEOS
                </Text>

                <Text style={styles.sectionTitle}>
                  Watch and learn
                </Text>
              </View>

              <View style={styles.videoBadge}>
                <Ionicons
                  name="logo-youtube"
                  size={15}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.videoEmptyCard}>
              <View style={styles.videoEmptyIcon}>
                <Ionicons
                  name="play-circle"
                  size={34}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.videoEmptyTitle}>
                Training videos coming soon
              </Text>

              <Text style={styles.videoEmptyText}>
                YouTube learning materials can be
                added here in the future without
                changing the existing module and
                assessment flow.
              </Text>
            </View>
          </View>
        ) : null}

        {/* =================================================
            ASSESSMENTS
        ================================================= */}

        {showAssessments ? (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  ASSESSMENTS
                </Text>

                <Text style={styles.sectionTitle}>
                  Written assessments
                </Text>
              </View>

              {areModulesCompleted ? (
                <View
                  style={
                    styles.unlockedBadge
                  }
                >
                  <Ionicons
                    name="lock-open-outline"
                    size={13}
                    color={COLORS.primary}
                  />

                  <Text
                    style={
                      styles.unlockedBadgeText
                    }
                  >
                    UNLOCKED
                  </Text>
                </View>
              ) : null}
            </View>

            {!areModulesCompleted ? (
              <View style={styles.lockedAssessmentCard}>
                <View
                  style={
                    styles.lockedAssessmentIcon
                  }
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={COLORS.muted}
                  />
                </View>

                <View
                  style={
                    styles.lockedAssessmentContent
                  }
                >
                  <Text
                    style={
                      styles.lockedAssessmentTitle
                    }
                  >
                    Assessment is locked
                  </Text>

                  <Text
                    style={
                      styles.lockedAssessmentText
                    }
                  >
                    Complete all course modules to
                    unlock the written assessment.
                  </Text>
                </View>
              </View>
            ) : isAssessmentLoading ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />

                <Text style={styles.inlineLoadingText}>
                  Loading assessments...
                </Text>
              </View>
            ) : participantAssessments.length ===
              0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={COLORS.secondary}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No assessment available
                </Text>

                <Text style={styles.emptyText}>
                  Your written assessment will appear
                  here when it is published.
                </Text>
              </View>
            ) : (
              <View style={styles.assessmentList}>
                {participantAssessments.map(
                  (
                    assessment: ParticipantAssessment,
                    index: number,
                  ) => {
                    const rawAssessment =
                      assessment as any;

                    const assessmentId =
                      getAssessmentId(
                        rawAssessment,
                      );

                    const title =
                      getAssessmentTitle(
                        rawAssessment,
                      );

                    const description =
                      getAssessmentDescription(
                        rawAssessment,
                      );

                    const questionCount =
                      getAssessmentQuestionCount(
                        rawAssessment,
                      );

                    const passingPercentage =
                      getAssessmentPassingPercentage(
                        rawAssessment,
                      );

                    const passed =
                      getAssessmentPassed(
                        rawAssessment,
                      );

                    return (
                      <View
                        key={
                          assessmentId ??
                          `assessment-${index}`
                        }
                        style={
                          styles.assessmentCard
                        }
                      >
                        <View
                          style={
                            styles.assessmentTop
                          }
                        >
                          <View
                            style={
                              styles.assessmentIcon
                            }
                          >
                            <Ionicons
                              name="document-text-outline"
                              size={21}
                              color={
                                COLORS.primary
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.assessmentHeaderText
                            }
                          >
                            <Text
                              style={
                                styles.assessmentLabel
                              }
                            >
                              WRITTEN ASSESSMENT
                            </Text>

                            <Text
                              style={
                                styles.assessmentTitle
                              }
                              numberOfLines={2}
                            >
                              {title}
                            </Text>
                          </View>

                          {passed ? (
                            <View
                              style={
                                styles.passedBadge
                              }
                            >
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={
                                  COLORS.primary
                                }
                              />

                              <Text
                                style={
                                  styles.passedBadgeText
                                }
                              >
                                PASSED
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text
                          style={
                            styles.assessmentDescription
                          }
                        >
                          {description}
                        </Text>

                        <View
                          style={
                            styles.assessmentMetaRow
                          }
                        >
                          <View
                            style={
                              styles.assessmentMetaItem
                            }
                          >
                            <Ionicons
                              name="help-circle-outline"
                              size={16}
                              color={
                                COLORS.secondary
                              }
                            />

                            <Text
                              style={
                                styles.assessmentMetaText
                              }
                            >
                              {questionCount} questions
                            </Text>
                          </View>

                          <View
                            style={
                              styles.assessmentMetaItem
                            }
                          >
                            <Ionicons
                              name="ribbon-outline"
                              size={16}
                              color={
                                COLORS.secondary
                              }
                            />

                            <Text
                              style={
                                styles.assessmentMetaText
                              }
                            >
                              {passingPercentage}%
                              passing
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          disabled={!assessmentId}
                          onPress={() => {
                            if (!assessmentId) {
                              return;
                            }

                            router.push(
                              `/assessment/${assessmentId}`,
                            );
                          }}
                          style={({ pressed }) => [
                            styles.assessmentButton,
                            pressed &&
                              styles.pressed,
                          ]}
                        >
                          <Text
                            style={
                              styles.assessmentButtonText
                            }
                          >
                            {passed
                              ? "Review Assessment"
                              : "Take Assessment"}
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={17}
                            color={COLORS.white}
                          />
                        </Pressable>
                      </View>
                    );
                  },
                )}
              </View>
            )}
          </View>
        ) : null}

        {/* =================================================
            ACCREDITATION
        ================================================= */}

        <View style={styles.accreditationCard}>
          <View style={styles.accreditationIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.accreditationContent}>
            <View
              style={
                styles.accreditationTitleRow
              }
            >
              <Text
                style={
                  styles.accreditationTitle
                }
              >
                Official Accredited Syllabus
              </Text>

              <View
                style={styles.isoBadge}
              >
                <Text style={styles.isoBadgeText}>
                  ISO-9001
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.accreditationText
              }
            >
              Your learning materials are organized
              according to the official ACE NextGen
              training program.
            </Text>
          </View>
        </View>

        {/* =================================================
            NO APPROVED TRAINING
        ================================================= */}

        {!approvedEnrollment &&
        !isLoadingEnrollments ? (
          <View style={styles.noTrainingCard}>
            <View style={styles.noTrainingIcon}>
              <Ionicons
                name="school-outline"
                size={30}
                color={COLORS.secondary}
              />
            </View>

            <Text style={styles.noTrainingTitle}>
              No approved training yet
            </Text>

            <Text style={styles.noTrainingText}>
              Once your enrollment is approved, your
              training modules and learning content
              will appear here.
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

type FilterButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

function FilterButton({
  label,
  icon,
  active,
  onPress,
}: FilterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        active &&
          styles.filterButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={
          active
            ? COLORS.white
            : COLORS.secondary
        }
      />

      <Text
        style={[
          styles.filterButtonText,
          active &&
            styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#002B5C",
  dark: "#0D2142",
  secondary: "#3B7597",
  accent: "#6FD1D7",

  background: "#F7F9FB",
  white: "#FFFFFF",

  softBlue: "#EAF2F7",
  softAccent: "#EAFBFC",
  border: "#D9E5EB",

  text: "#0D2142",
  muted: "#6B7C8C",
  lightMuted: "#94A3B8",

  successSoft: "#EAF6F3",
  success: "#3B806E",

  dangerSoft: "#FFF3F3",
  danger: "#B84A4A",

  lockedBackground: "#F2F5F7",
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 30,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    marginBottom: 22,
  },

  headerAccent: {
    width: 42,
    height: 4,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: COLORS.secondary,
    marginBottom: 5,
  },

  pageTitle: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "800",
    color: COLORS.dark,
    letterSpacing: -0.6,
  },

  pageSubtitle: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
    maxWidth: 340,
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#F1D1D1",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  errorIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginRight: 12,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: 3,
  },

  errorText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },
/* =======================================================
   TRAINING SUMMARY
======================================================= */

summaryCard: {
  backgroundColor: COLORS.white,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: COLORS.border,
  padding: 16,
  marginBottom: 24,
},

summaryHeader: {
  flexDirection: "row",
  alignItems: "flex-start",
},

summaryIcon: {
  width: 42,
  height: 42,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.softBlue,
  marginRight: 11,
},

summaryText: {
  flex: 1,
  paddingRight: 7,
},

summaryLabel: {
  fontSize: 9,
  fontWeight: "900",
  letterSpacing: 1,
  color: COLORS.secondary,
  marginBottom: 4,
},

summaryTitle: {
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "800",
  color: COLORS.dark,
},

summaryBatch: {
  marginTop: 3,
  fontSize: 11,
  fontWeight: "600",
  color: COLORS.muted,
},

approvedBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: COLORS.successSoft,
  borderRadius: 8,
  paddingHorizontal: 7,
  paddingVertical: 5,
},

approvedDot: {
  width: 5,
  height: 5,
  borderRadius: 5,
  backgroundColor: COLORS.success,
  marginRight: 4,
},

approvedText: {
  fontSize: 7,
  fontWeight: "900",
  letterSpacing: 0.4,
  color: COLORS.success,
},

summaryDivider: {
  height: 1,
  backgroundColor: "#EEF2F5",
  marginTop: 15,
  marginBottom: 13,
},

summaryProgressRow: {
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  marginBottom: 8,
},

summaryProgressInfo: {
  flex: 1,
  paddingRight: 10,
},

summaryProgressLabel: {
  fontSize: 11,
  fontWeight: "800",
  color: COLORS.dark,
},

summaryProgressValue: {
  marginTop: 3,
  fontSize: 10,
  color: COLORS.muted,
},

summaryPercentage: {
  fontSize: 19,
  fontWeight: "900",
  color: COLORS.primary,
},

progressTrack: {
  height: 6,
  borderRadius: 10,
  backgroundColor: COLORS.softBlue,
  overflow: "hidden",
},

progressFill: {
  height: "100%",
  borderRadius: 10,
  backgroundColor: COLORS.primary,
},

  /* =======================================================
     FILTER
  ======================================================= */

  filterSection: {
    marginBottom: 22,
  },

  sectionEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.secondary,
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
    color: COLORS.dark,
  },

  filterScroll: {
    paddingTop: 14,
    paddingRight: 12,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterButtonText: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  filterButtonTextActive: {
    color: COLORS.white,
  },

  /* =======================================================
     MATERIAL
  ======================================================= */

  materialCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 25,
  },

  materialIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softAccent,
    marginRight: 12,
  },

  materialContent: {
    flex: 1,
  },

  materialLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.secondary,
    marginBottom: 4,
  },

  materialTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: COLORS.dark,
  },

  materialText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  /* =======================================================
     CONTENT SECTION
  ======================================================= */

  contentSection: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  countBadge: {
    minWidth: 32,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },

  /* =======================================================
     MODULES
  ======================================================= */

  modulesList: {
    gap: 12,
  },

  moduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },

  moduleCardCompleted: {
    borderColor: "#CFE2E8",
  },

  moduleCardLocked: {
    backgroundColor: "#FAFBFC",
  },

  moduleTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  moduleNumber: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginRight: 12,
  },

  moduleNumberCompleted: {
    backgroundColor: COLORS.secondary,
  },

  moduleNumberLocked: {
    backgroundColor: COLORS.lockedBackground,
  },

  moduleNumberText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },

  moduleInfo: {
    flex: 1,
  },

  moduleTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  moduleTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: COLORS.dark,
    paddingRight: 7,
  },

  moduleTitleLocked: {
    color: COLORS.muted,
  },

  moduleDescription: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  moduleDescriptionLocked: {
    color: COLORS.lightMuted,
  },

  completedBadge: {
    backgroundColor: COLORS.successSoft,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  completedBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: COLORS.success,
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.softAccent,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  availableDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginRight: 4,
  },

  availableBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: COLORS.primary,
  },

  lockedBadge: {
    backgroundColor: COLORS.lockedBackground,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  lockedBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: COLORS.muted,
  },

  moduleBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F5",
  },

  moduleMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },

  moduleStatus: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  moduleStatusCompleted: {
    color: COLORS.success,
  },

  moduleStatusLocked: {
    color: COLORS.muted,
  },

  moduleButton: {
    minWidth: 84,
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  moduleButtonCompleted: {
    backgroundColor: COLORS.softAccent,
  },

  moduleButtonLocked: {
    backgroundColor: COLORS.lockedBackground,
  },

  moduleButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.white,
    marginRight: 5,
  },

  moduleButtonTextCompleted: {
    color: COLORS.primary,
  },

  moduleButtonTextLocked: {
    color: COLORS.muted,
  },

  /* =======================================================
     PROGRESS NOTICE
  ======================================================= */

  progressNotice: {
    flexDirection: "row",
    marginTop: 14,
    padding: 14,
    borderRadius: 15,
    backgroundColor: COLORS.softAccent,
    borderWidth: 1,
    borderColor: "#C9EFF1",
  },

  progressNoticeIcon: {
    marginRight: 10,
  },

  progressNoticeContent: {
    flex: 1,
  },

  progressNoticeTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 3,
  },

  progressNoticeText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.secondary,
  },

  /* =======================================================
     VIDEOS
  ======================================================= */

  videoBadge: {
    width: 32,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softAccent,
  },

  videoEmptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },

  videoEmptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softAccent,
    marginBottom: 13,
  },

  videoEmptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
  },

  videoEmptyText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    textAlign: "center",
  },

  /* =======================================================
     ASSESSMENTS
  ======================================================= */

  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: COLORS.softAccent,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  unlockedBadgeText: {
    marginLeft: 4,
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.primary,
  },

  lockedAssessmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
  },

  lockedAssessmentIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lockedBackground,
    marginRight: 12,
  },

  lockedAssessmentContent: {
    flex: 1,
  },

  lockedAssessmentTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.dark,
  },

  lockedAssessmentText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  assessmentList: {
    gap: 12,
  },

  assessmentCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
  },

  assessmentTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  assessmentIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginRight: 11,
  },

  assessmentHeaderText: {
    flex: 1,
  },

  assessmentLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.secondary,
    marginBottom: 3,
  },

  assessmentTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: COLORS.dark,
  },

  passedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successSoft,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: 6,
  },

  passedBadgeText: {
    marginLeft: 3,
    fontSize: 7,
    fontWeight: "900",
    color: COLORS.success,
  },

  assessmentDescription: {
    marginTop: 13,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  assessmentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 15,
  },

  assessmentMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  assessmentMetaText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  assessmentButton: {
    height: 40,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  assessmentButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.white,
    marginRight: 6,
  },

  /* =======================================================
     ACCREDITATION
  ======================================================= */

  accreditationCard: {
    flexDirection: "row",
    backgroundColor: COLORS.softAccent,
    borderWidth: 1,
    borderColor: "#C9EFF1",
    borderRadius: 18,
    padding: 15,
    marginBottom: 18,
  },

  accreditationIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginRight: 12,
  },

  accreditationContent: {
    flex: 1,
  },

  accreditationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accreditationTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
    paddingRight: 7,
  },

  isoBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  isoBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  accreditationText: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  /* =======================================================
     EMPTY / LOADING
  ======================================================= */

  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 22,
  },

  inlineLoadingText: {
    marginLeft: 9,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 27,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginBottom: 11,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    textAlign: "center",
  },

  /* =======================================================
     NO TRAINING
  ======================================================= */

  noTrainingCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginTop: 5,
  },

  noTrainingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginBottom: 13,
  },

  noTrainingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
  },

  noTrainingText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: "center",
  },

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 35,
  },

  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginBottom: 15,
  },

  loadingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dark,
  },

  loadingText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    textAlign: "center",
  },

  /* =======================================================
     GENERAL
  ======================================================= */

  pressed: {
    opacity: 0.78,
  },

  bottomSpace: {
    height: 30,
  },
});