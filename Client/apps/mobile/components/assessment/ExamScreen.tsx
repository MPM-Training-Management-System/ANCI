import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  mockAssessments,
} from "@/src/data/participant";

import ExamHeader from "./ExamHeader";
import ExamProgress from "./ExamProgress";
import QuestionCard from "./QuestionCard";
import ExamNavigation from "./ExamNavigation";
import ExamInstructions from "./ExamInstructions";
import ExamResult from "./ExamResult";

export default function ExamScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const assessment = useMemo(
    () =>
      mockAssessments.find(
        (item) =>
          item.id === params.id
      ) ??
      mockAssessments.find(
        (item) =>
          item.status === "Available"
      ),
    [params.id]
  );

  const [started, setStarted] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<number, number>>({});

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  const [submitted, setSubmitted] =
    useState(false);

  useEffect(() => {
    if (
      !started ||
      submitted ||
      secondsLeft <= 0
    ) {
      return;
    }

    const timer =
      setInterval(() => {
        setSecondsLeft(
          (previous) =>
            Math.max(
              previous - 1,
              0
            )
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    started,
    submitted,
    secondsLeft,
  ]);

  useEffect(() => {
    if (
      started &&
      !submitted &&
      secondsLeft === 0
    ) {
      Alert.alert(
        "Time's Up",
        "Your assessment time has ended.",
        [
          {
            text: "Submit",
            onPress: () =>
              setSubmitted(true),
          },
        ],
        {
          cancelable: false,
        }
      );
    }
  }, [
    secondsLeft,
    started,
    submitted,
  ]);

  if (!assessment) {
    return null;
  }

  const question =
    assessment.questions[
      currentQuestion
    ];

  const totalQuestions =
    assessment.questions.length;

  const handleStart = () => {
    setSecondsLeft(
      assessment.durationMinutes * 60
    );

    setStarted(true);
  };

  const handleSelectAnswer = (
    answerIndex: number
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]:
        answerIndex,
    }));
  };

  const handleNext = () => {
    if (
      currentQuestion <
      totalQuestions - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      );
    }
  };

  const handleSubmit = () => {
    const unanswered =
      totalQuestions -
      Object.keys(answers).length;

    if (unanswered > 0) {
      Alert.alert(
        "Unanswered Questions",
        `You still have ${unanswered} unanswered question${
          unanswered === 1
            ? ""
            : "s"
        }. Are you sure you want to submit?`,
        [
          {
            text: "Continue Exam",
            style: "cancel",
          },
          {
            text: "Submit",
            style: "destructive",
            onPress: () =>
              setSubmitted(true),
          },
        ]
      );

      return;
    }

    setSubmitted(true);
  };

  if (!started) {
    return (
      <ExamInstructions
        assessment={assessment}
        onStart={handleStart}
      />
    );
  }

  if (submitted) {
    return (
      <ExamResult
        assessment={assessment}
        answers={answers}
        onBack={() =>
          router.replace(
            "/assessment"
          )
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <ExamHeader
        assessment={assessment}
        secondsLeft={secondsLeft}
      />

      <ExamProgress
        current={currentQuestion + 1}
        total={totalQuestions}
      />

      <QuestionCard
        question={question}
        questionNumber={
          currentQuestion + 1
        }
        selectedAnswer={
          answers[currentQuestion]
        }
        onSelectAnswer={
          handleSelectAnswer
        }
      />

      <ExamNavigation
        currentQuestion={
          currentQuestion
        }
        totalQuestions={
          totalQuestions
        }
        onPrevious={
          handlePrevious
        }
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});