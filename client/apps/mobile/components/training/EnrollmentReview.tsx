import React from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  TrainingBatch,
} from "@repo/types";

import type {
  EnrollmentFormData,
} from "./EnrollmentForm";


// =========================================================
// PROPS
// =========================================================
interface Props {
  training: TrainingBatch;
  formData: EnrollmentFormData;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
}


// =========================================================
// COMPONENT
// =========================================================

export default function EnrollmentReview({
  training,
  formData,
  onBack,
  onSubmit,
  isSubmitting,
}: Props) {

  // =======================================================
  // CONFIRM SUBMIT
  // =======================================================

 const handleSubmit = () => {
  if (isSubmitting) {
    return;
  }

  Alert.alert(
    "Submit Enrollment",
    "Are you sure you want to submit this enrollment application?",
    [
      {
        text: "Review Again",
        style: "cancel",
      },
      {
        text: "Submit",
        onPress: onSubmit,
      },
    ]
  );
};

  // =======================================================
  // AVAILABLE SLOTS
  // =======================================================

  const availableSlots = Math.max(
    training.capacity -
      training.enrolledCount,
    0
  );


  // =======================================================
  // DATE RANGE
  // =======================================================

  const dateRange =
    `${formatDate(training.startDate)} – ${formatDate(
      training.endDate
    )}`;


  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =====================================
            HEADER
        ===================================== */}

        <View style={styles.header}>

          <Pressable
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#0F172A"
            />
          </Pressable>


          <View style={styles.headerText}>

            <Text style={styles.step}>
              STEP 2 OF 2
            </Text>

            <Text style={styles.title}>
              Review Application
            </Text>

            <Text style={styles.subtitle}>
              Check your information before
              submitting.
            </Text>

          </View>

        </View>


        {/* =====================================
            SELECTED TRAINING
        ===================================== */}

        <View style={styles.trainingCard}>

          <View style={styles.trainingIcon}>

            <Ionicons
              name="school-outline"
              size={21}
              color="#2563EB"
            />

          </View>


          <View style={styles.trainingContent}>

            <Text style={styles.trainingLabel}>
              SELECTED TRAINING
            </Text>


            <Text style={styles.trainingTitle}>
              {training.programName}
            </Text>


            <Text style={styles.trainingCode}>
              Batch: {training.batchCode}
            </Text>

          </View>

        </View>


        {/* =====================================
            PARTICIPANT INFORMATION
        ===================================== */}

        <Section
          title="Participant Information"
        >

          <ReviewItem
            label="Full Name"
            value={
              formData.participantName
            }
            icon="person-outline"
          />


          <ReviewItem
            label="Email"
            value={
              formData.email
            }
            icon="mail-outline"
          />


          <ReviewItem
            label="Mobile Number"
            value={
              formData.mobileNumber
            }
            icon="call-outline"
          />

        </Section>


        {/* =====================================
            TRAINING INFORMATION
        ===================================== */}

        <Section
          title="Training Information"
        >

          <ReviewItem
            label="Training Program"
            value={
              training.programName
            }
            icon="school-outline"
          />


          <ReviewItem
            label="Batch Code"
            value={
              training.batchCode
            }
            icon="pricetag-outline"
          />


          <ReviewItem
            label="Location"
            value={
              training.location ??
              "Not specified"
            }
            icon="location-outline"
          />


          <ReviewItem
            label="Training Period"
            value={dateRange}
            icon="calendar-outline"
          />


          <ReviewItem
            label="Available Slots"
            value={
              `${availableSlots} slots remaining`
            }
            icon="people-outline"
          />


          <ReviewItem
            label="Capacity"
            value={
              `${training.capacity} participants`
            }
            icon="people-circle-outline"
          />


          <ReviewItem
            label="Current Enrollment"
            value={
              `${training.enrolledCount} participants`
            }
            icon="person-add-outline"
          />

        </Section>


        {/* =====================================
            NOTICE
        ===================================== */}

        <View style={styles.notice}>

          <View style={styles.noticeIcon}>

            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#2563EB"
            />

          </View>


          <View style={styles.noticeContent}>

            <Text style={styles.noticeTitle}>
              Before you submit
            </Text>


            <Text style={styles.noticeText}>
              Your application will be sent to
              the administrator for review.
              Approval is required before you
              can access the training.
            </Text>

          </View>

        </View>


        {/* =====================================
            SUBMIT BUTTON
        ===================================== */}

       <Pressable
  onPress={handleSubmit}
  disabled={isSubmitting}
  style={[
    styles.submitButton,
    isSubmitting && styles.submitButtonDisabled,
  ]}
>
  {isSubmitting ? (
    <ActivityIndicator
      size="small"
      color="#FFFFFF"
    />
  ) : (
    <Ionicons
      name="send-outline"
      size={18}
      color="#FFFFFF"
    />
  )}

  <Text style={styles.submitText}>
    {isSubmitting
      ? "Submitting..."
      : "Submit Enrollment"}
  </Text>
</Pressable>


        {/* =====================================
            BOTTOM NOTE
        ===================================== */}

        <Text style={styles.bottomNote}>
          By submitting this application, you
          confirm that the information provided
          is accurate.
        </Text>

      </ScrollView>

    </View>
  );
}


// =========================================================
// SECTION
// =========================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {

  return (
    <View style={styles.section}>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {children}

    </View>
  );
}


// =========================================================
// REVIEW ITEM
// =========================================================

function ReviewItem({
  label,
  value,
  icon,
}: {
  label: string;

  value: string;

  icon:
    keyof typeof Ionicons.glyphMap;
}) {

  return (
    <View style={styles.reviewItem}>

      <View style={styles.reviewIcon}>

        <Ionicons
          name={icon}
          size={16}
          color="#2563EB"
        />

      </View>


      <View style={styles.reviewContent}>

        <Text style={styles.reviewLabel}>
          {label}
        </Text>


        <Text style={styles.reviewValue}>
          {value}
        </Text>

      </View>

    </View>
  );
}


// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
  value: string
): string {

  if (!value) {
    return "Not specified";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
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

  content: {
    padding: 20,
    paddingBottom: 90,
  },


  // ========================================
  // HEADER
  // ========================================

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  step: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  title: {
    marginTop: 3,
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 8,
    color: "#64748B",
  },


  // ========================================
  // TRAINING CARD
  // ========================================

  trainingCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    alignItems: "center",
  },

  trainingIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  trainingContent: {
    flex: 1,
    marginLeft: 10,
  },

  trainingLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#60A5FA",
  },

  trainingTitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  trainingCode: {
    marginTop: 2,
    fontSize: 7,
    color: "#64748B",
  },


  // ========================================
  // SECTION
  // ========================================

  section: {
    marginTop: 23,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
  },


  // ========================================
  // REVIEW ITEM
  // ========================================

  reviewItem: {
    marginBottom: 8,
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  reviewIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  reviewContent: {
    flex: 1,
    marginLeft: 9,
  },

  reviewLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#94A3B8",
  },

  reviewValue: {
    marginTop: 3,
    fontSize: 8.5,
    fontWeight: "700",
    color: "#334155",
  },


  // ========================================
  // NOTICE
  // ========================================

  notice: {
    marginTop: 20,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
  },

  noticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  noticeContent: {
    flex: 1,
    marginLeft: 9,
  },

  noticeTitle: {
    fontSize: 9,
    fontWeight: "900",
    color: "#1E40AF",
  },

  noticeText: {
    marginTop: 4,
    fontSize: 7,
    lineHeight: 12,
    color: "#475569",
  },


  // ========================================
  // SUBMIT
  // ========================================

  submitButton: {
    height: 52,
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  submitText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },


  // ========================================
  // BOTTOM NOTE
  // ========================================

  bottomNote: {
    marginTop: 8,
    paddingHorizontal: 20,
    textAlign: "center",
    fontSize: 7,
    lineHeight: 11,
    color: "#94A3B8",
  },
  submitButtonDisabled: {
  opacity: 0.7,
},

});