import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  mockParticipant,
  mockAssessments,
} from "@/src/data/participant";

import UpcomingTraining from "./UpcomingTraining";

export default function ParticipantDashboard() {
  const participant = mockParticipant;

  const training = participant.training;

  const statistics = participant.statistics;

  const modules = participant.learningModules;

  const attendance = participant.attendance;

  const assessments = mockAssessments;

  const completedModules =
    modules.filter(
      (module) =>
        module.status === "Completed"
    ).length;

  const completedAssessments =
    assessments.filter(
      (assessment) =>
        assessment.status === "Completed"
    ).length;

  const upcomingAttendance =
    attendance.find(
      (item) =>
        item.attendanceOpen === true
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ================================================= */}
      {/* WELCOME */}
      {/* ================================================= */}

      <View style={styles.welcomeSection}>
        <View style={styles.welcomeText}>
          <Text style={styles.eyebrow}>
            PARTICIPANT PORTAL
          </Text>

          <Text style={styles.greeting}>
            Welcome back,
          </Text>

          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {participant.fullName}
          </Text>

          <Text style={styles.subtitle}>
            Continue your training journey.
          </Text>
        </View>

        <View style={styles.avatar}>
          {participant.profileImageUrl ? (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.avatarText}>
                {participant.fullName
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          ) : (
            <Text style={styles.avatarText}>
              {participant.fullName
                .charAt(0)
                .toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      {/* ================================================= */}
      {/* ACCOUNT STATUS */}
      {/* ================================================= */}

      {participant.status ===
        "Pending" && (
        <View style={styles.pendingCard}>
          <View style={styles.pendingIcon}>
            <Ionicons
              name="time-outline"
              size={18}
              color="#B45309"
            />
          </View>

          <View style={styles.pendingContent}>
            <Text style={styles.pendingTitle}>
              Account under review
            </Text>

            <Text style={styles.pendingText}>
              Your participant account is currently
              pending administrator approval.
            </Text>
          </View>
        </View>
      )}

      {/* ================================================= */}
      {/* TRAINING */}
      {/* ================================================= */}

      <SectionTitle
        title="Your Training"
        subtitle="Current assigned program"
      />

      <UpcomingTraining
        training={training}
      />

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <SectionTitle
        title="Training Overview"
        subtitle="Your current progress"
      />

      <View style={styles.statsGrid}>
        <StatCard
          icon="school-outline"
          label="Progress"
          value={`${statistics.trainingProgress}%`}
        />

        <StatCard
          icon="calendar-outline"
          label="Attendance"
          value={`${statistics.attendanceRate}%`}
        />

        <StatCard
          icon="book-outline"
          label="Modules"
          value={`${completedModules}/${statistics.totalModules}`}
        />

        <StatCard
          icon="clipboard-outline"
          label="Assessments"
          value={`${completedAssessments}/${statistics.totalAssessments}`}
        />
      </View>

      {/* ================================================= */}
      {/* ATTENDANCE */}
      {/* ================================================= */}

      <SectionTitle
        title="Attendance"
        subtitle="Your latest attendance status"
      />

      <View style={styles.attendanceCard}>
        {upcomingAttendance ? (
          <>
            <View style={styles.attendanceIcon}>
              <Ionicons
                name="radio-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View style={styles.attendanceContent}>
              <Text style={styles.attendanceLabel}>
                ATTENDANCE IS OPEN
              </Text>

              <Text
                style={styles.attendanceTitle}
                numberOfLines={1}
              >
                {upcomingAttendance.sessionTitle}
              </Text>

              <Text style={styles.attendanceDate}>
                {upcomingAttendance.date} •{" "}
                {upcomingAttendance.mode}
              </Text>
            </View>

            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>
                OPEN
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.attendanceIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#16A34A"
              />
            </View>

            <View style={styles.attendanceContent}>
              <Text style={styles.attendanceLabel}>
                ATTENDANCE
              </Text>

              <Text style={styles.attendanceTitle}>
                No active attendance
              </Text>

              <Text style={styles.attendanceDate}>
                There is no attendance session open
                right now.
              </Text>
            </View>
          </>
        )}
      </View>

      {/* ================================================= */}
      {/* LEARNING */}
      {/* ================================================= */}

      <SectionTitle
        title="Continue Learning"
        subtitle="Pick up where you left off"
      />

      <View style={styles.learningCard}>
        {modules
          .filter(
            (module) =>
              module.status ===
              "In Progress"
          )
          .slice(0, 1)
          .map((module) => (
            <View
              key={module.id}
              style={styles.learningContent}
            >
              <View style={styles.learningIcon}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color="#2563EB"
                />
              </View>

              <View
                style={styles.learningText}
              >
                <Text style={styles.learningLabel}>
                  IN PROGRESS
                </Text>

                <Text
                  style={styles.learningTitle}
                  numberOfLines={2}
                >
                  {module.title}
                </Text>

                <View
                  style={styles.moduleProgress}
                >
                  <View
                    style={
                      styles.moduleProgressTrack
                    }
                  >
                    <View
                      style={[
                        styles.moduleProgressFill,
                        {
                          width: `${module.progress}%`,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={
                      styles.moduleProgressText
                    }
                  >
                    {module.progress}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </View>

      {/* ================================================= */}
      {/* ASSESSMENT */}
      {/* ================================================= */}

      <SectionTitle
        title="Assessments"
        subtitle="Your assessment progress"
      />

      <View style={styles.assessmentCard}>
        <View style={styles.assessmentIcon}>
          <Ionicons
            name="clipboard-outline"
            size={20}
            color="#7C3AED"
          />
        </View>

        <View style={styles.assessmentContent}>
          <Text style={styles.assessmentLabel}>
            NEXT ASSESSMENT
          </Text>

          <Text
            style={styles.assessmentTitle}
            numberOfLines={2}
          >
            {
              assessments.find(
                (item) =>
                  item.status ===
                  "Available"
              )?.title
            }
          </Text>

          <Text style={styles.assessmentMeta}>
            {
              assessments.find(
                (item) =>
                  item.status ===
                  "Available"
              )?.questions.length
            }{" "}
            questions
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#CBD5E1"
        />
      </View>

      {/* ================================================= */}
      {/* BOTTOM SPACE */}
      {/* ================================================= */}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}


// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>
        {title}
      </Text>

      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={17}
          color="#2563EB"
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
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
    paddingTop: 22,
    paddingBottom: 90,
  },

  // ----------------------------------------------------------
  // WELCOME
  // ----------------------------------------------------------

  welcomeSection: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  welcomeText: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrow: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#2563EB",
  },

  greeting: {
    marginTop: 5,
    fontSize: 11,
    color: "#64748B",
  },

  name: {
    marginTop: 2,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 8,
    color: "#94A3B8",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // ----------------------------------------------------------
  // PENDING
  // ----------------------------------------------------------

  pendingCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
  },

  pendingIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  pendingContent: {
    flex: 1,
    marginLeft: 9,
  },

  pendingTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#92400E",
  },

  pendingText: {
    marginTop: 2,
    fontSize: 7,
    lineHeight: 11,
    color: "#A16207",
  },

  // ----------------------------------------------------------
  // SECTION
  // ----------------------------------------------------------

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },

  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 7.5,
    color: "#94A3B8",
  },

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------

  statsGrid: {
    marginHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  statCard: {
    width: "48%",
    minHeight: 94,
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 1,
    fontSize: 7,
    color: "#94A3B8",
  },

  // ----------------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------------

  attendanceCard: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  attendanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceContent: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 8,
  },

  attendanceLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#2563EB",
  },

  attendanceTitle: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
  },

  attendanceDate: {
    marginTop: 3,
    fontSize: 7,
    lineHeight: 11,
    color: "#94A3B8",
  },

  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
  },

  openBadgeText: {
    fontSize: 6,
    fontWeight: "900",
    color: "#15803D",
  },

  // ----------------------------------------------------------
  // LEARNING
  // ----------------------------------------------------------

  learningCard: {
    marginHorizontal: 20,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  learningContent: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  learningIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  learningText: {
    flex: 1,
    marginLeft: 10,
  },

  learningLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#2563EB",
  },

  learningTitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  moduleProgress: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  moduleProgressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  moduleProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  moduleProgressText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#2563EB",
  },

  // ----------------------------------------------------------
  // ASSESSMENT
  // ----------------------------------------------------------

  assessmentCard: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  assessmentIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  assessmentContent: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 8,
  },

  assessmentLabel: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#7C3AED",
  },

  assessmentTitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  assessmentMeta: {
    marginTop: 3,
    fontSize: 7,
    color: "#94A3B8",
  },

  bottomSpace: {
    height: 25,
  },
});