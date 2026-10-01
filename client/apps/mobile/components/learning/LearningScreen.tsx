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
  TextInput,
  View,
} from "react-native";

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

// =========================================================
// TYPES
// =========================================================

type MaterialFilter =
  | "all"
  | "pdf"
  | "document"
  | "media";

type ModuleCompletion = {
  completed: number;
  total: number;
};

// =========================================================
// HELPERS
// =========================================================

function getMaterialType(material: any): string {
  return String(
    material?.materialType ??
      material?.fileType ??
      material?.type ??
      "",
  ).toLowerCase();
}

function getMaterialTitle(material: any): string {
  return (
    material?.title ??
    material?.name ??
    "Learning Material"
  );
}

function getMaterialDescription(
  material: any,
): string {
  return (
    material?.description ??
    material?.remarks ??
    "Training learning material and reference."
  );
}

function getFileName(material: any): string {
  return (
    material?.fileName ??
    material?.originalFileName ??
    material?.file?.fileName ??
    ""
  );
}

function getFileSize(material: any): number {
  const value =
    material?.fileSize ??
    material?.size ??
    material?.file?.fileSize ??
    0;

  return Number(value) || 0;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return "File";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMaterialCategory(
  material: any,
): MaterialFilter {
  const type = getMaterialType(material);
  const fileName = getFileName(material).toLowerCase();

  if (
    type.includes("video") ||
    type.includes("audio") ||
    type.includes("media") ||
    fileName.endsWith(".mp4") ||
    fileName.endsWith(".mov") ||
    fileName.endsWith(".mp3")
  ) {
    return "media";
  }

  if (
    type.includes("pdf") ||
    fileName.endsWith(".pdf")
  ) {
    return "pdf";
  }

  return "document";
}

function getMaterialIcon(material: any): string {
  const category =
    getMaterialCategory(material);

  if (category === "pdf") {
    return "▣";
  }

  if (category === "media") {
    return "▶";
  }

  return "▤";
}

function getMaterialLabel(material: any): string {
  const category =
    getMaterialCategory(material);

  if (category === "pdf") {
    return "PDF";
  }

  if (category === "media") {
    return "MEDIA";
  }

  const fileName =
    getFileName(material).toLowerCase();

  if (fileName.endsWith(".docx")) {
    return "DOC";
  }

  return "FILE";
}

// =========================================================
// ASSESSMENT HELPERS
// =========================================================

function getAssessmentId(
  assessment: any,
): string | null {
  const id =
    assessment?.id ??
    assessment?.assessmentId;

  if (!id) {
    return null;
  }

  return String(id);
}

function getAssessmentTitle(
  assessment: any,
): string {
  return (
    assessment?.title ??
    assessment?.name ??
    assessment?.assessmentTitle ??
    "Written Assessment"
  );
}

function getAssessmentDescription(
  assessment: any,
): string {
  return (
    assessment?.description ??
    assessment?.instructions ??
    assessment?.assessmentDescription ??
    "Complete the written assessment after finishing all training modules."
  );
}

function getAssessmentQuestionCount(
  assessment: any,
): number | null {
  const value =
    assessment?.questionCount ??
    assessment?.totalQuestions ??
    assessment?.numberOfQuestions;

  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getAssessmentPassingPercentage(
  assessment: any,
): number | null {
  const value =
    assessment?.passingPercentage ??
    assessment?.passingScore ??
    assessment?.passingRate;

  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getAssessmentPassed(
  assessment: any,
): boolean {
  return (
    assessment?.hasPassed === true ||
    assessment?.isPassed === true ||
    assessment?.passed === true
  );
}

// =========================================================
// COMPONENT
// =========================================================

export default function LearningTab() {
  // =======================================================
  // ENROLLMENTS
  // =======================================================

  const {
    enrollments,
    loadMyEnrollments,
    refreshMyEnrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentError,
  } = useEnrollments(enrollmentApi);

  // =======================================================
  // LEARNING MATERIALS
  // =======================================================

  const {
    learningMaterials,
    loadLearningMaterials,
    isLoading: isLoadingMaterials,
  } = useLearningMaterials(
    learningMaterialApi,
  );

  // =======================================================
  // LEARNING PROGRESS
  // =======================================================

  const {
    getMaterialProgress,
  } = useLearningProgress(
    learningProgressApi,
  );

  // =======================================================
  // WRITTEN ASSESSMENT
  // =======================================================

  const {
    loadByBatchIdParticipantAssessment,
    isLoading: isAssessmentLoading,
    error: assessmentError,
  } = useWrittenAssessment(apiClient);

  // =======================================================
  // LOCAL STATE
  // =======================================================

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<MaterialFilter>("all");

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    isCheckingModuleCompletion,
    setIsCheckingModuleCompletion,
  ] = useState(false);

  const [
    areModulesCompleted,
    setAreModulesCompleted,
  ] = useState(false);

  const [
    moduleCompletion,
    setModuleCompletion,
  ] = useState<ModuleCompletion>({
    completed: 0,
    total: 0,
  });

  const [
    participantAssessments,
    setParticipantAssessments,
  ] = useState<ParticipantAssessment[]>(
    [],
  );

  // =======================================================
  // INITIAL LOAD GUARD
  // =======================================================

  const hasLoadedInitialData =
    useRef(false);

  // =======================================================
  // APPROVED ENROLLMENT
  // =======================================================

  const approvedEnrollment =
    useMemo(() => {
      return enrollments.find(
        (enrollment: any) =>
          String(
            enrollment?.status ?? "",
          ).toLowerCase() ===
          "approved",
      );
    }, [enrollments]);

  const trainingBatchId =
    approvedEnrollment?.trainingBatchId;

  // =======================================================
  // CHECK ALL MODULES
  // =======================================================

  const checkAllModulesCompleted =
    useCallback(
      async (
        materials: any[],
      ): Promise<boolean> => {
        if (
          !Array.isArray(materials) ||
          materials.length === 0
        ) {
          setModuleCompletion({
            completed: 0,
            total: 0,
          });

          return false;
        }

        setIsCheckingModuleCompletion(
          true,
        );

        try {
          const progressResults =
            await Promise.all(
              materials.map(
                (material: any) =>
                  getMaterialProgress(
                    material.id,
                  ),
              ),
            );

          let totalModules = 0;
          let completedModules = 0;

          progressResults.forEach(
            (materialProgress: any) => {
              const modules =
                Array.isArray(
                  materialProgress?.modules,
                )
                  ? materialProgress.modules
                  : [];

              totalModules +=
                modules.length;

              modules.forEach(
                (moduleProgress: any) => {
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

                  const isCompleted =
                    totalSections > 0 &&
                    completedSections >=
                      totalSections;

                  if (isCompleted) {
                    completedModules += 1;
                  }
                },
              );
            },
          );

          setModuleCompletion({
            completed:
              completedModules,
            total: totalModules,
          });

          const allCompleted =
            totalModules > 0 &&
            completedModules ===
              totalModules;

          setAreModulesCompleted(
            allCompleted,
          );

          return allCompleted;
        } catch {
          setModuleCompletion({
            completed: 0,
            total: 0,
          });

          setAreModulesCompleted(
            false,
          );

          return false;
        } finally {
          setIsCheckingModuleCompletion(
            false,
          );
        }
      },
      [getMaterialProgress],
    );

  // =======================================================
  // LOAD ASSESSMENTS
  // =======================================================

  const loadAssessments =
    useCallback(
      async (
        batchId: string,
      ) => {
        try {
          const result =
            await loadByBatchIdParticipantAssessment(
              batchId,
            );

          if (
            Array.isArray(result)
          ) {
            setParticipantAssessments(
              result as ParticipantAssessment[],
            );

            return;
          }

          // Supports APIs that return:
          // { data: [...] }
          // { items: [...] }
          const resultData =
            (result as any)?.data ??
            (result as any)?.items;

          if (
            Array.isArray(resultData)
          ) {
            setParticipantAssessments(
              resultData as ParticipantAssessment[],
            );

            return;
          }

          setParticipantAssessments(
            [],
          );
        } catch {
          setParticipantAssessments(
            [],
          );
        }
      },
      [
        loadByBatchIdParticipantAssessment,
      ],
    );

  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadData = useCallback(
    async () => {
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
          setAreModulesCompleted(
            false,
          );

          setModuleCompletion({
            completed: 0,
            total: 0,
          });

          setParticipantAssessments(
            [],
          );

          return;
        }

        const materials =
          await loadLearningMaterials(
            currentBatchId,
          );

        const loadedMaterials =
          Array.isArray(materials)
            ? materials
            : [];

        const allCompleted =
          await checkAllModulesCompleted(
            loadedMaterials,
          );

        if (allCompleted) {
          await loadAssessments(
            String(currentBatchId),
          );
        } else {
          setParticipantAssessments(
            [],
          );
        }
      } catch {
        setAreModulesCompleted(
          false,
        );

        setParticipantAssessments(
          [],
        );
      }
    },
    [
      loadMyEnrollments,
      loadLearningMaterials,
      checkAllModulesCompleted,
      loadAssessments,
    ],
  );

  // =======================================================
  // INITIAL LOAD
  //
  // IMPORTANT:
  // This effect intentionally runs ONCE.
  // It does NOT depend on loadData.
  // =======================================================

  useEffect(() => {
    if (hasLoadedInitialData.current) {
      return;
    }

    hasLoadedInitialData.current =
      true;

    void loadData();

    // Intentionally only runs once
    // when the screen is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================================
  // REFRESH
  //
  // This is the ONLY normal way to get
  // updated progress/material/assessment data
  // after the initial load.
  // =======================================================

  const handleRefresh =
    useCallback(async () => {
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
          setAreModulesCompleted(
            false,
          );

          setModuleCompletion({
            completed: 0,
            total: 0,
          });

          setParticipantAssessments(
            [],
          );

          return;
        }

        const materials =
          await loadLearningMaterials(
            currentBatchId,
          );

        const loadedMaterials =
          Array.isArray(materials)
            ? materials
            : [];

        const allCompleted =
          await checkAllModulesCompleted(
            loadedMaterials,
          );

        if (allCompleted) {
          await loadAssessments(
            String(currentBatchId),
          );
        } else {
          setParticipantAssessments(
            [],
          );
        }
      } catch {
        // Hook errors are handled
        // by their respective hooks.
      } finally {
        setIsRefreshing(false);
      }
    }, [
      refreshMyEnrollments,
      loadLearningMaterials,
      checkAllModulesCompleted,
      loadAssessments,
    ]);

  // =======================================================
  // FILTERED MATERIALS
  // =======================================================

  const filteredMaterials =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return learningMaterials.filter(
        (material: any) => {
          const matchesSearch =
            !query ||
            getMaterialTitle(material)
              .toLowerCase()
              .includes(query) ||
            getMaterialDescription(
              material,
            )
              .toLowerCase()
              .includes(query) ||
            getFileName(material)
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            activeFilter === "all" ||
            getMaterialCategory(
              material,
            ) === activeFilter;

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [
      learningMaterials,
      searchQuery,
      activeFilter,
    ]);

  // =======================================================
  // MATERIAL COUNT
  // =======================================================

  const materialCount =
    learningMaterials.length;

  // =======================================================
  // COURSE COMPLETION
  // =======================================================

  const courseCompletionPercentage =
    moduleCompletion.total > 0
      ? Math.round(
          (moduleCompletion.completed /
            moduleCompletion.total) *
            100,
        )
      : 0;

  // =======================================================
  // CURRENT TRAINING
  // =======================================================

  const programName =
    (approvedEnrollment as any)
      ?.programName ??
    (approvedEnrollment as any)
      ?.trainingBatch?.programName ??
    "Current Training";

  const batchCode =
    (approvedEnrollment as any)
      ?.batchCode ??
    (approvedEnrollment as any)
      ?.trainingBatch?.batchCode ??
    "Training Batch";

  // =======================================================
  // OPEN MATERIAL
  // =======================================================

  const handleOpenMaterial =
    useCallback(
      (material: any) => {
        if (!material?.id) {
          return;
        }

        router.push({
          pathname:
            "/learning/material",
          params: {
            materialId:
              String(material.id),
          },
        });
      },
      [],
    );

  // =======================================================
  // OPEN ASSESSMENT
  // =======================================================

  const handleOpenAssessment =
    useCallback(
      (assessment: any) => {
        const assessmentId =
          getAssessmentId(
            assessment,
          );

        if (!assessmentId) {
          return;
        }

        router.push({
          pathname:
            "/assessment/[id]",
          params: {
            id: assessmentId,
            assessmentId,
          },
        });
      },
      [],
    );

  // =======================================================
  // TOTAL FILE SIZE
  // =======================================================

  const totalFileSize =
    useMemo(() => {
      return learningMaterials.reduce(
        (
          total: number,
          material: any,
        ) => {
          return (
            total +
            getFileSize(material)
          );
        },
        0,
      );
    }, [learningMaterials]);

  // =======================================================
  // LOADING
  // =======================================================

  if (
    isLoadingEnrollments &&
    enrollments.length === 0
  ) {
    return (
      <View
        style={
          styles.centerContainer
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
          Loading your learning hub...
        </Text>
      </View>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (
    enrollmentError &&
    enrollments.length === 0
  ) {
    return (
      <View
        style={
          styles.centerContainer
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <Text
            style={
              styles.errorIconText
            }
          >
            !
          </Text>
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Unable to load training
        </Text>

        <Text
          style={
            styles.errorMessage
          }
        >
          {enrollmentError.message ??
            "Something went wrong while loading your training."}
        </Text>

        <Pressable
          style={
            styles.retryButton
          }
          onPress={() => {
            void loadData();
          }}
        >
          <Text
            style={
              styles.retryButtonText
            }
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // =======================================================
  // NO APPROVED TRAINING
  // =======================================================

  if (!approvedEnrollment) {
    return (
      <View
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.emptyTrainingContainer
          }
          refreshControl={
            <RefreshControl
              refreshing={
                isRefreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor="#2563EB"
            />
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <Text
              style={
                styles.emptyIconText
              }
            >
              +
            </Text>
          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            No Active Training
          </Text>

          <Text
            style={
              styles.emptyDescription
            }
          >
            You do not currently
            have an approved
            training enrollment.
          </Text>

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={() =>
              router.push(
                "/(tabs)/training" as any,
              )
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              View Training
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <View
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#2563EB"
          />
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={styles.header}
        >
          <View
            style={
              styles.headerLeft
            }
          >
            <Text
              style={
                styles.pageTitle
              }
            >
              Training Modules
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
              Assigned coursework
              and syllabus for
              accredited
              certification.
            </Text>
          </View>
        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

        <View
          style={
            styles.searchContainer
          }
        >
          <Text
            style={
              styles.searchIcon
            }
          >
            ⌕
          </Text>

          <TextInput
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            placeholder="Search documents, syllabi, media..."
            placeholderTextColor="#94A3B8"
            style={
              styles.searchInput
            }
            autoCorrect={false}
          />

          <Pressable
            style={
              styles.filterButton
            }
            onPress={() => {
              setActiveFilter(
                activeFilter === "all"
                  ? "pdf"
                  : activeFilter === "pdf"
                    ? "document"
                    : activeFilter ===
                        "document"
                      ? "media"
                      : "all",
              );
            }}
          >
            <Text
              style={
                styles.filterIcon
              }
            >
              ≡
            </Text>
          </Pressable>
        </View>

        {/* =================================================
            FILTER CHIPS
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.chipsContainer
          }
        >
          <Pressable
            onPress={() =>
              setActiveFilter("all")
            }
            style={[
              styles.chip,
              activeFilter ===
                "all" &&
                styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter ===
                  "all" &&
                  styles.chipTextActive,
              ]}
            >
              All Materials
            </Text>

            <View
              style={[
                styles.countBadge,
                activeFilter ===
                  "all" &&
                  styles.countBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.countBadgeText,
                  activeFilter ===
                    "all" &&
                    styles.countBadgeTextActive,
                ]}
              >
                {materialCount}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() =>
              setActiveFilter("pdf")
            }
            style={[
              styles.chip,
              activeFilter ===
                "pdf" &&
                styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipIcon,
                {
                  color: "#EF4444",
                },
              ]}
            >
              □
            </Text>

            <Text
              style={[
                styles.chipText,
                activeFilter ===
                  "pdf" &&
                  styles.chipTextActive,
              ]}
            >
              PDF Handouts
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setActiveFilter(
                "document",
              )
            }
            style={[
              styles.chip,
              activeFilter ===
                "document" &&
                styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipIcon,
                {
                  color: "#2563EB",
                },
              ]}
            >
              □
            </Text>

            <Text
              style={[
                styles.chipText,
                activeFilter ===
                  "document" &&
                  styles.chipTextActive,
              ]}
            >
              Documents
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setActiveFilter("media")
            }
            style={[
              styles.chip,
              activeFilter ===
                "media" &&
                styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipIcon,
                {
                  color: "#9333EA",
                },
              ]}
            >
              ▶
            </Text>

            <Text
              style={[
                styles.chipText,
                activeFilter ===
                  "media" &&
                  styles.chipTextActive,
              ]}
            >
              Lectures
            </Text>
          </Pressable>
        </ScrollView>

        {/* =================================================
            CURRENT TRAINING
        ================================================= */}

        <View
          style={
            styles.trainingCard
          }
        >
          <View
            style={
              styles.trainingCardTop
            }
          >
            <View
              style={
                styles.trainingIdentity
              }
            >
              <View
                style={
                  styles.trainingIcon
                }
              >
                <Text
                  style={
                    styles.trainingIconText
                  }
                >
                  ✓
                </Text>
              </View>

              <View
                style={
                  styles.trainingInfo
                }
              >
                <View
                  style={
                    styles.activeCohortRow
                  }
                >
                  <Text
                    style={
                      styles.activeCohortText
                    }
                  >
                    ACTIVE COHORT
                  </Text>

                  <View
                    style={
                      styles.activeDot
                    }
                  />
                </View>

                <Text
                  numberOfLines={1}
                  style={
                    styles.trainingName
                  }
                >
                  {programName}
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.batchCode
                  }
                >
                  Batch: {batchCode}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.approvedBadge
              }
            >
              <Text
                style={
                  styles.approvedText
                }
              >
                APPROVED
              </Text>
            </View>
          </View>

          <View
            style={
              styles.progressDivider
            }
          />

          <View
            style={
              styles.progressHeader
            }
          >
            <Text
              style={
                styles.progressLabel
              }
            >
              Module Progress
            </Text>

            <Text
              style={
                styles.progressValue
              }
            >
              {isCheckingModuleCompletion
                ? "Checking..."
                : moduleCompletion.total >
                    0
                  ? `${moduleCompletion.completed}/${moduleCompletion.total} Modules`
                  : "Not started"}
            </Text>
          </View>

          <View
            style={
              styles.progressTrack
            }
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${courseCompletionPercentage}%`,
                },
              ]}
            />
          </View>

          <Text
            style={
              styles.progressPercentage
            }
          >
            {courseCompletionPercentage}% Completed
          </Text>
        </View>

        {/* =================================================
            BLUE SUMMARY CARD
        ================================================= */}

        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryDecor
            }
          />

          <View
            style={
              styles.summaryContent
            }
          >
            <Text
              style={
                styles.summaryEyebrow
              }
            >
              SYLLABUS ARCHIVE
            </Text>

            <View
              style={
                styles.summaryNumberRow
              }
            >
              <Text
                style={
                  styles.summaryNumber
                }
              >
                {materialCount}
              </Text>

              <Text
                style={
                  styles.summaryUnit
                }
              >
                Available Units
              </Text>
            </View>

            <Text
              style={
                styles.summaryDescription
              }
            >
              Published resources
              and references for
              your batch
              certification
            </Text>
          </View>

          <View
            style={
              styles.syncContainer
            }
          >
            <Pressable
              style={
                styles.syncButton
              }
              onPress={() => {
                void handleRefresh();
              }}
            >
              <Text
                style={
                  styles.syncIcon
                }
              >
                ↓
              </Text>

              <Text
                style={
                  styles.syncText
                }
              >
                SYNC ALL
              </Text>
            </Pressable>

            <Text
              style={
                styles.totalSize
              }
            >
              {totalFileSize > 0
                ? `${formatFileSize(
                    totalFileSize,
                  )} Total`
                : "Training Materials"}
            </Text>
          </View>
        </View>

        {/* =================================================
            COURSE MODULES HEADER
        ================================================= */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Course Modules
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Select or download to
              begin reading
            </Text>
          </View>

          <View
            style={
              styles.itemsBadge
            }
          >
            <Text
              style={
                styles.itemsBadgeText
              }
            >
              {filteredMaterials.length}{" "}
              items
            </Text>
          </View>
        </View>

        {/* =================================================
            MATERIALS
        ================================================= */}

        <View
          style={
            styles.materialsList
          }
        >
          {isLoadingMaterials &&
          learningMaterials.length ===
            0 ? (
            <View
              style={
                styles.materialLoading
              }
            >
              <ActivityIndicator
                color="#2563EB"
              />

              <Text
                style={
                  styles.materialLoadingText
                }
              >
                Loading learning
                materials...
              </Text>
            </View>
          ) : filteredMaterials.length ===
            0 ? (
            <View
              style={
                styles.noMaterials
              }
            >
              <Text
                style={
                  styles.noMaterialsIcon
                }
              >
                □
              </Text>

              <Text
                style={
                  styles.noMaterialsTitle
                }
              >
                No materials found
              </Text>

              <Text
                style={
                  styles.noMaterialsText
                }
              >
                Try another search or
                filter.
              </Text>
            </View>
          ) : (
            filteredMaterials.map(
              (
                material: any,
                index: number,
              ) => {
                const category =
                  getMaterialCategory(
                    material,
                  );

                const label =
                  getMaterialLabel(
                    material,
                  );

                const icon =
                  getMaterialIcon(
                    material,
                  );

                const title =
                  getMaterialTitle(
                    material,
                  );

                const description =
                  getMaterialDescription(
                    material,
                  );

                const fileSize =
                  formatFileSize(
                    getFileSize(
                      material,
                    ),
                  );

                const isPdf =
                  category === "pdf";

                const isMedia =
                  category ===
                  "media";

                return (
                  <Pressable
                    key={
                      material?.id ??
                      `material-${index}`
                    }
                    style={
                      styles.materialCard
                    }
                    onPress={() =>
                      handleOpenMaterial(
                        material,
                      )
                    }
                  >
                    <View
                      style={
                        styles.materialLeft
                      }
                    >
                      <View
                        style={[
                          styles.materialIconBox,
                          isPdf &&
                            styles.pdfIconBox,
                          isMedia &&
                            styles.mediaIconBox,
                        ]}
                      >
                        <Text
                          style={[
                            styles.materialIcon,
                            isPdf &&
                              styles.pdfIcon,
                            isMedia &&
                              styles.mediaIcon,
                          ]}
                        >
                          {icon}
                        </Text>

                        <Text
                          style={[
                            styles.materialLabel,
                            isPdf &&
                              styles.pdfIcon,
                            isMedia &&
                              styles.mediaIcon,
                          ]}
                        >
                          {label}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.materialInfo
                        }
                      >
                        <Text
                          numberOfLines={1}
                          style={
                            styles.materialTitle
                          }
                        >
                          {title}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={
                            styles.materialDescription
                          }
                        >
                          {description}
                        </Text>

                        <View
                          style={
                            styles.metaRow
                          }
                        >
                          <View
                            style={
                              styles.fileBadge
                            }
                          >
                            <Text
                              style={
                                styles.fileBadgeText
                              }
                            >
                              {label}
                              {fileSize !==
                              "File"
                                ? ` • ${fileSize}`
                                : ""}
                            </Text>
                          </View>

                          {index ===
                          0 ? (
                            <>
                              <Text
                                style={
                                  styles.metaDot
                                }
                              >
                                •
                              </Text>

                              <Text
                                style={
                                  styles.metaText
                                }
                              >
                                ✓ Offline
                              </Text>
                            </>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.openButton,
                        isMedia &&
                          styles.openMediaButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.openButtonText,
                          isMedia &&
                            styles.openMediaButtonText,
                        ]}
                      >
                        →
                      </Text>
                    </View>
                  </Pressable>
                );
              },
            )
          )}
        </View>

        {/* =================================================
            WRITTEN ASSESSMENT
            ONLY AFTER ALL MODULES ARE COMPLETE
        ================================================= */}

        {areModulesCompleted && (
          <View
            style={
              styles.assessmentSection
            }
          >
            <View
              style={
                styles.assessmentHeader
              }
            >
              <View
                style={
                  styles.assessmentHeaderLeft
                }
              >
                <View
                  style={
                    styles.assessmentHeaderIcon
                  }
                >
                  <Text
                    style={
                      styles.assessmentHeaderIconText
                    }
                  >
                    ✓
                  </Text>
                </View>

                <View
                  style={
                    styles.assessmentHeaderText
                  }
                >
                  <Text
                    style={
                      styles.assessmentEyebrow
                    }
                  >
                    MODULES COMPLETED
                  </Text>

                  <Text
                    style={
                      styles.assessmentSectionTitle
                    }
                  >
                    Written Assessment
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.unlockedBadge
                }
              >
                <Text
                  style={
                    styles.unlockedBadgeText
                  }
                >
                  UNLOCKED
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.assessmentSectionDescription
              }
            >
              You have completed all
              required training modules.
              The written assessment is
              now available.
            </Text>

            {isAssessmentLoading ? (
              <View
                style={
                  styles.assessmentLoading
                }
              >
                <ActivityIndicator
                  color="#2563EB"
                />

                <Text
                  style={
                    styles.assessmentLoadingText
                  }
                >
                  Loading assessment...
                </Text>
              </View>
            ) : assessmentError ? (
              <View
                style={
                  styles.assessmentError
                }
              >
                <Text
                  style={
                    styles.assessmentErrorTitle
                  }
                >
                  Assessment unavailable
                </Text>

                <Text
                  style={
                    styles.assessmentErrorText
                  }
                >
                  Please use Sync All or
                  pull down to refresh.
                </Text>
              </View>
            ) : participantAssessments.length ===
              0 ? (
              <View
                style={
                  styles.assessmentEmpty
                }
              >
                <Text
                  style={
                    styles.assessmentEmptyIcon
                  }
                >
                  □
                </Text>

                <Text
                  style={
                    styles.assessmentEmptyTitle
                  }
                >
                  No Written Assessment
                  Available
                </Text>

                <Text
                  style={
                    styles.assessmentEmptyText
                  }
                >
                  Your modules are complete,
                  but an assessment has not
                  been assigned to this
                  training batch yet.
                </Text>
              </View>
            ) : (
              <View
                style={
                  styles.assessmentList
                }
              >
                {participantAssessments.map(
                  (
                    assessment: any,
                    index: number,
                  ) => {
                    const assessmentId =
                      getAssessmentId(
                        assessment,
                      );

                    const title =
                      getAssessmentTitle(
                        assessment,
                      );

                    const description =
                      getAssessmentDescription(
                        assessment,
                      );

                    const questionCount =
                      getAssessmentQuestionCount(
                        assessment,
                      );

                    const passingPercentage =
                      getAssessmentPassingPercentage(
                        assessment,
                      );

                    const hasPassed =
                      getAssessmentPassed(
                        assessment,
                      );

                    if (!assessmentId) {
                      return null;
                    }

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
                            styles.assessmentCardTop
                          }
                        >
                          <View
                            style={
                              styles.assessmentIconBox
                            }
                          >
                            <Text
                              style={
                                styles.assessmentIcon
                              }
                            >
                              ✎
                            </Text>
                          </View>

                          <View
                            style={
                              styles.assessmentInfo
                            }
                          >
                            <View
                              style={
                                styles.assessmentTitleRow
                              }
                            >
                              <Text
                                numberOfLines={
                                  2
                                }
                                style={
                                  styles.assessmentTitle
                                }
                              >
                                {title}
                              </Text>

                              {hasPassed && (
                                <View
                                  style={
                                    styles.passedBadge
                                  }
                                >
                                  <Text
                                    style={
                                      styles.passedBadgeText
                                    }
                                  >
                                    PASSED
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text
                              numberOfLines={
                                2
                              }
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
                              {questionCount !==
                                null && (
                                <View
                                  style={
                                    styles.assessmentMeta
                                  }
                                >
                                  <Text
                                    style={
                                      styles.assessmentMetaText
                                    }
                                  >
                                    {questionCount}{" "}
                                    Questions
                                  </Text>
                                </View>
                              )}

                              {passingPercentage !==
                                null && (
                                <View
                                  style={
                                    styles.assessmentMeta
                                  }
                                >
                                  <Text
                                    style={
                                      styles.assessmentMetaText
                                    }
                                  >
                                    Passing:{" "}
                                    {
                                      passingPercentage
                                    }%
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>

                        <Pressable
                          style={
                            styles.assessmentButton
                          }
                          onPress={() =>
                            handleOpenAssessment(
                              assessment,
                            )
                          }
                        >
                          <Text
                            style={
                              styles.assessmentButtonText
                            }
                          >
                            {hasPassed
                              ? "Review Assessment"
                              : "Start Assessment"}
                          </Text>

                          <Text
                            style={
                              styles.assessmentButtonArrow
                            }
                          >
                            →
                          </Text>
                        </Pressable>
                      </View>
                    );
                  },
                )}
              </View>
            )}
          </View>
        )}

        {/* =================================================
            ACCREDITATION CALLOUT
        ================================================= */}

        <View
          style={
            styles.accreditationCard
          }
        >
          <View
            style={
              styles.accreditationIcon
            }
          >
            <Text
              style={
                styles.accreditationIconText
              }
            >
              ★
            </Text>
          </View>

          <View
            style={
              styles.accreditationContent
            }
          >
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
                Official Accredited
                Syllabus
              </Text>

              <View
                style={
                  styles.isoBadge
                }
              >
                <Text
                  style={
                    styles.isoBadgeText
                  }
                >
                  ISO-9001
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.accreditationText
              }
            >
              Reading and activity
              completions
              automatically sync
              with your attendance
              record and generate
              graduation credits.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 32,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },

  pageTitle: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    fontWeight: "400",
  },

  // =======================================================
  // SEARCH
  // =======================================================

  searchContainer: {
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 13,
    paddingRight: 7,
    marginBottom: 10,
  },

  searchIcon: {
    fontSize: 23,
    color: "#94A3B8",
    marginRight: 7,
  },

  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 12,
    color: "#1E293B",
    paddingVertical: 0,
  },

  filterButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  filterIcon: {
    fontSize: 17,
    color: "#475569",
    fontWeight: "700",
  },

  chipsContainer: {
    gap: 8,
    paddingBottom: 5,
  },

  chip: {
    minHeight: 34,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  chipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  chipIcon: {
    fontSize: 12,
    fontWeight: "800",
  },

  countBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  countBadgeActive: {
    backgroundColor:
      "rgba(255,255,255,0.2)",
  },

  countBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#475569",
  },

  countBadgeTextActive: {
    color: "#FFFFFF",
  },

  // =======================================================
  // TRAINING CARD
  // =======================================================

  trainingCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  trainingCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  trainingIdentity: {
    flexDirection: "row",
    flex: 1,
    minWidth: 0,
  },

  trainingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  trainingIconText: {
    fontSize: 20,
    color: "#059669",
    fontWeight: "900",
  },

  trainingInfo: {
    flex: 1,
    minWidth: 0,
  },

  activeCohortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },

  activeCohortText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },

  trainingName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  batchCode: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },

  approvedBadge: {
    marginLeft: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  approvedText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5,
  },

  progressDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: 13,
    marginBottom: 9,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  progressLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },

  progressValue: {
    fontSize: 10,
    color: "#1E293B",
    fontWeight: "800",
  },

  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  progressPercentage: {
    marginTop: 6,
    fontSize: 9,
    color: "#2563EB",
    fontWeight: "800",
    textAlign: "right",
  },

  // =======================================================
  // SUMMARY
  // =======================================================

  summaryCard: {
    marginTop: 14,
    minHeight: 150,
    borderRadius: 18,
    padding: 18,
    backgroundColor: "#2563EB",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#2563EB",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  summaryDecor: {
    position: "absolute",
    right: -35,
    bottom: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  summaryContent: {
    flex: 1,
    paddingRight: 10,
  },

  summaryEyebrow: {
    fontSize: 9,
    color: "#DBEAFE",
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  summaryNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },

  summaryNumber: {
    fontSize: 40,
    lineHeight: 43,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  summaryUnit: {
    fontSize: 11,
    color: "#DBEAFE",
    fontWeight: "600",
  },

  summaryDescription: {
    marginTop: 5,
    maxWidth: 210,
    fontSize: 10,
    lineHeight: 15,
    color: "#DBEAFE",
    fontWeight: "500",
  },

  syncContainer: {
    alignItems: "center",
    marginLeft: 6,
  },

  syncButton: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  syncIcon: {
    fontSize: 22,
    lineHeight: 23,
    color: "#2563EB",
    fontWeight: "900",
  },

  syncText: {
    marginTop: 2,
    fontSize: 7,
    color: "#2563EB",
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  totalSize: {
    marginTop: 7,
    fontSize: 8,
    color: "#DBEAFE",
    fontWeight: "600",
  },

  // =======================================================
  // SECTION
  // =======================================================

  sectionHeader: {
    marginTop: 19,
    marginBottom: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },

  itemsBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  itemsBadgeText: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "700",
  },

  // =======================================================
  // MATERIALS
  // =======================================================

  materialsList: {
    gap: 10,
  },

  materialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 14,
    minHeight: 91,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  materialLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  materialIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  pdfIconBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },

  mediaIconBox: {
    backgroundColor: "#FAF5FF",
    borderColor: "#E9D5FF",
  },

  materialIcon: {
    fontSize: 18,
    lineHeight: 19,
    color: "#2563EB",
    fontWeight: "900",
  },

  materialLabel: {
    marginTop: 1,
    fontSize: 7,
    color: "#2563EB",
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  pdfIcon: {
    color: "#DC2626",
  },

  mediaIcon: {
    color: "#9333EA",
  },

  materialInfo: {
    flex: 1,
    minWidth: 0,
  },

  materialTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  materialDescription: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  fileBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#F1F5F9",
  },

  fileBadgeText: {
    fontSize: 8,
    color: "#475569",
    fontWeight: "700",
  },

  metaDot: {
    fontSize: 9,
    color: "#CBD5E1",
  },

  metaText: {
    fontSize: 8,
    color: "#059669",
    fontWeight: "700",
  },

  openButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  openButtonText: {
    fontSize: 20,
    color: "#2563EB",
    fontWeight: "800",
  },

  openMediaButton: {
    backgroundColor: "#FAF5FF",
  },

  openMediaButtonText: {
    color: "#9333EA",
  },

  materialLoading: {
    paddingVertical: 35,
    alignItems: "center",
  },

  materialLoadingText: {
    marginTop: 9,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },

  noMaterials: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  noMaterialsIcon: {
    fontSize: 26,
    color: "#94A3B8",
  },

  noMaterialsTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },

  noMaterialsText: {
    marginTop: 4,
    fontSize: 11,
    color: "#94A3B8",
  },

  // =======================================================
  // WRITTEN ASSESSMENT
  // =======================================================

  assessmentSection: {
    marginTop: 18,
  },

  assessmentHeader: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#D1FAE5",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  assessmentHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  assessmentHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  assessmentHeaderIconText: {
    fontSize: 20,
    color: "#059669",
    fontWeight: "900",
  },

  assessmentHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  assessmentEyebrow: {
    fontSize: 8,
    color: "#059669",
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  assessmentSectionTitle: {
    marginTop: 2,
    fontSize: 17,
    color: "#0F172A",
    fontWeight: "800",
  },

  unlockedBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  unlockedBadgeText: {
    fontSize: 8,
    color: "#059669",
    fontWeight: "900",
  },

  assessmentSectionDescription: {
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#D1FAE5",
    paddingHorizontal: 14,
    paddingBottom: 13,
    fontSize: 10,
    lineHeight: 15,
    color: "#64748B",
  },

  assessmentLoading: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    paddingVertical: 25,
    alignItems: "center",
  },

  assessmentLoadingText: {
    marginTop: 8,
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },

  assessmentError: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    padding: 15,
  },

  assessmentErrorTitle: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "800",
  },

  assessmentErrorText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#64748B",
  },

  assessmentEmpty: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  assessmentEmptyIcon: {
    fontSize: 25,
    color: "#94A3B8",
  },

  assessmentEmptyTitle: {
    marginTop: 7,
    fontSize: 13,
    color: "#334155",
    fontWeight: "800",
    textAlign: "center",
  },

  assessmentEmptyText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#94A3B8",
    textAlign: "center",
  },

  assessmentList: {
    gap: 10,
  },

  assessmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    padding: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  assessmentCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  assessmentIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  assessmentIcon: {
    fontSize: 21,
    color: "#2563EB",
    fontWeight: "800",
  },

  assessmentInfo: {
    flex: 1,
    minWidth: 0,
  },

  assessmentTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  assessmentTitle: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#0F172A",
    fontWeight: "800",
  },

  passedBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  passedBadgeText: {
    fontSize: 7,
    color: "#059669",
    fontWeight: "900",
  },

  assessmentDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: "#64748B",
  },

  assessmentMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 7,
  },

  assessmentMeta: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "#F1F5F9",
  },

  assessmentMetaText: {
    fontSize: 8,
    color: "#475569",
    fontWeight: "700",
  },

  assessmentButton: {
    marginTop: 12,
    height: 42,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  assessmentButtonText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  assessmentButtonArrow: {
    marginLeft: 8,
    fontSize: 17,
    lineHeight: 18,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  // =======================================================
  // ACCREDITATION
  // =======================================================

  accreditationCard: {
    marginTop: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#F8FAFF",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  accreditationIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  accreditationIconText: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  accreditationContent: {
    flex: 1,
    minWidth: 0,
  },

  accreditationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  accreditationTitle: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "800",
  },

  isoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  isoBadgeText: {
    fontSize: 7,
    color: "#2563EB",
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  accreditationText: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 15,
    color: "#475569",
    fontWeight: "400",
  },

  // =======================================================
  // EMPTY TRAINING
  // =======================================================

  emptyTrainingContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconText: {
    fontSize: 30,
    color: "#2563EB",
    fontWeight: "300",
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    color: "#0F172A",
    fontWeight: "800",
  },

  emptyDescription: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  primaryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563EB",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  // =======================================================
  // ERROR
  // =======================================================

  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIconText: {
    fontSize: 24,
    color: "#DC2626",
    fontWeight: "900",
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "800",
  },

  errorMessage: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#2563EB",
  },

  retryButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "800",
  },
});