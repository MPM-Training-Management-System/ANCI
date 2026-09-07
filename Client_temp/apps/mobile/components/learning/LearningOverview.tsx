import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type {
  ParticipantTraining,
} from "@/src/data/participant";

interface Props {
  training: ParticipantTraining;
  completed: number;
  inProgress: number;
  locked: number;
}

export default function LearningOverview({
  training,
  completed,
  inProgress,
  locked,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.trainingTop}>
        <View style={styles.trainingIcon}>
          <Ionicons
            name="school-outline"
            size={21}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.trainingInfo}>
          <Text style={styles.trainingLabel}>
            CURRENT TRAINING
          </Text>

          <Text style={styles.trainingTitle}>
            {training.title}
          </Text>

          <Text style={styles.trainingCode}>
            {training.code}
          </Text>
        </View>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          Overall Progress
        </Text>

        <Text style={styles.progressValue}>
          {training.progress}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${training.progress}%`,
            },
          ]}
        />
      </View>

      <View style={styles.stats}>
        <Stat
          value={completed}
          label="Completed"
        />

        <View style={styles.divider} />

        <Stat
          value={inProgress}
          label="In Progress"
        />

        <View style={styles.divider} />

        <Stat
          value={locked}
          label="Locked"
        />
      </View>
    </View>
  );
}

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 23,
    backgroundColor: "#0F172A",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 5,
  },

  trainingTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  trainingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  trainingInfo: {
    flex: 1,
    marginLeft: 11,
  },

  trainingLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#94A3B8",
  },

  trainingTitle: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  trainingCode: {
    marginTop: 3,
    fontSize: 8,
    color: "#94A3B8",
  },

  progressHeader: {
    marginTop: 21,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#CBD5E1",
  },

  progressValue: {
    fontSize: 9,
    fontWeight: "900",
    color: "#60A5FA",
  },

  progressTrack: {
    height: 6,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#334155",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#3B82F6",
  },

  stats: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 7,
    color: "#94A3B8",
  },

  divider: {
    width: 1,
    height: 25,
    backgroundColor: "#334155",
  },
});