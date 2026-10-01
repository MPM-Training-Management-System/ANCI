"use client";

import {
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

import { router } from "expo-router";

import { learningMaterialApi, learningProgressApi } from "@/api/api";

import {
  useLearningMaterials,
  useLearningProgress,
} from "@repo/hooks";

interface LearningMaterialModulesProps {
  materialId: string;
  completedModuleId?: string;
}

export default function LearningMaterialModules({
  materialId,
  completedModuleId,
}: LearningMaterialModulesProps) {
  const {
    selectedMaterial,
    modules,
    isLoading,
    error,
    loadLearningMaterial,
    loadModules,
  } = useLearningMaterials(learningMaterialApi);

  const {
    progress,
    isLoading: isProgressLoading,
    error: progressError,
    getMaterialProgress,
  } = useLearningProgress(learningProgressApi);

  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Used only for instant UI update after returning from
   * the Module screen after completing a module.
   *
   * This does NOT trigger another GET request.
   */
  const [routeCompletedModuleId, setRouteCompletedModuleId] = useState<
    string | undefined
  >(completedModuleId);

  /**
   * Prevent duplicate initial requests for the same material.
   */
  const loadedMaterialIdRef = useRef<string | null>(null);

  useEffect(() => {
    setRouteCompletedModuleId(completedModuleId);
  }, [completedModuleId]);

  const fetchData = useCallback(async () => {
    if (!materialId) {
      return;
    }

    try {
      const material = await loadLearningMaterial(materialId);

      if (!material) {
        return;
      }

      await Promise.all([
        loadModules(material.id),
        getMaterialProgress(material.id),
      ]);
    } catch {
      // Errors are already handled by the hooks.
    }
  }, [
    materialId,
    loadLearningMaterial,
    loadModules,
    getMaterialProgress,
  ]);

  /**
   * Initial load.
   *
   * Only depends on materialId intentionally.
   * This prevents unnecessary repeated API calls when
   * hook function references change.
   */
  useEffect(() => {
    if (!materialId) {
      return;
    }

    if (loadedMaterialIdRef.current === materialId) {
      return;
    }

    loadedMaterialIdRef.current = materialId;

    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  /**
   * Pull-to-refresh.
   */
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchData();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchData]);

  /**
   * Combine backend progress with the module completed
   * from the previous route.
   */
  const completedModuleIds = useMemo(() => {
    const ids = new Set<string>();

    progress?.modules?.forEach((moduleProgress) => {
      if (
        moduleProgress.totalSections > 0 &&
        moduleProgress.completedSections >=
          moduleProgress.totalSections
      ) {
        ids.add(moduleProgress.moduleId);
      }
    });

    if (routeCompletedModuleId) {
      ids.add(routeCompletedModuleId);
    }

    return ids;
  }, [progress, routeCompletedModuleId]);

  const isModuleCompleted = useCallback(
    (moduleId: string) => {
      return completedModuleIds.has(moduleId);
    },
    [completedModuleIds],
  );

  /**
   * Module unlock rule:
   *
   * Module 1 = unlocked
   * Module 2 = unlocked only if Module 1 is completed
   * Module 3 = unlocked only if Module 2 is completed
   * etc.
   */
  const isUnlocked = useCallback(
    (index: number) => {
      if (index === 0) {
        return true;
      }

      const previousModule = modules[index - 1];

      if (!previousModule) {
        return false;
      }

      return isModuleCompleted(previousModule.id);
    },
    [modules, isModuleCompleted],
  );

  const handleOpenModule = useCallback(
    (index: number) => {
      const module = modules[index];

      if (!module) {
        return;
      }

      if (!isUnlocked(index)) {
        return;
      }

      router.push({
        pathname: "/learning/module",
        params: {
          materialId,
          moduleId: module.id,
          moduleIndex: String(index),
        },
      });
    },
    [modules, materialId, isUnlocked],
  );

  const allModulesCompleted = useMemo(() => {
    if (modules.length === 0) {
      return false;
    }

    return modules.every((module) =>
      isModuleCompleted(module.id),
    );
  }, [modules, isModuleCompleted]);

  const completedCount = useMemo(() => {
    return modules.filter((module) =>
      isModuleCompleted(module.id),
    ).length;
  }, [modules, isModuleCompleted]);

  const progressPercentage = useMemo(() => {
    if (modules.length === 0) {
      return 0;
    }

    return Math.round(
      (completedCount / modules.length) * 100,
    );
  }, [completedCount, modules.length]);

  if (isLoading && !selectedMaterial) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading course modules...
        </Text>
      </View>
    );
  }

  if (error && !selectedMaterial) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Unable to load course
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => {
            loadedMaterialIdRef.current = null;
            void fetchData();
          }}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!selectedMaterial) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>
          Course not found
        </Text>

        <Text style={styles.emptyText}>
          This learning material is currently unavailable.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text
              style={styles.headerTitle}
              numberOfLines={2}
            >
              Course Modules
            </Text>

            <Text
              style={styles.headerSubtitle}
              numberOfLines={2}
            >
              {selectedMaterial.title}
            </Text>
          </View>
        </View>

        {/* Course Information */}
        <View style={styles.courseCard}>
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>
              TRAINING MATERIAL
            </Text>
          </View>

          <Text style={styles.courseTitle}>
            {selectedMaterial.title}
          </Text>

          {selectedMaterial.description ? (
            <Text style={styles.courseDescription}>
              {selectedMaterial.description}
            </Text>
          ) : null}
        </View>

        {/* Overall Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>
                Course Progress
              </Text>

              <Text style={styles.progressCount}>
                {completedCount} of {modules.length} modules
                completed
              </Text>
            </View>

            <Text style={styles.progressPercentage}>
              {progressPercentage}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>

          {isProgressLoading ? (
            <View style={styles.progressLoading}>
              <ActivityIndicator size="small" />
              <Text style={styles.progressLoadingText}>
                Syncing progress...
              </Text>
            </View>
          ) : null}

          {progressError ? (
            <Text style={styles.progressError}>
              {progressError}
            </Text>
          ) : null}
        </View>

        {/* Modules */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Learning Modules
            </Text>

            <Text style={styles.sectionSubtitle}>
              Complete each module to unlock the next one.
            </Text>
          </View>
        </View>

        {modules.length === 0 ? (
          <View style={styles.emptyModulesCard}>
            <Text style={styles.emptyModulesTitle}>
              No modules available
            </Text>

            <Text style={styles.emptyModulesText}>
              Modules for this training material have not been
              added yet.
            </Text>
          </View>
        ) : (
          <View style={styles.modulesList}>
            {modules.map((module, index) => {
              const completed = isModuleCompleted(module.id);
              const unlocked = isUnlocked(index);

              return (
                <View
                  key={module.id}
                  style={[
                    styles.moduleCard,
                    !unlocked &&
                      styles.moduleCardLocked,
                  ]}
                >
                  <View style={styles.moduleTopRow}>
                    {/* Module Number */}
                    <View
                      style={[
                        styles.moduleNumber,
                        completed &&
                          styles.moduleNumberCompleted,
                        !unlocked &&
                          styles.moduleNumberLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.moduleNumberText,
                          completed &&
                            styles.moduleNumberTextCompleted,
                          !unlocked &&
                            styles.moduleNumberTextLocked,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    {/* Module Info */}
                    <View style={styles.moduleInfo}>
                      <Text
                        style={styles.moduleTitle}
                        numberOfLines={3}
                      >
                        {module.title}
                      </Text>

                      {module.description ? (
                        <Text
                          style={styles.moduleDescription}
                          numberOfLines={3}
                        >
                          {module.description}
                        </Text>
                      ) : null}
                    </View>

                    {/* Status */}
                    <View style={styles.statusContainer}>
                      {completed ? (
                        <View
                          style={styles.completedBadge}
                        >
                          <Text
                            style={
                              styles.completedBadgeText
                            }
                          >
                            ✓
                          </Text>
                        </View>
                      ) : !unlocked ? (
                        <View
                          style={styles.lockedBadge}
                        >
                          <Text
                            style={
                              styles.lockedBadgeText
                            }
                          >
                            🔒
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={styles.availableBadge}
                        >
                          <Text
                            style={
                              styles.availableBadgeText
                            }
                          >
                            →
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Module Action */}
                  <Pressable
                    disabled={!unlocked}
                    onPress={() =>
                      handleOpenModule(index)
                    }
                    style={[
                      styles.moduleButton,
                      completed &&
                        styles.moduleButtonCompleted,
                      !unlocked &&
                        styles.moduleButtonLocked,
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
                        ? "Review Module"
                        : unlocked
                          ? "Open Module"
                          : "Complete Previous Module"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* Completion Notice */}
        {allModulesCompleted ? (
          <View style={styles.completionCard}>
            <View style={styles.completionIcon}>
              <Text style={styles.completionIconText}>
                ✓
              </Text>
            </View>

            <View style={styles.completionContent}>
              <Text style={styles.completionTitle}>
                All Modules Completed
              </Text>

              <Text style={styles.completionText}>
                You have completed all learning modules.
                Your Written Assessment will be available
                from the Learning screen.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f8fafc",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 21,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563eb",
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 21,
  },

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  backIcon: {
    fontSize: 32,
    lineHeight: 34,
    color: "#0f172a",
    marginTop: -2,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748b",
  },

  /* Course */

  courseCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    marginBottom: 16,
  },

  courseBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#1d4ed8",
    marginBottom: 12,
  },

  courseBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#dbeafe",
  },

  courseTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: "#ffffff",
  },

  courseDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#dbeafe",
  },

  /* Progress */

  progressCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  progressCount: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },

  progressPercentage: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2563eb",
  },

  progressTrack: {
    height: 9,
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },

  progressLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  progressLoadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#64748b",
  },

  progressError: {
    marginTop: 10,
    fontSize: 12,
    color: "#dc2626",
  },

  /* Section */

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
  },

  /* Modules */

  modulesList: {
    gap: 14,
  },

  moduleCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  moduleCardLocked: {
    opacity: 0.7,
  },

  moduleTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  moduleNumber: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    marginRight: 12,
  },

  moduleNumberCompleted: {
    backgroundColor: "#2563eb",
  },

  moduleNumberLocked: {
    backgroundColor: "#f1f5f9",
  },

  moduleNumberText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563eb",
  },

  moduleNumberTextCompleted: {
    color: "#ffffff",
  },

  moduleNumberTextLocked: {
    color: "#94a3b8",
  },

  moduleInfo: {
    flex: 1,
    paddingRight: 8,
  },

  moduleTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  moduleDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
  },

  statusContainer: {
    marginLeft: 4,
  },

  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },

  completedBadgeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16a34a",
  },

  lockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  lockedBadgeText: {
    fontSize: 12,
  },

  availableBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },

  availableBadgeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563eb",
  },

  moduleButton: {
    marginTop: 16,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },

  moduleButtonCompleted: {
    backgroundColor: "#eff6ff",
  },

  moduleButtonLocked: {
    backgroundColor: "#f1f5f9",
  },

  moduleButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  moduleButtonTextCompleted: {
    color: "#2563eb",
  },

  moduleButtonTextLocked: {
    color: "#94a3b8",
  },

  /* Empty */

  emptyModulesCard: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },

  emptyModulesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  emptyModulesText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
    textAlign: "center",
  },

  /* Completion */

  completionCard: {
    flexDirection: "row",
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  completionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  completionIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },

  completionContent: {
    flex: 1,
  },

  completionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1e3a8a",
  },

  completionText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#1e40af",
  },

  bottomSpacing: {
    height: 20,
  },
});