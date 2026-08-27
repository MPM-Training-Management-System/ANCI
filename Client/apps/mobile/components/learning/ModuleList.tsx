import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  LearningModule,
} from "@/src/data/participant";

import ModuleCard from "./ModuleCard";

interface Props {
  modules: LearningModule[];
}

export default function ModuleList({
  modules,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Training Modules
          </Text>

          <Text style={styles.subtitle}>
            {modules.length} modules in your
            current training.
          </Text>
        </View>

        <View style={styles.count}>
          <Text style={styles.countText}>
            {modules.length}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {modules.map(
          (module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              number={index + 1}
            />
          )
        )}
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  count: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
  },

  list: {
    marginHorizontal: 20,
    gap: 10,
  },
});