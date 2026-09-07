import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  training: {
    title: string;
    status: string;
    progress: number;
    completedModules: number;
    totalModules: number;
  };
};

export default function TrainingProgressCard({
  training,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Ionicons
            name="school-outline"
            size={22}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.status}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            {training.status}
          </Text>
        </View>
      </View>

      <Text style={styles.label}>
        CURRENT TRAINING
      </Text>

      <Text style={styles.title}>
        {training.title}
      </Text>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          Training progress
        </Text>

        <Text style={styles.progressValue}>
          {training.progress}%
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progress,
            {
              width:
                `${training.progress}%`,
            },
          ]}
        />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.modules}>
          {training.completedModules} of{" "}
          {training.totalModules} modules
          completed
        </Text>

        <Ionicons
          name="arrow-forward"
          size={17}
          color="#2563EB"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,

    padding: 20,

    borderRadius: 22,

    backgroundColor: "#2563EB",

    overflow: "hidden",

    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 5,
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  icon: {
    width: 43,
    height: 43,

    borderRadius: 14,

    backgroundColor:
      "rgba(255,255,255,0.15)",

    alignItems: "center",
    justifyContent: "center",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor:
      "rgba(255,255,255,0.13)",
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#BBF7D0",

    marginRight: 6,
  },

  statusText: {
    fontSize: 10,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  label: {
    marginTop: 21,

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.4,

    color: "#BFDBFE",
  },

  title: {
    marginTop: 6,

    fontSize: 20,

    lineHeight: 26,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  progressHeader: {
    marginTop: 20,

    flexDirection: "row",

    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 10,

    color: "#DBEAFE",
  },

  progressValue: {
    fontSize: 11,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  progressBackground: {
    height: 7,

    marginTop: 8,

    borderRadius: 10,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    overflow: "hidden",
  },

  progress: {
    height: "100%",

    borderRadius: 10,

    backgroundColor: "#FFFFFF",
  },

  bottom: {
    marginTop: 13,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  modules: {
    fontSize: 10,

    color: "#DBEAFE",
  },
});