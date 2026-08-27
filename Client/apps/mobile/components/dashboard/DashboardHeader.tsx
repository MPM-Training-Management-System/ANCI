import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  participant: {
    firstName: string;
    profileImage: string;
  };
};

export default function DashboardHeader({
  participant,
}: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>
          Good morning,
        </Text>

        <Text style={styles.name}>
          {participant.firstName} 👋
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.notification}
        >
          <Ionicons
            name="notifications-outline"
            size={21}
            color="#0F172A"
          />

          <View style={styles.dot} />
        </Pressable>

        <Image
          source={{
            uri: participant.profileImage,
          }}
          style={styles.avatar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 22,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  greeting: {
    fontSize: 12,
    color: "#64748B",
  },

  name: {
    marginTop: 3,

    fontSize: 24,
    fontWeight: "800",

    letterSpacing: -0.5,

    color: "#0F172A",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  notification: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    position: "absolute",

    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#2563EB",

    top: 9,
    right: 10,

    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  avatar: {
    width: 44,
    height: 44,

    borderRadius: 15,

    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});