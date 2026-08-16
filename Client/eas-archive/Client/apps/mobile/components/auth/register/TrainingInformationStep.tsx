import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Input,
} from "@repo/ui-mobile";

export default function TrainingInformationStep() {
  const [trainingProgram, setTrainingProgram] =
    useState("");

  const [trainingCategory, setTrainingCategory] =
    useState("");

  const [batch, setBatch] =
    useState("");

  const [trainingMode, setTrainingMode] =
    useState("");

  const [preferredSchedule, setPreferredSchedule] =
    useState("");

  const [trainingVenue, setTrainingVenue] =
    useState("");

  const [expectedStartDate, setExpectedStartDate] =
    useState("");

  const [trainingGoal, setTrainingGoal] =
    useState("");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Input
        label="Training Program"
        required
        placeholder="Leadership Training"
        value={trainingProgram}
        onChangeText={setTrainingProgram}
      />

      <Input
        label="Training Category"
        required
        placeholder="Professional Development"
        value={trainingCategory}
        onChangeText={setTrainingCategory}
      />

      <Input
        label="Training Batch"
        required
        placeholder="Batch 1"
        value={batch}
        onChangeText={setBatch}
      />

      {/* Replace with RadioGroup later */}
      <Input
        label="Training Mode"
        required
        placeholder="Face-to-Face / Online / Hybrid"
        value={trainingMode}
        onChangeText={setTrainingMode}
      />

      {/* Replace with Select */}
      <Input
        label="Preferred Schedule"
        required
        placeholder="Weekends"
        value={preferredSchedule}
        onChangeText={setPreferredSchedule}
      />

      <Input
        label="Training Venue"
        placeholder="Training Center"
        value={trainingVenue}
        onChangeText={setTrainingVenue}
      />

      {/* Replace with DatePicker */}
      <Input
        label="Expected Start Date"
        required
        placeholder="YYYY-MM-DD"
        value={expectedStartDate}
        onChangeText={setExpectedStartDate}
      />

      <View style={styles.divider} />

      <Input
        label="Training Goal"
        required
        placeholder="Why do you want to attend this training?"
        multiline
        numberOfLines={5}
        value={trainingGoal}
        onChangeText={setTrainingGoal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 40,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
});