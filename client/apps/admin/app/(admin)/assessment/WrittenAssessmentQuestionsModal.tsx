"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  AdminAssessmentChoice,
  AdminAssessmentQuestion,
  CreateAssessmentChoiceRequest,
  CreateAssessmentQuestionRequest,
  UpdateAssessmentChoiceRequest,
  UpdateAssessmentQuestionRequest,
  WrittenAssessment,
} from "@repo/types";

import { writtenAssessmentApi } from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

interface WrittenAssessmentQuestionsModalProps {
  assessment: WrittenAssessment;
  onClose: () => void;
  onChanged?: () => void;
}

type QuestionFormState = {
  questionNumber: string;
  questionText: string;
  points: string;
};

type ChoiceFormState = {
  choiceLabel: string;
  choiceText: string;
  isCorrect: boolean;
  displayOrder: string;
};

// ============================================================
// DEFAULT VALUES
// ============================================================

const EMPTY_QUESTION_FORM: QuestionFormState = {
  questionNumber: "",
  questionText: "",
  points: "1",
};

const EMPTY_CHOICE_FORM: ChoiceFormState = {
  choiceLabel: "",
  choiceText: "",
  isCorrect: false,
  displayOrder: "",
};

// ============================================================
// COMPONENT
// ============================================================

export default function WrittenAssessmentQuestionsModal({
  assessment,
  onClose,
  onChanged,
}: WrittenAssessmentQuestionsModalProps) {
  // ==========================================================
  // QUESTIONS
  // ==========================================================

  const [questions, setQuestions] =
    useState<AdminAssessmentQuestion[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  // ==========================================================
  // QUESTION FORM
  // ==========================================================

  const [questionForm, setQuestionForm] =
    useState<QuestionFormState>(
      EMPTY_QUESTION_FORM,
    );

  const [editingQuestionId, setEditingQuestionId] =
    useState<string | null>(null);

  const [isQuestionFormOpen, setIsQuestionFormOpen] =
    useState(false);

  const [savingQuestion, setSavingQuestion] =
    useState(false);

  const [deletingQuestionId, setDeletingQuestionId] =
    useState<string | null>(null);


      // ==========================================================
  // AI QUESTION GENERATION
  // ==========================================================

  const [isGenerateModalOpen, setIsGenerateModalOpen] =
    useState(false);

  const [generateFile, setGenerateFile] =
    useState<File | null>(null);

  const [generateQuestionCount, setGenerateQuestionCount] =
    useState("10");

  const [isGenerating, setIsGenerating] =
    useState(false);

  // ==========================================================
  // CHOICE FORM
  // ==========================================================

  const [choiceQuestionId, setChoiceQuestionId] =
    useState<string | null>(null);

  const [choiceForm, setChoiceForm] =
    useState<ChoiceFormState>(
      EMPTY_CHOICE_FORM,
    );

  const [editingChoiceId, setEditingChoiceId] =
    useState<string | null>(null);

  const [isChoiceFormOpen, setIsChoiceFormOpen] =
    useState(false);

  const [savingChoice, setSavingChoice] =
    useState(false);

  const [deletingChoiceId, setDeletingChoiceId] =
    useState<string | null>(null);

  // ==========================================================
  // LOAD QUESTIONS
  // ==========================================================

  const loadQuestions = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await writtenAssessmentApi.getQuestions(
            assessment.id,
          );

        setQuestions(
          Array.isArray(result)
            ? result
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load assessment questions:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load assessment questions.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [assessment.id],
  );

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  // ==========================================================
  // ESCAPE KEY
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getNextQuestionNumber = () => {
    if (questions.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...questions.map(
          question =>
            question.questionNumber,
        ),
      ) + 1
    );
  };

  const getNextChoiceOrder = (
    question: AdminAssessmentQuestion,
  ) => {
    if (question.choices.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...question.choices.map(
          choice =>
            choice.displayOrder,
        ),
      ) + 1
    );
  };

  // ==========================================================
  // QUESTION FORM
  // ==========================================================

  const openCreateQuestion = () => {
    clearMessages();

    setEditingQuestionId(null);

    setQuestionForm({
      questionNumber:
        String(
          getNextQuestionNumber(),
        ),
      questionText: "",
      points: "1",
    });

    setIsQuestionFormOpen(true);
  };

  const openEditQuestion = (
    question: AdminAssessmentQuestion,
  ) => {
    clearMessages();

    setEditingQuestionId(
      question.id,
    );

    setQuestionForm({
      questionNumber:
        String(
          question.questionNumber,
        ),
      questionText:
        question.questionText,
      points:
        String(question.points),
    });

    setIsQuestionFormOpen(true);
  };

  const closeQuestionForm = () => {
    if (savingQuestion) {
      return;
    }

    setIsQuestionFormOpen(false);
    setEditingQuestionId(null);
    setQuestionForm(
      EMPTY_QUESTION_FORM,
    );
  };

  const handleQuestionSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    clearMessages();

    const questionNumber =
      Number(
        questionForm.questionNumber,
      );

    const points =
      Number(
        questionForm.points,
      );

    if (
      !Number.isInteger(
        questionNumber,
      ) ||
      questionNumber < 1
    ) {
      setError(
        "Question number must be at least 1.",
      );
      return;
    }

    if (
      !questionForm.questionText.trim()
    ) {
      setError(
        "Question text is required.",
      );
      return;
    }

    if (
      !Number.isInteger(points) ||
      points < 1
    ) {
      setError(
        "Points must be at least 1.",
      );
      return;
    }

    try {
      setSavingQuestion(true);

      if (editingQuestionId) {
        const request: UpdateAssessmentQuestionRequest =
          {
            questionNumber,
            questionText:
              questionForm.questionText.trim(),
            points,
          };

        const updated =
          await writtenAssessmentApi.updateQuestion(
            editingQuestionId,
            request,
          );

        setQuestions(current =>
          current
            .map(question =>
              question.id ===
              editingQuestionId
                ? updated
                : question,
            )
            .sort(
              (a, b) =>
                a.questionNumber -
                b.questionNumber,
            ),
        );

        setSuccess(
          "Question updated successfully.",
        );
      } else {
        const request: CreateAssessmentQuestionRequest =
          {
            writtenAssessmentId:
              assessment.id,
            questionNumber,
            questionText:
              questionForm.questionText.trim(),
            points,
          };

        const created =
          await writtenAssessmentApi.createQuestion(
            request,
          );

        setQuestions(current =>
          [
            ...current,
            created,
          ].sort(
            (a, b) =>
              a.questionNumber -
              b.questionNumber,
          ),
        );

        setSuccess(
          "Question created successfully.",
        );
      }

      setIsQuestionFormOpen(false);
      setEditingQuestionId(null);
      setQuestionForm(
        EMPTY_QUESTION_FORM,
      );

      onChanged?.();
    } catch (err) {
      console.error(
        "Failed to save question:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save question.",
      );
    } finally {
      setSavingQuestion(false);
    }
  };

  // ==========================================================
  // DELETE QUESTION
  // ==========================================================

  const handleDeleteQuestion = async (
    question: AdminAssessmentQuestion,
  ) => {
    const confirmed =
      window.confirm(
        `Delete Question ${question.questionNumber}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();

      setDeletingQuestionId(
        question.id,
      );

      await writtenAssessmentApi.deleteQuestion(
        question.id,
      );

      setQuestions(current =>
        current.filter(
          item =>
            item.id !== question.id,
        ),
      );

      setSuccess(
        "Question deleted successfully.",
      );

      onChanged?.();
    } catch (err) {
      console.error(
        "Failed to delete question:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete question.",
      );
    } finally {
      setDeletingQuestionId(null);
    }
  };



    // ==========================================================
  // AI QUESTION GENERATION
  // ==========================================================

  const openGenerateModal = () => {
    if (assessment.isPublished) {
      return;
    }

    clearMessages();

    setGenerateFile(null);
    setGenerateQuestionCount("10");
    setIsGenerateModalOpen(true);
  };

  const closeGenerateModal = () => {
    if (isGenerating) {
      return;
    }

    setIsGenerateModalOpen(false);
    setGenerateFile(null);
    setGenerateQuestionCount("10");
  };

  const handleGenerateFromDocument = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    clearMessages();

    if (assessment.isPublished) {
      setError(
        "Published assessments cannot be modified.",
      );
      return;
    }

    if (!generateFile) {
      setError(
        "Please select a DOCX document.",
      );
      return;
    }

    const extension =
      generateFile.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (extension !== "docx") {
      setError(
        "Only DOCX documents are supported.",
      );
      return;
    }

    const questionCount =
      Number(generateQuestionCount);

    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > 100
    ) {
      setError(
        "Question count must be between 1 and 100.",
      );
      return;
    }

    try {
      setIsGenerating(true);

      const generated =
        await writtenAssessmentApi.generateFromDocument(
          assessment.id,
          generateFile,
          questionCount,
        );

      setQuestions(current =>
        [
          ...current,
          ...generated,
        ].sort(
          (a, b) =>
            a.questionNumber -
            b.questionNumber,
        ),
      );

      setSuccess(
        `${generated.length} question${
          generated.length === 1
            ? ""
            : "s"
        } generated successfully.`,
      );

      setIsGenerateModalOpen(false);
      setGenerateFile(null);
      setGenerateQuestionCount("10");

      onChanged?.();
    } catch (err) {
      console.error(
        "Failed to generate questions from document:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate questions from document.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================================
  // CHOICE FORM
  // ==========================================================

  const openCreateChoice = (
    question: AdminAssessmentQuestion,
  ) => {
    clearMessages();

    setChoiceQuestionId(
      question.id,
    );

    setEditingChoiceId(null);

    setChoiceForm({
      choiceLabel: "",
      choiceText: "",
      isCorrect: false,
      displayOrder:
        String(
          getNextChoiceOrder(
            question,
          ),
        ),
    });

    setIsChoiceFormOpen(true);
  };

  const openEditChoice = (
    question: AdminAssessmentQuestion,
    choice: AdminAssessmentChoice,
  ) => {
    clearMessages();

    setChoiceQuestionId(
      question.id,
    );

    setEditingChoiceId(
      choice.id,
    );

    setChoiceForm({
      choiceLabel:
        choice.choiceLabel,
      choiceText:
        choice.choiceText,
      isCorrect:
        choice.isCorrect,
      displayOrder:
        String(
          choice.displayOrder,
        ),
    });

    setIsChoiceFormOpen(true);
  };

  const closeChoiceForm = () => {
    if (savingChoice) {
      return;
    }

    setIsChoiceFormOpen(false);
    setChoiceQuestionId(null);
    setEditingChoiceId(null);
    setChoiceForm(
      EMPTY_CHOICE_FORM,
    );
  };

  // ==========================================================
  // SAVE CHOICE
  // ==========================================================

  const handleChoiceSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    clearMessages();

    if (!choiceQuestionId) {
      setError(
        "Question was not selected.",
      );
      return;
    }

    if (
      !choiceForm.choiceLabel.trim()
    ) {
      setError(
        "Choice label is required.",
      );
      return;
    }

    if (
      !choiceForm.choiceText.trim()
    ) {
      setError(
        "Choice text is required.",
      );
      return;
    }

    const displayOrder =
      Number(
        choiceForm.displayOrder,
      );

    if (
      !Number.isInteger(
        displayOrder,
      ) ||
      displayOrder < 1
    ) {
      setError(
        "Display order must be at least 1.",
      );
      return;
    }

    const question =
      questions.find(
        item =>
          item.id ===
          choiceQuestionId,
      );

    if (!question) {
      setError(
        "Question was not found.",
      );
      return;
    }

    // ========================================================
    // ONLY ONE CORRECT ANSWER
    // ========================================================

    const anotherCorrectChoice =
      question.choices.some(
        choice =>
          choice.isCorrect &&
          choice.id !==
            editingChoiceId,
      );

    if (
      choiceForm.isCorrect &&
      anotherCorrectChoice
    ) {
      const replaceCorrect =
        window.confirm(
          "Another choice is currently marked as correct. Make this choice the new correct answer?",
        );

      if (!replaceCorrect) {
        return;
      }
    }

    try {
      setSavingChoice(true);

      if (editingChoiceId) {
        const request: UpdateAssessmentChoiceRequest =
          {
            choiceLabel:
              choiceForm.choiceLabel.trim(),
            choiceText:
              choiceForm.choiceText.trim(),
            isCorrect:
              choiceForm.isCorrect,
            displayOrder,
          };

        const updated =
          await writtenAssessmentApi.updateChoice(
            editingChoiceId,
            request,
          );

        setQuestions(current =>
          current.map(item => {
            if (
              item.id !==
              choiceQuestionId
            ) {
              return item;
            }

            return {
              ...item,
              choices:
                item.choices
                  .map(choice => {
                    if (
                      choice.id ===
                      editingChoiceId
                    ) {
                      return updated;
                    }

                    if (
                      choiceForm.isCorrect &&
                      choice.isCorrect
                    ) {
                      return {
                        ...choice,
                        isCorrect: false,
                      };
                    }

                    return choice;
                  })
                  .sort(
                    (a, b) =>
                      a.displayOrder -
                      b.displayOrder,
                  ),
            };
          }),
        );

        setSuccess(
          "Choice updated successfully.",
        );
      } else {
        const request: CreateAssessmentChoiceRequest =
          {
            assessmentQuestionId:
              choiceQuestionId,
            choiceLabel:
              choiceForm.choiceLabel.trim(),
            choiceText:
              choiceForm.choiceText.trim(),
            isCorrect:
              choiceForm.isCorrect,
            displayOrder,
          };

        const created =
          await writtenAssessmentApi.createChoice(
            request,
          );

        setQuestions(current =>
          current.map(item => {
            if (
              item.id !==
              choiceQuestionId
            ) {
              return item;
            }

            return {
              ...item,
              choices:
                [
                  ...item.choices.map(
                    choice =>
                      choiceForm.isCorrect &&
                      choice.isCorrect
                        ? {
                            ...choice,
                            isCorrect: false,
                          }
                        : choice,
                  ),
                  created,
                ].sort(
                  (a, b) =>
                    a.displayOrder -
                    b.displayOrder,
                ),
            };
          }),
        );

        setSuccess(
          "Choice created successfully.",
        );
      }

      closeChoiceForm();

      onChanged?.();
    } catch (err) {
      console.error(
        "Failed to save choice:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save choice.",
      );
    } finally {
      setSavingChoice(false);
    }
  };

  // ==========================================================
  // DELETE CHOICE
  // ==========================================================

  const handleDeleteChoice = async (
    choice: AdminAssessmentChoice,
  ) => {
    const confirmed =
      window.confirm(
        `Delete choice "${choice.choiceLabel}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();

      setDeletingChoiceId(
        choice.id,
      );

      await writtenAssessmentApi.deleteChoice(
        choice.id,
      );

      setQuestions(current =>
        current.map(question => ({
          ...question,
          choices:
            question.choices.filter(
              item =>
                item.id !==
                choice.id,
            ),
        })),
      );

      setSuccess(
        "Choice deleted successfully.",
      );

      onChanged?.();
    } catch (err) {
      console.error(
        "Failed to delete choice:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete choice.",
      );
    } finally {
      setDeletingChoiceId(null);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/50
        p-4
      "
      onMouseDown={event => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-[#e7e9ec]
            px-6
            py-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Question Management
            </p>

            <h2
              className="
                mt-1
                truncate
                text-xl
                font-bold
                text-[#17191c]
              "
            >
              {assessment.title}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              {assessment.batchCode}
              {" • "}
              Passing score:{" "}
              {assessment.passingPercentage}%
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              ml-4
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-[#dfe2e6]
              text-gray-500
              transition
              hover:bg-gray-50
              hover:text-black
            "
          >
            ×
          </button>
        </div>

        {/* ====================================================
            BODY
        ==================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-5
          "
        >
          {/* ALERTS */}

          {error && (
            <div
              className="
                mb-4
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
              "
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="
                mb-4
                rounded-xl
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-700
              "
            >
              {success}
            </div>
          )}

          {/* TOOLBAR */}

          <div
            className="
              mb-5
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h3
                className="
                  text-sm
                  font-bold
                  text-[#17191c]
                "
              >
                Questions
              </h3>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-gray-500
                "
              >
                {questions.length}{" "}
                question
                {questions.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
            

            <div
  className="
    flex
    flex-wrap
    items-center
    gap-2
  "
>
  <button
    type="button"
    onClick={openGenerateModal}
    disabled={
      assessment.isPublished ||
      isGenerating
    }
    className="
      rounded-xl
      border
      border-[#dfe2e6]
      bg-white
      px-4
      py-2.5
      text-xs
      font-semibold
      text-gray-700
      transition
      hover:bg-gray-50
      disabled:cursor-not-allowed
      disabled:opacity-40
    "
  >
    {isGenerating
      ? "Generating..."
      : "Generate from DOCX"}
  </button>

  <button
    type="button"
    onClick={openCreateQuestion}
    disabled={
      assessment.isPublished ||
      isGenerating
    }
    className="
      rounded-xl
      bg-black
      px-4
      py-2.5
      text-xs
      font-semibold
      text-white
      transition
      hover:bg-gray-800
      disabled:cursor-not-allowed
      disabled:opacity-40
    "
  >
    + Add Question
  </button>
</div>
          </div>

          {/* PUBLISHED WARNING */}

          {assessment.isPublished && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-amber-200
                bg-amber-50
                px-4
                py-3
                text-xs
                text-amber-700
              "
            >
              This assessment is published.
              Question and choice editing is
              disabled.
            </div>
          )}

          {/* LOADING */}

          {isLoading && (
            <div
              className="
                rounded-2xl
                border
                border-[#e7e9ec]
                px-5
                py-10
                text-center
                text-sm
                text-gray-400
              "
            >
              Loading questions...
            </div>
          )}

          {/* EMPTY */}

          {!isLoading &&
            questions.length === 0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-[#dfe2e6]
                  px-5
                  py-12
                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#17191c]
                  "
                >
                  No questions yet
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500
                  "
                >
                  Add the first question
                  to this assessment.
                </p>
              </div>
            )}

          {/* QUESTIONS */}

          {!isLoading &&
            questions.length > 0 && (
              <div className="space-y-4">
                {questions.map(
                  question => (
                    <div
                      key={
                        question.id
                      }
                      className="
                        rounded-2xl
                        border
                        border-[#e7e9ec]
                        bg-white
                        p-5
                      "
                    >
                      {/* QUESTION HEADER */}

                      <div
                        className="
                          flex
                          flex-col
                          gap-3
                          sm:flex-row
                          sm:items-start
                          sm:justify-between
                        "
                      >
                        <div className="min-w-0">
                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >
                            <span
                              className="
                                rounded-lg
                                bg-gray-100
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                text-gray-600
                              "
                            >
                              Q
                              {
                                question.questionNumber
                              }
                            </span>

                            <span
                              className="
                                text-[10px]
                                font-semibold
                                text-gray-400
                              "
                            >
                              {
                                question.points
                              }{" "}
                              point
                              {question.points ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          </div>

                          <p
                            className="
                              mt-3
                              whitespace-pre-wrap
                              text-sm
                              font-semibold
                              leading-6
                              text-[#17191c]
                            "
                          >
                            {
                              question.questionText
                            }
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            disabled={
                              assessment.isPublished
                            }
                            onClick={() =>
                              openEditQuestion(
                                question,
                              )
                            }
                            className="
                              rounded-lg
                              border
                              border-[#dfe2e6]
                              px-3
                              py-1.5
                              text-[11px]
                              font-semibold
                              text-gray-700
                              transition
                              hover:bg-gray-50
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              assessment.isPublished ||
                              deletingQuestionId ===
                                question.id
                            }
                            onClick={() =>
                              void handleDeleteQuestion(
                                question,
                              )
                            }
                            className="
                              rounded-lg
                              border
                              border-red-200
                              px-3
                              py-1.5
                              text-[11px]
                              font-semibold
                              text-red-600
                              transition
                              hover:bg-red-50
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            {deletingQuestionId ===
                            question.id
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>

                      {/* CHOICES */}

                      <div
                        className="
                          mt-5
                          border-t
                          border-[#eef0f2]
                          pt-4
                        "
                      >
                        <div
                          className="
                            mb-3
                            flex
                            items-center
                            justify-between
                          "
                        >
                          <p
                            className="
                              text-xs
                              font-bold
                              text-gray-600
                            "
                          >
                            Choices
                          </p>

                          <button
                            type="button"
                            disabled={
                              assessment.isPublished
                            }
                            onClick={() =>
                              openCreateChoice(
                                question,
                              )
                            }
                            className="
                              text-[11px]
                              font-semibold
                              text-black
                              hover:underline
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            + Add Choice
                          </button>
                        </div>

                        {question.choices
                          .length ===
                          0 && (
                          <p
                            className="
                              rounded-xl
                              bg-gray-50
                              px-4
                              py-3
                              text-xs
                              text-gray-400
                            "
                          >
                            No choices
                            added yet.
                          </p>
                        )}

                        {question.choices
                          .length > 0 && (
                          <div className="space-y-2">
                            {question.choices
                              .map(
                                choice => (
                                  <div
                                    key={
                                      choice.id
                                    }
                                    className="
                                      flex
                                      flex-col
                                      gap-3
                                      rounded-xl
                                      border
                                      border-[#e7e9ec]
                                      px-4
                                      py-3
                                      sm:flex-row
                                      sm:items-center
                                      sm:justify-between
                                    "
                                  >
                                    <div
                                      className="
                                        flex
                                        min-w-0
                                        items-start
                                        gap-3
                                      "
                                    >
                                      <span
                                        className="
                                          flex
                                          h-7
                                          w-7
                                          shrink-0
                                          items-center
                                          justify-center
                                          rounded-lg
                                          bg-gray-100
                                          text-[10px]
                                          font-bold
                                          text-gray-600
                                        "
                                      >
                                        {
                                          choice.choiceLabel
                                        }
                                      </span>

                                      <div className="min-w-0">
                                        <p
                                          className="
                                            text-xs
                                            text-[#17191c]
                                          "
                                        >
                                          {
                                            choice.choiceText
                                          }
                                        </p>

                                        <div
                                          className="
                                            mt-1.5
                                            flex
                                            items-center
                                            gap-2
                                          "
                                        >
                                          {choice.isCorrect && (
                                            <span
                                              className="
                                                rounded-full
                                                bg-green-50
                                                px-2
                                                py-0.5
                                                text-[9px]
                                                font-bold
                                                text-green-700
                                              "
                                            >
                                              Correct Answer
                                            </span>
                                          )}

                                          <span
                                            className="
                                              text-[9px]
                                              text-gray-400
                                            "
                                          >
                                            Order{" "}
                                            {
                                              choice.displayOrder
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div
                                      className="
                                        flex
                                        shrink-0
                                        items-center
                                        gap-2
                                      "
                                    >
                                      <button
                                        type="button"
                                        disabled={
                                          assessment.isPublished
                                        }
                                        onClick={() =>
                                          openEditChoice(
                                            question,
                                            choice,
                                          )
                                        }
                                        className="
                                          rounded-lg
                                          border
                                          border-[#dfe2e6]
                                          px-3
                                          py-1.5
                                          text-[10px]
                                          font-semibold
                                          text-gray-700
                                          transition
                                          hover:bg-gray-50
                                          disabled:cursor-not-allowed
                                          disabled:opacity-40
                                        "
                                      >
                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        disabled={
                                          assessment.isPublished ||
                                          deletingChoiceId ===
                                            choice.id
                                        }
                                        onClick={() =>
                                          void handleDeleteChoice(
                                            choice,
                                          )
                                        }
                                        className="
                                          rounded-lg
                                          border
                                          border-red-200
                                          px-3
                                          py-1.5
                                          text-[10px]
                                          font-semibold
                                          text-red-600
                                          transition
                                          hover:bg-red-50
                                          disabled:cursor-not-allowed
                                          disabled:opacity-40
                                        "
                                      >
                                        {deletingChoiceId ===
                                        choice.id
                                          ? "..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </div>
                                ),
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-[#e7e9ec]
            px-6
            py-4
          "
        >
          <p
            className="
              text-[10px]
              text-gray-400
            "
          >
            Admin only • Correct answers
            are visible here.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              bg-black
              px-5
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-gray-800
            "
          >
            Done
          </button>
        </div>
      </div>

      {/* ======================================================
          QUESTION FORM MODAL
      ====================================================== */}

      {isQuestionFormOpen && (
        <div
          className="
            fixed
            inset-0
            z-[110]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onMouseDown={event => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeQuestionForm();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
          >
            <div className="mb-5">
              <h3
                className="
                  text-lg
                  font-bold
                  text-[#17191c]
                "
              >
                {editingQuestionId
                  ? "Edit Question"
                  : "Add Question"}
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Create the question before
                adding its choices.
              </p>
            </div>

            <form
              onSubmit={
                handleQuestionSubmit
              }
              className="space-y-4"
            >
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Question Number
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={
                      questionForm.questionNumber
                    }
                    onChange={event =>
                      setQuestionForm(
                        current => ({
                          ...current,
                          questionNumber:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#dfe2e6]
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-black
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Points
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={
                      questionForm.points
                    }
                    onChange={event =>
                      setQuestionForm(
                        current => ({
                          ...current,
                          points:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#dfe2e6]
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-black
                    "
                  />
                </div>
              </div>

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-gray-600
                  "
                >
                  Question
                </label>

                <textarea
                  rows={5}
                  value={
                    questionForm.questionText
                  }
                  onChange={event =>
                    setQuestionForm(
                      current => ({
                        ...current,
                        questionText:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Enter the question..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-[#dfe2e6]
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-black
                  "
                />
              </div>

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-2
                "
              >
                <button
                  type="button"
                  onClick={
                    closeQuestionForm
                  }
                  disabled={
                    savingQuestion
                  }
                  className="
                    rounded-xl
                    border
                    border-[#dfe2e6]
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-gray-700
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingQuestion
                  }
                  className="
                    rounded-xl
                    bg-black
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    hover:bg-gray-800
                    disabled:opacity-50
                  "
                >
                  {savingQuestion
                    ? "Saving..."
                    : editingQuestionId
                      ? "Save Changes"
                      : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


            {/* ======================================================
          GENERATE QUESTIONS FROM DOCX MODAL
      ====================================================== */}

      {isGenerateModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[105]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onMouseDown={event => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeGenerateModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
          >
            {/* HEADER */}

            <div className="mb-5">
              <div
                className="
                  mb-3
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  text-sm
                "
              >
                AI
              </div>

              <h3
                className="
                  text-lg
                  font-bold
                  text-[#17191c]
                "
              >
                Generate Questions
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-gray-500
                "
              >
                Upload a DOCX learning material
                and let AI generate multiple-choice
                questions for this assessment.
              </p>
            </div>

            <form
              onSubmit={
                handleGenerateFromDocument
              }
              className="space-y-5"
            >
              {/* DOCUMENT */}

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-gray-600
                  "
                >
                  DOCX Document
                </label>

                <input
                  type="file"
                  accept="
                    .docx,
                    application/vnd.openxmlformats-officedocument.wordprocessingml.document
                  "
                  disabled={isGenerating}
                  onChange={event => {
                    const file =
                      event.target.files?.[0] ??
                      null;

                    setGenerateFile(file);
                  }}
                  className="
                    block
                    w-full
                    rounded-xl
                    border
                    border-[#dfe2e6]
                    bg-white
                    px-3
                    py-2.5
                    text-xs
                    text-gray-600
                    file:mr-3
                    file:rounded-lg
                    file:border-0
                    file:bg-gray-100
                    file:px-3
                    file:py-2
                    file:text-xs
                    file:font-semibold
                    file:text-gray-700
                  "
                />

                {generateFile && (
                  <p
                    className="
                      mt-2
                      truncate
                      text-[10px]
                      text-gray-400
                    "
                  >
                    Selected:{" "}
                    {generateFile.name}
                  </p>
                )}
              </div>

              {/* QUESTION COUNT */}

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-gray-600
                  "
                >
                  Number of Questions
                </label>

                <input
                  type="number"
                  min={1}
                  max={100}
                  value={
                    generateQuestionCount
                  }
                  disabled={isGenerating}
                  onChange={event =>
                    setGenerateQuestionCount(
                      event.target.value,
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-[#dfe2e6]
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-black
                    disabled:bg-gray-50
                  "
                />

                <p
                  className="
                    mt-1.5
                    text-[10px]
                    text-gray-400
                  "
                >
                  Enter a number from 1 to 100.
                </p>
              </div>

              {/* INFO */}

              <div
                className="
                  rounded-xl
                  border
                  border-blue-100
                  bg-blue-50
                  px-4
                  py-3
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold
                    text-blue-800
                  "
                >
                  How it works
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    leading-5
                    text-blue-700
                  "
                >
                  The document content will be
                  extracted and processed by AI.
                  Generated questions and their
                  correct answers will be saved
                  automatically.
                </p>
              </div>

              {/* ACTIONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-1
                "
              >
                <button
                  type="button"
                  onClick={
                    closeGenerateModal
                  }
                  disabled={isGenerating}
                  className="
                    rounded-xl
                    border
                    border-[#dfe2e6]
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isGenerating ||
                    !generateFile
                  }
                  className="
                    rounded-xl
                    bg-black
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-gray-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isGenerating
                    ? "Generating..."
                    : "Generate Questions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          CHOICE FORM MODAL
      ====================================================== */}

      {isChoiceFormOpen && (
        <div
          className="
            fixed
            inset-0
            z-[120]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onMouseDown={event => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeChoiceForm();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
          >
            <div className="mb-5">
              <h3
                className="
                  text-lg
                  font-bold
                  text-[#17191c]
                "
              >
                {editingChoiceId
                  ? "Edit Choice"
                  : "Add Choice"}
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Mark the correct answer for
                Admin evaluation.
              </p>
            </div>

            <form
              onSubmit={
                handleChoiceSubmit
              }
              className="space-y-4"
            >
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Choice Label
                  </label>

                  <input
                    type="text"
                    maxLength={20}
                    value={
                      choiceForm.choiceLabel
                    }
                    onChange={event =>
                      setChoiceForm(
                        current => ({
                          ...current,
                          choiceLabel:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="A"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#dfe2e6]
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-black
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-semibold
                      text-gray-600
                    "
                  >
                    Display Order
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={
                      choiceForm.displayOrder
                    }
                    onChange={event =>
                      setChoiceForm(
                        current => ({
                          ...current,
                          displayOrder:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#dfe2e6]
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-black
                    "
                  />
                </div>
              </div>

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-semibold
                    text-gray-600
                  "
                >
                  Choice Text
                </label>

                <textarea
                  rows={4}
                  value={
                    choiceForm.choiceText
                  }
                  onChange={event =>
                    setChoiceForm(
                      current => ({
                        ...current,
                        choiceText:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Enter the choice..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-[#dfe2e6]
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-black
                  "
                />
              </div>

              {/* CORRECT ANSWER */}

              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-[#e7e9ec]
                  bg-gray-50
                  px-4
                  py-3
                "
              >
                <input
                  type="checkbox"
                  checked={
                    choiceForm.isCorrect
                  }
                  onChange={event =>
                    setChoiceForm(
                      current => ({
                        ...current,
                        isCorrect:
                          event.target
                            .checked,
                      }),
                    )
                  }
                  className="
                    h-4
                    w-4
                    accent-black
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-[#17191c]
                    "
                  >
                    Correct Answer
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-gray-500
                    "
                  >
                    This answer will be
                    used when evaluating
                    the participant's exam.
                  </p>
                </div>
              </label>

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-2
                "
              >
                <button
                  type="button"
                  onClick={
                    closeChoiceForm
                  }
                  disabled={
                    savingChoice
                  }
                  className="
                    rounded-xl
                    border
                    border-[#dfe2e6]
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-gray-700
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingChoice
                  }
                  className="
                    rounded-xl
                    bg-black
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    hover:bg-gray-800
                    disabled:opacity-50
                  "
                >
                  {savingChoice
                    ? "Saving..."
                    : editingChoiceId
                      ? "Save Changes"
                      : "Create Choice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}