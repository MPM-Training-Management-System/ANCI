import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import ProfileHeader from "./ProfileHeader";
import ProfileInfoCard from "./ProfileInfoCard";
import CurrentTrainingCard from "./CurrentTrainingCard";
import CertificateSection from "./CertificateSection";
import ProfileMenu from "./ProfileMenu";

import {
  mockParticipantProfile,
  mockCertificates,
} from "@/src/data/profile";

export default function ProfileScreen() {
  const profile =
    mockParticipantProfile;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

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

      {/* Profile */}

      <ProfileHeader
        fullName={profile.fullName}
        userCode={profile.userCode}
        role={profile.role}
        status={profile.status}
      />

      {/* Personal Information */}

      <View style={styles.section}>
        <ProfileInfoCard
          fullName={profile.fullName}
          email={profile.email}
          mobileNumber={
            profile.mobileNumber
          }
          memberSince={
            profile.memberSince
          }
        />
      </View>

      {/* Current Training */}

      <View style={styles.section}>
        <CurrentTrainingCard
          title={
            profile.currentTraining.title
          }
          trainer={
            profile.currentTraining.trainer
          }
          progress={
            profile.currentTraining.progress
          }
          status={
            profile.currentTraining.status
          }
        />
      </View>

      {/* Certificates */}

      <View style={styles.section}>
        <CertificateSection
          certificates={
            mockCertificates
          }
        />
      </View>

      {/* Account */}

      <View style={styles.section}>
        <ProfileMenu />
      </View>

      {/* Footer */}

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
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingTop: 20,
    paddingBottom: 45,
  },

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

  section: {
    marginTop: 20,
  },

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