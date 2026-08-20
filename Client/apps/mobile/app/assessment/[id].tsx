import React, {
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

// ============================================================
// TYPES
// ============================================================

type Question = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
};

// ============================================================
// MOCK QUESTIONS
// ============================================================

const QUESTIONS: Question[] = [
  {
    id: "Q001",
    question:
      "What is one of the most important qualities of an effective leader?",
    choices: [
      "Effective communication",
      "Avoiding responsibility",
      "Ignoring feedback",
      "Working alone",
    ],
    answer: 0,
  },

  {
    id: "Q002",
    question:
      "Which approach is best when resolving a conflict within a team?",
    choices: [
      "Ignore the issue",
      "Listen to both sides",
      "Immediately blame someone",
      "Remove everyone involved",
    ],
    answer: 1,
  },

  {
    id: "Q003",
    question:
      "What should a leader do when receiving constructive feedback?",
    choices: [
      "Reject it immediately",
      "Ignore the person",
      "Listen and evaluate it",
      "Punish the person",
    ],
    answer: 2,
  },

  {
    id: "Q004",
    question:
      "What helps a team achieve a common goal?",
    choices: [
      "Competition between members",
      "Clear communication and cooperation",
      "Avoiding responsibilities",
      "Working without a plan",
    ],
    answer: 1,
  },

  {
    id: "Q005",
    question:
      "Which behavior demonstrates accountability?",
    choices: [
      "Blaming others",
      "Accepting responsibility for actions",
      "Avoiding difficult tasks",
      "Hiding mistakes",
    ],
    answer: 1,
  },

  {
    id: "Q006",
    question:
      "What is an effective way to motivate team members?",
    choices: [
      "Threaten them",
      "Ignore their contributions",
      "Recognize their efforts",
      "Give unclear instructions",
    ],
    answer: 2,
  },

  {
    id: "Q007",
    question:
      "Why is active listening important for leaders?",
    choices: [
      "It helps understand concerns",
      "It prevents communication",
      "It avoids teamwork",
      "It eliminates feedback",
    ],
    answer: 0,
  },

  {
    id: "Q008",
    question:
      "What should a leader consider before making an important decision?",
    choices: [
      "Only personal preference",
      "Available information and consequences",
      "Rumors",
      "Nothing",
    ],
    answer: 1,
  },

  {
    id: "Q009",
    question:
      "Which is an example of good teamwork?",
    choices: [
      "Sharing responsibilities",
      "Keeping information secret",
      "Avoiding collaboration",
      "Competing against teammates",
    ],
    answer: 0,
  },

  {
    id: "Q010",
    question:
      "What is the purpose of setting clear goals?",
    choices: [
      "To confuse the team",
      "To establish direction",
      "To avoid accountability",
      "To reduce communication",
    ],
    answer: 1,
  },
];

// ============================================================
// SCREEN
// ============================================================

export default function AssessmentExamScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
  }>();

  const assessmentId =
    params.id ?? "ASM-001";

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<string, number>>({});

  const [submitted, setSubmitted] =
    useState(params.mode === "result");

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  const currentQuestion =
    QUESTIONS[currentIndex];

  // ==========================================================
  // CURRENT ANSWER
  // ==========================================================

  const selectedAnswer =
    answers[currentQuestion?.id];

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress =
    ((currentIndex + 1) /
      QUESTIONS.length) *
    100;

  // ==========================================================
  // SCORE
  // ==========================================================

  const score = useMemo(() => {
    return QUESTIONS.reduce(
      (total, question) => {
        const selected =
          answers[question.id];

        if (
          selected === question.answer
        ) {
          return total + 1;
        }

        return total;
      },
      0,
    );
  }, [answers]);

  const percentage = Math.round(
    (score / QUESTIONS.length) * 100,
  );

  const passed = percentage >= 80;

  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  function selectAnswer(
    answerIndex: number,
  ) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]:
        answerIndex,
    }));
  }

  // ==========================================================
  // PREVIOUS
  // ==========================================================

  function handlePrevious() {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex(
      (previous) => previous - 1,
    );
  }

  // ==========================================================
  // NEXT
  // ==========================================================

  function handleNext() {
    if (
      selectedAnswer === undefined
    ) {
      Alert.alert(
        "Answer Required",
        "Please select an answer before continuing.",
      );

      return;
    }

    if (
      currentIndex <
      QUESTIONS.length - 1
    ) {
      setCurrentIndex(
        (previous) => previous + 1,
      );

      return;
    }

    handleSubmit();
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  function handleSubmit() {
    Alert.alert(
      "Submit Assessment",
      "Are you sure you want to submit your answers?",
      [
        {
          text: "Review",
          style: "cancel",
        },

        {
          text: "Submit",
          onPress: () => {
            setSubmitted(true);
          },
        },
      ],
    );
  }

  // ==========================================================
  // BACK TO ASSESSMENTS
  // ==========================================================

  function backToAssessments() {
    router.replace("/assessment/index");
  }

  // ==========================================================
  // BACK TO TRAINING
  // ==========================================================

  function backToTraining() {
    router.replace("/training");
  }

  // ==========================================================
  // RESULT SCREEN
  // ==========================================================

  if (submitted) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.resultContent
          }
        >
          {/* HEADER */}

          <View style={styles.resultHeader}>
            <Pressable
              style={styles.backButton}
              onPress={
                backToAssessments
              }
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color="#0F172A"
              />
            </Pressable>

            <Text
              style={styles.resultHeaderTitle}
            >
              Assessment Result
            </Text>

            <View
              style={styles.headerSpacer}
            />
          </View>

          {/* ==================================================
              SCORE CARD
          ================================================== */}

          <View
            style={[
              styles.resultCard,
              passed
                ? styles.resultPassed
                : styles.resultFailed,
            ]}
          >
            <View style={styles.resultIcon}>
              <Ionicons
                name={
                  passed
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={46}
                color={
                  passed
                    ? "#16A34A"
                    : "#DC2626"
                }
              />
            </View>

            <Text
              style={styles.scoreLabel}
            >
              YOUR SCORE
            </Text>

            <Text
              style={[
                styles.score,
                {
                  color: passed
                    ? "#16A34A"
                    : "#DC2626",
                },
              ]}
            >
              {percentage}%
            </Text>

            <Text
              style={styles.scoreDetails}
            >
              {score} out of{" "}
              {QUESTIONS.length} correct
            </Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: passed
                    ? "#DCFCE7"
                    : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: passed
                      ? "#16A34A"
                      : "#DC2626",
                  },
                ]}
              >
                {passed
                  ? "PASSED"
                  : "FAILED"}
              </Text>
            </View>
          </View>

          {/* ==================================================
              RESULT DETAILS
          ================================================== */}

          <View
            style={styles.detailsCard}
          >
            <ResultRow
              icon="document-text-outline"
              label="Assessment"
              value="Leadership Final Assessment"
            />

            <ResultRow
              icon="school-outline"
              label="Training"
              value="Leadership Training"
            />

            <ResultRow
              icon="checkmark-circle-outline"
              label="Passing Score"
              value="80%"
            />

            <ResultRow
              icon="help-circle-outline"
              label="Questions"
              value={`${QUESTIONS.length}`}
            />

            <ResultRow
              icon="trophy-outline"
              label="Final Score"
              value={`${percentage}%`}
            />
          </View>

          {/* ==================================================
              PASSED
          ================================================== */}

          {passed ? (
            <View
              style={styles.successCard}
            >
              <View
                style={styles.successIcon}
              >
                <Ionicons
                  name="ribbon-outline"
                  size={24}
                  color="#D97706"
                />
              </View>

              <View
                style={styles.successInfo}
              >
                <Text
                  style={styles.successTitle}
                >
                  Assessment Passed
                </Text>

                <Text
                  style={styles.successText}
                >
                  Congratulations! You have
                  successfully completed the
                  assessment.
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={styles.failedCard}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#DC2626"
              />

              <Text
                style={styles.failedText}
              >
                You did not reach the 80%
                passing score. A retake may
                be available according to the
                training policy.
              </Text>
            </View>
          )}

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <Pressable
            style={styles.trainingButton}
            onPress={backToTraining}
          >
            <Text
              style={styles.trainingButtonText}
            >
              Back to Training
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>

          <Pressable
            style={styles.assessmentButton}
            onPress={
              backToAssessments
            }
          >
            <Text
              style={styles.assessmentButtonText}
            >
              Assessment History
            </Text>
          </Pressable>

          <View
            style={styles.bottomSpace}
          />
        </ScrollView>
      </View>
    );
  }

  // ==========================================================
  // EXAM SCREEN
  // ==========================================================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.examContent
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View style={styles.examHeader}>
          <Pressable
            style={styles.backButton}
            onPress={
              backToAssessments
            }
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={styles.examHeaderInfo}
          >
            <Text
              style={styles.examTitle}
            >
              Leadership Assessment
            </Text>

            <Text
              style={styles.examId}
            >
              {assessmentId}
            </Text>
          </View>

          <View style={styles.counter}>
            <Text
              style={styles.counterText}
            >
              {currentIndex + 1}/
              {QUESTIONS.length}
            </Text>
          </View>
        </View>

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <View
          style={styles.progressContainer}
        >
          <View
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text
            style={styles.progressText}
          >
            {Math.round(progress)}%
            complete
          </Text>
        </View>

        {/* ==================================================
            QUESTION
        ================================================== */}

        <View
          style={styles.questionCard}
        >
          <Text
            style={styles.questionNumber}
          >
            QUESTION {currentIndex + 1}
          </Text>

          <Text
            style={styles.questionText}
          >
            {currentQuestion.question}
          </Text>

          {/* CHOICES */}

          <View style={styles.choices}>
            {currentQuestion.choices.map(
              (choice, index) => {
                const selected =
                  selectedAnswer ===
                  index;

                return (
                  <Pressable
                    key={choice}
                    style={[
                      styles.choice,
                      selected &&
                        styles.choiceSelected,
                    ]}
                    onPress={() =>
                      selectAnswer(
                        index,
                      )
                    }
                  >
                    <View
                      style={[
                        styles.choiceCircle,
                        selected &&
                          styles.choiceCircleSelected,
                      ]}
                    >
                      {selected && (
                        <View
                          style={
                            styles.choiceDot
                          }
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.choiceText,
                        selected &&
                          styles.choiceTextSelected,
                      ]}
                    >
                      {choice}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>
        </View>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <View
          style={styles.infoCard}
        >
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#64748B"
          />

          <Text
            style={styles.infoText}
          >
            Select the best answer. You can
            go back and review your answers
            before submitting.
          </Text>
        </View>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <View
          style={styles.navigation}
        >
          <Pressable
            style={[
              styles.previousButton,
              currentIndex === 0 &&
                styles.disabledButton,
            ]}
            onPress={
              handlePrevious
            }
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="arrow-back"
              size={17}
              color={
                currentIndex === 0
                  ? "#CBD5E1"
                  : "#475569"
              }
            />

            <Text
              style={[
                styles.previousText,
                currentIndex === 0 &&
                  styles.disabledText,
              ]}
            >
              Previous
            </Text>
          </Pressable>

          <Pressable
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text
              style={styles.nextText}
            >
              {currentIndex ===
              QUESTIONS.length - 1
                ? "Submit"
                : "Next"}
            </Text>

            <Ionicons
              name={
                currentIndex ===
                QUESTIONS.length - 1
                  ? "checkmark"
                  : "arrow-forward"
              }
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </View>
  );
}

// ============================================================
// RESULT ROW
// ============================================================

function ResultRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.resultRow}>
      <View
        style={styles.resultRowIcon}
      >
        <Ionicons
          name={icon}
          size={17}
          color="#7C3AED"
        />
      </View>

      <Text
        style={styles.resultRowLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.resultRowValue}
      >
        {value}
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  examContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 110,
  },

  resultContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 110,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  examHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  examHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },

  examTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  examId: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 2,
  },

  counter: {
    backgroundColor: "#FAF5FF",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  counterText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#7C3AED",
  },

  // ==========================================================
  // PROGRESS
  // ==========================================================

  progressContainer: {
    marginBottom: 17,
  },

  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#7C3AED",
  },

  progressText: {
    fontSize: 8,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 5,
  },

  // ==========================================================
  // QUESTION
  // ==========================================================

  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  questionNumber: {
    fontSize: 8,
    fontWeight: "800",
    color: "#7C3AED",
    letterSpacing: 0.8,
  },

  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 9,
  },

  choices: {
    marginTop: 20,
    gap: 10,
  },

  choice: {
    minHeight: 57,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  choiceSelected: {
    backgroundColor: "#FAF5FF",
    borderColor: "#A78BFA",
  },

  choiceCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  choiceCircleSelected: {
    borderColor: "#7C3AED",
  },

  choiceDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#7C3AED",
  },

  choiceText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: "#475569",
  },

  choiceTextSelected: {
    color: "#581C87",
    fontWeight: "700",
  },

  // ==========================================================
  // INFORMATION
  // ==========================================================

  infoCard: {
    backgroundColor: "#F1F5F9",
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 13,
  },

  infoText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
    marginLeft: 7,
  },

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  navigation: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  previousButton: {
    flex: 1,
    height: 51,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  previousText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
  },

  nextButton: {
    flex: 1,
    height: 51,
    borderRadius: 15,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  nextText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.65,
  },

  disabledText: {
    color: "#CBD5E1",
  },

  // ==========================================================
  // RESULT HEADER
  // ==========================================================

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  resultHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerSpacer: {
    width: 42,
  },

  // ==========================================================
  // RESULT CARD
  // ==========================================================

  resultCard: {
    borderRadius: 23,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
  },

  resultPassed: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },

  resultFailed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },

  resultIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
    marginTop: 14,
  },

  score: {
    fontSize: 48,
    fontWeight: "900",
    marginTop: 1,
  },

  scoreDetails: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    marginTop: 11,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  // ==========================================================
  // RESULT DETAILS
  // ==========================================================

  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 15,
  },

  resultRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  resultRowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  resultRowLabel: {
    flex: 1,
    fontSize: 9,
    color: "#64748B",
  },

  resultRowValue: {
    maxWidth: "58%",
    fontSize: 9,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },

  // ==========================================================
  // SUCCESS
  // ==========================================================

  successCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  successIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  successInfo: {
    flex: 1,
  },

  successTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400E",
  },

  successText: {
    fontSize: 9,
    lineHeight: 14,
    color: "#A16207",
    marginTop: 3,
  },

  // ==========================================================
  // FAILED
  // ==========================================================

  failedCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  failedText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
    color: "#991B1B",
    marginLeft: 8,
  },

  // ==========================================================
  // RESULT BUTTONS
  // ==========================================================

  trainingButton: {
    height: 53,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  trainingButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  assessmentButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  assessmentButtonText: {
    color: "#7C3AED",
    fontSize: 10,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 30,
  },
});