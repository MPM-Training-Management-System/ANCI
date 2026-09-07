import React from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

export default function ExamScreen() {
  const router = useRouter();

  const examCompleted = false;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#0F172A"
          />
        </Pressable>

        <Text style={styles.title}>
          Final Examination
        </Text>

        <Text style={styles.subtitle}>
          Examination information for your
          current training.
        </Text>

        <View style={styles.examCard}>
          <View style={styles.examIcon}>
            <Ionicons
              name="school-outline"
              size={30}
              color="#D97706"
            />
          </View>

          <Text style={styles.examLabel}>
            FINAL EXAMINATION
          </Text>

          <Text style={styles.examTitle}>
            Leadership Development Training
          </Text>

          <View
            style={[
              styles.statusBadge,
              examCompleted
                ? styles.passedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                examCompleted
                  ? styles.passedText
                  : styles.pendingText,
              ]}
            >
              {examCompleted
                ? "PASSED"
                : "PENDING"}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Info
            icon="calendar-outline"
            title="Exam Date"
            value="September 15, 2026"
          />

          <Info
            icon="time-outline"
            title="Time"
            value="9:00 AM"
          />

          <Info
            icon="location-outline"
            title="Location"
            value="ACE NextGen Training Center"
          />

          <Info
            icon="ribbon-outline"
            title="Passing Score"
            value="75%"
          />
        </View>

        {!examCompleted && (
          <View style={styles.pendingCard}>
            <Ionicons
              name="time-outline"
              size={21}
              color="#D97706"
            />

            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>
                Examination Pending
              </Text>

              <Text style={styles.pendingDescription}>
                Your final examination has not
                been completed yet. Please attend
                the scheduled examination.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Info({
  icon,
  title,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.info}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2563EB"
        />
      </View>

      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 110,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 23,
  },

  examCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    padding: 23,
    marginBottom: 18,
  },

  examIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  examLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
  },

  examTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },

  passedBadge: {
    backgroundColor: "#DCFCE7",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  passedText: {
    color: "#16A34A",
  },

  pendingText: {
    color: "#D97706",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 15,
    gap: 15,
  },

  info: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoText: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94A3B8",
  },

  infoValue: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    marginTop: 3,
  },

  pendingCard: {
    marginTop: 16,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
  },

  pendingInfo: {
    flex: 1,
    marginLeft: 9,
  },

  pendingTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400E",
  },

  pendingDescription: {
    fontSize: 9,
    lineHeight: 14,
    color: "#A16207",
    marginTop: 3,
  },
});