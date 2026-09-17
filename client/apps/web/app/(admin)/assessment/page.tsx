"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import type {
  TrainerAssessmentSubmission,
  WrittenAssessment,
} from "@repo/types";

import { apiClient } from "@/lib/api";

import {
  useWrittenAssessment,
} from "@repo/hooks";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPercentage(
  value: number | null | undefined,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  return Number(value);
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerAssessmentsPage() {
  const {
    assessments,
    trainerSubmissions,

    loadTrainerAssessments,
    loadTrainerSubmissions,
    loadTrainerSubmission,

    isLoading,
    error,
  } = useWrittenAssessment(apiClient);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] =
    useState<TrainerAssessmentSubmission | null>(
      null,
    );

  const [
    isLoadingSubmission,
    setIsLoadingSubmission,
  ] = useState(false);

  const [
    submissionError,
    setSubmissionError,
  ] = useState<string | null>(null);

  /* =======================================================
     LOAD PAGE
  ======================================================= */

  const loadPage = useCallback(
    async () => {
      try {
        await loadTrainerAssessments();
      } catch (err) {
        console.error(
          "LOAD TRAINER ASSESSMENTS ERROR:",
          err,
        );
      }
    },
    [loadTrainerAssessments],
  );

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  /* =======================================================
     GET TRAINING INFORMATION
     
     Trainer only has one assigned training,
     so we simply use the first assessment's batch info.
  ======================================================= */

  const currentAssessment =
    useMemo<WrittenAssessment | null>(() => {
      return assessments[0] ?? null;
    }, [assessments]);

  /* =======================================================
     LOAD SUBMISSIONS

     IMPORTANT:
     Do not directly use:

       assessments[0].id

     because assessments[0] may be undefined.

     We safely check the first assessment first.
  ======================================================= */

  useEffect(() => {
    const firstAssessment =
      assessments[0];

    if (!firstAssessment) {
      return;
    }

    void loadTrainerSubmissions(
      firstAssessment.id,
    ).catch((err) => {
      console.error(
        "LOAD SUBMISSIONS ERROR:",
        err,
      );
    });
  }, [
    assessments,
    loadTrainerSubmissions,
  ]);

  /* =======================================================
     PARTICIPANTS

     One participant = one row.

     If a participant has multiple submissions,
     we keep the latest submission.
  ======================================================= */

  const participants =
    useMemo(() => {
      const map = new Map<
        string,
        TrainerAssessmentSubmission
      >();

      trainerSubmissions.forEach(
        (submission) => {
          const participantKey =
            submission.participantId;

          const existing =
            map.get(participantKey);

          if (!existing) {
            map.set(
              participantKey,
              submission,
            );

            return;
          }

          const existingDate =
            existing.submittedAt
              ? new Date(
                  existing.submittedAt,
                ).getTime()
              : 0;

          const currentDate =
            submission.submittedAt
              ? new Date(
                  submission.submittedAt,
                ).getTime()
              : 0;

          if (
            currentDate >=
            existingDate
          ) {
            map.set(
              participantKey,
              submission,
            );
          }
        },
      );

      return Array.from(
        map.values(),
      );
    }, [trainerSubmissions]);

  /* =======================================================
     SEARCH PARTICIPANTS
  ======================================================= */

  const filteredParticipants =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return participants;
      }

      return participants.filter(
        (participant) => {
          return (
            participant.participantName
              ?.toLowerCase()
              .includes(keyword) ||
            participant.participantEmail
              ?.toLowerCase()
              .includes(keyword)
          );
        },
      );
    }, [
      participants,
      search,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalParticipants =
    participants.length;

  const passedParticipants =
    participants.filter(
      (participant) =>
        participant.isPassed,
    ).length;

  const failedParticipants =
    participants.filter(
      (participant) =>
        !participant.isPassed,
    ).length;

  const averageScore =
    participants.length === 0
      ? 0
      : participants.reduce(
          (
            total,
            participant,
          ) =>
            total +
            getPercentage(
              participant.percentage,
            ),
          0,
        ) / participants.length;

  /* =======================================================
     VIEW PARTICIPANT
  ======================================================= */

  const handleViewParticipant =
    useCallback(
      async (
        submission: TrainerAssessmentSubmission,
      ) => {
        setSubmissionError(null);
        setIsLoadingSubmission(true);

        try {
          const result =
            await loadTrainerSubmission(
              submission.attemptId,
            );

          setSelectedSubmission(
            result,
          );
        } catch (err) {
          console.error(
            "LOAD SUBMISSION ERROR:",
            err,
          );

          setSubmissionError(
            err instanceof Error
              ? err.message
              : "Unable to load participant submission.",
          );
        } finally {
          setIsLoadingSubmission(false);
        }
      },
      [loadTrainerSubmission],
    );

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeParticipantModal =
    useCallback(() => {
      setSelectedSubmission(null);
      setSubmissionError(null);
      setIsLoadingSubmission(false);
    }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <BookOpen className="h-4 w-4" />

              Trainer Portal
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Training
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
              View participant assessment results
              for your assigned training.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadPage()
            }
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={
                isLoading
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            TRAINING INFORMATION
        ================================================= */}

        {currentAssessment && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <BookOpen className="h-6 w-6 text-slate-700" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Assigned Training
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {currentAssessment.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {currentAssessment.batchCode ||
                        "Unknown Batch"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <FileText className="h-3.5 w-3.5" />

                      {currentAssessment.questionCount ??
                        0}{" "}
                      questions
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />

                      Created{" "}
                      {formatDate(
                        currentAssessment.createdAt,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span
                  className={
                    currentAssessment.isPublished
                      ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                      : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                  }
                >
                  {currentAssessment.isPublished
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load training assessments
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={
              <Users className="h-5 w-5" />
            }
            label="Participants"
            value={totalParticipants}
          />

          <StatCard
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
            label="Passed"
            value={passedParticipants}
          />

          <StatCard
            icon={
              <CircleAlert className="h-5 w-5" />
            }
            label="Failed"
            value={failedParticipants}
          />

          <StatCard
            icon={
              <FileText className="h-5 w-5" />
            }
            label="Average Score"
            value={`${averageScore.toFixed(1)}%`}
          />

        </div>

        {/* =================================================
            PARTICIPANTS SECTION
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* SECTION HEADER */}

          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Participants
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View assessment results and answer details.
                </p>
              </div>

              {/* SEARCH */}

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search participant..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading && (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                  />
                ),
              )}
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!isLoading &&
            filteredParticipants.length ===
              0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Users className="h-7 w-7 text-slate-400" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {search
                    ? "No participants found"
                    : "No submissions yet"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {search
                    ? "Try searching using a different participant name or email."
                    : "Participants will appear here after they submit the assessment."}
                </p>
              </div>
            )}

          {/* =================================================
              TABLE
          ================================================= */}

          {!isLoading &&
            filteredParticipants.length >
              0 && (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Participant
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Submitted
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Score
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Result
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredParticipants.map(
                      (participant) => (
                        <tr
                          key={
                            participant.participantId
                          }
                          className="transition hover:bg-slate-50"
                        >

                          {/* PARTICIPANT */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                {getInitials(
                                  participant.participantName,
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {
                                    participant.participantName
                                  }
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {
                                    participant.participantEmail
                                  }
                                </p>
                              </div>

                            </div>
                          </td>

                          {/* SUBMITTED */}

                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-600">
                              {formatDateTime(
                                participant.submittedAt,
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Attempt #
                              {
                                participant.attemptNumber
                              }
                            </p>
                          </td>

                          {/* SCORE */}

                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900">
                              {
                                participant.earnedPoints
                              }
                              /
                              {
                                participant.totalPoints
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {getPercentage(
                                participant.percentage,
                              )}
                              %
                            </p>
                          </td>

                          {/* RESULT */}

                          <td className="px-5 py-4">
                            <ResultBadge
                              passed={
                                participant.isPassed
                              }
                            />
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                void handleViewParticipant(
                                  participant,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Eye className="h-4 w-4" />

                              View
                            </button>
                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>
                </table>

              </div>
            )}

        </div>

      </div>

      {/* ===================================================
          PARTICIPANT DETAILS MODAL
      =================================================== */}

      {(selectedSubmission ||
        isLoadingSubmission) && (
        <SubmissionDetailsModal
          submission={
            selectedSubmission
          }
          isLoading={
            isLoadingSubmission
          }
          error={
            submissionError
          }
          onClose={
            closeParticipantModal
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   GET INITIALS
========================================================= */
function getInitials(name?: string | null) {
  if (!name?.trim()) {
    return "P";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const first = parts[0];

  if (!first) {
    return "P";
  }

  if (parts.length === 1) {
    return first
      .slice(0, 2)
      .toUpperCase();
  }

  const last =
    parts[parts.length - 1];

  if (!last) {
    return first
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    first.charAt(0) +
    last.charAt(0)
  ).toUpperCase();
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   RESULT BADGE
========================================================= */

function ResultBadge({
  passed,
}: {
  passed: boolean;
}) {
  return (
    <span
      className={
        passed
          ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
          : "inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
      }
    >
      {passed
        ? "Passed"
        : "Failed"}
    </span>
  );
}

/* =========================================================
   SUBMISSION DETAILS MODAL
========================================================= */

function SubmissionDetailsModal({
  submission,
  isLoading,
  error,
  onClose,
}: {
  submission:
    | TrainerAssessmentSubmission
    | null;

  isLoading: boolean;

  error: string | null;

  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[600] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex min-h-full items-center justify-center">

        <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-5 sm:p-6">

            <div className="min-w-0 pr-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Participant Details
              </p>

              {submission && (
                <>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    {
                      submission.participantName
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      submission.participantEmail
                    }
                  </p>
                </>
              )}

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading && (
            <div className="flex min-h-[300px] items-center justify-center p-8">

              <div className="flex items-center gap-3">

                <Spinner />

                <span className="text-sm font-medium text-slate-700">
                  Loading participant details...
                </span>

              </div>

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!isLoading &&
            error && (
              <div className="p-5 sm:p-6">

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Unable to load submission
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>
                  </div>

                </div>

              </div>
            )}

          {/* =================================================
              BODY
          ================================================= */}

          {!isLoading &&
            !error &&
            submission && (
              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

                {/* =================================================
                    RESULT SUMMARY
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Assessment Result
                      </p>

                      <div className="mt-2 flex items-center gap-3">

                        <p className="text-3xl font-bold text-slate-900">
                          {getPercentage(
                            submission.percentage,
                          )}
                          %
                        </p>

                        <ResultBadge
                          passed={
                            submission.isPassed
                          }
                        />

                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Submitted{" "}
                        {formatDateTime(
                          submission.submittedAt,
                        )}
                      </p>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                      <ScoreItem
                        label="Score"
                        value={`${submission.earnedPoints}/${submission.totalPoints}`}
                      />

                      <ScoreItem
                        label="Correct"
                        value={`${submission.correctAnswers}/${submission.totalQuestions}`}
                      />

                      <ScoreItem
                        label="Attempt"
                        value={`#${submission.attemptNumber}`}
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    ADDITIONAL DETAILS
                ================================================= */}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <DetailCard
                    label="Status"
                    value={
                      submission.status ||
                      "Completed"
                    }
                  />

                  <DetailCard
                    label="Evaluated"
                    value={formatDateTime(
                      submission.evaluatedAt,
                    )}
                  />

                  <DetailCard
                    label="Total Questions"
                    value={String(
                      submission.totalQuestions,
                    )}
                  />

                </div>

                {/* =================================================
                    ANSWER REVIEW
                ================================================= */}

                <div className="mt-7">

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-900">
                      Answer Review
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Review the participant's answers
                      and automatically calculated score.
                    </p>

                  </div>

                  {!submission.answers ||
                    submission.answers.length ===
                      0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">

                      <FileText className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-medium text-slate-500">
                        No answer details available.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-4">

                      {submission.answers.map(
                        (answer) => (
                          <AnswerCard
                            key={
                              answer.questionId
                            }
                            answer={
                              answer
                            }
                          />
                        ),
                      )}

                    </div>
                  )}

                </div>

              </div>
            )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex shrink-0 justify-end border-t border-slate-200 px-5 py-4 sm:px-6">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   SCORE ITEM
========================================================= */

function ScoreItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-sm">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   ANSWER CARD
========================================================= */

function AnswerCard({
  answer,
}: {
  answer:
    TrainerAssessmentSubmission["answers"][number];
}) {
  const correct =
    answer.isCorrect;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      {/* QUESTION */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
            {
              answer.questionNumber
            }
          </div>

          <div className="min-w-0">

            <p className="text-sm font-semibold leading-6 text-slate-900">
              {
                answer.questionText
              }
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {answer.points} point
              {answer.points === 1
                ? ""
                : "s"}
            </p>

          </div>

        </div>

        <ResultBadge
          passed={correct}
        />

      </div>

      {/* PARTICIPANT ANSWER */}

      <div
        className={
          correct
            ? "mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
            : "mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4"
        }
      >

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Participant Answer
        </p>

        <div className="mt-2 text-sm text-slate-700">

          {answer.selectedChoiceLabel && (
            <span className="mr-2 font-bold text-slate-900">
              {
                answer.selectedChoiceLabel
              }
              .
            </span>
          )}

          <span>
            {
              answer.selectedChoiceText ||
              "No answer"
            }
          </span>

        </div>

      </div>

      {/* CORRECT ANSWER */}

      {!correct && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Correct Answer
          </p>

          <div className="mt-2 text-sm text-slate-700">

            {answer.correctChoiceLabel && (
              <span className="mr-2 font-bold text-slate-900">
                {
                  answer.correctChoiceLabel
                }
                .
              </span>
            )}

            <span>
              {
                answer.correctChoiceText ||
                "—"
              }
            </span>

          </div>

        </div>
      )}

      {/* POINTS */}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

        <span className="text-xs text-slate-500">
          Earned points
        </span>

        <span className="text-sm font-bold text-slate-900">
          {
            answer.earnedPoints
          }
          /
          {
            answer.points
          }
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
  );
}