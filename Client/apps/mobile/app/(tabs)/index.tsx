import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";


import { authApi } from "@/api/api";
import {auth } from "@/api/auth"
import { LoginUser } from "@repo/api";

export default function HomeScreen() {
  const router = useRouter();

   const [user, setUser] = useState<LoginUser | null>(null);


    useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authApi.me();
        console.log(data);
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, []);


  const participant = {
    name: "Juan Dela Cruz",
    firstName: "Juan",
    profileImage:
      "https://i.pravatar.cc/300?img=12",
    verified: true,
  };

  const activeTraining = {
    title: "Leadership Development Training",
    instructor: "ACE NextGen Training Team",
    progress: 72,
    completedModules: 8,
    totalModules: 11,
  };

  const upcomingTraining = {
    title: "Communication Skills Workshop",
    date: "August 15, 2026",
    time: "9:00 AM - 5:00 PM",
    location: "ACE NextGen Training Center",
  };

  const latestAnnouncement = {
    title: "Training Schedule Update",
    description:
      "Please be reminded of the updated schedule for the upcoming training session.",
    date: "August 10, 2026",
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
      

        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: user?.profileImage,
                }}
                style={styles.avatar}
              />

             {user?.isActive === true && (
                <View style={styles.verifiedIcon}>
                  <Ionicons
                    name="checkmark"
                    size={11}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>
                Welcome back,
              </Text>

              <Text style={styles.name}>
                {user?.fullName}
              </Text>

              {participant.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color="#16A34A"
                  />

                  <Text style={styles.verifiedText}>
                    Verified
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Pressable
            style={styles.notificationButton}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#334155"
            />

            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* =========================================
            TRAINING PROGRESS
        ========================================= */}

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={styles.progressIcon}>
              <Ionicons
                name="school-outline"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.progressTitleWrapper}>
              <Text style={styles.smallLabel}>
                ACTIVE TRAINING
              </Text>

              <Text style={styles.trainingTitle}>
                {activeTraining.title}
              </Text>
            </View>
          </View>

          <View style={styles.progressInfoRow}>
            <Text style={styles.progressLabel}>
              Training Progress
            </Text>

            <Text style={styles.progressPercentage}>
              {activeTraining.progress}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${activeTraining.progress}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressBottom}>
            <View style={styles.moduleInfo}>
              <Ionicons
                name="book-outline"
                size={15}
                color="#BFDBFE"
              />

              <Text style={styles.moduleText}>
                {activeTraining.completedModules} of{" "}
                {activeTraining.totalModules} modules
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/training")}
              style={styles.viewTrainingButton}
            >
              <Text style={styles.viewTrainingText}>
                View Training
              </Text>

              <Ionicons
                name="arrow-forward"
                size={14}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        {/* =========================================
            MY CERTIFICATE
        ========================================= */}

        <Pressable
          style={styles.certificateCard}
          onPress={() => router.push("/certificate")}
        >
          <View style={styles.certificateIcon}>
            <Ionicons
              name="ribbon"
              size={27}
              color="#D97706"
            />
          </View>

          <View style={styles.certificateInfo}>
            <Text style={styles.certificateLabel}>
              MY CERTIFICATE
            </Text>

            <Text style={styles.certificateTitle}>
              Leadership Development Training
            </Text>

            <Text style={styles.certificateDescription}>
              View your earned certificates
            </Text>
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#64748B"
            />
          </View>
        </Pressable>

        {/* =========================================
            UPCOMING TRAINING
        ========================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Upcoming Training
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your next scheduled session
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/training")}
          >
            <Text style={styles.seeAll}>
              See All
            </Text>
          </Pressable>
        </View>

        <View style={styles.upcomingCard}>
          <View style={styles.dateBox}>
            <Text style={styles.dateMonth}>
              AUG
            </Text>

            <Text style={styles.dateDay}>
              15
            </Text>
          </View>

          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle}>
              {upcomingTraining.title}
            </Text>

            <View style={styles.detailRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color="#64748B"
              />

              <Text style={styles.detailText}>
                {upcomingTraining.time}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color="#64748B"
              />

              <Text
                style={styles.detailText}
                numberOfLines={1}
              >
                {upcomingTraining.location}
              </Text>
            </View>
          </View>

          <View style={styles.upcomingArrow}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#94A3B8"
            />
          </View>
        </View>

        {/* =========================================
            LATEST ANNOUNCEMENT
        ========================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Latest Announcement
            </Text>

            <Text style={styles.sectionSubtitle}>
              Stay updated with ACE NextGen
            </Text>
          </View>

          <Ionicons
            name="megaphone-outline"
            size={21}
            color="#2563EB"
          />
        </View>

        <View style={styles.announcementCard}>
          <View style={styles.announcementIcon}>
            <Ionicons
              name="megaphone"
              size={20}
              color="#2563EB"
            />
          </View>

          <View style={styles.announcementInfo}>
            <Text style={styles.announcementTitle}>
              {latestAnnouncement.title}
            </Text>

            <Text
              style={styles.announcementDescription}
              numberOfLines={2}
            >
              {latestAnnouncement.description}
            </Text>

            <View style={styles.announcementDate}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color="#94A3B8"
              />

              <Text style={styles.announcementDateText}>
                {latestAnnouncement.date}
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================
            QUICK STATS
        ========================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Your Training Overview
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.blueIcon,
              ]}
            >
              <Ionicons
                name="school-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statValue}>
              3
            </Text>

            <Text style={styles.statLabel}>
              Trainings
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.greenIcon,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#16A34A"
              />
            </View>

            <Text style={styles.statValue}>
              8
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>

          <Pressable
            style={styles.statCard}
            onPress={() =>
              router.push("/certificate")
            }
          >
            <View
              style={[
                styles.statIcon,
                styles.orangeIcon,
              ]}
            >
              <Ionicons
                name="ribbon-outline"
                size={20}
                color="#D97706"
              />
            </View>

            <Text style={styles.statValue}>
              2
            </Text>

            <Text style={styles.statLabel}>
              Certificates
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
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
    paddingTop: 54,
    paddingBottom: 110,
  },

  /* PROFILE */

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E2E8F0",
  },

  verifiedIcon: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    borderWidth: 2,
    borderColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    flex: 1,
  },

  welcomeText: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },

  name: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },

  verifiedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#16A34A",
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  /* TRAINING PROGRESS */

  progressCard: {
    backgroundColor: "#2563EB",
    borderRadius: 23,
    padding: 18,
    marginBottom: 14,
  },

  progressTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  progressTitleWrapper: {
    flex: 1,
  },

  smallLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#BFDBFE",
    letterSpacing: 1,
  },

  trainingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 3,
  },

  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DBEAFE",
  },

  progressPercentage: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  progressBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  moduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  moduleText: {
    fontSize: 9,
    color: "#DBEAFE",
    fontWeight: "600",
  },

  viewTrainingButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewTrainingText: {
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  /* CERTIFICATE */

  certificateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  certificateIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  certificateInfo: {
    flex: 1,
  },

  certificateLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#D97706",
    letterSpacing: 0.8,
  },

  certificateTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 3,
  },

  certificateDescription: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
  },

  arrowCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionSubtitle: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 3,
  },

  seeAll: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  /* UPCOMING */

  upcomingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  dateBox: {
    width: 52,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  dateMonth: {
    fontSize: 8,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 1,
  },

  dateDay: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1D4ED8",
    marginTop: -2,
  },

  upcomingInfo: {
    flex: 1,
  },

  upcomingTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },

  detailText: {
    fontSize: 8,
    color: "#64748B",
    flex: 1,
  },

  upcomingArrow: {
    marginLeft: 5,
  },

  /* ANNOUNCEMENT */

  announcementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    marginBottom: 24,
  },

  announcementIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  announcementInfo: {
    flex: 1,
  },

  announcementTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  announcementDescription: {
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
    marginTop: 4,
  },

  announcementDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },

  announcementDateText: {
    fontSize: 8,
    color: "#94A3B8",
  },

  /* STATS */

  statsRow: {
    flexDirection: "row",
    gap: 9,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  blueIcon: {
    backgroundColor: "#EFF6FF",
  },

  greenIcon: {
    backgroundColor: "#F0FDF4",
  },

  orangeIcon: {
    backgroundColor: "#FFF7ED",
  },

  statValue: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },

  statLabel: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
  },

  bottomSpace: {
    height: 30,
  },
});