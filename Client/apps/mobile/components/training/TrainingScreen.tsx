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

type Flow =
  | "none"
  | "details"
  | "form"
  | "review";


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
  ] = useState<Screen>(
    "available"
  );

  const [
    flow,
    setFlow,
  ] = useState<Flow>(
    "none"
  );

  const [
    selectedTrainingId,
    setSelectedTrainingId,
  ] = useState<string | null>(
    null
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
  // REAL API
  //
  // GET /api/training-batches
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
  // REAL API
  //
  // GET /api/enrollments/me
  // POST /api/enrollments
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
const hasActiveEnrollment =
  useMemo(() => {

    return enrollments.some(
      (enrollment) => {

        const status =
          String(
            enrollment.status
          ).toLowerCase();

        return (
          status === "pending" ||
          status === "documentsrequired" ||
          status === "underreview" ||
          status === "needscorrection" ||
          status === "approved"
        );

      }
    );

  }, [enrollments]);
useEffect(() => {

  refreshMyEnrollments()
    .catch((error) => {

      console.error(
        "FAILED TO LOAD MY ENROLLMENTS:",
        error
      );

    });

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
  // OPEN TRAINING DETAILS
  // ========================================================

  const openTraining = (
    training: TrainingBatch
  ) => {

    setSelectedTrainingId(
      training.id
    );

    setFlow(
      "details"
    );
  };


  // ========================================================
  // BACK TO MAIN
  // ========================================================

  const backToMain = () => {

    setSelectedTrainingId(
      null
    );

    setFlow(
      "none"
    );
  };


 const startEnrollment = () => {

  if (!selectedTraining) {
    return;
  }


  // ======================================================
  // CHECK ACTIVE ENROLLMENT
  // ======================================================

  const activeEnrollment =
    enrollments.find(
      (enrollment) => {

        const status =
          String(
            enrollment.status
          ).toLowerCase();

        return (
          status === "pending" ||
          status === "documentsrequired" ||
          status === "underreview" ||
          status === "needscorrection" ||
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
      status === "documentsrequired"
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


  // ======================================================
  // CHECK CAPACITY
  // ======================================================

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




  setFlow(
    "form"
  );
};


  const handleFormContinue = (
    data: EnrollmentFormData
  ) => {

    setFormData(
      data
    );

    setFlow(
      "review"
    );
  };


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


    // =====================================================
    // CHECK DUPLICATE ENROLLMENT
    // =====================================================

    const existingEnrollment =
      enrollments.find(
        enrollment =>
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


    // =====================================================
    // CHECK CAPACITY
    // =====================================================

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


    // =====================================================
    // CHECK REQUIRED DOCUMENTS
    //
    // EnrollmentForm already validates these,
    // but we check again before the actual API call.
    // =====================================================

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

      // ===================================================
      // STEP 1
      // CREATE ENROLLMENT
      // ===================================================

      const enrollment =
        await createEnrollment({
          trainingBatchId:
            selectedTraining.id,
        });


      console.log(
        "ENROLLMENT CREATED:",
        enrollment.id
      );


      // ===================================================
      // STEP 2
      // UPLOAD DOCUMENTS
      //
      // POST
      // /api/enrollments/{enrollmentId}/documents
      //
      // FormData:
      // RequirementId
      // File
      // ===================================================

      for (
        const document
        of formData.documents
      ) {

        const uploadData =
          new FormData();


        // -------------------------------------------------
        // RequirementId
        // -------------------------------------------------

        uploadData.append(
          "RequirementId",
          document.requirementId
        );


        // -------------------------------------------------
        // File
        // -------------------------------------------------

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


        console.log(
          "UPLOADING DOCUMENT:",
          document.requirementName
        );


        await enrollmentApi.uploadDocument(
          enrollment.id,
          uploadData
        );


        console.log(
          "DOCUMENT UPLOADED:",
          document.requirementName
        );
      }


      // ===================================================
      // STEP 3
      // REFRESH ENROLLMENTS
      // ===================================================

      await refreshMyEnrollments();


      // ===================================================
      // STEP 4
      // REFRESH TRAINING BATCHES
      // ===================================================

      await refresh();


      // ===================================================
      // SUCCESS
      // ===================================================

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

              setFlow(
                "none"
              );

              setScreen(
                "enrollment"
              );

              setFormData({
                participantName: "",
                email: "",
                mobileNumber: "",
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
          setFlow(
            "form"
          )
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

      {/* ==========================================
          HEADER
      ========================================== */}

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


      {/* ==========================================
          TABS
      ========================================== */}

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

          label="My Enrollmet"

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
            setScreen(
              "active"
            )
          }
        />

      </View>


      {/* ==========================================
          AVAILABLE
      ========================================== */}

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


      {/* ==========================================
          MY ENROLLMENT
      ========================================== */}

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


      {/* ==========================================
          ACTIVE
      ========================================== */}

      {screen ===
        "active" && (
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
              Active Training
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Trainings approved by the
              administrator.
            </Text>

          </View>


          {activeEnrollments.length ===
          0 ? (

            <EmptyState
              title="No Active Training"
              description="Once your enrollment is approved, your training will appear here."
            />

          ) : (

            activeEnrollments.map(
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

    </ScrollView>
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
        name={
          icon
        }

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

    eyebrow: {
      fontSize: 7,
      fontWeight: "900",
      letterSpacing: 1.3,
      color: "#2563EB",
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