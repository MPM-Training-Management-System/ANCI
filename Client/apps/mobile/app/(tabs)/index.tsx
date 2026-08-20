import React, { useEffect, useState } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";

// ============================================================
// TYPES
// ============================================================

type ExamStatus =
  | "not-qualified"
  | "qualified"
  | "retake"
  | "passed"
  | "failed";

// ============================================================
// MOCK DATA
// ============================================================

const MOCK_EXAM_STATUS: ExamStatus =
  "qualified";

const PARTICIPANT = {
  firstName: "Juan",
  fullName: "Juan Dela Cruz",
  email: "juan@email.com",
  role: "PARTICIPANT",
};

const CURRENT_TRAINING = {
  title: "Leadership Training",

  description:
    "Build leadership, communication, decision-making, and team management skills through practical training.",

  status: "IN PROGRESS",

  progress: 65,

  date: "Aug 12–16, 2026",

  time: "9:00 AM – 4:00 PM",

  location: "Training Center",

  trainer: "Maria Santos",
};

const STATS = [
  {
    icon: "school-outline" as const,
    value: "3",
    title: "Trainings",
  },
  {
    icon: "checkmark-circle-outline" as const,
    value: "2",
    title: "Completed",
  },
  {
    icon: "calendar-outline" as const,
    value: "96%",
    title: "Attendance",
  },
  {
    icon: "ribbon-outline" as const,
    value: "2",
    title: "Certificates",
  },
];

// ============================================================
// MAIN DASHBOARD
// ============================================================

export default function ParticipantDashboard() {
  const router = useRouter();

  const [examStatus] =
    useState<ExamStatus>(
      MOCK_EXAM_STATUS,
    );

  const [showNotification, setShowNotification] =
    useState(false);

  const [showExamModal, setShowExamModal] =
    useState(false);

  // ==========================================================
  // SHOW EXAM MODAL
  // ==========================================================

  useEffect(() => {
    if (
      examStatus === "qualified" ||
      examStatus === "retake" ||
      examStatus === "passed" ||
      examStatus === "failed"
    ) {
      const timer = setTimeout(() => {
        setShowExamModal(true);
      }, 700);

      return () =>
        clearTimeout(timer);
    }
  }, [examStatus]);

  // ==========================================================
  // EXAM CONTENT
  // ==========================================================

  function getExamContent() {
    switch (examStatus) {
      case "qualified":
        return {
          icon: "checkmark-circle" as const,

          title: "You're Qualified!",

          description:
            "Congratulations! You completed the required assessment and are now qualified to take the final exam.",

          label: "EXAM AVAILABLE",

          action: "Take Exam",

          color: "#16A34A",

          background: "#F0FDF4",

          border: "#BBF7D0",

          iconBackground: "#DCFCE7",
        };

      case "retake":
        return {
          icon: "refresh-circle" as const,

          title: "Retake Required",

          description:
            "Your previous exam attempt did not meet the required passing score. You are eligible to take a retake.",

          label: "RETAKE AVAILABLE",

          action: "Retake Exam",

          color: "#D97706",

          background: "#FFFBEB",

          border: "#FDE68A",

          iconBackground: "#FEF3C7",
        };

      case "passed":
        return {
          icon: "trophy" as const,

          title: "Exam Passed!",

          description:
            "Excellent work! You passed the final exam. Your training completion is now being processed.",

          label: "PASSED",

          action: "View Result",

          color: "#16A34A",

          background: "#F0FDF4",

          border: "#BBF7D0",

          iconBackground: "#DCFCE7",
        };

      case "failed":
        return {
          icon: "close-circle" as const,

          title: "Exam Not Passed",

          description:
            "Your exam attempt did not reach the required passing score. You may take a retake when it becomes available.",

          label: "RETAKE PENDING",

          action: "View Result",

          color: "#DC2626",

          background: "#FEF2F2",

          border: "#FECACA",

          iconBackground: "#FEE2E2",
        };

      default:
        return null;
    }
  }

  const examContent =
    getExamContent();

  // ==========================================================
  // EXAM ACTION
  // ==========================================================

  function handleExamAction() {
    setShowExamModal(false);

    /*
      MOCK NAVIGATION

      Once the actual exam screen exists,
      connect this to:

      router.push({
        pathname: "/exam/[id]",
        params: {
          id: "EXAM-001",
        },
      });
    */

    router.push("/training");
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

      {/* ====================================================
    HEADER
==================================================== */}

<View style={styles.header}>
  <View style={styles.headerLeft}>
    {/* AVATAR */}

    <View style={styles.avatar}>
      <Text style={styles.avatarText}>
        JD
      </Text>

      {/* ONLINE INDICATOR */}

      <View style={styles.avatarOnlineDot} />
    </View>

    {/* NAME */}

    <View style={styles.headerInfo}>
      <Text style={styles.greeting}>
        Good morning 👋
      </Text>

      <Text
        style={styles.name}
        numberOfLines={1}
      >
        {PARTICIPANT.fullName}
      </Text>

      <View style={styles.roleRow}>
        <View style={styles.onlineDot} />

        <Text style={styles.roleText}>
          {PARTICIPANT.role}
        </Text>
      </View>
    </View>
  </View>

  {/* NOTIFICATION */}

  <Pressable
    style={styles.notificationButton}
    onPress={() =>
      setShowNotification(
        (previous) => !previous
      )
    }
  >
    <Ionicons
      name="notifications-outline"
      size={22}
      color="#0F172A"
    />

    <View
      style={styles.notificationDot}
    />
  </Pressable>
</View>
        {/* ====================================================
            NOTIFICATION
        ==================================================== */}

        {showNotification && (
          <View
            style={
              styles.notificationCard
            }
          >
            <View
              style={
                styles.notificationIcon
              }
            >
              <Ionicons
                name="notifications"
                size={18}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.notificationInfo
              }
            >
              <Text
                style={
                  styles.notificationTitle
                }
              >
                Training Reminder
              </Text>

              <Text
                style={
                  styles.notificationText
                }
              >
                Leadership Training is
                scheduled tomorrow at
                9:00 AM.
              </Text>

              <Text
                style={
                  styles.notificationTime
                }
              >
                Just now
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setShowNotification(false)
              }
            >
              <Ionicons
                name="close"
                size={17}
                color="#94A3B8"
              />
            </Pressable>
          </View>
        )}

        {/* ====================================================
            EXAM ALERT
        ==================================================== */}

        {examContent && (
          <Pressable
            style={[
              styles.examAlertCard,
              {
                backgroundColor:
                  examContent.background,
                borderColor:
                  examContent.border,
              },
            ]}
            onPress={() =>
              setShowExamModal(true)
            }
          >
            <View
              style={[
                styles.examAlertIcon,
                {
                  backgroundColor:
                    examContent.iconBackground,
                },
              ]}
            >
              <Ionicons
                name={examContent.icon}
                size={24}
                color={examContent.color}
              />
            </View>

            <View
              style={
                styles.examAlertInfo
              }
            >
              <View
                style={
                  styles.examAlertHeader
                }
              >
                <Text
                  style={[
                    styles.examAlertLabel,
                    {
                      color:
                        examContent.color,
                    },
                  ]}
                >
                  {examContent.label}
                </Text>

                <View
                  style={[
                    styles.actionBadge,
                    {
                      backgroundColor:
                        examContent.iconBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionBadgeText,
                      {
                        color:
                          examContent.color,
                      },
                    ]}
                  >
                    ACTION
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.examAlertTitle
                }
              >
                {examContent.title}
              </Text>

              <Text
                style={
                  styles.examAlertDescription
                }
                numberOfLines={2}
              >
                {examContent.description}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={examContent.color}
            />
          </Pressable>
        )}

        {/* ====================================================
            LEARNING JOURNEY
        ==================================================== */}

        <SectionHeader
          title="Your Learning Journey"
        />

        <View style={styles.trainingHero}>
          {/* Decorative circles */}

          <View
            style={styles.heroCircleOne}
          />

          <View
            style={styles.heroCircleTwo}
          />

          {/* TOP */}

          <View
            style={styles.heroTopRow}
          >
            <View
              style={styles.heroLabelRow}
            >
              <View
                style={styles.heroLiveDot}
              />

              <Text
                style={styles.heroLabel}
              >
                CURRENT TRAINING
              </Text>
            </View>

            <View
              style={styles.heroStatus}
            >
              <Text
                style={styles.heroStatusText}
              >
                {CURRENT_TRAINING.status}
              </Text>
            </View>
          </View>

          {/* ICON */}

          <View style={styles.heroIcon}>
            <Ionicons
              name="school"
              size={27}
              color="#FFFFFF"
            />
          </View>

          {/* TITLE */}

          <Text
            style={styles.heroTitle}
          >
            {CURRENT_TRAINING.title}
          </Text>

          <Text
            style={styles.heroDescription}
          >
            {CURRENT_TRAINING.description}
          </Text>

          {/* DETAILS */}

          <View
            style={styles.heroDetails}
          >
            <View
              style={styles.heroDetail}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#DBEAFE"
              />

              <Text
                style={
                  styles.heroDetailText
                }
              >
                {CURRENT_TRAINING.date}
              </Text>
            </View>

            <View
              style={styles.heroDetail}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color="#DBEAFE"
              />

              <Text
                style={
                  styles.heroDetailText
                }
              >
                {CURRENT_TRAINING.time}
              </Text>
            </View>
          </View>

          {/* PROGRESS */}

          <View
            style={
              styles.heroProgressHeader
            }
          >
            <Text
              style={
                styles.heroProgressLabel
              }
            >
              Learning Progress
            </Text>

            <Text
              style={
                styles.heroProgressValue
              }
            >
              {CURRENT_TRAINING.progress}%
            </Text>
          </View>

          <View
            style={
              styles.heroProgressTrack
            }
          >
            <View
              style={[
                styles.heroProgressBar,
                {
                  width: `${CURRENT_TRAINING.progress}%`,
                },
              ]}
            />
          </View>

          {/* BOTTOM */}

          <View
            style={styles.heroBottom}
          >
            <View>
              <Text
                style={
                  styles.heroTrainerLabel
                }
              >
                TRAINER
              </Text>

              <Text
                style={styles.heroTrainer}
              >
                {CURRENT_TRAINING.trainer}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.heroButton,
                pressed &&
                  styles.buttonPressed,
              ]}
              onPress={() =>
                router.push(
                  "/training",
                )
              }
            >
              <Text
                style={
                  styles.heroButtonText
                }
              >
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={15}
                color="#2563EB"
              />
            </Pressable>
          </View>
        </View>

        {/* ====================================================
            ENROLLMENT
        ==================================================== */}

        <View
          style={styles.enrollmentCard}
        >
          <View
            style={styles.enrollmentIcon}
          >
            <Ionicons
              name="checkmark-circle"
              size={23}
              color="#16A34A"
            />
          </View>

          <View
            style={styles.enrollmentInfo}
          >
            <Text
              style={
                styles.enrollmentLabel
              }
            >
              ENROLLMENT STATUS
            </Text>

            <Text
              style={
                styles.enrollmentTitle
              }
            >
              You're enrolled
            </Text>

            <Text
              style={
                styles.enrollmentText
              }
            >
              Your current training enrollment
              has been approved by the
              administrator.
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

        {/* ====================================================
            OVERVIEW
        ==================================================== */}

        <SectionHeader title="My Overview" />

        <View style={styles.statsGrid}>
          {STATS.map((item) => (
            <StatCard
              key={item.title}
              icon={item.icon}
              value={item.value}
              title={item.title}
            />
          ))}
        </View>

        {/* ====================================================
            ATTENDANCE
        ==================================================== */}

        <SectionHeader
          title="Today's Attendance"
          action="Open"
          onPress={() =>
            router.push("/QR")
          }
        />

        <View
          style={styles.attendanceCard}
        >
          <View
            style={styles.attendanceLeft}
          >
            <View
              style={styles.attendanceIcon}
            >
              <Ionicons
                name="qr-code-outline"
                size={23}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.attendanceInfo
              }
            >
              <Text
                style={
                  styles.attendanceTitle
                }
              >
                Attendance is ready
              </Text>

              <Text
                style={
                  styles.attendanceText
                }
              >
                Show your QR to your trainer
                when you arrive.
              </Text>

              <View
                style={
                  styles.attendanceStatus
                }
              >
                <View
                  style={styles.readyDot}
                />

                <Text
                  style={styles.readyText}
                >
                  READY FOR TIME IN
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={
              styles.attendanceButton
            }
            onPress={() =>
              router.push("/QR")
            }
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#2563EB"
            />
          </Pressable>
        </View>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <SectionHeader title="Quick Actions" />

        <View style={styles.actionsGrid}>
          <ActionCard
            icon="school-outline"
            title="Training"
            description="Open training"
            onPress={() =>
              router.push("/training")
            }
          />

          <ActionCard
            icon="document-text-outline"
            title="Assessment"
            description="View assessment"
            onPress={() =>
              router.push("/training")
            }
          />

          <ActionCard
            icon="qr-code-outline"
            title="Attendance"
            description="View attendance"
            onPress={() =>
              router.push("/QR")
            }
          />

          <ActionCard
            icon="ribbon-outline"
            title="Certificates"
            description="View certificates"
            onPress={() =>
              router.push(
                "/certificate",
              )
            }
          />
        </View>

        {/* ====================================================
            UPCOMING
        ==================================================== */}

        <SectionHeader
          title="Upcoming Training"
          action="View All"
          onPress={() =>
            router.push("/training")
          }
        />

        <UpcomingItem
          day="18"
          month="AUG"
          title="Team Development"
          time="1:00 PM"
          location="Training Hall"
        />

        <UpcomingItem
          day="25"
          month="AUG"
          title="Communication Skills"
          time="9:00 AM"
          location="Training Center"
        />

        {/* ====================================================
            EXAM STATUS
        ==================================================== */}

        {examContent && (
          <View
            style={[
              styles.examSectionCard,
              {
                backgroundColor:
                  examContent.background,
                borderColor:
                  examContent.border,
              },
            ]}
          >
            <View
              style={[
                styles.examSectionIcon,
                {
                  backgroundColor:
                    examContent.iconBackground,
                },
              ]}
            >
              <Ionicons
                name={examContent.icon}
                size={22}
                color={examContent.color}
              />
            </View>

            <View
              style={
                styles.examSectionInfo
              }
            >
              <Text
                style={[
                  styles.examSectionLabel,
                  {
                    color:
                      examContent.color,
                  },
                ]}
              >
                {examContent.label}
              </Text>

              <Text
                style={
                  styles.examSectionTitle
                }
              >
                {examContent.title}
              </Text>

              <Text
                style={
                  styles.examSectionDescription
                }
              >
                {examContent.description}
              </Text>
            </View>

            <Pressable
              style={[
                styles.examSectionButton,
                {
                  backgroundColor:
                    examContent.color,
                },
              ]}
              onPress={
                handleExamAction
              }
            >
              <Text
                style={
                  styles.examSectionButtonText
                }
              >
                {examContent.action}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ====================================================
            CERTIFICATE
        ==================================================== */}

        <SectionHeader
          title="Latest Certificate"
          action="View All"
          onPress={() =>
            router.push(
              "/certificate",
            )
          }
        />

        <Pressable
          style={
            styles.certificateCard
          }
          onPress={() =>
            router.push(
              "/certificate",
            )
          }
        >
          <View
            style={styles.certificateIcon}
          >
            <Ionicons
              name="ribbon"
              size={23}
              color="#D97706"
            />
          </View>

          <View
            style={
              styles.certificateInfo
            }
          >
            <Text
              style={
                styles.certificateTitle
              }
            >
              Basic Training
            </Text>

            <Text
              style={
                styles.certificateDate
              }
            >
              Issued July 29, 2026
            </Text>

            <View
              style={
                styles.certificateVerified
              }
            >
              <Ionicons
                name="checkmark-circle"
                size={12}
                color="#16A34A"
              />

              <Text
                style={
                  styles.certificateVerifiedText
                }
              >
                Verified Certificate
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#94A3B8"
          />
        </Pressable>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>

      {/* ======================================================
          EXAM MODAL
      ====================================================== */}

      {examContent && (
        <Modal
          visible={showExamModal}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowExamModal(false)
          }
        >
          <View
            style={styles.modalOverlay}
          >
            <View
              style={[
                styles.modalCard,
                {
                  borderColor:
                    examContent.border,
                },
              ]}
            >
              {/* CLOSE */}

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setShowExamModal(false)
                }
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </Pressable>

              {/* ICON */}

              <View
                style={[
                  styles.modalIcon,
                  {
                    backgroundColor:
                      examContent.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name={
                    examContent.icon
                  }
                  size={38}
                  color={
                    examContent.color
                  }
                />
              </View>

              {/* STATUS */}

              <View
                style={[
                  styles.modalStatusBadge,
                  {
                    backgroundColor:
                      examContent.iconBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalStatusText,
                    {
                      color:
                        examContent.color,
                    },
                  ]}
                >
                  {examContent.label}
                </Text>
              </View>

              {/* TITLE */}

              <Text
                style={styles.modalTitle}
              >
                {examContent.title}
              </Text>

              {/* DESCRIPTION */}

              <Text
                style={
                  styles.modalDescription
                }
              >
                {examContent.description}
              </Text>

              {/* DETAILS */}

              {(examStatus ===
                "qualified" ||
                examStatus ===
                  "retake") && (
                <View
                  style={
                    styles.examDetailsBox
                  }
                >
                  <ExamDetail
                    icon="document-text-outline"
                    label="Exam"
                    value="Leadership Final Exam"
                  />

                  <ExamDetail
                    icon="help-circle-outline"
                    label="Questions"
                    value="50 Questions"
                  />

                  <ExamDetail
                    icon="time-outline"
                    label="Duration"
                    value="60 Minutes"
                  />

                  <ExamDetail
                    icon="ribbon-outline"
                    label="Passing Score"
                    value="80%"
                  />
                </View>
              )}

              {/* PRIMARY */}

              <Pressable
                style={[
                  styles.modalPrimaryButton,
                  {
                    backgroundColor:
                      examContent.color,
                  },
                ]}
                onPress={
                  handleExamAction
                }
              >
                <Text
                  style={
                    styles.modalPrimaryButtonText
                  }
                >
                  {examContent.action}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>

              {/* SECONDARY */}

              <Pressable
                style={
                  styles.modalSecondaryButton
                }
                onPress={() =>
                  setShowExamModal(false)
                }
              >
                <Text
                  style={
                    styles.modalSecondaryText
                  }
                >
                  Maybe Later
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View
      style={styles.sectionHeader}
    >
      <Text
        style={styles.sectionTitle}
      >
        {title}
      </Text>

      {action && onPress && (
        <Pressable onPress={onPress}>
          <Text
            style={styles.sectionAction}
          >
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  value,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  title: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#2563EB"
        />
      </View>

      <Text
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statTitle}
      >
        {title}
      </Text>
    </View>
  );
}

// ============================================================
// ACTION CARD
// ============================================================

function ActionCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        pressed &&
          styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={styles.actionIcon}
      >
        <Ionicons
          name={icon}
          size={21}
          color="#2563EB"
        />
      </View>

      <Text
        style={styles.actionTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.actionDescription}
      >
        {description}
      </Text>
    </Pressable>
  );
}

// ============================================================
// UPCOMING ITEM
// ============================================================

function UpcomingItem({
  day,
  month,
  title,
  time,
  location,
}: {
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.upcomingCard,
        pressed &&
          styles.buttonPressed,
      ]}
    >
      <View
        style={styles.upcomingDate}
      >
        <Text
          style={styles.upcomingMonth}
        >
          {month}
        </Text>

        <Text
          style={styles.upcomingDay}
        >
          {day}
        </Text>
      </View>

      <View
        style={styles.upcomingInfo}
      >
        <Text
          style={styles.upcomingTitle}
        >
          {title}
        </Text>

        <View
          style={styles.upcomingRow}
        >
          <Ionicons
            name="time-outline"
            size={13}
            color="#64748B"
          />

          <Text
            style={styles.upcomingText}
          >
            {time}
          </Text>
        </View>

        <View
          style={styles.upcomingRow}
        >
          <Ionicons
            name="location-outline"
            size={13}
            color="#64748B"
          />

          <Text
            style={styles.upcomingText}
          >
            {location}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

// ============================================================
// EXAM DETAIL
// ============================================================

function ExamDetail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.examDetail}>
      <Ionicons
        name={icon}
        size={16}
        color="#64748B"
      />

      <View
        style={styles.examDetailInfo}
      >
        <Text
          style={styles.examDetailLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.examDetailValue}
        >
          {value}
        </Text>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 110,
  },

  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

headerLeft: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
},

avatar: {
  width: 52,
  height: 52,
  borderRadius: 17,
  backgroundColor: "#2563EB",

  alignItems: "center",
  justifyContent: "center",

  marginRight: 11,

  position: "relative",

  borderWidth: 2,
  borderColor: "#FFFFFF",

  elevation: 3,

  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.08,
  shadowRadius: 5,
},

avatarText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#FFFFFF",
},

avatarOnlineDot: {
  position: "absolute",

  width: 11,
  height: 11,

  borderRadius: 6,

  backgroundColor: "#22C55E",

  right: -1,
  bottom: -1,

  borderWidth: 2,
  borderColor: "#F8FAFC",
},

headerInfo: {
  flex: 1,
},

greeting: {
  fontSize: 10,
  color: "#64748B",
},

name: {
  fontSize: 17,
  fontWeight: "800",
  color: "#0F172A",

  marginTop: 2,

  maxWidth: 190,
},

roleRow: {
  flexDirection: "row",
  alignItems: "center",

  marginTop: 3,
},

onlineDot: {
  width: 6,
  height: 6,

  borderRadius: 3,

  backgroundColor: "#16A34A",

  marginRight: 5,
},

roleText: {
  fontSize: 7,
  fontWeight: "800",

  color: "#64748B",

  letterSpacing: 0.5,
},

notificationButton: {
  width: 43,
  height: 43,

  borderRadius: 14,

  backgroundColor: "#FFFFFF",

  alignItems: "center",
  justifyContent: "center",

  borderWidth: 1,
  borderColor: "#E2E8F0",

  marginLeft: 10,
},

notificationDot: {
  position: "absolute",

  top: 8,
  right: 8,

  width: 7,
  height: 7,

  borderRadius: 4,

  backgroundColor: "#EF4444",

  borderWidth: 1,
  borderColor: "#FFFFFF",
},

  // ==========================================================
  // NOTIFICATION
  // ==========================================================

  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 14,
  },

  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  notificationInfo: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  notificationText: {
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
    marginTop: 3,
  },

  notificationTime: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 4,
  },

  // ==========================================================
  // EXAM ALERT
  // ==========================================================

  examAlertCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },

  examAlertIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  examAlertInfo: {
    flex: 1,
  },

  examAlertHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  examAlertLabel: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  actionBadge: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 6,
  },

  actionBadgeText: {
    fontSize: 6,
    fontWeight: "800",
  },

  examAlertTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 3,
  },

  examAlertDescription: {
    fontSize: 8,
    lineHeight: 12,
    color: "#64748B",
    marginTop: 3,
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionAction: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },

  // ==========================================================
  // TRAINING HERO
  // ==========================================================

  trainingHero: {
    backgroundColor: "#2563EB",
    borderRadius: 26,
    padding: 18,
    overflow: "hidden",
    position: "relative",
  },

  heroCircleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor:
      "rgba(255,255,255,0.06)",
    right: -75,
    top: -80,
  },

  heroCircleTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor:
      "rgba(255,255,255,0.05)",
    right: 45,
    bottom: -75,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#86EFAC",
    marginRight: 6,
  },

  heroLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#DBEAFE",
  },

  heroStatus: {
    backgroundColor:
      "rgba(255,255,255,0.14)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  heroStatusText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  heroIcon: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor:
      "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 12,
  },

  heroDescription: {
    fontSize: 9,
    lineHeight: 14,
    color: "#DBEAFE",
    marginTop: 5,
    maxWidth: "92%",
  },

  heroDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 14,
  },

  heroDetail: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroDetailText: {
    fontSize: 8,
    color: "#DBEAFE",
    marginLeft: 5,
  },

  heroProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
    marginBottom: 6,
  },

  heroProgressLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#DBEAFE",
  },

  heroProgressValue: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroProgressTrack: {
    height: 7,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    borderRadius: 5,
    overflow: "hidden",
  },

  heroProgressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },

  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
  },

  heroTrainerLabel: {
    fontSize: 6,
    fontWeight: "800",
    color: "#93C5FD",
    letterSpacing: 0.6,
  },

  heroTrainer: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },

  heroButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  heroButtonText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },

  // ==========================================================
  // ENROLLMENT
  // ==========================================================

  enrollmentCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginTop: 12,
  },

  enrollmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  enrollmentInfo: {
    flex: 1,
  },

  enrollmentLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: "#15803D",
    letterSpacing: 0.6,
  },

  enrollmentTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
    marginTop: 2,
  },

  enrollmentText: {
    fontSize: 8,
    lineHeight: 13,
    color: "#15803D",
    marginTop: 2,
  },

  approvedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    marginLeft: 5,
  },

  approvedText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#16A34A",
  },

  // ==========================================================
  // STATS
  // ==========================================================

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },

  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },

  statTitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },

  // ==========================================================
  // ATTENDANCE
  // ==========================================================

  attendanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  attendanceLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  attendanceIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  attendanceInfo: {
    flex: 1,
  },

  attendanceTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  attendanceText: {
    fontSize: 8,
    lineHeight: 12,
    color: "#64748B",
    marginTop: 2,
  },

  attendanceStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D97706",
    marginRight: 4,
  },

  readyText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#D97706",
  },

  attendanceButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // QUICK ACTIONS
  // ==========================================================

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  actionCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
  },

  actionDescription: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
  },

  // ==========================================================
  // UPCOMING
  // ==========================================================

  upcomingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 9,
  },

  upcomingDate: {
    width: 49,
    height: 53,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  upcomingMonth: {
    fontSize: 7,
    fontWeight: "800",
    color: "#2563EB",
  },

  upcomingDay: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  upcomingInfo: {
    flex: 1,
  },

  upcomingTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  upcomingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  upcomingText: {
    fontSize: 8,
    color: "#64748B",
    marginLeft: 5,
  },

  // ==========================================================
  // EXAM SECTION
  // ==========================================================

  examSectionCard: {
    marginTop: 18,
    borderRadius: 19,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },

  examSectionIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  examSectionInfo: {
    flex: 1,
  },

  examSectionLabel: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  examSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },

  examSectionDescription: {
    fontSize: 8,
    lineHeight: 12,
    color: "#64748B",
    marginTop: 3,
  },

  examSectionButton: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 9,
    marginLeft: 6,
  },

  examSectionButtonText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // ==========================================================
  // CERTIFICATE
  // ==========================================================

  certificateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  certificateIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  certificateInfo: {
    flex: 1,
  },

  certificateTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  certificateDate: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 3,
  },

  certificateVerified: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  certificateVerifiedText: {
    fontSize: 7,
    color: "#16A34A",
    fontWeight: "700",
    marginLeft: 3,
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
  },

  modalStatusBadge: {
    alignSelf: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 13,
  },

  modalStatusText: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 9,
  },

  modalDescription: {
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
  },

  examDetailsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginTop: 17,
  },

  examDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },

  examDetailInfo: {
    flex: 1,
    marginLeft: 9,
  },

  examDetailLabel: {
    fontSize: 7,
    color: "#94A3B8",
  },

  examDetailValue: {
    fontSize: 9,
    fontWeight: "800",
    color: "#334155",
    marginTop: 1,
  },

  modalPrimaryButton: {
    height: 50,
    borderRadius: 14,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  modalPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  modalSecondaryButton: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  modalSecondaryText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },

  buttonPressed: {
    opacity: 0.7,
  },

  bottomSpace: {
    height: 30,
  },
});