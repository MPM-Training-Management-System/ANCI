import React, {
  useCallback,
  useEffect,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  useEnrollments,
} from "@repo/hooks";

import {
  enrollmentApi,
  learningMaterialApi
} from "@/api/api";


import {
  useLearningMaterials,
} from "@repo/hooks";


// ============================================================
// SCREEN
// ============================================================

export default function LearningScreen() {

  // ==========================================================
  // MY ENROLLMENTS
  //
  // GET /api/enrollments/me
  // ==========================================================

  const {
    enrollments,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
    refreshMyEnrollments,
  } = useEnrollments(
    enrollmentApi,
  );


  // ==========================================================
  // LEARNING MATERIALS
  // ==========================================================

  const {
    learningMaterials,
    isLoading: materialsLoading,
    error: materialsError,
    loadLearningMaterials,
  } = useLearningMaterials(
    learningMaterialApi,
  );


  // ==========================================================
  // LOAD MY ENROLLMENTS
  // ==========================================================

  useEffect(() => {

    refreshMyEnrollments()
      .catch((error) => {

        console.error(
          "FAILED TO LOAD MY ENROLLMENTS:",
          error,
        );

      });

  }, [
    refreshMyEnrollments,
  ]);


  // ==========================================================
  // CURRENT APPROVED ENROLLMENT
  // ==========================================================

  const currentEnrollment =
    useMemo(() => {

      return (
        enrollments.find(
          (enrollment) =>
            String(
              enrollment.status,
            ).toLowerCase() ===
            "approved",
        ) ?? null
      );

    }, [
      enrollments,
    ]);


  // ==========================================================
  // CURRENT TRAINING BATCH ID
  // ==========================================================

  const trainingBatchId =
    currentEnrollment?.trainingBatchId ??
    null;


  // ==========================================================
  // LOAD LEARNING MATERIALS
  // ==========================================================

  const loadMaterials =
    useCallback(
      async () => {

        if (!trainingBatchId) {
          return;
        }

        try {

          await loadLearningMaterials(
            trainingBatchId,
          );

        } catch (error) {

          console.error(
            "FAILED TO LOAD LEARNING MATERIALS:",
            error,
          );

        }

      },
      [
        trainingBatchId,
        loadLearningMaterials,
      ],
    );


  // ==========================================================
  // LOAD MATERIALS WHEN APPROVED TRAINING EXISTS
  // ==========================================================

  useEffect(() => {

    if (!trainingBatchId) {
      return;
    }

    void loadMaterials();

  }, [
    trainingBatchId,
    loadMaterials,
  ]);


  // ==========================================================
  // OPEN MATERIAL
  // ==========================================================

  const handleOpenMaterial =
    (
      materialId: string,
    ) => {

      router.push({
        pathname:
          "/learning/material",
        params: {
          materialId,
        },
      });

    };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {

      try {

        const result =
          await refreshMyEnrollments();

        const approvedEnrollment =
          result.find(
            (enrollment) =>
              String(
                enrollment.status,
              ).toLowerCase() ===
              "approved",
          );

        if (
          approvedEnrollment?.trainingBatchId
        ) {

          await loadLearningMaterials(
            approvedEnrollment.trainingBatchId,
          );

        }

      } catch (error) {

        console.error(
          "FAILED TO REFRESH LEARNING:",
          error,
        );

      }

    };


  // ==========================================================
  // LOADING ENROLLMENT
  // ==========================================================

  if (
    enrollmentsLoading &&
    enrollments.length === 0
  ) {

    return (
      <View
        style={styles.centerContainer}
      >

        <ActivityIndicator
          size="large"
          color="#111827"
        />

        <Text
          style={styles.loadingText}
        >
          Checking your training...
        </Text>

      </View>
    );

  }


  // ==========================================================
  // NO APPROVED TRAINING
  // ==========================================================

  if (!currentEnrollment) {

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.emptyContent
        }
        showsVerticalScrollIndicator={false}
      >

        <View
          style={styles.emptyIcon}
        >

          <Text
            style={styles.emptyIconText}
          >
            ▣
          </Text>

        </View>

        <Text
          style={styles.emptyTitle}
        >
          No Training Selected
        </Text>

        <Text
          style={styles.emptyMessage}
        >
          You don't have an approved training
          enrollment yet. Once your enrollment
          is approved, your learning materials
          will appear here automatically.
        </Text>


        {/* ====================================================
            REFRESH
        ==================================================== */}

        <Pressable
          onPress={() =>
            void handleRefresh()
          }
          style={styles.refreshButton}
        >

          <Text
            style={styles.refreshButtonText}
          >
            Refresh Enrollment
          </Text>

        </Pressable>

      </ScrollView>
    );

  }


  // ==========================================================
  // MATERIAL LOADING
  // ==========================================================

  if (
    materialsLoading &&
    learningMaterials.length === 0
  ) {

    return (
      <View
        style={styles.centerContainer}
      >

        <ActivityIndicator
          size="large"
          color="#111827"
        />

        <Text
          style={styles.loadingText}
        >
          Loading your learning materials...
        </Text>

      </View>
    );

  }


  // ==========================================================
  // MATERIAL ERROR
  // ==========================================================

  if (
    materialsError &&
    learningMaterials.length === 0
  ) {

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.emptyContent
        }
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
          style={styles.emptyTitle}
        >
          Unable to Load Materials
        </Text>

        <Text
          style={styles.emptyMessage}
        >
          {materialsError.message}
        </Text>

        <Pressable
          onPress={() =>
            void loadMaterials()
          }
          style={styles.refreshButton}
        >

          <Text
            style={styles.refreshButtonText}
          >
            Try Again
          </Text>

        </Pressable>

      </ScrollView>
    );

  }


  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >

        <Text
          style={styles.eyebrow}
        >
          MY TRAINING
        </Text>

        <Text
          style={styles.title}
        >
          Learning
        </Text>

        <Text
          style={styles.subtitle}
        >
          Continue learning from your
          assigned training materials.
        </Text>

      </View>


      {/* ======================================================
          CURRENT TRAINING
      ====================================================== */}

      <View
        style={styles.trainingCard}
      >

        <View
          style={styles.trainingIcon}
        >

          <Text
            style={styles.trainingIconText}
          >
            ✓
          </Text>

        </View>

        <View
          style={styles.trainingInfo}
        >

          <Text
            style={styles.trainingLabel}
          >
            CURRENT TRAINING
          </Text>

          <Text
            style={styles.trainingTitle}
            numberOfLines={2}
          >
            {currentEnrollment.programName}
          </Text>

          <Text
            style={styles.batchCode}
          >
            Batch: {currentEnrollment.batchCode}
          </Text>

        </View>

        <View
          style={styles.approvedBadge}
        >

          <Text
            style={styles.approvedText}
          >
            APPROVED
          </Text>

        </View>

      </View>


      {/* ======================================================
          MATERIAL SUMMARY
      ====================================================== */}

      <View
        style={styles.summaryCard}
      >

        <View>

          <Text
            style={styles.summaryLabel}
          >
            LEARNING MATERIALS
          </Text>

          <Text
            style={styles.summaryNumber}
          >
            {learningMaterials.length}
          </Text>

          <Text
            style={styles.summaryDescription}
          >
            Published resources for your training
          </Text>

        </View>

        <View
          style={styles.summaryIcon}
        >

          <Text
            style={styles.summaryIconText}
          >
            ▣
          </Text>

        </View>

      </View>


      {/* ======================================================
          MATERIAL HEADER
      ====================================================== */}

      <View
        style={styles.sectionHeader}
      >

        <View>

          <Text
            style={styles.sectionTitle}
          >
            Your Materials
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            Select a material to start learning
          </Text>

        </View>

      </View>


      {/* ======================================================
          EMPTY MATERIALS
      ====================================================== */}

      {learningMaterials.length === 0 ? (

        <View
          style={styles.emptyMaterialCard}
        >

          <View
            style={styles.materialEmptyIcon}
          >

            <Text
              style={styles.materialEmptyIconText}
            >
              □
            </Text>

          </View>

          <Text
            style={styles.emptyMaterialTitle}
          >
            No Learning Materials Yet
          </Text>

          <Text
            style={styles.emptyMaterialText}
          >
            Your trainer has not published any
            learning materials for this training.
          </Text>

        </View>

      ) : (

        <View
          style={styles.materialList}
        >

          {learningMaterials.map(
            (material) => (

              <Pressable
                key={material.id}
                onPress={() =>
                  handleOpenMaterial(
                    material.id,
                  )
                }
                style={({ pressed }) => [
                  styles.materialCard,
                  pressed &&
                    styles.materialCardPressed,
                ]}
              >

                {/* FILE ICON */}

                <View
                  style={styles.fileIcon}
                >

                  <Text
                    style={styles.fileIconText}
                  >
                    {getFileLabel(
                      material.materialType,
                      material.fileName,
                    )}
                  </Text>

                </View>


                {/* INFORMATION */}

                <View
                  style={styles.materialInfo}
                >

                  <Text
                    style={styles.materialTitle}
                    numberOfLines={2}
                  >
                    {material.title}
                  </Text>


                  {material.description && (

                    <Text
                      style={
                        styles.materialDescription
                      }
                      numberOfLines={2}
                    >
                      {material.description}
                    </Text>

                  )}


                  <View
                    style={styles.metaRow}
                  >

                    <Text
                      style={styles.materialType}
                    >
                      {material.materialType}
                    </Text>

                    {material.fileSize != null && (

                      <Text
                        style={styles.fileSize}
                      >
                        {" • "}
                        {formatFileSize(
                          material.fileSize,
                        )}
                      </Text>

                    )}

                  </View>

                </View>


                {/* ARROW */}

                <View
                  style={styles.arrowButton}
                >

                  <Text
                    style={styles.arrowText}
                  >
                    →
                  </Text>

                </View>

              </Pressable>

            ),
          )}

        </View>

      )}


      {/* ======================================================
          INFO
      ====================================================== */}

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
            Training Learning
          </Text>

          <Text
            style={styles.infoText}
          >
            These materials belong to your
            currently approved training batch.
          </Text>

        </View>

      </View>

    </ScrollView>
  );
}


// ============================================================
// FILE LABEL
// ============================================================

function getFileLabel(
  materialType: string,
  fileName: string | null,
): string {

  const type =
    materialType
      ?.toLowerCase()
      .trim();

  const name =
    fileName
      ?.toLowerCase()
      .trim() ?? "";


  if (
    type === "pdf" ||
    name.endsWith(".pdf")
  ) {
    return "PDF";
  }


  if (
    type === "presentation" ||
    type === "ppt" ||
    type === "pptx" ||
    name.endsWith(".ppt") ||
    name.endsWith(".pptx")
  ) {
    return "PPT";
  }


  if (
    type === "document" ||
    type === "doc" ||
    type === "docx" ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "DOC";
  }


  if (
    type === "video" ||
    name.endsWith(".mp4") ||
    name.endsWith(".mov")
  ) {
    return "VID";
  }


  return "FILE";
}


// ============================================================
// FILE SIZE
// ============================================================

function formatFileSize(
  bytes: number,
): string {

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  if (
    bytes <
    1024 * 1024 * 1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
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
    paddingTop: 30,
    paddingHorizontal: 18,
    paddingBottom: 100,
  },

  emptyContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
    backgroundColor: "#F8FAFC",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#64748B",
    marginBottom: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#111827",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    color: "#64748B",
  },

  // ==========================================================
  // TRAINING
  // ==========================================================

  trainingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  trainingIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    marginRight: 11,
  },

  trainingIconText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#059669",
  },

  trainingInfo: {
    flex: 1,
  },

  trainingLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  trainingTitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#111827",
  },

  batchCode: {
    marginTop: 3,
    fontSize: 9,
    color: "#64748B",
  },

  approvedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
    marginLeft: 7,
  },

  approvedText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#059669",
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    marginBottom: 25,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FFFFFF",
  },

  summaryNumber: {
    marginTop: 3,
    fontSize: 29,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  summaryDescription: {
    marginTop: 2,
    fontSize: 10,
    color: "#FFFFFF",
  },

  summaryIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  summaryIconText: {
    fontSize: 20,
    color: "#2563EB",
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionHeader: {
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

  // ==========================================================
  // MATERIAL
  // ==========================================================

  materialList: {
    gap: 10,
  },

  materialCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  materialCardPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  fileIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginRight: 12,
  },

  fileIconText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#475569",
  },

  materialInfo: {
    flex: 1,
    minWidth: 0,
  },

  materialTitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    color: "#111827",
  },

  materialDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: "#64748B",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  materialType: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },

  fileSize: {
    fontSize: 8,
    color: "#94A3B8",
  },

  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginLeft: 8,
  },

  arrowText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  // ==========================================================
  // EMPTY MATERIAL
  // ==========================================================

  emptyMaterialCard: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 25,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  materialEmptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  materialEmptyIconText: {
    fontSize: 20,
    color: "#94A3B8",
  },

  emptyMaterialTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  emptyMaterialText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoCard: {
    flexDirection: "row",
    marginTop: 20,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  infoIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
    marginRight: 10,
  },

  infoIconText: {
    fontSize: 13,
    fontWeight: "800",
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
    fontSize: 10,
    lineHeight: 16,
    color: "#3B82F6",
  },

  // ==========================================================
  // EMPTY / ERROR
  // ==========================================================

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  emptyIconText: {
    fontSize: 23,
    color: "#64748B",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },

  emptyMessage: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    color: "#64748B",
  },

  refreshButton: {
    marginTop: 19,
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#111827",
  },

  refreshButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  errorIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorIconText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#DC2626",
  },

});