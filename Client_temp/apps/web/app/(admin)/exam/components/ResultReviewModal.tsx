"use client";

import type { ExamResult } from "../types";

/* =========================================================
   PROPS
========================================================= */

interface ResultReviewModalProps {
  result: ExamResult;
  onClose: () => void;
}

/* =========================================================
   RESULT BADGE
========================================================= */

function ResultBadge({
  result,
}: {
  result: ExamResult["result"];
}) {
  const styles: Record<
    ExamResult["result"],
    string
  > = {
    Passed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Failed:
      "border-red-200 bg-red-50 text-red-700",

    "For Retake":
      "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${styles[result]}`}
    >
      {result}
    </span>
  );
}

/* =========================================================
   REVIEW STAT
========================================================= */

function ReviewStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   ANSWER BOX
========================================================= */

function AnswerBox({
  title,
  value,
  correct,
}: {
  title: string;
  value: string;
  correct: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        correct
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-[0.08em] ${
          correct
            ? "text-emerald-600"
            : "text-red-600"
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-1 text-xs font-semibold ${
          correct
            ? "text-emerald-800"
            : "text-red-800"
        }`}
      >
        {value || "No answer"}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY BUILDER
========================================================= */

function EmptyBuilder({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dfe2e5] px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        +
      </div>

      <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-gray-500">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   RESULT REVIEW MODAL
========================================================= */

export default function ResultReviewModal({
  result,
  onClose,
}: ResultReviewModalProps) {
  const isWritten =
    result.assessmentType ===
    "Written Exam";

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>
            <div className="flex flex-wrap items-center gap-2">

              <ResultBadge
                result={result.result}
              />

              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  isWritten
                    ? "bg-violet-50 text-violet-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {result.assessmentType}
              </span>

            </div>

            <h2 className="mt-3 text-lg font-bold text-[#17191c]">
              {result.participantName}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {result.assessmentTitle}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              {result.participantId} ·{" "}
              {result.participantEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          {/* =================================================
              SCORE SUMMARY
          ================================================= */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            <ReviewStat
              title="Score"
              value={`${result.score}/${result.maxScore}`}
            />

            <ReviewStat
              title="Percentage"
              value={`${result.percentage}%`}
            />

            <ReviewStat
              title="Passing"
              value={`${result.passingScore}%`}
            />

            <ReviewStat
              title="Attempt"
              value={`#${result.attemptNumber}`}
            />

          </div>

          {/* =================================================
              SUBMITTED / RETAKE
          ================================================= */}

          <div className="mt-4 rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Submitted
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {result.submittedAt}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Retake
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {result.retakeStatus}
                </p>
              </div>

            </div>

          </div>

          {/* =================================================
              WRITTEN EXAM
          ================================================= */}

          {isWritten && (
            <div className="mt-6">

              <div className="mb-3">
                <h3 className="text-sm font-bold">
                  Answer Review
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Review the participant&apos;s
                  answers and correct answers.
                </p>
              </div>

              {result.questions.length ===
              0 ? (
                <EmptyBuilder
                  text="No question-level result data is available."
                />
              ) : (
                <div className="space-y-3">

                  {result.questions.map(
                    (question) => (
                      <div
                        key={question.id}
                        className={`rounded-2xl border p-5 ${
                          question.status ===
                          "Correct"
                            ? "border-emerald-100 bg-emerald-50/40"
                            : "border-red-100 bg-red-50/40"
                        }`}
                      >

                        <div className="flex gap-4">

                          {/* QUESTION NUMBER */}

                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                              question.status ===
                              "Correct"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {
                              question.questionNumber
                            }
                          </div>

                          <div className="min-w-0 flex-1">

                            {/* QUESTION HEADER */}

                            <div className="flex items-start justify-between gap-3">

                              <p className="text-xs font-semibold leading-5 text-[#17191c]">
                                {question.question}
                              </p>

                              <span className="shrink-0 text-[9px] font-bold text-gray-400">
                                {
                                  question.pointsEarned
                                }
                                /
                                {
                                  question.maxPoints
                                }{" "}
                                pts
                              </span>

                            </div>

                            {/* ANSWERS */}

                            <div className="mt-4 grid gap-2">

                              <AnswerBox
                                title="Participant Answer"
                                value={
                                  question.selectedAnswer
                                }
                                correct={
                                  question.status ===
                                  "Correct"
                                }
                              />

                              {question.status ===
                                "Incorrect" && (
                                <AnswerBox
                                  title="Correct Answer"
                                  value={
                                    question.correctAnswer
                                  }
                                  correct
                                />
                              )}

                            </div>

                          </div>

                        </div>

                      </div>
                    ),
                  )}

                </div>
              )}

            </div>
          )}

          {/* =================================================
              PRACTICAL ASSESSMENT
          ================================================= */}

          {!isWritten && (
            <div className="mt-6">

              <div className="mb-3">
                <h3 className="text-sm font-bold">
                  Practical Assessment
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Criteria scores entered by
                  the trainer.
                </p>
              </div>

              {result.practicalCriteria
                .length === 0 ? (
                <EmptyBuilder
                  text="No practical criteria result data is available."
                />
              ) : (
                <div className="space-y-3">

                  {result.practicalCriteria.map(
                    (criterion) => {
                      const percentage =
                        criterion.maxScore >
                        0
                          ? Math.min(
                              100,
                              (criterion.score /
                                criterion.maxScore) *
                                100,
                            )
                          : 0;

                      return (
                        <div
                          key={
                            criterion.id
                          }
                          className="rounded-2xl border border-[#e7e9ec] bg-white p-5"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <p className="text-xs font-semibold text-[#17191c]">
                                {
                                  criterion.name
                                }
                              </p>

                              <p className="mt-1 text-[10px] leading-5 text-gray-400">
                                {
                                  criterion.remarks ||
                                  "No remarks."
                                }
                              </p>

                            </div>

                            <div className="shrink-0 text-right">

                              <p className="text-sm font-bold text-[#17191c]">
                                {
                                  criterion.score
                                }
                                /
                                {
                                  criterion.maxScore
                                }
                              </p>

                              <p className="mt-1 text-[9px] text-gray-400">
                                points
                              </p>

                            </div>

                          </div>

                          {/* PROGRESS */}

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    },
                  )}

                </div>
              )}

            </div>
          )}

          {/* =================================================
              TRAINER REMARKS
          ================================================= */}

          {result.trainerRemarks && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-blue-500">
                Trainer Remarks
              </p>

              <p className="mt-2 text-xs leading-6 text-blue-800">
                {result.trainerRemarks}
              </p>

            </div>
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex shrink-0 justify-end border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}