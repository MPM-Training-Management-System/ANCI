import React from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { auth } from "@/api/auth";

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  danger?: boolean;
  onPress: () => void;
}

function MenuItem({
  icon,
  title,
  subtitle,
  danger = false,
  onPress,
}: MenuItemProps) {

  

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconBox,
          danger && styles.dangerIconBox,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            danger
              ? "#DC2626"
              : "#2563EB"
          }
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.itemTitle,
            danger && styles.dangerTitle,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#94A3B8"
      />
    </Pressable>
  );
}

export default function ProfileMenu() {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.logout();

              router.replace("/login");
            } catch (error) {
              console.error(
                "LOGOUT ERROR:",
                error
              );

              Alert.alert(
                "Logout Failed",
                "Something went wrong while logging out."
              );
            }
          },
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Account
      </Text>

      <View style={styles.card}>
        <MenuItem
          icon="create-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() =>
            Alert.alert(
              "Edit Profile",
              "Profile editing will be connected to the API later."
            )
          }
        />

        <View style={styles.divider} />

        <MenuItem
          icon="lock-closed-outline"
          title="Change Password"
          subtitle="Update your account password"
          onPress={() =>
            Alert.alert(
              "Change Password",
              "Password management will be connected to the API later."
            )
          }
        />

        <View style={styles.divider} />

        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help with your account"
          onPress={() =>
            Alert.alert(
              "Help & Support",
              "Support center will be available here."
            )
          }
        />

        <View style={styles.divider} />

        <MenuItem
          icon="log-out-outline"
          title="Logout"
          subtitle="Sign out from this device"
          danger
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  card: {
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  item: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIconBox: {
    backgroundColor: "#FEF2F2",
  },

  content: {
    flex: 1,
    marginHorizontal: 11,
  },

  itemTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
  },

  dangerTitle: {
    color: "#DC2626",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 8,
    color: "#94A3B8",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  pressed: {
    opacity: 0.65,
  },
});