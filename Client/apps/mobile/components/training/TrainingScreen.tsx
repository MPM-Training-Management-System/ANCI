import React, {
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import TrainingCard from "./TrainingCard";
import TrainingDetails from "./TrainingDetails";
import EnrollmentForm, {
  type EnrollmentFormData,
} from "./EnrollmentForm";
import EnrollmentReview from "./EnrollmentReview";
import EnrollmentStatusCard from "./EnrollmentStatusCard";

import {
  mockParticipantTrainings,
  type ParticipantTraining,
} from "@/src/data/participantTraining";

import {
  mockParticipantEnrollments,
  type ParticipantEnrollment,
} from "@/src/data/participantEnrollment";

type Screen =
  | "available"
  | "enrollment"
  | "active";

type Flow =
  | "none"
  | "details"
  | "form"
  | "review";

export default function TrainingScreen() {
  const [screen, setScreen] =
    useState<Screen>(
      "available"
    );

  const [flow, setFlow] =
    useState<Flow>("none");

  const [
    selectedTrainingId,
    setSelectedTrainingId,
  ] = useState<string | null>(
    null
  );

  const [
    enrollments,
    setEnrollments,
  ] = useState<
    ParticipantEnrollment[]
  >(
    mockParticipantEnrollments
  );

  const [
    formData,
    setFormData,
  ] = useState<EnrollmentFormData>({
    participantName:
      "Ralph Joed Nagal Gerente",

    email:
      "ralphjoedg@gmail.com",

    mobileNumber:
      "09123456789",

    mode: "Hybrid",
  });

  const selectedTraining =
    useMemo(() => {
      if (
        selectedTrainingId ===
        null
      ) {
        return null;
      }

      return (
        mockParticipantTrainings.find(
          (training) =>
            training.id ===
            selectedTrainingId
        ) ?? null
      );
    }, [
      selectedTrainingId,
    ]);

  const activeEnrollments =
    enrollments.filter(
      (enrollment) =>
        enrollment.status ===
        "Approved"
    );

  /*
   * ==========================================================
   * OPEN TRAINING
   * ==========================================================
   */

  const openTraining = (
    training: ParticipantTraining
  ) => {
    setSelectedTrainingId(
      training.id
    );

    setFlow("details");
  };

  /*
   * ==========================================================
   * BACK TO MAIN
   * ==========================================================
   */

  const backToMain = () => {
    setSelectedTrainingId(
      null
    );

    setFlow("none");
  };

  /*
   * ==========================================================
   * START ENROLLMENT
   * ==========================================================
   */

  const startEnrollment = () => {
    if (!selectedTraining) {
      return;
    }

    const existing =
      enrollments.find(
        (enrollment) =>
          enrollment.trainingId ===
          selectedTraining.id
      );

    if (existing) {
      Alert.alert(
        "Already Enrolled",
        `You already have a ${existing.status.toLowerCase()} enrollment for this training.`
      );

      return;
    }

    setFlow("form");
  };

  /*
   * ==========================================================
   * FORM → REVIEW
   * ==========================================================
   */

  const handleFormContinue = (
    data: EnrollmentFormData
  ) => {
    setFormData(data);

    setFlow("review");
  };

  /*
   * ==========================================================
   * REVIEW → SUBMIT
   * ==========================================================
   */

  const submitEnrollment = () => {
    if (!selectedTraining) {
      return;
    }

    const newEnrollment:
      ParticipantEnrollment = {
      id: `ENR-${String(
        enrollments.length + 1
      ).padStart(3, "0")}`,

      trainingId:
        selectedTraining.id,

      trainingCode:
        selectedTraining.code,

      trainingTitle:
        selectedTraining.title,

      participantName:
        formData.participantName,

      email:
        formData.email,

      mobileNumber:
        formData.mobileNumber,

      trainer:
        selectedTraining.trainer,

      mode:
        formData.mode,

      schedule:
        selectedTraining.schedule,

      time:
        selectedTraining.time,

      location:
        selectedTraining.location,

      duration:
        selectedTraining.duration,

      submittedAt:
        new Date().toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        ),

      status:
        "Pending",

      startDate:
        selectedTraining.startDate,

      endDate:
        selectedTraining.endDate,
    };

    setEnrollments(
      (previous) => [
        ...previous,
        newEnrollment,
      ]
    );

    setSelectedTrainingId(
      null
    );

    setFlow("none");

    setScreen("enrollment");

    Alert.alert(
      "Enrollment Submitted",
      "Your enrollment application has been submitted successfully and is now pending administrator review."
    );
  };

  /*
   * ==========================================================
   * OPEN APPROVED TRAINING
   * ==========================================================
   */

  const openApprovedTraining = (
    enrollment: ParticipantEnrollment
  ) => {
    Alert.alert(
      "Training Ready",
      `Opening ${enrollment.trainingTitle}.`
    );
  };

  /*
   * ==========================================================
   * ENROLLMENT FORM
   * ==========================================================
   */

  if (
    flow === "form" &&
    selectedTraining
  ) {
    return (
      <EnrollmentForm
        training={
          selectedTraining
        }
        initialData={formData}
        onBack={() =>
          setFlow("details")
        }
        onContinue={
          handleFormContinue
        }
      />
    );
  }

  /*
   * ==========================================================
   * ENROLLMENT REVIEW
   * ==========================================================
   */

  if (
    flow === "review" &&
    selectedTraining
  ) {
    return (
      <EnrollmentReview
        training={
          selectedTraining
        }
        formData={formData}
        onBack={() =>
          setFlow("form")
        }
        onSubmit={
          submitEnrollment
        }
      />
    );
  }

  /*
   * ==========================================================
   * TRAINING DETAILS
   * ==========================================================
   */

  if (
    flow === "details" &&
    selectedTraining
  ) {
    const alreadyEnrolled =
      enrollments.some(
        (enrollment) =>
          enrollment.trainingId ===
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

  /*
   * ==========================================================
   * MAIN TRAINING SCREEN
   * ==========================================================
   */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            PARTICIPANT PORTAL
          </Text>

          <Text style={styles.headerTitle}>
            Training
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Find and manage your training
            programs.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="school-outline"
            size={20}
            color="#2563EB"
          />
        </View>
      </View>

      {/* TABS */}

      <View style={styles.segment}>
        <SegmentButton
          active={
            screen === "available"
          }
          icon="search-outline"
          label="Available"
          onPress={() =>
            setScreen("available")
          }
        />

        <SegmentButton
          active={
            screen === "enrollment"
          }
          icon="document-text-outline"
          label="My Enrollment"
          onPress={() =>
            setScreen("enrollment")
          }
        />

        <SegmentButton
          active={
            screen === "active"
          }
          icon="school-outline"
          label="Active"
          onPress={() =>
            setScreen("active")
          }
        />
      </View>

      {/* ======================================================
          AVAILABLE TRAININGS
      ====================================================== */}

      {screen === "available" && (
        <>
          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryLabel}>
                AVAILABLE TRAININGS
              </Text>

              <Text style={styles.summaryValue}>
                {
                  mockParticipantTrainings.length
                }
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="library-outline"
                size={22}
                color="#2563EB"
              />
            </View>
          </View>

          {mockParticipantTrainings.map(
            (training) => (
              <TrainingCard
                key={training.id}
                training={training}
                onPress={() =>
                  openTraining(
                    training
                  )
                }
              />
            )
          )}
        </>
      )}

      {/* ======================================================
          MY ENROLLMENT
      ====================================================== */}

      {screen === "enrollment" && (
        <>
          <View style={styles.sectionHeader}>
            <Text
              style={styles.sectionTitle}
            >
              My Enrollment
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Track your training
              applications.
            </Text>
          </View>

          {enrollments.length ===
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

      {/* ======================================================
          ACTIVE TRAINING
      ====================================================== */}

      {screen === "active" && (
        <>
          <View style={styles.sectionHeader}>
            <Text
              style={styles.sectionTitle}
            >
              Active Training
            </Text>

            <Text
              style={styles.sectionSubtitle}
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

/* ============================================================
   SEGMENT
============================================================ */

function SegmentButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
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

/* ============================================================
   EMPTY
============================================================ */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="document-outline"
          size={27}
          color="#94A3B8"
        />
      </View>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptyText}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingBottom: 90,
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
});