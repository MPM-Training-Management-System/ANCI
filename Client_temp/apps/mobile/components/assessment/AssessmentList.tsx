import React from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import AssessmentHeader from "./AssessmentHeader";
import AssessmentCard from "./AssessmentCard";

import {
  mockAssessments,
} from "@/src/data/participant";

export default function AssessmentList() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AssessmentHeader />

      <View style={styles.list}>
        {mockAssessments.map(
          (assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
            />
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  list: {
    marginTop: 5,
    gap: 12,
  },
});