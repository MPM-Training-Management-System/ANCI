import React from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";

import LearningHeader from "./LearningHeader";
import LearningOverview from "./LearningOverview";
import ContinueLearningCard from "./ContinueLearningCard";
import ModuleList from "./ModuleList";
import LearningAssessmentCard from "./LearningAssessmentCard";
import LearningInfoCard from "./LearningInfoCard";

import {
  mockParticipant,
} from "@/src/data/participant";

export default function LearningScreen() {
  const modules =
    mockParticipant.learningModules;

  const currentModule =
    modules.find(
      (module) =>
        module.status === "In Progress"
    );

  const completed =
    modules.filter(
      (module) =>
        module.status === "Completed"
    ).length;

  const inProgress =
    modules.filter(
      (module) =>
        module.status === "In Progress"
    ).length;

  const locked =
    modules.filter(
      (module) =>
        module.status === "Locked"
    ).length;

  const handleOpenAssessments = () => {
    router.push("/assessment");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LearningHeader />

      <LearningOverview
        training={mockParticipant.training}
        completed={completed}
        inProgress={inProgress}
        locked={locked}
      />

      {currentModule && (
        <ContinueLearningCard
          module={currentModule}
        />
      )}

      <ModuleList
        modules={modules}
      />

      <LearningAssessmentCard
        onPress={handleOpenAssessments}
      />

      <LearningInfoCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingTop: 30,
    paddingBottom: 90,
  },
});