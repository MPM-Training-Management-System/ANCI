import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function LearningInfoCard() {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons
          name="bulb-outline"
          size={18}
          color="#2563EB"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Keep learning
        </Text>

        <Text style={styles.text}>
          Complete each module to unlock the next
          part of your training. Your progress is
          updated as you complete your lessons.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    gap: 9,
  },

  icon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
  },

  text: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 13,
    color: "#475569",
  },
});