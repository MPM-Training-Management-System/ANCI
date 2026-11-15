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
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import type {
  ParticipantAssessment,
  LearningModuleFile,
} from "@repo/types";

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

type LearningFilter = "all" | "in-progress" | "completed";

type SupportingFileFilter =
  | "all"
  | "pdf"
  | "documents"
  | "videos";

type ModuleItem = {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  totalSections: number;
  completedSections: number;
  isCompleted: boolean;
};

type LearningMaterialItem = {
  id: string;
  title?: string;
  [key: string]: any;
};

type EnrollmentItem = {
  status?: string;
  trainingBatchId?: string;
  programName?: string;
  batchCode?: string;
  trainingBatch?: {
    programName?: string;
    batchCode?: string;
  };
  [key: string]: any;
};

type SupportingFileItem = LearningModuleFile & {
  moduleTitle: string;
  materialTitle: string;
};

/* =========================================================
   HELPERS
========================================================= */

const unwrapArray = (result: any): any[] => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  return [];
};

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
    "Complete this assessment to evaluate your understanding."
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

const getAssessmentPassingPercentage = (assessment: any): number => {
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
   SUPPORTING FILE HELPERS
========================================================= */

const getFileExtension = (fileName?: string | null): string => {
  if (!fileName) return "";

  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
};

const getSupportingFileType = (
  file: SupportingFileItem,
): SupportingFileFilter | "other" => {
  const contentType = (file.contentType ?? "").toLowerCase();
  const extension = getFileExtension(file.fileName);

  if (
    contentType.includes("pdf") ||
    extension === "pdf"
  ) {
    return "pdf";
  }

  if (
    contentType.includes("msword") ||
    contentType.includes("wordprocessingml") ||
    contentType.includes("officedocument.wordprocessingml") ||
    ["doc", "docx"].includes(extension)
  ) {
    return "documents";
  }

  if (
    contentType.startsWith("video/") ||
    ["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(
      extension,
    )
  ) {
    return "videos";
  }

  return "other";
};

const getFileTypeLabel = (file: SupportingFileItem): string => {
  const type = getSupportingFileType(file);

  if (type === "pdf") return "PDF DOCUMENT";
  if (type === "documents") return "WORD DOCUMENT";
  if (type === "videos") return "VIDEO";

  const extension = getFileExtension(file.fileName);

  return extension
    ? `${extension.toUpperCase()} FILE`
    : "SUPPORTING FILE";
};

const getFileIcon = (
  file: SupportingFileItem,
): React.ComponentProps<typeof Ionicons>["name"] => {
  const type = getSupportingFileType(file);

  if (type === "pdf") return "document-text-outline";
  if (type === "documents") return "document-outline";
  if (type === "videos") return "videocam-outline";

  return "attach-outline";
};

const formatFileSize = (size?: number | null): string => {
  if (!size || size <= 0) return "File size unavailable";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function LearningScreen() {
  /* =======================================================
     CUSTOM HOOKS
  ======================================================= */

  const {
    loadMyEnrollments,
    error: enrollmentError,
  } = useEnrollments(enrollmentApi);

  const {
    loadLearningMaterials,
    loadModules,
    loadSections,
  } = useLearningMaterials(learningMaterialApi);

  const {
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

  const [approvedEnrollment, setApprovedEnrollment] =
    useState<EnrollmentItem | null>(null);

  const [currentLearningMaterial, setCurrentLearningMaterial] =
    useState<LearningMaterialItem | null>(null);

  const [moduleItems, setModuleItems] = useState<ModuleItem[]>([]);

  const [supportingFiles, setSupportingFiles] =
    useState<SupportingFileItem[]>([]);

  const [participantAssessments, setParticipantAssessments] =
    useState<ParticipantAssessment[]>([]);

  const [progressData, setProgressData] = useState<any>(null);

  const [activeFilter, setActiveFilter] =
    useState<LearningFilter>("all");

  const [activeFileFilter, setActiveFileFilter] =
    useState<SupportingFileFilter>("all");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  /* =======================================================
     REQUEST GUARDS
  ======================================================= */

  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const actionsRef = useRef({
    loadMyEnrollments,
    loadLearningMaterials,
    loadModules,
    loadSections,
    getMaterialProgress,
    loadByBatchIdParticipantAssessment,
  });

  actionsRef.current = {
    loadMyEnrollments,
    loadLearningMaterials,
    loadModules,
    loadSections,
    getMaterialProgress,
    loadByBatchIdParticipantAssessment,
  };

  /* =======================================================
     LOAD ALL LEARNING DATA
  ======================================================= */

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoadError(false);

    try {
      const actions = actionsRef.current;

      /* -----------------------------------------------
         1. LOAD ENROLLMENTS
      ----------------------------------------------- */

      const enrollmentResult = await actions.loadMyEnrollments();
      const enrollmentList = unwrapArray(enrollmentResult);

      const approved = enrollmentList.find(
        (item: EnrollmentItem) =>
          String(item?.status ?? "").toLowerCase() === "approved",
      );

      if (!approved?.trainingBatchId) {
        setApprovedEnrollment(null);
        setCurrentLearningMaterial(null);
        setModuleItems([]);
        setSupportingFiles([]);
        setProgressData(null);
        setParticipantAssessments([]);
        return;
      }

      setApprovedEnrollment(approved);

      const batchId = String(approved.trainingBatchId);

      /* -----------------------------------------------
         2. LOAD PUBLISHED LEARNING MATERIALS
      ----------------------------------------------- */

      const materialResult =
        await actions.loadLearningMaterials(batchId);

      const materials = unwrapArray(materialResult);

      if (materials.length === 0) {
        setCurrentLearningMaterial(null);
        setModuleItems([]);
        setSupportingFiles([]);
        setProgressData(null);
        setParticipantAssessments([]);
        return;
      }

      const material = materials[0];

      if (!material?.id) {
        setCurrentLearningMaterial(null);
        setModuleItems([]);
        setSupportingFiles([]);
        setProgressData(null);
        setParticipantAssessments([]);
        return;
      }

      setCurrentLearningMaterial(material);

      const materialId = String(material.id);

      /* -----------------------------------------------
         3. LOAD MATERIAL PROGRESS
      ----------------------------------------------- */

      const loadedProgress =
        await actions.getMaterialProgress(materialId);

      setProgressData(loadedProgress ?? null);

      const progressModules = Array.isArray(
        loadedProgress?.modules,
      )
        ? loadedProgress.modules
        : [];

      /* -----------------------------------------------
         4. LOAD MODULES
      ----------------------------------------------- */

      setIsLoadingModules(true);

      const moduleResult = await actions.loadModules(materialId);
      const modules = unwrapArray(moduleResult);

      /*
        Collect all supporting files uploaded to the
        modules under the current learning material.
      */

      const allSupportingFiles: SupportingFileItem[] = [];

      modules.forEach((module: any) => {
        const moduleFiles = Array.isArray(module?.files)
          ? module.files
          : [];

        moduleFiles.forEach((file: LearningModuleFile) => {
          if (!file?.id || !file?.fileUrl) return;

          allSupportingFiles.push({
            ...file,
            moduleTitle:
              module?.title ??
              module?.name ??
              "Learning Module",
            materialTitle:
              material?.title ??
              "Training Learning Material",
          });
        });
      });

      setSupportingFiles(allSupportingFiles);

      const moduleResults = await Promise.all(
        modules.map(async (module: any, index: number) => {
          const moduleId = String(module?.id ?? "");

          if (!moduleId) return null;

          const sectionResult =
            await actions.loadSections(moduleId);

          const sections = unwrapArray(sectionResult);

          const moduleProgress = progressModules.find(
            (item: any) =>
              String(item?.moduleId ?? "") === moduleId,
          );

          const totalSections =
            Number(moduleProgress?.totalSections ?? 0) ||
            sections.length;

          const completedSections = Number(
            moduleProgress?.completedSections ?? 0,
          );

          const isCompleted =
            totalSections > 0 &&
            completedSections >= totalSections;

          return {
            id: moduleId,
            title:
              module?.title ??
              module?.name ??
              `Module ${index + 1}`,
            description:
              module?.description ??
              module?.summary ??
              "Complete the lessons in this module.",
            displayOrder: Number(
              module?.displayOrder ?? index + 1,
            ),
            totalSections,
            completedSections,
            isCompleted,
          } as ModuleItem;
        }),
      );

      const sortedModules = moduleResults
        .filter((item): item is ModuleItem => item !== null)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      setModuleItems(sortedModules);
      setIsLoadingModules(false);

      /* -----------------------------------------------
         5. LOAD ASSESSMENTS ONLY WHEN ALL MODULES
            ARE COMPLETED
      ----------------------------------------------- */

      const allCompleted =
        sortedModules.length > 0 &&
        sortedModules.every((module) => module.isCompleted);

      if (allCompleted) {
        setIsLoadingAssessments(true);

        try {
          const assessmentResult =
            await actions.loadByBatchIdParticipantAssessment(
              batchId,
            );

          setParticipantAssessments(
            unwrapArray(assessmentResult) as ParticipantAssessment[],
          );
        } catch (error) {
          console.error("Failed to load assessments:", error);
          setParticipantAssessments([]);
        } finally {
          setIsLoadingAssessments(false);
        }
      } else {
        setParticipantAssessments([]);
      }
    } catch (error) {
      console.error("Failed to load learning hub:", error);
      setLoadError(true);
    } finally {
      setIsLoadingModules(false);
      setIsInitialLoading(false);
      setHasLoaded(true);
      isFetchingRef.current = false;
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    void loadData();
  }, []);

  /* =======================================================
     PULL TO REFRESH
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    if (isFetchingRef.current) return;

    setIsRefreshing(true);

    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  /* =======================================================
     TRAINING INFORMATION
  ======================================================= */

  const programName =
    approvedEnrollment?.programName ??
    approvedEnrollment?.trainingBatch?.programName ??
    "Current Training";

  const batchCode =
    approvedEnrollment?.batchCode ??
    approvedEnrollment?.trainingBatch?.batchCode ??
    "Training Batch";

  /* =======================================================
     MODULE COMPLETION
  ======================================================= */

  const completedModuleCount = useMemo(
    () => moduleItems.filter((module) => module.isCompleted).length,
    [moduleItems],
  );

  const totalModuleCount = moduleItems.length;

  const allModulesCompleted =
    totalModuleCount > 0 &&
    completedModuleCount === totalModuleCount;

  const courseCompletionPercentage =
    totalModuleCount > 0
      ? Math.round(
          (completedModuleCount / totalModuleCount) * 100,
        )
      : 0;

  /* =======================================================
     MODULE ACCESS
  ======================================================= */

  const isModuleUnlocked = useCallback(
    (index: number) => {
      if (index === 0) return true;

      return Boolean(moduleItems[index - 1]?.isCompleted);
    },
    [moduleItems],
  );

  const handleOpenModule = useCallback(
    (module: ModuleItem, index: number) => {
      if (!module.id || !currentLearningMaterial?.id) return;
      if (!isModuleUnlocked(index)) return;

      router.push({
        pathname: "/learning/module",
        params: {
          materialId: String(currentLearningMaterial.id),
          moduleId: module.id,
          moduleIndex: String(index),
        },
      });
    },
    [currentLearningMaterial, isModuleUnlocked],
  );

  /* =======================================================
     FILTER MODULES
  ======================================================= */

  const filteredModules = useMemo(() => {
    switch (activeFilter) {
      case "in-progress":
        return moduleItems.filter(
          (module) =>
            !module.isCompleted &&
            (module.completedSections > 0 ||
              module.totalSections === 0),
        );

      case "completed":
        return moduleItems.filter(
          (module) => module.isCompleted,
        );

      default:
        return moduleItems;
    }
  }, [moduleItems, activeFilter]);

  /* =======================================================
     SUPPORTING FILE FILTERS
  ======================================================= */

  const filteredSupportingFiles = useMemo(() => {
    if (activeFileFilter === "all") {
      return supportingFiles;
    }

    return supportingFiles.filter(
      (file) =>
        getSupportingFileType(file) === activeFileFilter,
    );
  }, [supportingFiles, activeFileFilter]);

  const fileCounts = useMemo(
    () => ({
      all: supportingFiles.length,
      pdf: supportingFiles.filter(
        (file) => getSupportingFileType(file) === "pdf",
      ).length,
      documents: supportingFiles.filter(
        (file) => getSupportingFileType(file) === "documents",
      ).length,
      videos: supportingFiles.filter(
        (file) => getSupportingFileType(file) === "videos",
      ).length,
    }),
    [supportingFiles],
  );

  /* =======================================================
     OPEN SUPPORTING FILE
  ======================================================= */

  const handleOpenSupportingFile = useCallback(
    async (file: SupportingFileItem) => {
      const fileUrl = file.fileUrl?.trim();

      if (!fileUrl) {
        Alert.alert(
          "File unavailable",
          "The file does not have a valid URL.",
        );
        return;
      }

      try {
        await Linking.openURL(fileUrl);
      } catch (error) {
        console.error("Unable to open supporting file:", error);

        Alert.alert(
          "Unable to open file",
          "Please check your internet connection or try again later.",
        );
      }
    },
    [],
  );

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (isInitialLoading && !hasLoaded) {
    return (
      <View style={styles.centerState}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="small" color={COLORS.white} />
        </View>

        <Text style={styles.loadingTitle}>
          Preparing your learning hub
        </Text>

        <Text style={styles.loadingText}>
          Please wait while we load your training materials.
        </Text>
      </View>
    );
  }

  const hasError =
    loadError ||
    Boolean(enrollmentError) ||
    Boolean(progressError) ||
    Boolean(assessmentError);

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerAccent} />

          <Text style={styles.eyebrow}>
            ACE NEXTGEN TRAINING
          </Text>

          <Text style={styles.pageTitle}>
            Learning Hub
          </Text>

          <Text style={styles.pageSubtitle}>
            Access your training modules, study each lesson,
            and track your learning progress.
          </Text>
        </View>

        {/* ERROR */}

        {hasError ? (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={COLORS.danger}
            />

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Unable to load some information
              </Text>

              <Text style={styles.errorText}>
                Pull down to refresh and try again.
              </Text>
            </View>
          </View>
        ) : null}

        {/* NO APPROVED ENROLLMENT */}

        {!approvedEnrollment ? (
          <View style={styles.noTrainingCard}>
            <View style={styles.noTrainingIcon}>
              <Ionicons
                name="school-outline"
                size={32}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.noTrainingTitle}>
              No approved training yet
            </Text>

            <Text style={styles.noTrainingText}>
              Your learning materials will become available
              once your enrollment has been approved.
            </Text>
          </View>
        ) : (
          <>
            {/* TRAINING INFORMATION */}

            <View style={styles.trainingCard}>
              <View style={styles.trainingTop}>
                <View style={styles.trainingIcon}>
                  <Ionicons
                    name="school-outline"
                    size={23}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.trainingInfo}>
                  <Text style={styles.trainingEyebrow}>
                    YOUR CURRENT TRAINING
                  </Text>

                  <Text style={styles.trainingTitle}>
                    {programName}
                  </Text>

                  <Text style={styles.trainingBatch}>
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

              <View style={styles.divider} />

              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressLabel}>
                    Overall Module Progress
                  </Text>

                  <Text style={styles.progressSubtext}>
                    {completedModuleCount} of {totalModuleCount}{" "}
                    modules completed
                  </Text>
                </View>

                <Text style={styles.progressPercentage}>
                  {courseCompletionPercentage}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${courseCompletionPercentage}%` },
                  ]}
                />
              </View>
            </View>

            {/* LEARNING MATERIAL */}

            {currentLearningMaterial ? (
              <View style={styles.materialCard}>
                <View style={styles.materialIcon}>
                  <Ionicons
                    name="library-outline"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.materialContent}>
                  <Text style={styles.materialEyebrow}>
                    PUBLISHED LEARNING MATERIAL
                  </Text>

                  <Text style={styles.materialTitle}>
                    {currentLearningMaterial.title ??
                      "Training Learning Material"}
                  </Text>

                  <Text style={styles.materialDescription}>
                    Study the modules and lessons prepared
                    for your training batch.
                  </Text>
                </View>
              </View>
            ) : (
              <EmptyCard
                icon="documents-outline"
                title="No learning material available"
                description="Your trainer or administrator has not published learning materials for this batch yet."
              />
            )}

            {/* =================================================
                SUPPORTING FILES
            ================================================= */}

            {currentLearningMaterial ? (
              <View style={styles.contentSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeading}>
                    <Text style={styles.sectionEyebrow}>
                      ADDITIONAL LEARNING RESOURCES
                    </Text>

                    <Text style={styles.sectionTitle}>
                      Supporting Files
                    </Text>

                    <Text style={styles.sectionDescription}>
                      Open the documents, PDF files, and videos
                      uploaded by your trainer.
                    </Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {supportingFiles.length}
                    </Text>
                  </View>
                </View>

                {/* FILE FILTERS */}

                <View style={styles.fileFilterRow}>
                  <FileFilterButton
                    label="All Files"
                    count={fileCounts.all}
                    active={activeFileFilter === "all"}
                    onPress={() => setActiveFileFilter("all")}
                  />

                  <FileFilterButton
                    label="PDF"
                    count={fileCounts.pdf}
                    active={activeFileFilter === "pdf"}
                    onPress={() => setActiveFileFilter("pdf")}
                  />

                  <FileFilterButton
                    label="Documents"
                    count={fileCounts.documents}
                    active={activeFileFilter === "documents"}
                    onPress={() =>
                      setActiveFileFilter("documents")
                    }
                  />

                  <FileFilterButton
                    label="Videos"
                    count={fileCounts.videos}
                    active={activeFileFilter === "videos"}
                    onPress={() => setActiveFileFilter("videos")}
                  />
                </View>

                {supportingFiles.length === 0 ? (
                  <EmptyCard
                    icon="folder-open-outline"
                    title="No supporting files available"
                    description="Files uploaded to your learning modules will appear here."
                  />
                ) : filteredSupportingFiles.length === 0 ? (
                  <EmptyCard
                    icon="filter-outline"
                    title="No files found"
                    description="There are no supporting files under this file type."
                  />
                ) : (
                  <View style={styles.supportingFileList}>
                    {filteredSupportingFiles.map((file) => (
                      <View
                        key={file.id}
                        style={styles.supportingFileCard}
                      >
                        <View style={styles.supportingFileTop}>
                          <View style={styles.supportingFileIcon}>
                            <Ionicons
                              name={getFileIcon(file)}
                              size={23}
                              color={COLORS.primary}
                            />
                          </View>

                          <View style={styles.supportingFileInfo}>
                            <Text
                              style={styles.supportingFileName}
                              numberOfLines={2}
                            >
                              {file.fileName ?? "Untitled File"}
                            </Text>

                            <Text style={styles.supportingFileType}>
                              {getFileTypeLabel(file)}
                            </Text>
                          </View>

                          <Pressable
                            onPress={() =>
                              handleOpenSupportingFile(file)
                            }
                            style={({ pressed }) => [
                              styles.fileOpenButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Ionicons
                              name="open-outline"
                              size={17}
                              color={COLORS.white}
                            />
                          </Pressable>
                        </View>

                        <View style={styles.supportingFileDivider} />

                        <View style={styles.supportingFileFooter}>
                          <View style={styles.fileMetaItem}>
                            <Ionicons
                              name="book-outline"
                              size={13}
                              color={COLORS.secondary}
                            />

                            <Text
                              style={styles.fileMetaText}
                              numberOfLines={1}
                            >
                              {file.moduleTitle}
                            </Text>
                          </View>

                          <Text style={styles.fileSizeText}>
                            {formatFileSize(file.fileSize)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : null}

            {/* MODULES */}

            {currentLearningMaterial ? (
              <View style={styles.contentSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeading}>
                    <Text style={styles.sectionEyebrow}>
                      YOUR LEARNING PATH
                    </Text>

                    <Text style={styles.sectionTitle}>
                      Training Modules
                    </Text>

                    <Text style={styles.sectionDescription}>
                      Complete each module in order to unlock
                      the next one.
                    </Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {moduleItems.length}
                    </Text>
                  </View>
                </View>

                {/* MODULE FILTERS */}

                <View style={styles.filterRow}>
                  <FilterButton
                    label="All"
                    active={activeFilter === "all"}
                    onPress={() => setActiveFilter("all")}
                  />

                  <FilterButton
                    label="In Progress"
                    active={activeFilter === "in-progress"}
                    onPress={() =>
                      setActiveFilter("in-progress")
                    }
                  />

                  <FilterButton
                    label="Completed"
                    active={activeFilter === "completed"}
                    onPress={() =>
                      setActiveFilter("completed")
                    }
                  />
                </View>

                {isLoadingModules || isProgressLoading ? (
                  <LoadingCard text="Loading your modules..." />
                ) : moduleItems.length === 0 ? (
                  <EmptyCard
                    icon="book-outline"
                    title="No modules available"
                    description="Modules will appear here once they are added to your published learning material."
                  />
                ) : filteredModules.length === 0 ? (
                  <EmptyCard
                    icon="filter-outline"
                    title="No modules found"
                    description="There are no modules under this filter."
                  />
                ) : (
                  <View style={styles.moduleList}>
                    {filteredModules.map((module) => {
                      const originalIndex = moduleItems.findIndex(
                        (item) => item.id === module.id,
                      );

                      const unlocked =
                        isModuleUnlocked(originalIndex);

                      const completed = module.isCompleted;

                      const percentage =
                        module.totalSections > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (module.completedSections /
                                  module.totalSections) *
                                  100,
                              ),
                            )
                          : 0;

                      return (
                        <View
                          key={module.id}
                          style={[
                            styles.moduleCard,
                            !unlocked && styles.moduleCardLocked,
                            completed && styles.moduleCardCompleted,
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
                                  size={20}
                                  color={COLORS.white}
                                />
                              ) : !unlocked ? (
                                <Ionicons
                                  name="lock-closed-outline"
                                  size={18}
                                  color={COLORS.muted}
                                />
                              ) : (
                                <Text style={styles.moduleNumberText}>
                                  {String(originalIndex + 1).padStart(
                                    2,
                                    "0",
                                  )}
                                </Text>
                              )}
                            </View>

                            <View style={styles.moduleInfo}>
                              <View style={styles.moduleTitleRow}>
                                <Text
                                  style={styles.moduleTitle}
                                  numberOfLines={2}
                                >
                                  {module.title}
                                </Text>

                                <StatusBadge
                                  label={
                                    completed
                                      ? "COMPLETED"
                                      : unlocked
                                        ? "AVAILABLE"
                                        : "LOCKED"
                                  }
                                  type={
                                    completed
                                      ? "completed"
                                      : unlocked
                                        ? "available"
                                        : "locked"
                                  }
                                />
                              </View>

                              <Text
                                style={styles.moduleDescription}
                                numberOfLines={3}
                              >
                                {module.description}
                              </Text>
                            </View>
                          </View>

                          {/* MODULE PROGRESS */}

                          <View style={styles.moduleProgressSection}>
                            <View style={styles.moduleProgressHeader}>
                              <Text style={styles.moduleProgressLabel}>
                                Lesson Progress
                              </Text>

                              <Text style={styles.moduleProgressCount}>
                                {module.completedSections}/
                                {module.totalSections} lessons
                              </Text>
                            </View>

                            <View style={styles.moduleProgressTrack}>
                              <View
                                style={[
                                  styles.moduleProgressFill,
                                  { width: `${percentage}%` },
                                ]}
                              />
                            </View>
                          </View>

                          {/* MODULE FOOTER */}

                          <View style={styles.moduleFooter}>
                            <View style={styles.moduleStatus}>
                              <Ionicons
                                name={
                                  completed
                                    ? "checkmark-circle-outline"
                                    : unlocked
                                      ? "book-outline"
                                      : "lock-closed-outline"
                                }
                                size={16}
                                color={
                                  completed
                                    ? COLORS.success
                                    : unlocked
                                      ? COLORS.primary
                                      : COLORS.muted
                                }
                              />

                              <Text
                                style={[
                                  styles.moduleStatusText,
                                  completed &&
                                    styles.moduleStatusCompleted,
                                ]}
                              >
                                {completed
                                  ? "All lessons completed"
                                  : unlocked
                                    ? "Continue learning"
                                    : "Complete the previous module first"}
                              </Text>
                            </View>

                            <Pressable
                              disabled={!unlocked}
                              onPress={() =>
                                handleOpenModule(module, originalIndex)
                              }
                              style={({ pressed }) => [
                                styles.moduleButton,
                                completed &&
                                  styles.moduleButtonCompleted,
                                !unlocked &&
                                  styles.moduleButtonLocked,
                                pressed && unlocked && styles.pressed,
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
                                    ? "Open Module"
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
                    })}
                  </View>
                )}
              </View>
            ) : null}

            {/* COMPLETION NOTICE */}

            {allModulesCompleted ? (
              <View style={styles.successCard}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="trophy-outline"
                    size={25}
                    color={COLORS.success}
                  />
                </View>

                <View style={styles.successContent}>
                  <Text style={styles.successTitle}>
                    All modules completed!
                  </Text>

                  <Text style={styles.successText}>
                    You have completed all the lessons in your
                    learning material. Your written assessment
                    is now available.
                  </Text>
                </View>
              </View>
            ) : moduleItems.length > 0 ? (
              <View style={styles.infoCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color={COLORS.primary}
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>
                    Complete your modules in order
                  </Text>

                  <Text style={styles.infoText}>
                    Open an available module, read its lessons,
                    and manually mark each lesson as complete.
                    The next module unlocks after all lessons
                    in the current module are completed.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* WRITTEN ASSESSMENTS */}

            <View style={styles.contentSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>
                    KNOWLEDGE EVALUATION
                  </Text>

                  <Text style={styles.sectionTitle}>
                    Written Assessments
                  </Text>
                </View>

                <View
                  style={[
                    styles.assessmentStatusBadge,
                    allModulesCompleted
                      ? styles.assessmentUnlocked
                      : styles.assessmentLocked,
                  ]}
                >
                  <Ionicons
                    name={
                      allModulesCompleted
                        ? "lock-open-outline"
                        : "lock-closed-outline"
                    }
                    size={13}
                    color={
                      allModulesCompleted
                        ? COLORS.primary
                        : COLORS.muted
                    }
                  />

                  <Text
                    style={[
                      styles.assessmentStatusText,
                      allModulesCompleted
                        ? styles.assessmentUnlockedText
                        : styles.assessmentLockedText,
                    ]}
                  >
                    {allModulesCompleted ? "UNLOCKED" : "LOCKED"}
                  </Text>
                </View>
              </View>

              {!allModulesCompleted ? (
                <View style={styles.lockedAssessmentCard}>
                  <View style={styles.lockedAssessmentIcon}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={23}
                      color={COLORS.muted}
                    />
                  </View>

                  <View style={styles.lockedAssessmentContent}>
                    <Text style={styles.lockedAssessmentTitle}>
                      Assessment is locked
                    </Text>

                    <Text style={styles.lockedAssessmentText}>
                      Complete all learning modules before
                      taking your written assessment.
                    </Text>
                  </View>
                </View>
              ) : isAssessmentLoading || isLoadingAssessments ? (
                <LoadingCard text="Loading assessments..." />
              ) : participantAssessments.length === 0 ? (
                <EmptyCard
                  icon="document-text-outline"
                  title="No assessment available"
                  description="Your written assessment will appear here once it has been published."
                />
              ) : (
                <View style={styles.assessmentList}>
                  {participantAssessments.map(
                    (assessment: ParticipantAssessment, index) => {
                      const raw = assessment as any;
                      const assessmentId = getAssessmentId(raw);
                      const passed = getAssessmentPassed(raw);

                      return (
                        <View
                          key={
                            assessmentId ?? `assessment-${index}`
                          }
                          style={styles.assessmentCard}
                        >
                          <View style={styles.assessmentTop}>
                            <View style={styles.assessmentIcon}>
                              <Ionicons
                                name="document-text-outline"
                                size={22}
                                color={COLORS.primary}
                              />
                            </View>

                            <View style={styles.assessmentInfo}>
                              <Text style={styles.assessmentEyebrow}>
                                WRITTEN ASSESSMENT
                              </Text>

                              <Text style={styles.assessmentTitle}>
                                {getAssessmentTitle(raw)}
                              </Text>
                            </View>

                            {passed ? (
                              <StatusBadge
                                label="PASSED"
                                type="completed"
                              />
                            ) : null}
                          </View>

                          <Text style={styles.assessmentDescription}>
                            {getAssessmentDescription(raw)}
                          </Text>

                          <View style={styles.assessmentMeta}>
                            <View style={styles.assessmentMetaItem}>
                              <Ionicons
                                name="help-circle-outline"
                                size={16}
                                color={COLORS.secondary}
                              />

                              <Text style={styles.assessmentMetaText}>
                                {getAssessmentQuestionCount(raw)} questions
                              </Text>
                            </View>

                            <View style={styles.assessmentMetaItem}>
                              <Ionicons
                                name="ribbon-outline"
                                size={16}
                                color={COLORS.secondary}
                              />

                              <Text style={styles.assessmentMetaText}>
                                {getAssessmentPassingPercentage(raw)}%
                                passing
                              </Text>
                            </View>
                          </View>

                          <Pressable
                            disabled={!assessmentId}
                            onPress={() => {
                              if (!assessmentId) return;

                              router.push(
                                `/assessment/${assessmentId}`,
                              );
                            }}
                            style={({ pressed }) => [
                              styles.assessmentButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.assessmentButtonText}>
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
          </>
        )}

        {/* FOOTER */}

        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={COLORS.secondary}
          />

          <Text style={styles.footerText}>
            ACE NextGen Consultancy Inc.{"\n"}
            Official Training and Learning Platform
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        active && styles.filterButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,
          active && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FileFilterButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fileFilterButton,
        active && styles.fileFilterButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.fileFilterText,
          active && styles.fileFilterTextActive,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.fileFilterCount,
          active && styles.fileFilterCountActive,
        ]}
      >
        <Text
          style={[
            styles.fileFilterCountText,
            active && styles.fileFilterCountTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function StatusBadge({
  label,
  type,
}: {
  label: string;
  type: "completed" | "available" | "locked";
}) {
  const badgeStyle =
    type === "completed"
      ? styles.completedBadge
      : type === "available"
        ? styles.availableBadge
        : styles.lockedBadge;

  const textStyle =
    type === "completed"
      ? styles.completedBadgeText
      : type === "available"
        ? styles.availableBadgeText
        : styles.lockedBadgeText;

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

function EmptyCard({
  icon,
  title,
  description,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={icon}
          size={28}
          color={COLORS.secondary}
        />
      </View>

      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{description}</Text>
    </View>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.loadingInlineText}>{text}</Text>
    </View>
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
  success: "#3B806E",
  successSoft: "#EAF6F3",
  danger: "#B84A4A",
  dangerSoft: "#FFF3F3",
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
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: COLORS.secondary,
    marginBottom: 5,
  },
  pageTitle: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    color: COLORS.dark,
    letterSpacing: -0.6,
  },
  pageSubtitle: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#F1D1D1",
    borderRadius: 15,
    padding: 14,
    marginBottom: 18,
  },
  errorContent: {
    flex: 1,
    marginLeft: 11,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark,
  },
  errorText: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.muted,
  },
  trainingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 17,
  },
  trainingTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  trainingIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginRight: 11,
  },
  trainingInfo: {
    flex: 1,
    paddingRight: 5,
  },
  trainingEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  trainingTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: COLORS.dark,
  },
  trainingBatch: {
    marginTop: 4,
    fontSize: 10,
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
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F5",
    marginTop: 15,
    marginBottom: 13,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.dark,
  },
  progressSubtext: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.muted,
  },
  progressPercentage: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.primary,
  },
  progressTrack: {
    height: 7,
    borderRadius: 10,
    backgroundColor: COLORS.softBlue,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  materialCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 25,
  },
  materialIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softAccent,
    marginRight: 12,
  },
  materialContent: {
    flex: 1,
  },
  materialEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  materialTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    color: COLORS.dark,
  },
  materialDescription: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
  },
  contentSection: {
    marginBottom: 27,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionHeading: {
    flex: 1,
    paddingRight: 10,
  },
  sectionEyebrow: {
    fontSize: 9,
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
  sectionDescription: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },
  countBadge: {
    minWidth: 32,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },

  /* MODULE FILTERS */

  filterRow: {
    flexDirection: "row",
    marginBottom: 13,
    gap: 7,
  },
  filterButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 18,
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },

  /* SUPPORTING FILE FILTERS */

  fileFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 13,
  },
  fileFilterButton: {
    minHeight: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  fileFilterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fileFilterText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  fileFilterTextActive: {
    color: COLORS.white,
  },
  fileFilterCount: {
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    paddingHorizontal: 4,
  },
  fileFilterCountActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  fileFilterCountText: {
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.primary,
  },
  fileFilterCountTextActive: {
    color: COLORS.white,
  },

  /* SUPPORTING FILE CARDS */

  supportingFileList: {
    gap: 10,
  },
  supportingFileCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 13,
  },
  supportingFileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  supportingFileIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginRight: 11,
  },
  supportingFileInfo: {
    flex: 1,
    paddingRight: 8,
  },
  supportingFileName: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    color: COLORS.dark,
  },
  supportingFileType: {
    marginTop: 4,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: COLORS.secondary,
  },
  fileOpenButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  supportingFileDivider: {
    height: 1,
    backgroundColor: "#EEF2F5",
    marginTop: 12,
    marginBottom: 9,
  },
  supportingFileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fileMetaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  fileMetaText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.secondary,
    flexShrink: 1,
  },
  fileSizeText: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.muted,
  },

  /* MODULE CARDS */

  moduleList: {
    gap: 12,
  },
  moduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },
  moduleCardLocked: {
    backgroundColor: "#FAFBFC",
  },
  moduleCardCompleted: {
    borderColor: "#CFE2E8",
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
    marginRight: 11,
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
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    color: COLORS.dark,
    paddingRight: 7,
  },
  moduleDescription: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
  },
  completedBadge: {
    backgroundColor: COLORS.successSoft,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  completedBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: COLORS.success,
  },
  availableBadge: {
    backgroundColor: COLORS.softAccent,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  availableBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: COLORS.primary,
  },
  lockedBadge: {
    backgroundColor: COLORS.lockedBackground,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  lockedBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: COLORS.muted,
  },
  moduleProgressSection: {
    marginTop: 15,
  },
  moduleProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  moduleProgressLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.dark,
  },
  moduleProgressCount: {
    fontSize: 9,
    color: COLORS.muted,
  },
  moduleProgressTrack: {
    height: 5,
    borderRadius: 10,
    backgroundColor: COLORS.softBlue,
    overflow: "hidden",
  },
  moduleProgressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F5",
  },
  moduleStatus: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 7,
  },
  moduleStatusText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.secondary,
    flexShrink: 1,
  },
  moduleStatusCompleted: {
    color: COLORS.success,
  },
  moduleButton: {
    minWidth: 100,
    height: 35,
    borderRadius: 9,
    paddingHorizontal: 10,
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
    fontSize: 10,
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

  /* COMPLETION AND INFORMATION */

  successCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: "#CFE2D9",
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
  },
  successIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginRight: 11,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.success,
  },
  successText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.softAccent,
    borderWidth: 1,
    borderColor: "#C9EFF1",
    borderRadius: 15,
    padding: 14,
    marginTop: 14,
    marginBottom: 25,
  },
  infoContent: {
    flex: 1,
    marginLeft: 9,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  infoText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  /* ASSESSMENTS */

  assessmentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  assessmentUnlocked: {
    backgroundColor: COLORS.softAccent,
  },
  assessmentLocked: {
    backgroundColor: COLORS.lockedBackground,
  },
  assessmentStatusText: {
    marginLeft: 4,
    fontSize: 8,
    fontWeight: "900",
  },
  assessmentUnlockedText: {
    color: COLORS.primary,
  },
  assessmentLockedText: {
    color: COLORS.muted,
  },
  lockedAssessmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 15,
  },
  lockedAssessmentIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lockedBackground,
    marginRight: 11,
  },
  lockedAssessmentContent: {
    flex: 1,
  },
  lockedAssessmentTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark,
  },
  lockedAssessmentText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
  },
  assessmentList: {
    gap: 12,
  },
  assessmentCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 15,
  },
  assessmentTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  assessmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginRight: 10,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.secondary,
    marginBottom: 3,
  },
  assessmentTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    color: COLORS.dark,
  },
  assessmentDescription: {
    marginTop: 12,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
  },
  assessmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 13,
  },
  assessmentMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  assessmentMetaText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  assessmentButton: {
    height: 39,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  assessmentButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.white,
    marginRight: 6,
  },

  /* EMPTY AND LOADING */

  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    paddingHorizontal: 22,
    paddingVertical: 27,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
    marginBottom: 10,
  },
  emptyTitle: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.dark,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: "center",
  },
  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingVertical: 22,
  },
  loadingInlineText: {
    marginLeft: 9,
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.muted,
  },

  /* NO TRAINING */

  noTrainingCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
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

  /* FOOTER */

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 5,
  },
  footerText: {
    marginLeft: 9,
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "600",
    color: COLORS.secondary,
  },
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
  pressed: {
    opacity: 0.78,
  },
  bottomSpace: {
    height: 25,
  },
});