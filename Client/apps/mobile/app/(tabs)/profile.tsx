"use client";

import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { auth } from "@/api/auth";

export default function ProfileScreen() {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);

              console.log(
                "MOBILE LOGOUT STARTED"
              );

              // =================================================
              // REMOVE TOKEN
              // REMOVE USER
              // DISABLE BIOMETRIC LOGIN
              // =================================================

              await auth.logout();

              console.log(
                "MOBILE LOGOUT SUCCESS"
              );

              // =================================================
              // RETURN TO LOGIN
              // =================================================

              router.replace("/login");
            } catch (error) {
              console.error(
                "MOBILE LOGOUT ERROR:",
                error
              );

              Alert.alert(
                "Logout Failed",
                "Something went wrong while signing out. Please try again."
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <Text style={styles.title}>
          My Profile
        </Text>

        <Text style={styles.subtitle}>
          Manage your participant account.
        </Text>

        {/* =====================================================
            PROFILE HEADER
        ===================================================== */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={40}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.name}>
            Juan Dela Cruz
          </Text>

          <Text style={styles.email}>
            juan@email.com
          </Text>

          <View style={styles.participantBadge}>
            <Text
              style={styles.participantBadgeText}
            >
              PARTICIPANT
            </Text>
          </View>
        </View>

        {/* =====================================================
            ACCOUNT
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Personal Information"
            subtitle="View and update your details"
          />

          <MenuItem
            icon="mail-outline"
            title="Email Address"
            subtitle="juan@email.com"
          />

          <MenuItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
          />
        </View>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          Security
        </Text>

        <View style={styles.menuCard}>
          <MenuItem
            icon="shield-checkmark-outline"
            title="Account Verification"
            subtitle="Your account is verified"
            verified
          />

          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage notification preferences"
          />
        </View>

        {/* =====================================================
            LOGOUT
        ===================================================== */}

        <Pressable
          style={[
            styles.logoutButton,
            isLoggingOut &&
              styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#DC2626"
          />

          <Text style={styles.logoutText}>
            {isLoggingOut
              ? "Signing Out..."
              : "Sign Out"}
          </Text>
        </Pressable>

        {/* =====================================================
            VERSION
        ===================================================== */}

        <Text style={styles.version}>
          ACE NextGen Participant App{"\n"}
          Version 1.0.0
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

// =========================================================
// MENU ITEM
// =========================================================

function MenuItem({
  icon,
  title,
  subtitle,
  verified,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  verified?: boolean;
}) {
  return (
    <Pressable style={styles.menuItem}>
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#2563EB"
        />
      </View>

      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      {verified ? (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#16A34A"
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={19}
          color="#94A3B8"
        />
      )}
    </Pressable>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 110,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 25,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 28,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  email: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  participantBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },

  participantBadgeText: {
    color: "#2563EB",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 27,
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 72,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  menuSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 3,
  },

  logoutButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutButtonDisabled: {
    opacity: 0.6,
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800",
  },

  version: {
    textAlign: "center",
    fontSize: 9,
    lineHeight: 15,
    color: "#94A3B8",
    marginTop: 20,
  },

  bottomSpace: {
    height: 20,
  },
});