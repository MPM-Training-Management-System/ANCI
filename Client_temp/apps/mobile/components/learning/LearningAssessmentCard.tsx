import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  onPress: () => void;
}

export default function LearningAssessmentCard({
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Assessments
          </Text>

          <Text style={styles.subtitle}>
            Check your knowledge and progress.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.icon}>
          <Ionicons
            name="clipboard-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.cardTitle}>
            Training Assessments
          </Text>

          <Text style={styles.description}>
            View available assessments, completed
            assessments, and your scores.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color="#94A3B8"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },

  header: {
    marginHorizontal: 20,
    marginBottom: 11,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9,
    color: "#94A3B8",
  },

  card: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },

  description: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 13,
    color: "#64748B",
  },

  pressed: {
    opacity: 0.72,
  },
});