import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  Enrollment,
} from "@repo/types";

interface Props {
  enrollment: Enrollment;

  onOpenTraining?: (
    enrollment: Enrollment
  ) => void;
}

export default function EnrollmentStatusCard({
  enrollment,
  onOpenTraining,
}: Props) {

  const status =
    String(
      enrollment.status
    ).toLowerCase();


  // ========================================================
  // STATUS FLAGS
  // ========================================================

  const isPending =
    status === "pending";

  const isDocumentsRequired =
    status === "documentsrequired";

  const isUnderReview =
    status === "underreview";

  const isNeedsCorrection =
    status === "needscorrection";

  const isApproved =
    status === "approved";

  const isRejected =
    status === "rejected";

  const isCancelled =
    status === "cancelled";

  const isCompleted =
    status === "completed";


  // ========================================================
  // STATUS ICON
  // ========================================================

  const icon =
    isPending
      ? "time-outline"
      : isDocumentsRequired
      ? "document-text-outline"
      : isUnderReview
      ? "search-outline"
      : isNeedsCorrection
      ? "alert-circle-outline"
      : isApproved
      ? "checkmark-circle-outline"
      : isRejected
      ? "close-circle-outline"
      : isCancelled
      ? "ban-outline"
      : isCompleted
      ? "ribbon-outline"
      : "document-outline";


  // ========================================================
  // ICON COLOR
  // ========================================================

  const iconColor =
    isPending
      ? "#D97706"
      : isDocumentsRequired
      ? "#2563EB"
      : isUnderReview
      ? "#7C3AED"
      : isNeedsCorrection
      ? "#EA580C"
      : isApproved
      ? "#16A34A"
      : isRejected
      ? "#DC2626"
      : isCancelled
      ? "#64748B"
      : isCompleted
      ? "#7C3AED"
      : "#64748B";


  // ========================================================
  // STATUS TITLE
  // ========================================================

  const statusTitle =
    isPending
      ? "Enrollment Submitted"
      : isDocumentsRequired
      ? "Documents Required"
      : isUnderReview
      ? "Enrollment Under Review"
      : isNeedsCorrection
      ? "Correction Required"
      : isApproved
      ? "Enrollment Approved"
      : isRejected
      ? "Enrollment Rejected"
      : isCancelled
      ? "Enrollment Cancelled"
      : isCompleted
      ? "Training Completed"
      : "Enrollment";


  // ========================================================
  // STATUS DESCRIPTION
  // ========================================================

  const description =
    isPending
      ? "Your enrollment application is waiting for administrator review."
      : isDocumentsRequired
      ? "Please complete and submit the required documents for your enrollment."
      : isUnderReview
      ? "Your enrollment and submitted documents are currently being reviewed."
      : isNeedsCorrection
      ? "Some information or documents require correction. Please review the administrator remarks."
      : isApproved
      ? "Your enrollment has been approved. You can now access your training."
      : isRejected
      ? "Your enrollment application was not approved."
      : isCancelled
      ? "This enrollment application has been cancelled."
      : isCompleted
      ? "You have successfully completed this training."
      : "Your enrollment information.";


  // ========================================================
  // DISPLAY STATUS
  // ========================================================

  const displayStatus =
    String(
      enrollment.status
    )
      .replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      );


  // ========================================================
  // HAS REMARKS
  // ========================================================

  const hasRemarks =
    Boolean(
      enrollment.reviewRemarks &&
      enrollment.reviewRemarks.trim()
    );


  return (
    <View
      style={
        styles.card
      }
    >

      {/* =========================================
          STATUS ICON
      ========================================= */}

      <View
        style={[
          styles.iconBox,

          isPending &&
            styles.pendingIcon,

          isDocumentsRequired &&
            styles.documentsRequiredIcon,

          isUnderReview &&
            styles.underReviewIcon,

          isNeedsCorrection &&
            styles.needsCorrectionIcon,

          isApproved &&
            styles.approvedIcon,

          isRejected &&
            styles.rejectedIcon,

          isCancelled &&
            styles.cancelledIcon,

          isCompleted &&
            styles.completedIcon,
        ]}
      >

        <Ionicons
          name={icon}
          size={25}
          color={iconColor}
        />

      </View>


      {/* =========================================
          STATUS TITLE
      ========================================= */}

      <Text
        style={
          styles.statusTitle
        }
      >
        {statusTitle}
      </Text>


      {/* =========================================
          TRAINING PROGRAM
      ========================================= */}

      <Text
        style={
          styles.trainingTitle
        }
      >
        {enrollment.programName}
      </Text>


      {/* =========================================
          BATCH
      ========================================= */}

      <Text
        style={
          styles.batchText
        }
      >
        Batch: {enrollment.batchCode}
      </Text>


      {/* =========================================
          DESCRIPTION
      ========================================= */}

      <Text
        style={
          styles.description
        }
      >
        {description}
      </Text>


      {/* =========================================
          STATUS
      ========================================= */}

      <View
        style={
          styles.statusRow
        }
      >

        <Text
          style={
            styles.statusLabel
          }
        >
          STATUS
        </Text>


        <View
          style={[
            styles.badge,

            isPending &&
              styles.pendingBadge,

            isDocumentsRequired &&
              styles.documentsRequiredBadge,

            isUnderReview &&
              styles.underReviewBadge,

            isNeedsCorrection &&
              styles.needsCorrectionBadge,

            isApproved &&
              styles.approvedBadge,

            isRejected &&
              styles.rejectedBadge,

            isCancelled &&
              styles.cancelledBadge,

            isCompleted &&
              styles.completedBadge,
          ]}
        >

          <Text
            style={[
              styles.badgeText,

              isPending &&
                styles.pendingText,

              isDocumentsRequired &&
                styles.documentsRequiredText,

              isUnderReview &&
                styles.underReviewText,

              isNeedsCorrection &&
                styles.needsCorrectionText,

              isApproved &&
                styles.approvedText,

              isRejected &&
                styles.rejectedText,

              isCancelled &&
                styles.cancelledText,

              isCompleted &&
                styles.completedText,
            ]}
          >
            {displayStatus}
          </Text>

        </View>

      </View>


      {/* =========================================
          ADMIN REMARKS
      ========================================= */}

      {hasRemarks && (

        <View
          style={
            styles.remarksBox
          }
        >

          <View
            style={
              styles.remarksHeader
            }
          >

            <Ionicons
              name="chatbox-ellipses-outline"
              size={14}
              color="#64748B"
            />

            <Text
              style={
                styles.remarksLabel
              }
            >
              ADMIN REMARKS
            </Text>

          </View>


          <Text
            style={
              styles.remarksText
            }
          >
            {enrollment.reviewRemarks}
          </Text>

        </View>

      )}


      {/* =========================================
          ENROLLMENT DETAILS
      ========================================= */}

      <View
        style={
          styles.details
        }
      >

        <Detail
          label="TRAINING BATCH"
          value={
            enrollment.batchCode
          }
        />


        <Detail
          label="ENROLLMENT DATE"
          value={
            formatDate(
              enrollment.enrolledAt
            )
          }
        />


        <Detail
          label="ENROLLMENT ID"
          value={
            enrollment.id
          }
        />

      </View>


      {/* =========================================
          OPEN TRAINING
      ========================================= */}

      {isApproved &&
        onOpenTraining && (

        <Pressable
          onPress={() =>
            onOpenTraining(
              enrollment
            )
          }

          style={
            styles.openButton
          }
        >

          <Text
            style={
              styles.openButtonText
            }
          >
            Open Training
          </Text>


          <Ionicons
            name="arrow-forward"
            size={15}
            color="#FFFFFF"
          />

        </Pressable>

      )}

    </View>
  );
}


// ==========================================================
// DETAIL
// ==========================================================

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <View
      style={
        styles.detail
      }
    >

      <Text
        style={
          styles.detailLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.detailValue
        }
        numberOfLines={1}
      >
        {value}
      </Text>

    </View>
  );
}


// ==========================================================
// DATE FORMAT
// ==========================================================

function formatDate(
  value: string
): string {

  if (!value) {
    return "-";
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


// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({

    card: {
      marginHorizontal: 20,
      marginBottom: 15,

      padding: 20,

      borderRadius: 22,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E2E8F0",

      alignItems: "center",
    },


    // ======================================================
    // ICON
    // ======================================================

    iconBox: {
      width: 58,
      height: 58,

      borderRadius: 19,

      backgroundColor: "#F1F5F9",

      alignItems: "center",
      justifyContent: "center",
    },


    pendingIcon: {
      backgroundColor: "#FEF3C7",
    },


    documentsRequiredIcon: {
      backgroundColor: "#DBEAFE",
    },


    underReviewIcon: {
      backgroundColor: "#EDE9FE",
    },


    needsCorrectionIcon: {
      backgroundColor: "#FFEDD5",
    },


    approvedIcon: {
      backgroundColor: "#DCFCE7",
    },


    rejectedIcon: {
      backgroundColor: "#FEE2E2",
    },


    cancelledIcon: {
      backgroundColor: "#E2E8F0",
    },


    completedIcon: {
      backgroundColor: "#F3E8FF",
    },


    // ======================================================
    // TEXT
    // ======================================================

    statusTitle: {
      marginTop: 13,

      fontSize: 16,

      fontWeight: "900",

      color: "#0F172A",

      textAlign: "center",
    },


    trainingTitle: {
      marginTop: 5,

      textAlign: "center",

      fontSize: 11,

      fontWeight: "800",

      color: "#334155",
    },


    batchText: {
      marginTop: 3,

      textAlign: "center",

      fontSize: 8,

      fontWeight: "700",

      color: "#64748B",
    },


    description: {
      marginTop: 9,

      textAlign: "center",

      fontSize: 8,

      lineHeight: 13,

      color: "#64748B",
    },


    // ======================================================
    // STATUS
    // ======================================================

    statusRow: {
      width: "100%",

      marginTop: 17,

      paddingTop: 13,

      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",
    },


    statusLabel: {
      fontSize: 6,

      fontWeight: "900",

      letterSpacing: 0.7,

      color: "#94A3B8",
    },


    badge: {
      paddingHorizontal: 9,
      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor: "#F1F5F9",
    },


    pendingBadge: {
      backgroundColor: "#FEF3C7",
    },


    documentsRequiredBadge: {
      backgroundColor: "#DBEAFE",
    },


    underReviewBadge: {
      backgroundColor: "#EDE9FE",
    },


    needsCorrectionBadge: {
      backgroundColor: "#FFEDD5",
    },


    approvedBadge: {
      backgroundColor: "#DCFCE7",
    },


    rejectedBadge: {
      backgroundColor: "#FEE2E2",
    },


    cancelledBadge: {
      backgroundColor: "#E2E8F0",
    },


    completedBadge: {
      backgroundColor: "#F3E8FF",
    },


    badgeText: {
      fontSize: 6,

      fontWeight: "900",

      color: "#64748B",
    },


    pendingText: {
      color: "#B45309",
    },


    documentsRequiredText: {
      color: "#1D4ED8",
    },


    underReviewText: {
      color: "#6D28D9",
    },


    needsCorrectionText: {
      color: "#C2410C",
    },


    approvedText: {
      color: "#15803D",
    },


    rejectedText: {
      color: "#B91C1C",
    },


    cancelledText: {
      color: "#475569",
    },


    completedText: {
      color: "#7E22CE",
    },


    // ======================================================
    // REMARKS
    // ======================================================

    remarksBox: {
      width: "100%",

      marginTop: 15,

      padding: 12,

      borderRadius: 13,

      backgroundColor: "#F8FAFC",

      borderWidth: 1,
      borderColor: "#E2E8F0",
    },


    remarksHeader: {
      flexDirection: "row",

      alignItems: "center",

      gap: 6,
    },


    remarksLabel: {
      fontSize: 6,

      fontWeight: "900",

      letterSpacing: 0.7,

      color: "#64748B",
    },


    remarksText: {
      marginTop: 7,

      fontSize: 8,

      lineHeight: 13,

      color: "#475569",
    },


    // ======================================================
    // DETAILS
    // ======================================================

    details: {
      width: "100%",

      marginTop: 15,

      gap: 9,
    },


    detail: {
      padding: 10,

      borderRadius: 12,

      backgroundColor: "#F8FAFC",
    },


    detailLabel: {
      fontSize: 5.5,

      fontWeight: "900",

      letterSpacing: 0.6,

      color: "#94A3B8",
    },


    detailValue: {
      marginTop: 3,

      fontSize: 8,

      fontWeight: "700",

      color: "#334155",
    },


    // ======================================================
    // OPEN TRAINING
    // ======================================================

    openButton: {
      width: "100%",

      height: 45,

      marginTop: 17,

      borderRadius: 14,

      backgroundColor: "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 7,
    },


    openButtonText: {
      fontSize: 8,

      fontWeight: "900",

      color: "#FFFFFF",
    },

  });