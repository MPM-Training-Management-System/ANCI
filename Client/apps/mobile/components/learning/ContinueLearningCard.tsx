import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  LearningModule,
} from "@/src/data/participant";

interface Props {
  module: LearningModule;
}

export default function ContinueLearningCard({
  module,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons
            name="play"
            size={17}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.label}>
            CONTINUE LEARNING
          </Text>

          <Text style={styles.title}>
            {module.title}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {module.description}
      </Text>

      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {module.progress}% complete
        </Text>

        <Text style={styles.lessons}>
          {module.lessons} lessons
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${module.progress}%`,
            },
          ]}
        />
      </View>

      <Pressable
        onPress={() => {}}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>
          Continue Module
        </Text>

        <Ionicons
          name="arrow-forward"
          size={17}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 17,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    shadowColor: "#2563EB",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  label: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  title: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  description: {
    marginTop: 12,
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
  },

  progressHeader: {
    marginTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#2563EB",
  },

  lessons: {
    fontSize: 8,
    color: "#94A3B8",
  },

  track: {
    height: 5,
    marginTop: 7,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  button: {
    height: 43,
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  buttonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.72,
  },
});