import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type AttendanceButtonProps = {
  onPress?: (
    event: GestureResponderEvent
  ) => void;

  onLongPress?: (
    event: GestureResponderEvent
  ) => void;

  accessibilityState?: {
    selected?: boolean;
  };
};

function AttendanceButton({
  onPress,
  onLongPress,
  accessibilityState,
}: AttendanceButtonProps) {
  const focused = accessibilityState?.selected;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.attendanceWrapper}
    >
      <View
        style={[
          styles.attendanceButton,
          focused && styles.attendanceButtonActive,
        ]}
      >
        <Ionicons
          name="qr-code-outline"
          size={28}
          color="#FFFFFF"
        />
      </View>

      <Text
        style={[
          styles.attendanceLabel,
          focused && styles.attendanceLabelActive,
        ]}
      >
        Attend
      </Text>
    </Pressable>
  );
}

export default function ParticipantTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: styles.tabBar,

        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
        },

        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      {/* HOME */}

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* TRAINING */}

      <Tabs.Screen
        name="training"
        options={{
          title: "Training",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "calendar"
                  : "calendar-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ATTENDANCE */}

      <Tabs.Screen
        name="attendance"
        options={{
          title: "",

          tabBarButton: (props) => (
            <AttendanceButton
              onPress={
                props.onPress ?? undefined
              }
              onLongPress={
                props.onLongPress ?? undefined
              }
              accessibilityState={
                props.accessibilityState
              }
            />
          ),
        }}
      />

      {/* CERTIFICATE */}

      <Tabs.Screen
        name="certificate"
        options={{
          title: "Certificate",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "ribbon"
                  : "ribbon-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "person"
                  : "person-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",

    left: 12,
    right: 12,
    bottom: 12,

    height: 68,

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    elevation: 8,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 12,

    paddingTop: 5,
    paddingBottom: 7,

    overflow: "visible",
  },

  attendanceWrapper: {
    width: 82,
    height: 82,

    alignItems: "center",

    marginTop: -25,
  },

  attendanceButton: {
    width: 62,
    height: 62,

    borderRadius: 31,

    backgroundColor: "#2563EB",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 5,
    borderColor: "#FFFFFF",

    elevation: 10,

    shadowColor: "#2563EB",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.28,

    shadowRadius: 8,
  },

  attendanceButtonActive: {
    backgroundColor: "#1D4ED8",
  },

  attendanceLabel: {
    marginTop: 3,

    fontSize: 9,

    fontWeight: "800",

    color: "#64748B",

    textTransform: "uppercase",
  },

  attendanceLabelActive: {
    color: "#2563EB",
  },
});