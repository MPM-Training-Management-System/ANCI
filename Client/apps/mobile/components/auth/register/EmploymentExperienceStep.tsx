import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { Input } from "@repo/ui-mobile";

export default function EmploymentExperienceStep() {
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [industry, setIndustry] = useState("");

  const [previousTraining, setPreviousTraining] = useState("");
  const [trainingName, setTrainingName] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] = useState("");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Input
        label="Employment Status"
        required
        placeholder="Student / Employed / Self-employed"
        value={employmentStatus}
        onChangeText={setEmploymentStatus}
      />

      <Input
        label="Company"
        placeholder="ABC Corporation"
        value={company}
        onChangeText={setCompany}
      />

      <Input
        label="Position"
        placeholder="Software Developer"
        value={position}
        onChangeText={setPosition}
      />

      <Input
        label="Industry"
        placeholder="Information Technology"
        value={industry}
        onChangeText={setIndustry}
      />

      <Input
        label="Have you attended similar training?"
        required
        placeholder="Yes / No"
        value={previousTraining}
        onChangeText={setPreviousTraining}
      />

      <Input
        label="Training Name"
        placeholder="Leadership Seminar"
        value={trainingName}
        onChangeText={setTrainingName}
      />

      <Input
        label="Years of Experience"
        keyboardType="numeric"
        value={yearsExperience}
        onChangeText={setYearsExperience}
      />

      <Input
        label="Skills"
        placeholder="Communication, Leadership..."
        multiline
        numberOfLines={3}
        value={skills}
        onChangeText={setSkills}
      />

      <Input
        label="Certifications"
        placeholder="NC II, TESDA..."
        multiline
        numberOfLines={3}
        value={certifications}
        onChangeText={setCertifications}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 40,
  },
});