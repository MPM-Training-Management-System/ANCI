import React from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useParticipantProfile } from "@repo/hooks";

import ProfileHeader from "./ProfileHeader";
import ProfileInfoCard from "./ProfileInfoCard";
import CurrentTrainingCard from "./CurrentTrainingCard";
import CertificateSection from "./CertificateSection";
import ProfileMenu from "./ProfileMenu";

import {
  mockParticipantProfile,
  mockCertificates,
} from "@/src/data/profile";
import { participantApi } from "@/api/api";

export default function ProfileScreen() {
  const {
    profile,
    isLoading,
    error,
    refetch,
  } = useParticipantProfile(participantApi);

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Failed to load profile
        </Text>

        <Text style={styles.errorMessage}>
          Something went wrong while loading
          your profile.
        </Text>

        <Pressable
          onPress={refetch}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================
  // NO PROFILE
  // ==========================================

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons
            name="person-outline"
            size={30}
            color="#64748B"
          />
        </View>

        <Text style={styles.errorTitle}>
          Profile not found
        </Text>

        <Text style={styles.errorMessage}>
          We couldn't find your participant profile.
        </Text>

        <Pressable
          onPress={refetch}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================
  // MAIN PROFILE SCREEN
  //
  // At this point:
  // profile is guaranteed to be ParticipantProfile
  // ==========================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.eyebrow}>
            PARTICIPANT PORTAL
          </Text>

          <Text style={styles.title}>
            Profile
          </Text>

          <Text style={styles.subtitle}>
            Manage your account and achievements.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#2563EB"
          />
        </View>
      </View>

      {/* ======================================
          PROFILE HEADER
      ====================================== */}

      <ProfileHeader
        profile={profile}
      />

     

       <View style={styles.section}>
        <ProfileInfoCard
         profile={profile}
        />
      </View>

      {/* ======================================
          CURRENT TRAINING

          Temporary: still using mock data
          because currentTraining is not included
          in /api/participant-profiles/me
      ====================================== */}

      <View style={styles.section}>
        <CurrentTrainingCard
          title={
            mockParticipantProfile.currentTraining.title
          }
          trainer={
            mockParticipantProfile.currentTraining.trainer
          }
          progress={
            mockParticipantProfile.currentTraining.progress
          }
          status={
            mockParticipantProfile.currentTraining.status
          }
        />
      </View>

      {/* ======================================
          CERTIFICATES
      ====================================== */}

      <View style={styles.section}>
        <CertificateSection
          certificates={mockCertificates}
        />
      </View>

      {/* ======================================
          ACCOUNT MENU
      ====================================== */}

      <View style={styles.section}>
        <ProfileMenu />
      </View>

      {/* ======================================
          FOOTER
      ====================================== */}

      <View style={styles.footer}>
        <View style={styles.footerIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color="#2563EB"
          />
        </View>

        <Text style={styles.footerText}>
          Your account information is securely
          managed by ACE NextGen.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ==========================================
  // SCREEN
  // ==========================================

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingTop: 20,
    paddingBottom: 45,
  },

  // ==========================================
  // CENTER / LOADING / ERROR
  // ==========================================

  centerContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  errorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#2563EB",
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // ==========================================
  // PAGE HEADER
  // ==========================================

  pageHeader: {
    marginHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#2563EB",
  },

  title: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
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

  // ==========================================
  // SECTIONS
  // ==========================================

  section: {
    marginTop: 20,
  },

  // ==========================================
  // FOOTER
  // ==========================================

  footer: {
    marginTop: 25,
    marginHorizontal: 20,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  footerIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },
});