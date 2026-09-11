"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { apiClient } from "@/api/api";

import { useWrittenAssessment } from "@repo/hooks";

import type {
  AssessmentQuestion,
  AssessmentResult,
} from "@repo/types";

// ============================================================
// TYPES
// ============================================================

type AnswerMap = Record<string, string>;

type RouteParams = {
  assessmentId?: string | string[];
};

// ============================================================
// HELPERS
// ============================================================

function getParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AssessmentScreen() {
  const router = useRouter();

 const params =
  useLocalSearchParams<{
    id?: string | string[];
  }>();

const assessmentId =
  Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const {
    participantAssessment,
    attempt,
    isLoading,
    error,

    loadParticipantAssessment,
    startAttempt,
    loadAttempt,
    submitAttempt,
    loadMyResults,
    clearError,
  } = useWrittenAssessment(apiClient);

  // ==========================================================
  // STATE
  // ==========================================================

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [hasStarted, setHasStarted] =
    useState(false);

  const [result, setResult] =
    useState<AssessmentResult | null>(null);

  // ==========================================================
  // LOAD ASSESSMENT
  // ==========================================================

  const loadAssessment = useCallback(
    async () => {
      if (!assessmentId) {
        return;
      }

      try {
        const data =
          await loadParticipantAssessment(
            assessmentId,
          );

        await loadMyResults(
          assessmentId,
        );

        /*
         * If already passed, do not automatically
         * start another attempt.
         */
        if (data.hasPassed) {
          setHasStarted(false);
          return;
        }
      } catch {
        /*
         * Hook already handles the error state.
         */
      }
    },
    [
      assessmentId,
      loadParticipantAssessment,
      loadMyResults,
    ],
  );

  useEffect(() => {
    loadAssessment();
  }, [loadAssessment]);

  // ==========================================================
  // START / RESUME ATTEMPT
  // ==========================================================

  const handleStartAssessment =
    useCallback(async () => {
      if (!assessmentId) {
        Alert.alert(
          "Assessment Error",
          "Assessment ID is missing.",
        );

        return;
      }

      if (
        participantAssessment?.hasPassed
      ) {
        Alert.alert(
          "Assessment Completed",
          "You have already passed this assessment.",
        );

        return;
      }

      try {
        /*
         * The backend handles resume logic.
         *
         * If there is already an in-progress attempt,
         * startAttempt() returns that attempt.
         *
         * We do NOT access attempt.answers here because
         * AssessmentAttempt does not expose an answers property.
         */
        await startAttempt(
          assessmentId,
        );

        setAnswers({});
        setCurrentQuestionIndex(0);

        /*
         * Do not show an old result when starting
         * or resuming an assessment.
         */
        setResult(null);

        setHasStarted(true);
      } catch {
        /*
         * Hook already handles the error state.
         */
      }
    }, [
      assessmentId,
      participantAssessment?.hasPassed,
      startAttempt,
    ]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    useCallback(async () => {
      setIsRefreshing(true);

      try {
        await loadAssessment();

        if (attempt?.id) {
          await loadAttempt(
            attempt.id,
          );
        }
      } finally {
        setIsRefreshing(false);
      }
    }, [
      loadAssessment,
      attempt?.id,
      loadAttempt,
    ]);

  // ==========================================================
  // QUESTIONS
  // ==========================================================

  const questions =
    useMemo<AssessmentQuestion[]>(
      () => {
        return attempt?.questions ?? [];
      },
      [attempt?.questions],
    );

  const currentQuestion =
    questions[
      currentQuestionIndex
    ];

  const selectedChoiceId =
    currentQuestion
      ? answers[currentQuestion.id]
      : undefined;

  // ==========================================================
  // ANSWER SELECTION
  // ==========================================================

  const handleSelectAnswer =
    useCallback(
      (
        questionId: string,
        choiceId: string,
      ) => {
        if (isSubmitting) {
          return;
        }

        setAnswers(current => ({
          ...current,
          [questionId]: choiceId,
        }));
      },
      [isSubmitting],
    );

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handlePrevious =
    useCallback(() => {
      setCurrentQuestionIndex(
        current =>
          Math.max(
            current - 1,
            0,
          ),
      );
    }, []);

  const handleNext =
    useCallback(() => {
      if (!currentQuestion) {
        return;
      }

      if (!selectedChoiceId) {
        Alert.alert(
          "Select an Answer",
          "Please select an answer before continuing.",
        );

        return;
      }

      setCurrentQuestionIndex(
        current =>
          Math.min(
            current + 1,
            questions.length - 1,
          ),
      );
    }, [
      currentQuestion,
      selectedChoiceId,
      questions.length,
    ]);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const unansweredCount =
    useMemo(() => {
      return questions.filter(
        question =>
          !answers[question.id],
      ).length;
    }, [
      questions,
      answers,
    ]);

  const handleSubmit =
    useCallback(async () => {
      if (!attempt?.id) {
        Alert.alert(
          "Assessment Error",
          "No active assessment attempt was found.",
        );

        return;
      }

      if (
        unansweredCount > 0
      ) {
        Alert.alert(
          "Incomplete Assessment",
          `You still have ${unansweredCount} unanswered question${
            unansweredCount === 1
              ? ""
              : "s"
          }. Please answer all questions before submitting.`,
        );

        return;
      }

      Alert.alert(
        "Submit Assessment",
        "Are you sure you want to submit your answers?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Submit",
            style: "default",
            onPress: async () => {
              setIsSubmitting(true);

              try {
                const resultData =
                  await submitAttempt({
                    attemptId:
                      attempt.id,

                    answers:
                      Object.entries(
                        answers,
                      ).map(
                        ([
                          questionId,
                          selectedChoiceId,
                        ]) => ({
                          questionId,
                          selectedChoiceId,
                        }),
                      ),
                  });

                setResult(
                  resultData,
                );

                setHasStarted(
                  false,
                );

                /*
                 * Refresh participant assessment
                 * so attempt count / passed status
                 * are updated.
                 */
                if (assessmentId) {
                  await loadParticipantAssessment(
                    assessmentId,
                  );
                }
              } catch {
                /*
                 * Hook handles error.
                 */
              } finally {
                setIsSubmitting(
                  false,
                );
              }
            },
          },
        ],
      );
    }, [
      attempt?.id,
      unansweredCount,
      answers,
      submitAttempt,
      assessmentId,
      loadParticipantAssessment,
    ]);

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack =
    useCallback(() => {
      router.back();
    }, [router]);

  // ==========================================================
  // MISSING ASSESSMENT ID
  // ==========================================================

  if (!assessmentId) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerContainer}
        >
          <Text
            style={styles.errorTitle}
          >
            Assessment Not Found
          </Text>

          <Text
            style={styles.errorText}
          >
            The assessment ID is missing.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={handleBack}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    isLoading &&
    !participantAssessment &&
    !result
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerContainer}
        >
          <ActivityIndicator
            size="large"
          />

          <Text
            style={styles.loadingText}
          >
            Loading assessment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ERROR SCREEN
  // ==========================================================

  if (
    error &&
    !participantAssessment &&
    !attempt &&
    !result
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerContainer}
        >
          <View
            style={styles.errorIcon}
          >
            <Text
              style={
                styles.errorIconText
              }
            >
              !
            </Text>
          </View>

          <Text
            style={styles.errorTitle}
          >
            Something went wrong
          </Text>

          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              clearError();
              loadAssessment();
            }}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Try Again
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleBack}
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // RESULT SCREEN
  // ==========================================================

  if (result) {
    const passed =
      result.isPassed;

    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={
            styles.resultScrollContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                isRefreshing
              }
              onRefresh={
                handleRefresh
              }
            />
          }
        >
          <View
            style={styles.resultHeader}
          >
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ‹
              </Text>
            </Pressable>

            <Text
              style={styles.headerTitle}
            >
              Assessment Result
            </Text>

            <View
              style={styles.headerSpacer}
            />
          </View>

          <View
            style={styles.resultCard}
          >
            <View
              style={[
                styles.resultIcon,
                passed
                  ? styles.resultIconPassed
                  : styles.resultIconFailed,
              ]}
            >
              <Text
                style={
                  styles.resultIconText
                }
              >
                {passed
                  ? "✓"
                  : "!"}
              </Text>
            </View>

            <Text
              style={styles.resultTitle}
            >
              {passed
                ? "Congratulations!"
                : "Assessment Completed"}
            </Text>

            <Text
              style={
                styles.resultSubtitle
              }
            >
              {passed
                ? "You passed the written assessment."
                : "You did not reach the passing score."}
            </Text>

            <View
              style={styles.scoreCard}
            >
              <Text
                style={styles.scoreLabel}
              >
                Your Score
              </Text>

              <Text
                style={styles.scoreValue}
              >
                {result.percentage}%
              </Text>

              <Text
                style={
                  styles.passingText
                }
              >
                Passing Score:{" "}
                {
                  participantAssessment?.passingPercentage ??
                  0
                }
                %
              </Text>
            </View>

            <View
              style={styles.resultDetails}
            >
              <View
                style={
                  styles.resultDetailRow
                }
              >
                <Text
                  style={
                    styles.resultDetailLabel
                  }
                >
                  Correct Answers
                </Text>

                <Text
                  style={
                    styles.resultDetailValue
                  }
                >
                  {result.correctAnswers}
                </Text>
              </View>

              <View
                style={
                  styles.resultDetailRow
                }
              >
                <Text
                  style={
                    styles.resultDetailLabel
                  }
                >
                  Total Questions
                </Text>

                <Text
                  style={
                    styles.resultDetailValue
                  }
                >
                  {result.totalQuestions}
                </Text>
              </View>
            </View>

            {passed ? (
              <Pressable
                style={
                  styles.primaryButton
                }
                onPress={
                  handleBack
                }
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Continue
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={
                  styles.primaryButton
                }
                onPress={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentQuestionIndex(
                    0,
                  );
                  setHasStarted(false);
                }}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Try Again
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // PASSED ALREADY
  // ==========================================================

  if (
    participantAssessment?.hasPassed &&
    !hasStarted
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={
            styles.resultScrollContent
          }
        >
          <View
            style={styles.resultHeader}
          >
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ‹
              </Text>
            </Pressable>

            <Text
              style={styles.headerTitle}
            >
              Assessment
            </Text>

            <View
              style={styles.headerSpacer}
            />
          </View>

          <View
            style={styles.resultCard}
          >
            <View
              style={[
                styles.resultIcon,
                styles.resultIconPassed,
              ]}
            >
              <Text
                style={
                  styles.resultIconText
                }
              >
                ✓
              </Text>
            </View>

            <Text
              style={styles.resultTitle}
            >
              Assessment Passed
            </Text>

            <Text
              style={
                styles.resultSubtitle
              }
            >
              You have already passed this
              assessment.
            </Text>

            {participantAssessment.latestPercentage !==
              null &&
              participantAssessment.latestPercentage !==
                undefined && (
                <View
                  style={
                    styles.scoreCard
                  }
                >
                  <Text
                    style={
                      styles.scoreLabel
                    }
                  >
                    Latest Score
                  </Text>

                  <Text
                    style={
                      styles.scoreValue
                    }
                  >
                    {
                      participantAssessment.latestPercentage
                    }
                    %
                  </Text>
                </View>
              )}

            <Pressable
              style={
                styles.primaryButton
              }
              onPress={handleBack}
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Continue
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // START SCREEN
  // ==========================================================

  if (
    !hasStarted ||
    !attempt
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={
            styles.startScrollContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                isRefreshing
              }
              onRefresh={
                handleRefresh
              }
            />
          }
        >
          <View
            style={styles.topHeader}
          >
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ‹
              </Text>
            </Pressable>

            <Text
              style={styles.headerTitle}
            >
              Assessment
            </Text>

            <View
              style={styles.headerSpacer}
            />
          </View>

          <View
            style={styles.assessmentHero}
          >
            <View
              style={styles.assessmentIcon}
            >
              <Text
                style={
                  styles.assessmentIconText
                }
              >
                ?
              </Text>
            </View>

            <Text
              style={
                styles.assessmentTitle
              }
            >
              {participantAssessment?.title ??
                "Written Assessment"}
            </Text>

            {participantAssessment?.description ? (
              <Text
                style={
                  styles.assessmentDescription
                }
              >
                {
                  participantAssessment.description
                }
              </Text>
            ) : (
              <Text
                style={
                  styles.assessmentDescription
                }
              >
                Test your knowledge from the
                learning materials.
              </Text>
            )}
          </View>

          <View
            style={styles.infoCard}
          >
            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Questions
              </Text>

              <Text
                style={styles.infoValue}
              >
                {
                  participantAssessment?.questionCount ??
                  0
                }
              </Text>
            </View>

            <View
              style={styles.infoDivider}
            />

            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Passing Score
              </Text>

              <Text
                style={styles.infoValue}
              >
                {
                  participantAssessment?.passingPercentage ??
                  0
                }
                %
              </Text>
            </View>

            <View
              style={styles.infoDivider}
            />

            <View
              style={styles.infoRow}
            >
              <Text
                style={styles.infoLabel}
              >
                Previous Attempts
              </Text>

              <Text
                style={styles.infoValue}
              >
                {
                  participantAssessment?.attemptCount ??
                  0
                }
              </Text>
            </View>
          </View>

          <View
            style={styles.instructionCard}
          >
            <Text
              style={
                styles.instructionTitle
              }
            >
              Before You Start
            </Text>

            <Text
              style={
                styles.instructionItem
              }
            >
              • Read each question carefully.
            </Text>

            <Text
              style={
                styles.instructionItem
              }
            >
              • Select one answer for each
              question.
            </Text>

            <Text
              style={
                styles.instructionItem
              }
            >
              • Answer all questions before
              submitting.
            </Text>

            <Text
              style={
                styles.instructionItem
              }
            >
              • Make sure your answers are
              correct before submitting.
            </Text>
          </View>

          {error ? (
            <View
              style={styles.inlineError}
            >
              <Text
                style={
                  styles.inlineErrorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              isLoading &&
                styles.disabledButton,
            ]}
            disabled={isLoading}
            onPress={
              handleStartAssessment
            }
          >
            {isLoading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Start Assessment
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // NO QUESTIONS
  // ==========================================================

  if (
    questions.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerContainer}
        >
          <View
            style={styles.errorIcon}
          >
            <Text
              style={
                styles.errorIconText
              }
            >
              !
            </Text>
          </View>

          <Text
            style={styles.errorTitle}
          >
            No Questions Found
          </Text>

          <Text
            style={styles.errorText}
          >
            This assessment does not have any
            questions yet.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={handleBack}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // CURRENT QUESTION
  // ==========================================================

  if (!currentQuestion) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerContainer}
        >
          <ActivityIndicator
            size="large"
          />

          <Text
            style={styles.loadingText}
          >
            Loading questions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // QUESTION STATE
  // ==========================================================

  const isFirstQuestion =
    currentQuestionIndex === 0;

  const isLastQuestion =
    currentQuestionIndex ===
    questions.length - 1;

  const progress =
    questions.length > 0
      ? (currentQuestionIndex + 1) /
        questions.length
      : 0;

  // ==========================================================
  // QUESTION SCREEN
  // ==========================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.questionScreen}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={styles.questionHeader}
        >
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
            disabled={isSubmitting}
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              ‹
            </Text>
          </Pressable>

          <View
            style={
              styles.questionHeaderCenter
            }
          >
            <Text
              style={
                styles.questionHeaderTitle
              }
              numberOfLines={1}
            >
              {participantAssessment?.title ??
                "Assessment"}
            </Text>

            <Text
              style={
                styles.questionHeaderSubtitle
              }
            >
              Question{" "}
              {currentQuestionIndex + 1}{" "}
              of{" "}
              {questions.length}
            </Text>
          </View>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* ====================================================
            PROGRESS
        ==================================================== */}

        <View
          style={styles.progressContainer}
        >
          <View
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* ====================================================
            QUESTION
        ==================================================== */}

        <ScrollView
          style={styles.questionScroll}
          contentContainerStyle={
            styles.questionContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                isRefreshing
              }
              onRefresh={
                handleRefresh
              }
            />
          }
        >
          <View
            style={
              styles.questionNumberBadge
            }
          >
            <Text
              style={
                styles.questionNumberText
              }
            >
              {currentQuestionIndex + 1}
            </Text>
          </View>

          <Text
            style={styles.questionText}
          >
            {
              currentQuestion.questionText
            }
          </Text>

          <Text
            style={styles.chooseText}
          >
            Choose the best answer.
          </Text>

          <View
            style={styles.choicesContainer}
          >
            {currentQuestion.choices
              .slice()
              .sort(
                (a, b) =>
                  a.displayOrder -
                  b.displayOrder,
              )
              .map(
                (
                  choice,
                  choiceIndex,
                ) => {
                  const isSelected =
                    selectedChoiceId ===
                    choice.id;

                  return (
                    <Pressable
                      key={choice.id}
                      style={[
                        styles.choiceCard,
                        isSelected &&
                          styles.choiceCardSelected,
                      ]}
                      disabled={
                        isSubmitting
                      }
                      onPress={() =>
                        handleSelectAnswer(
                          currentQuestion.id,
                          choice.id,
                        )
                      }
                    >
                      <View
                        style={[
                          styles.choiceCircle,
                          isSelected &&
                            styles.choiceCircleSelected,
                        ]}
                      >
                        {isSelected ? (
                          <View
                            style={
                              styles.choiceCircleInner
                            }
                          />
                        ) : null}
                      </View>

                      <View
                        style={
                          styles.choiceTextContainer
                        }
                      >
                        <Text
                          style={[
                            styles.choiceLetter,
                            isSelected &&
                              styles.choiceLetterSelected,
                          ]}
                        >
                          {String.fromCharCode(
                            65 +
                              choiceIndex,
                          )}
                        </Text>

                        <Text
                          style={[
                            styles.choiceText,
                            isSelected &&
                              styles.choiceTextSelected,
                          ]}
                        >
                          {
                            choice.choiceText
                          }
                        </Text>
                      </View>
                    </Pressable>
                  );
                },
              )}
          </View>

          {error ? (
            <View
              style={styles.inlineError}
            >
              <Text
                style={
                  styles.inlineErrorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <View
          style={styles.footer}
        >
          <View
            style={styles.footerTop}
          >
            <Text
              style={styles.answeredText}
            >
              {Object.keys(answers).length}{" "}
              of{" "}
              {questions.length} answered
            </Text>

            {unansweredCount > 0 && (
              <Text
                style={
                  styles.unansweredText
                }
              >
                {unansweredCount} remaining
              </Text>
            )}
          </View>

          <View
            style={styles.footerButtons}
          >
            {/* PREVIOUS */}

            <Pressable
              style={[
                styles.previousButton,
                isFirstQuestion &&
                  styles.disabledOutlineButton,
              ]}
              disabled={
                isFirstQuestion ||
                isSubmitting
              }
              onPress={
                handlePrevious
              }
            >
              <Text
                style={[
                  styles.previousButtonText,
                  isFirstQuestion &&
                    styles.disabledButtonText,
                ]}
              >
                Previous
              </Text>
            </Pressable>

            {/* NEXT / SUBMIT */}

            {isLastQuestion ? (
              <Pressable
                style={[
                  styles.submitButton,
                  (isSubmitting ||
                    !selectedChoiceId) &&
                    styles.disabledButton,
                ]}
                disabled={
                  isSubmitting ||
                  !selectedChoiceId
                }
                onPress={
                  handleSubmit
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.submitButtonText
                    }
                  >
                    Submit
                  </Text>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.nextButton,
                  !selectedChoiceId &&
                    styles.disabledButton,
                ]}
                disabled={
                  !selectedChoiceId ||
                  isSubmitting
                }
                onPress={
                  handleNext
                }
              >
                <Text
                  style={
                    styles.nextButtonText
                  }
                >
                  Next
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: "#64748B",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  questionHeaderCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },

  questionHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  questionHeaderSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  headerSpacer: {
    width: 40,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#0F172A",
    fontWeight: "300",
  },

  // ==========================================================
  // START SCREEN
  // ==========================================================

  startScrollContent: {
    paddingBottom: 32,
  },

  assessmentHero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },

  assessmentIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E7FF",
    marginBottom: 18,
  },

  assessmentIconText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#4F46E5",
  },

  assessmentTitle: {
    textAlign: "center",
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800",
    color: "#0F172A",
  },

  assessmentDescription: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  infoCard: {
    marginHorizontal: 20,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  infoRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  instructionCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
  },

  instructionTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  instructionItem: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },

  // ==========================================================
  // QUESTIONS
  // ==========================================================

  questionScreen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#4F46E5",
  },

  questionScroll: {
    flex: 1,
  },

  questionContent: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 30,
  },

  questionNumberBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E7FF",
    marginBottom: 16,
  },

  questionNumberText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#4F46E5",
  },

  questionText: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: "700",
    color: "#0F172A",
  },

  chooseText: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    color: "#64748B",
  },

  choicesContainer: {
    gap: 12,
  },

  choiceCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },

  choiceCardSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },

  choiceCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  choiceCircleSelected: {
    borderColor: "#4F46E5",
  },

  choiceCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5",
  },

  choiceTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 13,
  },

  choiceLetter: {
    width: 28,
    fontSize: 14,
    fontWeight: "800",
    color: "#64748B",
  },

  choiceLetterSelected: {
    color: "#4F46E5",
  },

  choiceText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: "#334155",
  },

  choiceTextSelected: {
    color: "#312E81",
    fontWeight: "600",
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  footerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  answeredText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },

  unansweredText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
  },

  footerButtons: {
    flexDirection: "row",
    gap: 10,
  },

  previousButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  previousButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },

  nextButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
  },

  nextButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  submitButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
  },

  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.45,
  },

  disabledOutlineButton: {
    opacity: 0.5,
  },

  disabledButtonText: {
    color: "#94A3B8",
  },

  // ==========================================================
  // GENERAL BUTTONS
  // ==========================================================

  primaryButton: {
    minHeight: 52,
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  secondaryButton: {
    minHeight: 50,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 20,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorIconText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#DC2626",
  },

  errorTitle: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  errorText: {
    marginTop: 8,
    maxWidth: 320,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  inlineError: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  inlineErrorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#B91C1C",
  },

  // ==========================================================
  // RESULT
  // ==========================================================

  resultScrollContent: {
    paddingBottom: 40,
  },

  resultCard: {
    marginHorizontal: 20,
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  resultIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },

  resultIconPassed: {
    backgroundColor: "#DCFCE7",
  },

  resultIconFailed: {
    backgroundColor: "#FEE2E2",
  },

  resultIconText: {
    fontSize: 38,
    fontWeight: "800",
    color: "#16A34A",
  },

  resultTitle: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  resultSubtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  scoreCard: {
    width: "100%",
    marginTop: 24,
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },

  scoreLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  scoreValue: {
    marginTop: 4,
    fontSize: 42,
    fontWeight: "900",
    color: "#4F46E5",
  },

  passingText: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  resultDetails: {
    width: "100%",
    marginTop: 18,
  },

  resultDetailRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  resultDetailLabel: {
    fontSize: 14,
    color: "#64748B",
  },

  resultDetailValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
});