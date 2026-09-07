import React from "react";

import {
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

interface Props {
  training: TrainingBatch;

  alreadyEnrolled: boolean;

  onBack: () => void;

  onEnroll: () => void;
}

export default function TrainingDetails({
  training,
  alreadyEnrolled,
  onBack,
  onEnroll,
}: Props) {
  // ==========================================
  // AVAILABLE SLOTS
  // ==========================================

  const remainingSlots = Math.max(
    training.capacity -
      training.enrolledCount,
    0
  );

  const isFull =
    remainingSlots <= 0;


  // ==========================================
  // ENROLL
  // ==========================================

  const handleEnroll = () => {
    if (alreadyEnrolled) {
      Alert.alert(
        "Already Enrolled",
        "You already have an enrollment application for this training."
      );

      return;
    }

    if (isFull) {
      Alert.alert(
        "Training Full",
        "This training has already reached its maximum number of participants."
      );

      return;
    }

    onEnroll();
  };


  // ==========================================
  // STATUS
  // ==========================================

  const statusText =
    training.status;

  const statusStyle =
    getStatusStyle(
      training.status
    );


  // ==========================================
  // PROGRESS
  // ==========================================

  const progress =
    training.capacity > 0
      ? Math.min(
          100,
          (training.enrolledCount /
            training.capacity) *
            100
        )
      : 0;


  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* ====================================
            HEADER
        ==================================== */}

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


          <Text style={styles.headerTitle}>
            Training Details
          </Text>


          <View
            style={styles.headerSpacer}
          />

        </View>


        {/* ====================================
            HERO
        ==================================== */}

        <View style={styles.hero}>

          <View style={styles.heroIcon}>

            <Ionicons
              name="school-outline"
              size={30}
              color="#2563EB"
            />

          </View>


          <Text style={styles.heroTitle}>
            {training.programName}
          </Text>


          <Text style={styles.code}>
            {training.batchCode}
          </Text>


          {/* STATUS */}

          <View
            style={[
              styles.statusBadge,
              statusStyle,
            ]}
          >
            <View
              style={styles.statusDot}
            />

            <Text
              style={styles.statusText}
            >
              {statusText}
            </Text>

          </View>

        </View>


        {/* ====================================
            TRAINING INFORMATION
        ==================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Training Information
          </Text>


          <InfoItem
            icon="pricetag-outline"
            label="Batch Code"
            value={
              training.batchCode
            }
          />


          <InfoItem
            icon="location-outline"
            label="Location"
            value={
              training.location ||
              "Not specified"
            }
          />


          <InfoItem
            icon="calendar-outline"
            label="Start Date"
            value={formatDate(
              training.startDate
            )}
          />


          <InfoItem
            icon="calendar-outline"
            label="End Date"
            value={formatDate(
              training.endDate
            )}
          />

        </View>


        {/* ====================================
            TRAINING CAPACITY
        ==================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Training Capacity
          </Text>


          <View
            style={styles.capacityCard}
          >

            <View>

              <Text
                style={styles.capacityLabel}
              >
                PARTICIPANTS
              </Text>


              <Text
                style={styles.capacityValue}
              >
                {training.enrolledCount} /{" "}
                {training.capacity}
              </Text>

            </View>


            <View
              style={styles.capacityIcon}
            >

              <Ionicons
                name="people-outline"
                size={19}
                color="#2563EB"
              />

            </View>

          </View>


          {/* PROGRESS */}

          <View
            style={styles.progressTrack}
          >

            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />

          </View>


          <Text
            style={styles.slotText}
          >
            {isFull
              ? "This training is currently full."
              : `${remainingSlots} slots remaining`}
          </Text>

        </View>


        {/* ====================================
            TRAINING PERIOD
        ==================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Training Period
          </Text>


          <View style={styles.dateRow}>

            <DateItem
              label="START DATE"
              value={formatDate(
                training.startDate
              )}
            />


            <DateItem
              label="END DATE"
              value={formatDate(
                training.endDate
              )}
            />

          </View>

        </View>


        {/* ====================================
            BATCH STATUS INFORMATION
        ==================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Batch Status
          </Text>


          <View
            style={styles.statusCard}
          >

            <View
              style={[
                styles.largeStatusIcon,
                statusStyle,
              ]}
            >

              <Ionicons
                name={getStatusIcon(
                  training.status
                )}
                size={20}
                color="#2563EB"
              />

            </View>


            <View
              style={styles.statusContent}
            >

              <Text
                style={styles.statusCardLabel}
              >
                CURRENT STATUS
              </Text>


              <Text
                style={styles.statusCardValue}
              >
                {training.status}
              </Text>

            </View>

          </View>

        </View>


        {/* ====================================
            ENROLL BUTTON
        ==================================== */}

        <Pressable
          onPress={handleEnroll}
          style={[
            styles.enrollButton,
            (isFull ||
              alreadyEnrolled) &&
              styles.disabledButton,
          ]}
        >

          <Ionicons
            name={
              alreadyEnrolled
                ? "checkmark-circle-outline"
                : isFull
                ? "lock-closed-outline"
                : "add-circle-outline"
            }
            size={19}
            color="#FFFFFF"
          />


          <Text
            style={styles.enrollButtonText}
          >
            {alreadyEnrolled
              ? "Already Enrolled"
              : isFull
              ? "Training Full"
              : "Enroll Now"}
          </Text>

        </Pressable>


        {!alreadyEnrolled &&
          !isFull && (
            <Text
              style={styles.bottomNote}
            >
              Your enrollment will be
              submitted for administrator
              review.
            </Text>
          )}

      </ScrollView>

    </View>
  );
}


// ==========================================
// INFO ITEM
// ==========================================

function InfoItem({
  icon,
  label,
  value,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;
}) {

  return (
    <View style={styles.infoItem}>

      <View style={styles.infoIcon}>

        <Ionicons
          name={icon}
          size={17}
          color="#2563EB"
        />

      </View>


      <View
        style={styles.infoContent}
      >

        <Text
          style={styles.infoLabel}
        >
          {label}
        </Text>


        <Text
          style={styles.infoValue}
        >
          {value}
        </Text>

      </View>

    </View>
  );
}


// ==========================================
// DATE ITEM
// ==========================================

function DateItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <View style={styles.dateItem}>

      <Text style={styles.dateLabel}>
        {label}
      </Text>


      <Text style={styles.dateValue}>
        {value}
      </Text>

    </View>
  );
}


// ==========================================
// DATE FORMAT
// ==========================================

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


// ==========================================
// STATUS STYLE
// ==========================================

function getStatusStyle(
  status: string
) {

  switch (
    status.toLowerCase()
  ) {

    case "published":
      return styles.publishedStatus;

    case "ongoing":
      return styles.ongoingStatus;

    case "completed":
      return styles.completedStatus;

    case "cancelled":
      return styles.cancelledStatus;

    case "draft":
    default:
      return styles.draftStatus;
  }
}


// ==========================================
// STATUS ICON
// ==========================================

function getStatusIcon(
  status: string
): keyof typeof Ionicons.glyphMap {

  switch (
    status.toLowerCase()
  ) {

    case "published":
      return "checkmark-circle-outline";

    case "ongoing":
      return "play-circle-outline";

    case "completed":
      return "trophy-outline";

    case "cancelled":
      return "close-circle-outline";

    case "draft":
    default:
      return "document-outline";
  }
}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },


  content: {
    paddingBottom: 90,
    marginTop: 30,
  },


  // ========================================
  // HEADER
  // ========================================

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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


  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },


  headerSpacer: {
    width: 40,
  },


  // ========================================
  // HERO
  // ========================================

  hero: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
  },


  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },


  heroTitle: {
    marginTop: 13,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },


  code: {
    marginTop: 5,
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
  },


  // ========================================
  // STATUS BADGE
  // ========================================

  statusBadge: {
    marginTop: 11,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },


  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },


  statusText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#1D4ED8",
  },


  publishedStatus: {
    backgroundColor: "#DBEAFE",
  },


  ongoingStatus: {
    backgroundColor: "#DCFCE7",
  },


  completedStatus: {
    backgroundColor: "#F1F5F9",
  },


  cancelledStatus: {
    backgroundColor: "#FEE2E2",
  },


  draftStatus: {
    backgroundColor: "#F1F5F9",
  },


  // ========================================
  // SECTION
  // ========================================

  section: {
    marginTop: 22,
    paddingHorizontal: 20,
  },


  sectionTitle: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },


  // ========================================
  // INFO
  // ========================================

  infoItem: {
    marginBottom: 10,
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },


  infoIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },


  infoContent: {
    flex: 1,
    marginLeft: 9,
  },


  infoLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#94A3B8",
  },


  infoValue: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "700",
    color: "#334155",
  },


  // ========================================
  // CAPACITY
  // ========================================

  capacityCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },


  capacityLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#94A3B8",
  },


  capacityValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
  },


  capacityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },


  progressTrack: {
    height: 7,
    marginTop: 9,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },


  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },


  slotText: {
    marginTop: 5,
    fontSize: 7,
    color: "#64748B",
  },


  // ========================================
  // DATE
  // ========================================

  dateRow: {
    flexDirection: "row",
    gap: 8,
  },


  dateItem: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },


  dateLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#94A3B8",
  },


  dateValue: {
    marginTop: 5,
    fontSize: 8,
    fontWeight: "700",
    color: "#334155",
  },


  // ========================================
  // STATUS CARD
  // ========================================

  statusCard: {
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },


  largeStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },


  statusContent: {
    marginLeft: 10,
    flex: 1,
  },


  statusCardLabel: {
    fontSize: 5.5,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#94A3B8",
  },


  statusCardValue: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "800",
    color: "#334155",
  },


  // ========================================
  // ENROLL
  // ========================================

  enrollButton: {
    marginHorizontal: 20,
    marginTop: 26,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },


  disabledButton: {
    backgroundColor: "#94A3B8",
  },


  enrollButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },


  bottomNote: {
    marginTop: 8,
    paddingHorizontal: 30,
    textAlign: "center",
    fontSize: 7,
    lineHeight: 11,
    color: "#94A3B8",
  },

});