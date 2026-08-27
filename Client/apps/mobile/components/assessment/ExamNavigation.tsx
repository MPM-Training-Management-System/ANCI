import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function ExamNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
}: Props) {
  const isFirst =
    currentQuestion === 0;

  const isLast =
    currentQuestion ===
    totalQuestions - 1;

  return (
    <View style={styles.container}>
      <Pressable
        disabled={isFirst}
        onPress={onPrevious}
        style={({ pressed }) => [
          styles.previous,
          isFirst &&
            styles.disabled,
          pressed &&
            !isFirst &&
            styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={16}
          color={
            isFirst
              ? "#CBD5E1"
              : "#475569"
          }
        />

        <Text
          style={[
            styles.previousText,
            isFirst &&
              styles.disabledText,
          ]}
        >
          Previous
        </Text>
      </Pressable>

      {isLast ? (
        <Pressable
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.submit,
            pressed &&
              styles.pressed,
          ]}
        >
          <Text style={styles.submitText}>
            Submit Exam
          </Text>

          <Ionicons
            name="checkmark"
            size={17}
            color="#FFFFFF"
          />
        </Pressable>
      ) : (
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.next,
            pressed &&
              styles.pressed,
          ]}
        >
          <Text style={styles.nextText}>
            Next
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    gap: 10,
  },

  previous: {
    flex: 1,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  next: {
    flex: 1,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  submit: {
    flex: 1,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  previousText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#475569",
  },

  nextText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  submitText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  disabled: {
    opacity: 0.65,
  },

  disabledText: {
    color: "#CBD5E1",
  },

  pressed: {
    opacity: 0.72,
  },
});