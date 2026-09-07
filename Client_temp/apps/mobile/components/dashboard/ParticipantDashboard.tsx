import React, {
  useEffect,
  useMemo,
  useCallback,
  useState
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl
} from "react-native";

import {
  router,
} from "expo-router";

import {
  useMe,
  useEnrollments,
  useTrainingBatches,
} from "@repo/hooks";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  mockParticipant,
  mockAssessments,
} from "@/src/data/participant";

import UpcomingTraining from "./UpcomingTraining";

import {
  participantApi,
  enrollmentApi,
  trainingBatchApi,
} from "@/api/api";


// ============================================================
// DASHBOARD
// ============================================================

export default function ParticipantDashboard() {


 const [refreshing, setRefreshing] = useState(false);

 
  // ==========================================================
  // PARTICIPANT PROFILE
  // ==========================================================

  const {
    profile,
    isLoading,
    refetch
  } = useMe(
    participantApi
  );


   const onRefresh = useCallback(async () => {
  try {
    setRefreshing(true);
    await refetch();
  } finally {
    setRefreshing(false);
  }
}, [refetch]);


  // ==========================================================
  // MY ENROLLMENTS
  // ==========================================================

  const {
    enrollments,
    isLoading:
      enrollmentsLoading,
    refreshMyEnrollments,
  } = useEnrollments(
    enrollmentApi
  );


  // ==========================================================
  // TRAINING BATCHES
  //
  // GET /api/training-batches
  //
  // This contains the assigned trainer.
  // ==========================================================

  const {
    batches,
    isLoading:
      batchesLoading,
  } = useTrainingBatches(
    trainingBatchApi
  );


  // ==========================================================
  // LOAD MY ENROLLMENTS
  // ==========================================================

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


  // ==========================================================
  // MOCK DATA
  // ==========================================================

  const participant =
    mockParticipant;


  const statistics =
    participant.statistics;


  const modules =
    participant.learningModules;


  const attendance =
    participant.attendance;


  const assessments =
    mockAssessments;


  // ==========================================================
  // CURRENT ENROLLMENT
  //
  // Only APPROVED is shown as current training.
  // ==========================================================

  const currentEnrollment =
    useMemo(() => {

      return enrollments.find(
        (enrollment) =>
          String(
            enrollment.status
          ).toLowerCase() ===
          "approved"
      ) ?? null;

    }, [
      enrollments,
    ]);


  // ==========================================================
  // CURRENT TRAINING BATCH
  //
  // Find the TrainingBatch that belongs to the
  // current enrollment.
  // ==========================================================

  const currentBatch =
    useMemo(() => {

      if (!currentEnrollment) {
        return null;
      }


      return batches.find(
        (batch) =>
          batch.id ===
          currentEnrollment.trainingBatchId
      ) ?? null;

    }, [
      batches,
      currentEnrollment,
    ]);


  // ==========================================================
  // CURRENT TRAINER
  //
  // Trainer comes from TrainingBatch.
  // ==========================================================

  const currentTrainer =
    currentBatch?.trainer ?? null;


  // ==========================================================
  // COMPLETED MODULES
  // ==========================================================

  const completedModules =
    modules.filter(
      (module) =>
        module.status ===
        "Completed"
    ).length;


  // ==========================================================
  // COMPLETED ASSESSMENTS
  // ==========================================================

  const completedAssessments =
    assessments.filter(
      (assessment) =>
        assessment.status ===
        "Completed"
    ).length;


  // ==========================================================
  // UPCOMING ATTENDANCE
  // ==========================================================

  const upcomingAttendance =
    attendance.find(
      (item) =>
        item.attendanceOpen ===
        true
    );


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    isLoading ||
    enrollmentsLoading ||
    batchesLoading
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
          Loading dashboard...
        </Text>

      </View>
    );
  }


  // ==========================================================
  // DASHBOARD
  // ==========================================================

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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={["#2563EB"]}
          />}
      
    >

      {/* ================================================== */}
      {/* WELCOME */}
      {/* ================================================== */}

      <View
        style={
          styles.welcomeSection
        }
      >

        <View
          style={
            styles.welcomeText
          }
        >



          <Text
            style={
              styles.greeting
            }
          >
            Welcome back,
          </Text>


          <Text
            style={
              styles.name
            }

            numberOfLines={1}
          >
            {
              profile?.firstName ??
              "Participant"
            }
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Continue your training journey.
          </Text>

        </View>


        {/* ================================================= */}
        {/* PROFILE IMAGE */}
        {/* ================================================= */}

        <View
          style={
            styles.avatar
          }
        >

          {profile?.profileImageUrl ? (

            <Image
              source={{
                uri:
                  profile.profileImageUrl,
              }}

              style={
                styles.avatarImage
              }
            />

          ) : (

            <Text
              style={
                styles.avatarText
              }
            >
              {
                profile?.firstName
                  ?.charAt(0)
                  .toUpperCase() ?? "P"
              }
            </Text>

          )}

        </View>

      </View>


      {/* ================================================== */}
      {/* PENDING ACCOUNT */}
      {/* ================================================== */}

      {profile?.status ===
        "Pending" && (

        <View
          style={
            styles.pendingCard
          }
        >

          <View
            style={
              styles.pendingIcon
            }
          >

            <Ionicons
              name="time-outline"
              size={18}
              color="#B45309"
            />

          </View>


          <View
            style={
              styles.pendingContent
            }
          >

            <Text
              style={
                styles.pendingTitle
              }
            >
              Account under review
            </Text>


            <Text
              style={
                styles.pendingText
              }
            >
              Your participant account is currently
              pending administrator approval.
            </Text>

          </View>

        </View>

      )}


      {/* ================================================== */}
      {/* YOUR TRAINING */}
      {/* ================================================== */}

      <SectionTitle
        title="Your Training"
        subtitle="Current assigned program"
      />


      {currentEnrollment ? (

        <UpcomingTraining
          training={
            currentEnrollment
          }

          trainer={
            currentTrainer
          }

        />

      ) : (

       <NoCurrentTraining
  onBrowse={() =>
    router.push("/training")
  }
/>

      )}


      {/* ================================================== */}
      {/* TRAINING OVERVIEW */}
      {/* ================================================== */}

      <SectionTitle
        title="Training Overview"
        subtitle="Your current progress"
      />


      <View
        style={
          styles.statsGrid
        }
      >

        <StatCard
          icon="school-outline"
          label="Progress"
          value={
            `${statistics.trainingProgress}%`
          }
        />


        <StatCard
          icon="calendar-outline"
          label="Attendance"
          value={
            `${statistics.attendanceRate}%`
          }
        />


        <StatCard
          icon="book-outline"
          label="Modules"
          value={
            `${completedModules}/${statistics.totalModules}`
          }
        />


        <StatCard
          icon="clipboard-outline"
          label="Assessments"
          value={
            `${completedAssessments}/${statistics.totalAssessments}`
          }
        />

      </View>


      {/* ================================================== */}
      {/* ATTENDANCE */}
      {/* ================================================== */}

      <SectionTitle
        title="Attendance"
        subtitle="Your latest attendance status"
      />


      <View
        style={
          styles.attendanceCard
        }
      >

        {upcomingAttendance ? (

          <View
            style={
              styles.attendanceRow
            }
          >

            <View
              style={
                styles.attendanceIcon
              }
            >

              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#15803D"
              />

            </View>


            <View
              style={
                styles.attendanceContent
              }
            >

              <Text
                style={
                  styles.attendanceTitle
                }
              >
                {
                  upcomingAttendance.sessionTitle
                }
              </Text>


              <Text
                style={
                  styles.attendanceDate
                }
              >
                {
                  upcomingAttendance.date
                }
              </Text>


              <Text
                style={
                  styles.attendanceMode
                }
              >
                {
                  upcomingAttendance.mode
                }
              </Text>

            </View>


            <View
              style={
                styles.attendanceStatus
              }
            >

              <View
                style={
                  styles.attendanceStatusDot
                }
              />


              <Text
                style={
                  styles.attendanceStatusText
                }
              >
                OPEN
              </Text>

            </View>

          </View>

        ) : (

          <View
            style={
              styles.noAttendance
            }
          >

            <View
              style={
                styles.noAttendanceIcon
              }
            >

              <Ionicons
                name="calendar-outline"
                size={18}
                color="#94A3B8"
              />

            </View>


            <View
              style={
                styles.noAttendanceContent
              }
            >

              <Text
                style={
                  styles.noAttendanceTitle
                }
              >
                No attendance session
              </Text>


              <Text
                style={
                  styles.noAttendanceText
                }
              >
                There is currently no open attendance session.
              </Text>

            </View>

          </View>

        )}

      </View>


      {/* ================================================== */}
      {/* RECENT ACTIVITY */}
      {/* ================================================== */}

      <SectionTitle
        title="Recent Activity"
        subtitle="Your latest training activity"
      />


      <View
        style={
          styles.activityCard
        }
      >

        <ActivityItem
          icon="school-outline"
          title="Training Enrollment"
          description={
            currentEnrollment
              ? `Enrolled in ${currentEnrollment.programName}`
              : "No active training enrollment"
          }
        />


        <ActivityItem
          icon="book-outline"
          title="Learning Modules"
          description={
            `${completedModules} module(s) completed`
          }
        />


        <ActivityItem
          icon="clipboard-outline"
          title="Assessments"
          description={
            `${completedAssessments} assessment(s) completed`
          }
        />

      </View>

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
        {title}
      </Text>


      <Text
        style={
          styles.sectionSubtitle
        }
      >
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
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  label: string;

  value: string;
}) {

  return (
    <View
      style={
        styles.statCard
      }
    >

      <View
        style={
          styles.statIcon
        }
      >

        <Ionicons
          name={icon}
          size={17}
          color="#2563EB"
        />

      </View>


      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

    </View>
  );
}


// ============================================================
// ACTIVITY ITEM
// ============================================================

function ActivityItem({
  icon,
  title,
  description,
}: {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  title: string;

  description: string;
}) {

  return (
    <View
      style={
        styles.activityItem
      }
    >

      <View
        style={
          styles.activityIcon
        }
      >

        <Ionicons
          name={icon}
          size={16}
          color="#2563EB"
        />

      </View>


      <View
        style={
          styles.activityContent
        }
      >

        <Text
          style={
            styles.activityTitle
          }
        >
          {title}
        </Text>


        <Text
          style={
            styles.activityDescription
          }
        >
          {description}
        </Text>

      </View>

    </View>
  );
}


// ============================================================
// NO CURRENT TRAINING
// ============================================================

function NoCurrentTraining({
  onBrowse,
}: {
  onBrowse: () => void;
}) {

  return (
    <View
      style={
        styles.noTrainingCard
      }
    >

      <View
        style={
          styles.noTrainingIcon
        }
      >

        <Ionicons
          name="school-outline"
          size={22}
          color="#64748B"
        />

      </View>


      <View
        style={
          styles.noTrainingContent
        }
      >

        <Text
          style={
            styles.noTrainingTitle
          }
        >
          No Active Training
        </Text>


        <Text
          style={
            styles.noTrainingText
          }
        >
          You currently don't have an active training
          enrollment. Browse available training programs
          and enroll in one to get started.
        </Text>


        <Pressable
          onPress={
            onBrowse
          }

          style={({ pressed }) => [
            styles.browseButton,

            pressed &&
              styles.browseButtonPressed,
          ]}
        >

          <Ionicons
            name="search-outline"
            size={14}
            color="#FFFFFF"
          />


          <Text
            style={
              styles.browseButtonText
            }
          >
            Browse Trainings
          </Text>


          <Ionicons
            name="arrow-forward"
            size={14}
            color="#FFFFFF"
          />

        </Pressable>

      </View>

    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    // --------------------------------------------------------
    // CONTAINER
    // --------------------------------------------------------

    container: {
      flex: 1,

      backgroundColor: "#F8FAFC",
    },


    content: {
      paddingTop: 38,

      paddingBottom: 70,
    },


    // --------------------------------------------------------
    // LOADING
    // --------------------------------------------------------

    loadingContainer: {
      flex: 1,

      backgroundColor: "#F8FAFC",

      alignItems: "center",

      justifyContent: "center",
    },


    loadingText: {
      marginTop: 10,

      fontSize: 12,

      color: "#64748B",
    },


    // --------------------------------------------------------
    // WELCOME
    // --------------------------------------------------------

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
      marginTop: 4,

      fontSize: 12,

      color: "#64748B",
    },


    name: {
      marginTop: 1,

      fontSize: 22,

      fontWeight: "800",

      color: "#0F172A",
    },


    subtitle: {
      marginTop: 4,

      fontSize: 9,

      color: "#94A3B8",
    },


    // --------------------------------------------------------
    // AVATAR
    // --------------------------------------------------------

    avatar: {
      width: 52,

      height: 52,

      borderRadius: 18,

      backgroundColor: "#E2E8F0",

      alignItems: "center",

      justifyContent: "center",

      overflow: "hidden",
    },


    avatarImage: {
      width: "100%",

      height: "100%",
    },


    avatarText: {
      fontSize: 18,

      fontWeight: "800",

      color: "#475569",
    },


    // --------------------------------------------------------
    // PENDING
    // --------------------------------------------------------

    pendingCard: {
      marginHorizontal: 20,

      marginTop: 20,

      padding: 13,

      borderRadius: 16,

      backgroundColor: "#FFFBEB",

      borderWidth: 1,

      borderColor: "#FDE68A",

      flexDirection: "row",

      alignItems: "center",
    },


    pendingIcon: {
      width: 36,

      height: 36,

      borderRadius: 11,

      backgroundColor: "#FEF3C7",

      alignItems: "center",

      justifyContent: "center",
    },


    pendingContent: {
      flex: 1,

      marginLeft: 10,
    },


    pendingTitle: {
      fontSize: 9,

      fontWeight: "800",

      color: "#92400E",
    },


    pendingText: {
      marginTop: 2,

      fontSize: 7.5,

      lineHeight: 12,

      color: "#A16207",
    },


    // --------------------------------------------------------
    // SECTION
    // --------------------------------------------------------

    sectionHeader: {
      marginTop: 25,

      marginHorizontal: 20,

      marginBottom: 10,
    },


    sectionTitle: {
      fontSize: 13,

      fontWeight: "800",

      color: "#0F172A",
    },


    sectionSubtitle: {
      marginTop: 2,

      fontSize: 8,

      color: "#94A3B8",
    },


    // --------------------------------------------------------
    // STATS
    // --------------------------------------------------------

    statsGrid: {
      marginHorizontal: 20,

      flexDirection: "row",

      flexWrap: "wrap",

      gap: 9,
    },


    statCard: {
      width: "48%",

      padding: 13,

      borderRadius: 16,

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

      marginBottom: 8,
    },


    statLabel: {
      fontSize: 7,

      color: "#94A3B8",
    },


    statValue: {
      marginTop: 2,

      fontSize: 15,

      fontWeight: "800",

      color: "#0F172A",
    },


    // --------------------------------------------------------
    // ATTENDANCE
    // --------------------------------------------------------

    attendanceCard: {
      marginHorizontal: 20,

      padding: 13,

      borderRadius: 17,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,

      borderColor: "#E2E8F0",
    },


    attendanceRow: {
      flexDirection: "row",

      alignItems: "center",
    },


    attendanceIcon: {
      width: 38,

      height: 38,

      borderRadius: 12,

      backgroundColor: "#DCFCE7",

      alignItems: "center",

      justifyContent: "center",
    },


    attendanceContent: {
      marginLeft: 10,

      flex: 1,
    },


    attendanceTitle: {
      fontSize: 9,

      fontWeight: "800",

      color: "#334155",
    },


    attendanceDate: {
      marginTop: 2,

      fontSize: 7,

      color: "#64748B",
    },


    attendanceMode: {
      marginTop: 1,

      fontSize: 6.5,

      color: "#94A3B8",
    },


    attendanceStatus: {
      flexDirection: "row",

      alignItems: "center",

      gap: 5,
    },


    attendanceStatusDot: {
      width: 7,

      height: 7,

      borderRadius: 999,

      backgroundColor: "#16A34A",
    },


    attendanceStatusText: {
      fontSize: 6.5,

      fontWeight: "800",

      color: "#15803D",
    },


    noAttendance: {
      flexDirection: "row",

      alignItems: "center",
    },


    noAttendanceIcon: {
      width: 38,

      height: 38,

      borderRadius: 12,

      backgroundColor: "#F1F5F9",

      alignItems: "center",

      justifyContent: "center",
    },


    noAttendanceContent: {
      flex: 1,

      marginLeft: 10,
    },


    noAttendanceTitle: {
      fontSize: 9,

      fontWeight: "800",

      color: "#475569",
    },


    noAttendanceText: {
      marginTop: 2,

      fontSize: 7,

      lineHeight: 11,

      color: "#94A3B8",
    },


    // --------------------------------------------------------
    // ACTIVITY
    // --------------------------------------------------------

    activityCard: {
      marginHorizontal: 20,

      padding: 5,

      borderRadius: 17,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,

      borderColor: "#E2E8F0",
    },


    activityItem: {
      padding: 10,

      flexDirection: "row",

      alignItems: "center",
    },


    activityIcon: {
      width: 34,

      height: 34,

      borderRadius: 11,

      backgroundColor: "#EEF4FF",

      alignItems: "center",

      justifyContent: "center",
    },


    activityContent: {
      flex: 1,

      marginLeft: 10,
    },


    activityTitle: {
      fontSize: 8.5,

      fontWeight: "800",

      color: "#334155",
    },


    activityDescription: {
      marginTop: 2,

      fontSize: 7,

      color: "#94A3B8",
    },


    // --------------------------------------------------------
    // NO ACTIVE TRAINING
    // --------------------------------------------------------

    noTrainingCard: {
      marginHorizontal: 20,

      padding: 17,

      borderRadius: 19,

      backgroundColor: "#FFFFFF",

      borderWidth: 1,

      borderColor: "#E2E8F0",

      flexDirection: "row",

      alignItems: "flex-start",
    },


    noTrainingIcon: {
      width: 44,

      height: 44,

      borderRadius: 14,

      backgroundColor: "#EEF4FF",

      alignItems: "center",

      justifyContent: "center",
    },


    noTrainingContent: {
      flex: 1,

      marginLeft: 11,
    },


    noTrainingTitle: {
      fontSize: 10,

      fontWeight: "800",

      color: "#334155",
    },


    noTrainingText: {
      marginTop: 4,

      fontSize: 7.5,

      lineHeight: 12,

      color: "#94A3B8",
    },


    // --------------------------------------------------------
    // BROWSE BUTTON
    // --------------------------------------------------------

    browseButton: {
      marginTop: 11,

      height: 34,

      paddingHorizontal: 11,

      borderRadius: 10,

      backgroundColor: "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      alignSelf: "flex-start",

      gap: 6,
    },


    browseButtonText: {
      fontSize: 7.5,

      fontWeight: "800",

      color: "#FFFFFF",
    },


    browseButtonPressed: {
      opacity: 0.7,
    },

  });