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

import { router } from "expo-router";

import {
  learningMaterialApi,
  learningProgressApi,
} from "@/api/api";

import {
  useLearningMaterials,
  useLearningProgress,
} from "@repo/hooks";

type Props = {
  materialId: string;
  completedModuleId?: string;
};

export default function LearningMaterialModules({
  materialId,
  completedModuleId,
}: Props) {
  // ==========================================================
  // LEARNING MATERIAL
  // ==========================================================

  const {
    selectedMaterial,
    modules,
    isLoading,
    error,
    loadLearningMaterial,
    loadModules,
  } = useLearningMaterials(
    learningMaterialApi,
  );

  // ==========================================================
  // LEARNING PROGRESS
  // ==========================================================

  const {
    progress,
    isLoading: isProgressLoading,
    error: progressError,
    getMaterialProgress,
  } = useLearningProgress(
    learningProgressApi,
  );

  // ==========================================================
  // REFRESH
  // ==========================================================

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  // ==========================================================
  // COMPLETED MODULE FROM NAVIGATION
  //
  // This is ONLY for instant UI update after Finish Module.
  //
  // It does NOT trigger another GET.
  // ==========================================================

  const [
    routeCompletedModuleId,
    setRouteCompletedModuleId,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!completedModuleId) {
      return;
    }

    setRouteCompletedModuleId(
      completedModuleId,
    );
  }, [
    completedModuleId,
  ]);

  // ==========================================================
  // INITIAL LOAD GUARD
  //
  // Stores the material ID that has already been loaded.
  //
  // This is safer than a simple boolean because if the route
  // changes to another material, the new material can still
  // load once.
  // ==========================================================

  const loadedMaterialIdRef =
    useRef<string | null>(null);

  // ==========================================================
  // FETCH DATA
  //
  // This is the ONLY function that performs GET requests.
  //
  // Material is loaded first.
  // Modules + Progress are then loaded in parallel.
  // ==========================================================

  const fetchData =
    useCallback(
      async () => {
        const material =
          await loadLearningMaterial(
            materialId,
          );

        await Promise.all([
          loadModules(
            material.id,
          ),
          getMaterialProgress(
            material.id,
          ),
        ]);
      },
      [
        materialId,
        loadLearningMaterial,
        loadModules,
        getMaterialProgress,
      ],
    );

  // ==========================================================
  // INITIAL LOAD
  //
  // IMPORTANT:
  //
  // We intentionally do NOT depend on fetchData here.
  //
  // Otherwise changing hook function references can cause
  // another GET request.
  //
  // This effect only reacts to materialId.
  // ==========================================================

  useEffect(() => {
    if (!materialId) {
      return;
    }

    if (
      loadedMaterialIdRef.current ===
      materialId
    ) {
      return;
    }

    loadedMaterialIdRef.current =
      materialId;

    void fetchData();

    // Intentionally only run when materialId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    materialId,
  ]);

  // ==========================================================
  // MANUAL REFRESH
  //
  // This is the ONLY way to fetch again while staying on
  // the same material screen.
  // ==========================================================

  const handleRefresh =
    useCallback(
      async () => {
        if (isRefreshing) {
          return;
        }

        try {
          setIsRefreshing(true);

          await fetchData();
        } catch {
          // Errors are handled by hooks.
        } finally {
          setIsRefreshing(false);
        }
      },
      [
        fetchData,
        isRefreshing,
      ],
    );

  // ==========================================================
  // COMPLETED MODULE IDS
  //
  // Persistent completion:
  //     backend progress
  //
  // Instant completion:
  //     completedModuleId from route
  // ==========================================================

  const completedModuleIds =
    useMemo(() => {
      const ids = new Set<string>();

      // --------------------------------------------------------
      // BACKEND PROGRESS
      // --------------------------------------------------------

      if (progress) {
        for (
          const moduleProgress of progress.modules
        ) {
          if (
            moduleProgress.totalSections > 0 &&
            moduleProgress.completedSections >=
              moduleProgress.totalSections
          ) {
            ids.add(
              moduleProgress.moduleId,
            );
          }
        }
      }

      // --------------------------------------------------------
      // IMMEDIATE ROUTE COMPLETION
      // --------------------------------------------------------

      if (
        routeCompletedModuleId
      ) {
        ids.add(
          routeCompletedModuleId,
        );
      }

      return ids;
    }, [
      progress,
      routeCompletedModuleId,
    ]);

  // ==========================================================
  // MODULE COMPLETED?
  // ==========================================================

  const isModuleCompleted =
    useCallback(
      (moduleId: string) => {
        return completedModuleIds.has(
          moduleId,
        );
      },
      [
        completedModuleIds,
      ],
    );

  // ==========================================================
  // MODULE UNLOCK
  //
  // Module 1:
  //     always unlocked
  //
  // Module 2:
  //     requires Module 1 completed
  //
  // Module 3:
  //     requires Module 2 completed
  //
  // etc.
  // ==========================================================

  const isUnlocked =
    useCallback(
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
          previousModule.id,
        );
      },
      [
        modules,
        isModuleCompleted,
      ],
    );

  // ==========================================================
  // OPEN MODULE
  // ==========================================================

  const handleOpenModule =
    useCallback(
      (index: number) => {
        const module =
          modules[index];

        if (!module) {
          return;
        }

        if (!isUnlocked(index)) {
          return;
        }

        router.push({
          pathname:
            "/learning/module",
          params: {
            materialId,
            moduleId: module.id,
            moduleIndex:
              String(index),
          },
        });
      },
      [
        modules,
        isUnlocked,
        materialId,
      ],
    );

  // ==========================================================
  // INITIAL LOADING
  // ==========================================================

  if (
    isLoading &&
    !selectedMaterial
  ) {
    return (
      <View
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color="#111827"
        />

        <Text
          style={styles.loadingText}
        >
          Loading learning material...
        </Text>
      </View>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !selectedMaterial
  ) {
    return (
      <View
        style={styles.center}
      >
        <View
          style={styles.errorIcon}
        >
          <Text
            style={styles.errorIconText}
          >
            !
          </Text>
        </View>

        <Text
          style={styles.errorTitle}
        >
          Unable to Load Material
        </Text>

        <Text
          style={styles.errorText}
        >
          {error.message}
        </Text>

        <Pressable
          onPress={() =>
            void handleRefresh()
          }
          style={styles.retryButton}
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

  // ==========================================================
  // MAIN
  // ==========================================================

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
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={styles.backButton}
        >
          <Text
            style={styles.backArrow}
          >
            ‹
          </Text>
        </Pressable>

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.eyebrow}
          >
            LEARNING
          </Text>

          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {selectedMaterial?.title}
          </Text>
        </View>
      </View>

      {/* ====================================================
          INTRO
      ==================================================== */}

      <View
        style={styles.introCard}
      >
        <Text
          style={styles.introLabel}
        >
          COURSE CONTENT
        </Text>

        <Text
          style={styles.introTitle}
        >
          Continue your learning
        </Text>

        <Text
          style={styles.introText}
        >
          Complete each module in order.
          Finish a module to unlock the
          next one.
        </Text>
      </View>

      {/* ====================================================
          MODULES
      ==================================================== */}

      <View
        style={styles.sectionHeader}
      >
        <View>
          <Text
            style={styles.sectionTitle}
          >
            Course Modules
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            Learn step by step
          </Text>
        </View>

        <View
          style={styles.countBadge}
        >
          <Text
            style={styles.countText}
          >
            {modules.length}
          </Text>
        </View>
      </View>

      <View
        style={styles.moduleList}
      >
        {modules.map(
          (
            module,
            index,
          ) => {
            const unlocked =
              isUnlocked(index);

            const completed =
              isModuleCompleted(
                module.id,
              );

            return (
              <Pressable
                key={module.id}
                disabled={!unlocked}
                onPress={() =>
                  handleOpenModule(
                    index,
                  )
                }
                style={[
                  styles.moduleCard,
                  !unlocked &&
                    styles.moduleCardLocked,
                  completed &&
                    styles.moduleCardCompleted,
                ]}
              >
                {/* NUMBER */}

                <View
                  style={[
                    styles.moduleNumber,
                    unlocked &&
                      styles.moduleNumberUnlocked,
                    completed &&
                      styles.moduleNumberCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.moduleNumberText,
                      unlocked &&
                        styles.moduleNumberTextUnlocked,
                      completed &&
                        styles.moduleNumberTextCompleted,
                    ]}
                  >
                    {completed
                      ? "✓"
                      : !unlocked
                        ? "🔒"
                        : index + 1}
                  </Text>
                </View>

                {/* INFO */}

                <View
                  style={styles.moduleInfo}
                >
                  <Text
                    style={styles.moduleLabel}
                  >
                    MODULE {index + 1}
                  </Text>

                  <Text
                    style={[
                      styles.moduleTitle,
                      !unlocked &&
                        styles.lockedText,
                    ]}
                    numberOfLines={2}
                  >
                    {module.title}
                  </Text>

                  <Text
                    style={
                      styles.moduleDescription
                    }
                  >
                    {completed
                      ? "Module completed"
                      : !unlocked
                        ? "Complete previous module first"
                        : `${module.sectionCount} ${
                            module.sectionCount ===
                            1
                              ? "lesson"
                              : "lessons"
                          }`}
                  </Text>
                </View>

                {/* RIGHT STATUS */}

                <View
                  style={styles.statusArea}
                >
                  {completed ? (
                    <Text
                      style={
                        styles.completedStatus
                      }
                    >
                      DONE
                    </Text>
                  ) : unlocked ? (
                    <Text
                      style={
                        styles.openArrow
                      }
                    >
                      ›
                    </Text>
                  ) : (
                    <Text
                      style={
                        styles.lockIcon
                      }
                    >
                      🔒
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          },
        )}
      </View>

      {/* ====================================================
          PROGRESS LOADING
      ==================================================== */}

      {isProgressLoading &&
        !progress && (
          <View
            style={
              styles.progressLoading
            }
          >
            <ActivityIndicator
              size="small"
              color="#64748B"
            />

            <Text
              style={
                styles.progressLoadingText
              }
            >
              Loading progress...
            </Text>
          </View>
        )}

      {/* ====================================================
          PROGRESS ERROR
      ==================================================== */}

      {progressError &&
        !progress && (
          <View
            style={
              styles.progressErrorCard
            }
          >
            <Text
              style={
                styles.progressErrorText
              }
            >
              Progress could not be loaded.
              Pull down to refresh.
            </Text>
          </View>
        )}

      {/* ====================================================
          INFO
      ==================================================== */}

      <View
        style={styles.infoCard}
      >
        <View
          style={styles.infoIcon}
        >
          <Text
            style={styles.infoIconText}
          >
            i
          </Text>
        </View>

        <View
          style={styles.infoContent}
        >
          <Text
            style={styles.infoTitle}
          >
            Complete the lessons
          </Text>

          <Text
            style={styles.infoText}
          >
            Open an unlocked module and
            read each lesson page. Use Next
            to continue until the module is
            completed.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 29,
    paddingHorizontal: 18,
    paddingBottom: 100,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  backArrow: {
    marginTop: -3,
    fontSize: 28,
    lineHeight: 30,
    color: "#111827",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#64748B",
  },

  title: {
    marginTop: 3,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#111827",
  },

  // ==========================================================
  // INTRO
  // ==========================================================

  introCard: {
    padding: 19,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    marginBottom: 25,
  },

  introLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#FFFFFF",
  },

  introTitle: {
    marginTop: 7,
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  introText: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 17,
    color: "#CBD5E1",
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },

  countText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#475569",
  },

  // ==========================================================
  // MODULE
  // ==========================================================

  moduleList: {
    gap: 9,
  },

  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  moduleCardLocked: {
    backgroundColor: "#F1F5F9",
    opacity: 0.65,
  },

  moduleCardCompleted: {
    backgroundColor: "#F8FAFC",
  },

  moduleNumber: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginRight: 12,
  },

  moduleNumberUnlocked: {
    backgroundColor: "#111827",
  },

  moduleNumberCompleted: {
    backgroundColor: "#ECFDF5",
  },

  moduleNumberText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94A3B8",
  },

  moduleNumberTextUnlocked: {
    color: "#FFFFFF",
  },

  moduleNumberTextCompleted: {
    color: "#059669",
  },

  moduleInfo: {
    flex: 1,
    minWidth: 0,
  },

  moduleLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  moduleTitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#111827",
  },

  lockedText: {
    color: "#64748B",
  },

  moduleDescription: {
    marginTop: 4,
    fontSize: 8,
    color: "#94A3B8",
  },

  statusArea: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  openArrow: {
    fontSize: 25,
    color: "#94A3B8",
  },

  lockIcon: {
    fontSize: 13,
  },

  completedStatus: {
    fontSize: 7,
    fontWeight: "900",
    color: "#059669",
  },

  // ==========================================================
  // PROGRESS
  // ==========================================================

  progressLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    gap: 7,
  },

  progressLoadingText: {
    fontSize: 9,
    color: "#64748B",
  },

  progressErrorCard: {
    marginTop: 14,
    padding: 11,
    borderRadius: 13,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  progressErrorText: {
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    color: "#B91C1C",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoCard: {
    flexDirection: "row",
    marginTop: 22,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
    marginRight: 10,
  },

  infoIconText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2563EB",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  infoText: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 15,
    color: "#3B82F6",
  },

  // ==========================================================
  // CENTER
  // ==========================================================

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 11,
    color: "#64748B",
  },

  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorIconText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#DC2626",
  },

  errorTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  errorText: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    color: "#64748B",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#111827",
  },

  retryButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});