import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Props {
  current: number;
  total: number;
}

export default function ExamProgress({
  current,
  total,
}: Props) {
  const progress =
    (current / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.question}>
          Question {current} of {total}
        </Text>

        <Text style={styles.percent}>
          {Math.round(progress)}%
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  question: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
  },

  percent: {
    fontSize: 8,
    fontWeight: "800",
    color: "#2563EB",
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
});