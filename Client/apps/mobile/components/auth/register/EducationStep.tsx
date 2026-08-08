import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  Input,
} from "@repo/ui-mobile";

export default function EducationStep() {
  const [
    highestEducation,
    setHighestEducation,
  ] = useState("");

  const [school, setSchool] =
    useState("");

  const [course, setCourse] =
    useState("");

  const [
    graduationYear,
    setGraduationYear,
  ] = useState("");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Input
        label="Highest Educational Attainment"
        required
        placeholder="Bachelor's Degree"
        value={highestEducation}
        onChangeText={
          setHighestEducation
        }
      />

      <Input
        label="School / University"
        placeholder="Colegio de Montalban"
        value={school}
        onChangeText={setSchool}
      />

      <Input
        label="Course / Degree"
        placeholder="Bachelor of Science in Information Technology"
        value={course}
        onChangeText={setCourse}
      />

      <Input
        label="Year Graduated"
        keyboardType="numeric"
        placeholder="2026"
        value={graduationYear}
        onChangeText={
          setGraduationYear
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 40,
  },
});