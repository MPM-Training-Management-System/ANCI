import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  AssessmentQuestion,
} from "@/src/data/participant";

import AnswerOption from "./AnswerOption";

interface Props {
  question: AssessmentQuestion;
  questionNumber: number;
  selectedAnswer?: number;
  onSelectAnswer: (
    answer: number
  ) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onSelectAnswer,
}: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.label}>
          QUESTION {questionNumber}
        </Text>

        <Text style={styles.question}>
          {question.question}
        </Text>

        <View style={styles.options}>
          {question.options.map(
            (option, index) => (
              <AnswerOption
                key={`${question.id}-${index}`}
                label={option}
                index={index}
                selected={
                  selectedAnswer ===
                  index
                }
                onPress={() =>
                  onSelectAnswer(index)
                }
              />
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 20,
  },

  card: {
    padding: 18,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  label: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#2563EB",
  },

  question: {
    marginTop: 9,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "800",
    color: "#0F172A",
  },

  options: {
    marginTop: 22,
    gap: 10,
  },
});