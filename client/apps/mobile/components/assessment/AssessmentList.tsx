"use client";

import React, {
  useCallback,
  useEffect,
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

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { apiClient } from "@/api/api";

import {
  useWrittenAssessment,
} from "@repo/hooks";

import type {
  ParticipantAssessment,
} from "@repo/types";

import AssessmentHeader from "./AssessmentHeader";
import AssessmentCard from "./AssessmentCard";

// ============================================================
// TYPES
// ============================================================

type RouteParams = {
  trainingBatchId?: string | string[];
};

// ============================================================
// HELPERS
// ============================================================

function getParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AssessmentList() {
  const params =
    useLocalSearchParams<RouteParams>();

  const trainingBatchId =
    getParamValue(
      params.trainingBatchId,
    );

  const {
    isLoading,
    error,
    loadByBatchIdParticipantAssessment,
    clearError,
  } = useWrittenAssessment(
    apiClient,
  );

  const [
    assessments,
    setAssessments,
  ] = useState<ParticipantAssessment[]>(
    [],
  );

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  // ==========================================================
  // LOAD PUBLISHED ASSESSMENTS
  // ==========================================================

  const loadAssessments =
    useCallback(async () => {
      if (!trainingBatchId) {
        return;
      }

      try {
        const data =
          await loadByBatchIdParticipantAssessment(
            trainingBatchId,
          );

        /*
         * Backend already filters:
         *
         * x.TrainingBatchId == trainingBatchId
         * x.IsPublished
         *
         * But we also filter here as an extra
         * frontend safety check.
         */
        const publishedAssessments =
          data.filter(
            assessment =>
              assessment.isPublished,
          );

        setAssessments(
          publishedAssessments,
        );
      } catch {
        /*
         * Hook already handles error state.
         */
      }
    }, [
      trainingBatchId,
      loadByBatchIdParticipantAssessment,
    ]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    useCallback(async () => {
      setIsRefreshing(true);

      try {
        await loadAssessments();
      } finally {
        setIsRefreshing(false);
      }
    }, [loadAssessments]);

  // ==========================================================
  // OPEN ASSESSMENT
  // ==========================================================

  const handleOpenAssessment =
    useCallback(
      (
        assessmentId: string,
      ) => {
      router.push({
  pathname: "/assessment/[id]",
  params: {
    id: assessmentId,
  },
});
      },
      [],
    );

  // ==========================================================
  // MISSING BATCH
  // ==========================================================

  if (!trainingBatchId) {
    return (
      <View
        style={styles.centerContainer}
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
          Training Batch Not Found
        </Text>

        <Text
          style={styles.errorText}
        >
          The training batch ID is missing.
        </Text>
      </View>
    );
  }

  // ==========================================================
  // INITIAL LOADING
  // ==========================================================

  if (
    isLoading &&
    assessments.length === 0
  ) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.loadingContainer
        }
      >
        <AssessmentHeader />

        <ActivityIndicator
          size="large"
        />

        <Text
          style={styles.loadingText}
        >
          Loading assessments...
        </Text>
      </ScrollView>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    assessments.length === 0
  ) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.errorContainer
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
        <AssessmentHeader />

        <View
          style={styles.errorBox}
        >
          <View
            style={styles.errorIcon}
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
            style={styles.errorTitle}
          >
            Something went wrong
          </Text>

          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => {
              clearError();
              loadAssessments();
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
      </ScrollView>
    );
  }

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (
    assessments.length === 0
  ) {
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
        <AssessmentHeader />

        <View
          style={styles.emptyContainer}
        >
          <View
            style={styles.emptyIcon}
          >
            <Text
              style={styles.emptyIconText}
            >
              ✓
            </Text>
          </View>

          <Text
            style={styles.emptyTitle}
          >
            No Assessments Available
          </Text>

          <Text
            style={styles.emptyText}
          >
            There are no published assessments
            available for this training batch yet.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // ==========================================================
  // ASSESSMENT LIST
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
      <AssessmentHeader />

      <View
        style={styles.listHeader}
      >
        <Text
          style={styles.listTitle}
        >
          Available Assessments
        </Text>

        <Text
          style={styles.listCount}
        >
          {assessments.length}{" "}
          {assessments.length === 1
            ? "assessment"
            : "assessments"}
        </Text>
      </View>

      <View
        style={styles.list}
      >
        {assessments.map(
          assessment => (
            <Pressable
              key={assessment.id}
              onPress={() =>
                handleOpenAssessment(
                  assessment.id,
                )
              }
              style={
                styles.cardWrapper
              }
            >
              <AssessmentCard
                assessment={
                  assessment
                }
              />
            </Pressable>
          ),
        )}
      </View>

      {error ? (
        <View
          style={styles.inlineError}
        >
          <Text
            style={
              styles.inlineErrorText
            }
          >
            {error}
          </Text>
        </View>
      ) : null}
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },

  loadingText: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 14,
    color: "#64748B",
  },

  // ==========================================================
  // LIST HEADER
  // ==========================================================

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  listCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  // ==========================================================
  // LIST
  // ==========================================================

  list: {
    paddingHorizontal: 20,
    gap: 12,
  },

  cardWrapper: {
    width: "100%",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 70,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E7FF",
    marginBottom: 18,
  },

  emptyIconText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#4F46E5",
  },

  emptyTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    maxWidth: 330,
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },

  errorBox: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorIconText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#DC2626",
  },

  errorTitle: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  errorText: {
    maxWidth: 330,
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  retryButton: {
    minHeight: 50,
    marginTop: 22,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
  },

  retryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  inlineError: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  inlineErrorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#B91C1C",
  },
});