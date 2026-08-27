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
  ParticipantTraining,
} from "@/src/data/participantTraining";

interface Props {
  training: ParticipantTraining;

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
  const remainingSlots =
    training.slots -
    training.enrolled;

  const isFull =
    remainingSlots <= 0;

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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="school-outline"
              size={30}
              color="#2563EB"
            />
          </View>

          <Text style={styles.heroTitle}>
            {training.title}
          </Text>

          <Text style={styles.code}>
            {training.code}
          </Text>

          <View style={styles.heroMode}>
            <Text style={styles.heroModeText}>
              {training.mode}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About this training
          </Text>

          <Text style={styles.description}>
            {training.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Training Information
          </Text>

          <InfoItem
            icon="person-outline"
            label="Trainer"
            value={training.trainer}
          />

          <InfoItem
            icon="calendar-outline"
            label="Schedule"
            value={training.schedule}
          />

          <InfoItem
            icon="time-outline"
            label="Time"
            value={training.time}
          />

          <InfoItem
            icon="hourglass-outline"
            label="Duration"
            value={training.duration}
          />

          <InfoItem
            icon="location-outline"
            label="Location"
            value={training.location}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Training Capacity
          </Text>

          <View style={styles.capacityCard}>
            <View>
              <Text style={styles.capacityLabel}>
                PARTICIPANTS
              </Text>

              <Text style={styles.capacityValue}>
                {training.enrolled} /{" "}
                {training.slots}
              </Text>
            </View>

            <View style={styles.capacityIcon}>
              <Ionicons
                name="people-outline"
                size={19}
                color="#2563EB"
              />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    100,
                    (training.enrolled /
                      training.slots) *
                      100
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.slotText}>
            {isFull
              ? "This training is currently full."
              : `${remainingSlots} slots remaining`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Requirements
          </Text>

          {training.requirements.map(
            (requirement, index) => (
              <View
                key={`${training.id}-${index}`}
                style={styles.requirement}
              >
                <View style={styles.check}>
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color="#16A34A"
                  />
                </View>

                <Text style={styles.requirementText}>
                  {requirement}
                </Text>
              </View>
            )
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Training Period
          </Text>

          <View style={styles.dateRow}>
            <DateItem
              label="START DATE"
              value={training.startDate}
            />

            <DateItem
              label="END DATE"
              value={training.endDate}
            />
          </View>
        </View>

        <Pressable
          onPress={handleEnroll}
          style={[
            styles.enrollButton,
            (isFull || alreadyEnrolled) &&
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

          <Text style={styles.enrollButtonText}>
            {alreadyEnrolled
              ? "Already Enrolled"
              : isFull
              ? "Training Full"
              : "Enroll Now"}
          </Text>
        </Pressable>

        {!alreadyEnrolled && !isFull && (
          <Text style={styles.bottomNote}>
            Your enrollment will be submitted
            for administrator review.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
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

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

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

  heroMode: {
    marginTop: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  heroModeText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#1D4ED8",
  },

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

  description: {
    fontSize: 9,
    lineHeight: 15,
    color: "#64748B",
  },

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

  requirement: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  check: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  requirementText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 8,
    color: "#475569",
  },

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