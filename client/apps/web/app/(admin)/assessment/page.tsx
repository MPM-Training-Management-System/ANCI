"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  MessageCircle,
  RefreshCw,
  Users,
  X,
} from "lucide-react";

import type {
  Enrollment,
  PracticalAssessment,
  PracticalAssessmentResult,
  ParticipationParticipant,
  ParticipationSetting,
  TrainerAssessmentSubmission,
  WrittenAssessment,
} from "@repo/types";

import { useTrainerAssessmentsPage } from "@/hooks/useTrainerAssessmentsPage";

import {
  Button,
  DataTable,
  PageSection,
} from "@repo/ui/index";

import {
  
  
  writtenColumns,
} from "./written-columns";

import {participationColumns} from "./participation-columns";
import {practicalColumns} from "./practical-columns";

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

function getInitials(name?: string | null) {
  if (!name?.trim()) {
    return "P";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return (
    parts[0]!.charAt(0) +
    parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerAssessmentsPage() {
  const {
    assessmentType,
    setAssessmentType,

    activeLoading,
    activeError,

    /* =====================================================
       WRITTEN
    ===================================================== */

    currentWrittenAssessment,
    filteredWrittenParticipants,

    writtenTotal,
    writtenPassed,
    writtenFailed,
    writtenAverage,

    writtenIsLoading,

    selectedSubmission,
    isLoadingSubmission,
    submissionError,

    handleViewWrittenParticipant,
    closeWrittenModal,

    /* =====================================================
       PRACTICAL
    ===================================================== */

    currentPracticalAssessment,
    filteredPracticalParticipants,

    practicalResults,
    practicalEvaluatedCount,
    practicalPassedCount,
    practicalFailedCount,
    practicalAverage,

    practicalIsLoading,
    enrollmentIsLoading,

    getPracticalResult,

    selectedPracticalAssessment,
    selectedEnrollment,

    isEvaluationModalOpen,
    isSubmittingEvaluation,
    practicalActionError,

    handleEvaluatePractical,
    handleSubmitPractical,
    closePracticalEvaluation,

    selectedPracticalResult,
    isResultModalOpen,

    handleViewPracticalResult,
    closePracticalResult,

    /* =====================================================
       PARTICIPATION
    ===================================================== */

    trainingSessions,
    selectedParticipationBatch,
    selectedParticipationSession,

    participationSetting,
    participationParticipants,
    filteredParticipationParticipants,

    participationRecordedCount,
    participationCompletedCount,

    selectedParticipationSessionId,
    setSelectedParticipationSessionId,

    participationIsLoading,
    participationActionError,

    handleRecordParticipation,
    handleRemoveParticipation,

    getParticipationName,
    getParticipationEmail,
    getParticipationCode,
  } = useTrainerAssessmentsPage();

  /* =========================================================
     REFRESH
  ========================================================= */

  const loadPage = () => {
    window.location.reload();
  };

  /* =========================================================
     WRITTEN TABLE DATA
  ========================================================= */

  const writtenTableData = useMemo(() => {
    return filteredWrittenParticipants.map(
      (participant) => ({
        id: participant.participantId,

        participantName:
          participant.participantName,

        participantCode:
          participant.participantId ?? null,

        participantEmail:
          participant.participantEmail ?? null,

        submittedAt:
          participant.submittedAt ?? null,

        attemptNumber:
          participant.attemptNumber ?? null,

        score:
          participant.earnedPoints ?? null,

        totalItems:
          participant.totalPoints ?? null,

        percentage:
          participant.percentage ?? null,

        result:
          participant.isPassed
            ? "Passed"
            : "Failed",

        onView: () =>
          handleViewWrittenParticipant(
            participant,
          ),
      }),
    );
  }, [
    filteredWrittenParticipants,
    handleViewWrittenParticipant,
  ]);

  /* =========================================================
     PRACTICAL TABLE DATA
  ========================================================= */

  const practicalTableData = useMemo(() => {
    return filteredPracticalParticipants.map(
      (enrollment) => {
        const result =
          getPracticalResult(
            enrollment.id,
          );

        return {
          id: enrollment.id,

          participantName:
            enrollment.participant.fullName,

          participantCode:
            enrollment.participant.userCode ??
            null,

          participantEmail:
            enrollment.participant.email ??
            null,

          batchCode:
            enrollment.batchCode ?? null,

          isEvaluated:
            Boolean(result),

          score:
            result?.totalScore ??
            result?.percentage ??
            null,

          percentage:
            result?.percentage ?? null,

          result: result
            ? result.isPassed
              ? "Passed"
              : "Failed"
            : "Pending",

          onEvaluate: () =>
            handleEvaluatePractical(
              enrollment,
            ),

          onViewResult: result
            ? () =>
                handleViewPracticalResult(
                  result,
                )
            : undefined,
        };
      },
    );
  }, [
    filteredPracticalParticipants,
    getPracticalResult,
    handleEvaluatePractical,
    handleViewPracticalResult,
  ]);

  /* =========================================================
     PARTICIPATION TABLE DATA
  ========================================================= */

  const participationTableData = useMemo(() => {
    return filteredParticipationParticipants.map(
      (participant) => {
        const required = Number(
          participant.requiredRecitations ??
            participationSetting
              ?.requiredRecitations ??
            0,
        );

        const actual = Number(
          participant.actualRecitations ?? 0,
        );

        const percentage = Math.min(
          Number(
            participant.participationPercentage ??
              (required > 0
                ? (actual / required) * 100
                : 0),
          ),
          100,
        );

        return {
          id: participant.enrollmentId,

          participantName:
            getParticipationName(
              participant,
            ),

          participantCode:
            getParticipationCode(
              participant,
            ),

          participantEmail:
            getParticipationEmail(
              participant,
            ),

          recitationCount:
            actual,

          requiredRecitations:
            required,

          participationCount:
            actual,

          participationPercentage:
            percentage,

          isRecorded:
            Boolean(
              participant.hasRecited,
            ),

          onRecord: () =>
            void handleRecordParticipation(
              participant,
            ),

          onRemove: () =>
            void handleRemoveParticipation(
              participant,
            ),
        };
      },
    );
  }, [
    filteredParticipationParticipants,
    participationSetting,
    getParticipationName,
    getParticipationCode,
    getParticipationEmail,
    handleRecordParticipation,
    handleRemoveParticipation,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

      

        <PageSection
          title="Assessments"
          description="Manage participant written and practical assessments for your assigned training."
        actions={  <button
            type="button"
            onClick={loadPage}
            disabled={activeLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={
                activeLoading
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />

            Refresh
          </button>}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        

        </div>

        {/* =================================================
            TYPE TABS
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">

  <Button
    type="button"
    onClick={() => setAssessmentType("written")}
    className={
      assessmentType === "written"
        ? "rounded-xl !bg-[#002b5c] px-4 py-3 text-sm font-semibold !text-white shadow-sm transition hover:!bg-[#0d2142]"
        : "rounded-xl !bg-white px-4 py-3 text-sm font-semibold !text-black shadow-sm transition hover:!bg-[#eef4f8] hover:!text-black"
    }
  >
    Written Assessment
  </Button>

  <Button
    type="button"
    onClick={() => setAssessmentType("practical")}
    className={
      assessmentType === "practical"
        ? "rounded-xl !bg-[#002b5c] px-4 py-3 text-sm font-semibold !text-white shadow-sm transition hover:!bg-[#0d2142]"
        : "rounded-xl !bg-white px-4 py-3 text-sm font-semibold !text-black shadow-sm transition hover:!bg-[#eef4f8] hover:!text-black"
    }
  >
    Practical Assessment
  </Button>

  <Button
    type="button"
    onClick={() => setAssessmentType("participation")}
    className={
      assessmentType === "participation"
        ? "rounded-xl !bg-[#002b5c] px-4 py-3 text-sm font-semibold !text-white shadow-sm transition hover:!bg-[#0d2142]"
        : "rounded-xl !bg-white px-4 py-3 text-sm font-semibold !text-black shadow-sm transition hover:!bg-[#eef4f8] hover:!text-black"
    }
  >
    Active Participation
  </Button>


          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {activeError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load assessment data
              </p>

              <p className="mt-1 text-sm text-red-700">
                {activeError}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            WRITTEN
        ================================================= */}

        {assessmentType ===
          "written" && (
          <WrittenAssessmentSection
            assessment={
              currentWrittenAssessment
            }
            participants={
              filteredWrittenParticipants
            }
            tableData={
              writtenTableData
            }
            totalParticipants={
              writtenTotal
            }
            passedParticipants={
              writtenPassed
            }
            failedParticipants={
              writtenFailed
            }
            averageScore={
              writtenAverage
            }
            isLoading={
              writtenIsLoading
            }
          />
        )}

        {/* =================================================
            PRACTICAL
        ================================================= */}

        {assessmentType ===
          "practical" && (
          <PracticalAssessmentSection
            assessment={
              currentPracticalAssessment
            }
            participants={
              filteredPracticalParticipants
            }
            tableData={
              practicalTableData
            }
            evaluatedCount={
              practicalEvaluatedCount
            }
            passedCount={
              practicalPassedCount
            }
            failedCount={
              practicalFailedCount
            }
            averageScore={
              practicalAverage
            }
            isLoading={
              practicalIsLoading ||
              enrollmentIsLoading
            }
          />
        )}

        {/* =================================================
            PARTICIPATION
        ================================================= */}

        {assessmentType ===
          "participation" && (
          <ActiveParticipationSection
            sessions={
              trainingSessions
            }
            batch={
              selectedParticipationBatch
            }
            session={
              selectedParticipationSession
            }
            setting={
              participationSetting
            }
            participants={
              filteredParticipationParticipants
            }
            tableData={
              participationTableData
            }
            totalParticipants={
              participationParticipants.length
            }
            recordedCount={
              participationRecordedCount
            }
            completedCount={
              participationCompletedCount
            }
            selectedSessionId={
              selectedParticipationSessionId
            }
            onSessionChange={
              setSelectedParticipationSessionId
            }
            isLoading={
              participationIsLoading
            }
            actionError={
              participationActionError
            }
          />
        )}

      </div>

      {/* ===================================================
          WRITTEN MODAL
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
            closeWrittenModal
          }
        />
      )}

      {/* ===================================================
          PRACTICAL EVALUATION MODAL
      =================================================== */}

      {isEvaluationModalOpen &&
        selectedPracticalAssessment &&
        selectedEnrollment && (
          <PracticalEvaluationModal
            assessment={
              selectedPracticalAssessment
            }
            enrollment={
              selectedEnrollment
            }
            existingResult={
              getPracticalResult(
                selectedEnrollment.id,
              )
            }
            isSubmitting={
              isSubmittingEvaluation
            }
            error={
              practicalActionError
            }
            onClose={
              closePracticalEvaluation
            }
            onSubmit={
              handleSubmitPractical
            }
          />
        )}

      {/* ===================================================
          PRACTICAL RESULT MODAL
      =================================================== */}

      {isResultModalOpen &&
        selectedPracticalResult && (
          <PracticalResultModal
            result={
              selectedPracticalResult
            }
            onClose={
              closePracticalResult
            }
          />
        )}

    </div>
  );
}

/* =========================================================
   WRITTEN ASSESSMENT SECTION
========================================================= */

function WrittenAssessmentSection({
  assessment,
  participants,
  tableData,
  totalParticipants,
  passedParticipants,
  failedParticipants,
  averageScore,
  isLoading,
}: {
  assessment:
    | WrittenAssessment
    | null;

  participants:
    TrainerAssessmentSubmission[];

  tableData: Array<{
    id: string;
    participantName: string;
    participantCode?: string | null;
    participantEmail?: string | null;
    submittedAt?: string | Date | null;
    attemptNumber?: number | null;
    score?: number | null;
    totalItems?: number | null;
    percentage?: number | null;
    result?: string | null;
    onView?: () => void;
  }>;

  totalParticipants: number;
  passedParticipants: number;
  failedParticipants: number;
  averageScore: number;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">

      {/* TRAINING INFO */}

      {assessment && (
        <AssessmentInfoCard
          title={
            assessment.title
          }
          batchCode={
            assessment.batchCode
          }
          published={
            assessment.isPublished
          }
          icon={
            <FileText className="h-6 w-6 text-slate-700" />
          }
          meta={
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <FileText className="h-3.5 w-3.5" />

                {assessment.questionCount ??
                  0}{" "}
                questions
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />

                Created{" "}
                {formatDate(
                  assessment.createdAt,
                )}
              </span>
            </>
          }
        />
      )}

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={
            <Users className="h-5 w-5" />
          }
          label="Participants"
          value={
            totalParticipants
          }
        />

        <StatCard
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          label="Passed"
          value={
            passedParticipants
          }
        />

        <StatCard
          icon={
            <CircleAlert className="h-5 w-5" />
          }
          label="Failed"
          value={
            failedParticipants
          }
        />

        <StatCard
          icon={
            <FileText className="h-5 w-5" />
          }
          label="Average Score"
          value={`${averageScore.toFixed(
            1,
          )}%`}
        />

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Participant Submissions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review participant written assessment submissions.
          </p>
        </div>

        {isLoading ? (
          <LoadingRows />
        ) : participants.length ===
          0 ? (
          <EmptyState
            icon={
              <Users className="h-7 w-7 text-slate-400" />
            }
            title="No submissions yet"
            description="Participants will appear here after submitting the written assessment."
          />
        ) : (
          <DataTable
            columns={
              writtenColumns
            }
            data={tableData}
          />
        )}

      </div>

    </div>
  );
}

/* =========================================================
   PRACTICAL ASSESSMENT SECTION
========================================================= */

function PracticalAssessmentSection({
  assessment,
  participants,
  tableData,
  evaluatedCount,
  passedCount,
  failedCount,
  averageScore,
  isLoading,
}: {
  assessment:
    | PracticalAssessment
    | null;

  participants: Enrollment[];

  tableData: Array<{
    id: string;
    participantName: string;
    participantCode?: string | null;
    participantEmail?: string | null;
    batchCode?: string | null;
    isEvaluated?: boolean;
    score?: number | null;
    percentage?: number | null;
    result?: string | null;
    onEvaluate?: () => void;
    onViewResult?: () => void;
  }>;

  evaluatedCount: number;
  passedCount: number;
  failedCount: number;
  averageScore: number;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">

      {/* INFO */}

      {assessment && (
        <AssessmentInfoCard
          title={
            assessment.title
          }
          batchCode={
            participants[0]
              ?.batchCode
          }
          published={
            assessment.isPublished
          }
          icon={
            <ClipboardCheck className="h-6 w-6 text-slate-700" />
          }
          meta={
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ClipboardCheck className="h-3.5 w-3.5" />

                {
                  assessment.criteria
                    .length
                }{" "}
                criteria
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                Passing{" "}
                {
                  assessment.passingPercentage
                }
                %
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />

                Created{" "}
                {formatDate(
                  assessment.createdAt,
                )}
              </span>
            </>
          }
        />
      )}

      {!assessment &&
        !isLoading && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

            <ClipboardCheck className="mx-auto h-9 w-9 text-slate-300" />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No practical assessment assigned
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You currently don't have a published
              practical assessment assigned to your
              training.
            </p>

          </div>
        )}

      {assessment && (
        <>
          {/* STATS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={
                <Users className="h-5 w-5" />
              }
              label="Participants"
              value={
                participants.length
              }
            />

            <StatCard
              icon={
                <ClipboardCheck className="h-5 w-5" />
              }
              label="Evaluated"
              value={
                evaluatedCount
              }
            />

            <StatCard
              icon={
                <CheckCircle2 className="h-5 w-5" />
              }
              label="Passed"
              value={
                passedCount
              }
            />

            <StatCard
              icon={
                <FileText className="h-5 w-5" />
              }
              label="Average Score"
              value={`${averageScore.toFixed(
                1,
              )}%`}
            />

          </div>

       

            {isLoading ? (
              <LoadingRows />
            ) : participants.length ===
              0 ? (
              <EmptyState
                icon={
                  <Users className="h-7 w-7 text-slate-400" />
                }
                title="No approved participants"
                description="Approved participants for this training batch will appear here."
              />
            ) : (
              <DataTable
                columns={
                  practicalColumns
                }
                data={tableData}
              />
            )}

        </>
      )}

    </div>
  );
}

/* =========================================================
   ACTIVE PARTICIPATION SECTION
========================================================= */

function ActiveParticipationSection({
  sessions,
  batch,
  session,
  setting,
  participants,
  tableData,
  totalParticipants,
  recordedCount,
  completedCount,
  selectedSessionId,
  onSessionChange,
  isLoading,
  actionError,
}: {
  sessions: Array<{
    id: string;
    sessionNumber?: number;
    sessionDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;

  batch: {
    id: string;
    batchCode?: string | null;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  } | null;

  session: {
    id: string;
    sessionNumber?: number;
    sessionDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  } | null;

  setting:
    ParticipationSetting | null;

  participants:
    ParticipationParticipant[];

  tableData: Array<{
    id: string;
    participantName: string;
    participantCode?: string | null;
    participantEmail?: string | null;
    recitationCount?: number;
    requiredRecitations?: number;
    participationCount?: number;
    participationPercentage?: number;
    isRecorded?: boolean;
    onRecord?: () => void;
    onRemove?: () => void;
  }>;

  totalParticipants: number;
  recordedCount: number;
  completedCount: number;

  selectedSessionId: string;

  onSessionChange: (
    value: string,
  ) => void;

  isLoading: boolean;
  actionError: string | null;
}) {
  const required = Number(
    setting?.requiredRecitations ??
      0,
  );

  return (
    <div className="space-y-6">

      {/* =================================================
          PARTICIPATION HEADER
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-5">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <MessageCircle className="h-6 w-6 text-slate-700" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Participation
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Recitation Records
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Record one recitation per participant for each training session.
                Recitations are accumulated throughout the training.
              </p>
            </div>

          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Training Session
            </label>

            <select
              value={
                selectedSessionId
              }
              onChange={(event) =>
                onSessionChange(
                  event.target.value,
                )
              }
              disabled={
                isLoading ||
                sessions.length ===
                  0
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400 disabled:bg-slate-50"
            >
              <option value="">
                Select training session
              </option>

              {sessions.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    Session{" "}
                    {item.sessionNumber ??
                      "—"}{" "}
                    •{" "}
                    {formatDate(
                      item.sessionDate,
                    )}
                  </option>
                ),
              )}
            </select>
          </div>

        </div>

      </div>

      {/* =================================================
          SELECTED TRAINING
      ================================================= */}

      {batch && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Selected Training
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {batch.batchCode ||
                  "Training Batch"}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                {batch.location && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {
                      batch.location
                    }
                  </span>
                )}

                {batch.startDate && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />

                    {formatDate(
                      batch.startDate,
                    )}

                    {batch.endDate
                      ? ` – ${formatDate(
                          batch.endDate,
                        )}`
                      : ""}
                  </span>
                )}

              </div>

            </div>

            <div className="rounded-xl bg-slate-50 px-5 py-4 text-right">

              <p className="text-xs text-slate-400">
                Required Recitations
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {required ||
                  "—"}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                For the entire training
              </p>

            </div>

          </div>

          {session && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Session{" "}
                {session.sessionNumber ??
                  "—"}
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />

                {formatDate(
                  session.sessionDate,
                )}
              </span>

              {(session.startTime ||
                session.endTime) && (
                <span className="text-xs text-slate-500">
                  {session.startTime ||
                    "—"}{" "}
                  {session.endTime
                    ? `– ${session.endTime}`
                    : ""}
                </span>
              )}

            </div>
          )}

        </div>
      )}

      {/* =================================================
          STATS + TABLE
      ================================================= */}

      {batch && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={
                <Users className="h-5 w-5" />
              }
              label="Participants"
              value={
                totalParticipants
              }
            />

            <StatCard
              icon={
                <MessageCircle className="h-5 w-5" />
              }
              label="Recited This Session"
              value={
                recordedCount
              }
            />

            <StatCard
              icon={
                <CheckCircle2 className="h-5 w-5" />
              }
              label="Requirement Completed"
              value={
                completedCount
              }
            />

            <StatCard
              icon={
                <ClipboardCheck className="h-5 w-5" />
              }
              label="Required Recitations"
              value={
                required || "—"
              }
            />

          </div>

          {actionError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Participation action failed
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {actionError}
                </p>
              </div>

            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">
                Participant Participation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Record recitation for the selected session and monitor cumulative progress.
              </p>
            </div>

            {isLoading ? (
              <LoadingRows />
            ) : participants.length ===
              0 ? (
              <EmptyState
                icon={
                  <Users className="h-7 w-7 text-slate-400" />
                }
                title={
                  session
                    ? "No approved participants"
                    : "Select a training session"
                }
                description={
                  session
                    ? "Approved participants for this training session will appear here."
                    : "Select a training session to load participants."
                }
              />
            ) : (
              <DataTable
                columns={
                  participationColumns
                }
                data={
                  tableData
                }
              />
            )}

          </div>
        </>
      )}

      {!batch &&
        !isLoading && (
          <EmptyState
            icon={
              <Users className="h-7 w-7 text-slate-400" />
            }
            title="No training batch available"
            description="No training batch is currently available for participation recording."
          />
        )}

    </div>
  );
}

/* =========================================================
   PRACTICAL EVALUATION MODAL
========================================================= */

function PracticalEvaluationModal({
  assessment,
  enrollment,
  existingResult,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  assessment: PracticalAssessment;

  enrollment: Enrollment;

  existingResult:
    | PracticalAssessmentResult
    | null;

  isSubmitting: boolean;

  error: string | null;

  onClose: () => void;

  onSubmit: (
    enrollmentId: string,
    scores: {
      criterionId: string;
      score: number;
    }[],
    trainerRemarks: string,
  ) => Promise<void>;
}) {
  const [scores, setScores] =
    useState<
      Record<string, string>
    >(() => {
      const initial: Record<
        string,
        string
      > = {};

      assessment.criteria.forEach(
        (criterion) => {
          const existing =
            existingResult?.criterionScores.find(
              (item) =>
                item.criterionId ===
                criterion.id,
            );

          initial[criterion.id] =
            existing
              ? String(
                  existing.score,
                )
              : "";
        },
      );

      return initial;
    });

  const [
    trainerRemarks,
    setTrainerRemarks,
  ] = useState(
    existingResult?.trainerRemarks ??
      "",
  );

  const [localError, setLocalError] =
    useState<string | null>(null);

  const weightedScore =
    assessment.criteria.reduce(
      (total, criterion) => {
        const raw =
          scores[criterion.id];

        const score =
          raw === undefined ||
          raw === ""
            ? 0
            : Number(raw);

        if (
          Number.isNaN(score)
        ) {
          return total;
        }

        return (
          total +
          score *
            (criterion.weightPercentage /
              100)
        );
      },
      0,
    );

  const hasMissingScore =
    assessment.criteria.some(
      (criterion) =>
        scores[criterion.id] ===
          undefined ||
        scores[criterion.id] ===
          "",
    );

  const hasInvalidScore =
    assessment.criteria.some(
      (criterion) => {
        const raw =
          scores[criterion.id];

        if (
          raw === undefined ||
          raw === ""
        ) {
          return false;
        }

        const score = Number(raw);

        return (
          Number.isNaN(score) ||
          score < 0 ||
          score > 100
        );
      },
    );

  const handleScoreChange = (
    criterionId: string,
    value: string,
  ) => {
    if (value === "") {
      setScores((current) => ({
        ...current,
        [criterionId]: "",
      }));

      return;
    }

    if (
      !/^\d{0,3}(\.\d{0,2})?$/.test(
        value,
      )
    ) {
      return;
    }

    const numericValue =
      Number(value);

    if (
      numericValue > 100
    ) {
      return;
    }

    setScores((current) => ({
      ...current,
      [criterionId]: value,
    }));

    setLocalError(null);
  };

  const handleSubmit = async () => {
    setLocalError(null);

    if (hasMissingScore) {
      setLocalError(
        "Please provide a score for every criterion.",
      );

      return;
    }

    if (hasInvalidScore) {
      setLocalError(
        "Each criterion score must be between 0 and 100.",
      );

      return;
    }

    const criterionScores =
      assessment.criteria.map(
        (criterion) => ({
          criterionId:
            criterion.id,
          score: Number(
            scores[criterion.id],
          ),
        }),
      );

    await onSubmit(
      enrollment.id,
      criterionScores,
      trainerRemarks,
    );
  };

  return (
    <div className="fixed inset-0 z-[700] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex min-h-full items-center justify-center">

        <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-5 sm:p-6">

            <div className="min-w-0 pr-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Practical Evaluation
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {
                  enrollment
                    .participant
                    .fullName
                }
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {assessment.title}
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={
                isSubmitting
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Assessment
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {assessment.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Passing score:{" "}
                    {
                      assessment.passingPercentage
                    }
                    %
                  </p>

                </div>

                <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">

                  <p className="text-xs text-slate-400">
                    Current Practical Score
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {weightedScore.toFixed(
                      2,
                    )}
                    %
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-6">

              <div className="mb-4">

                <h3 className="text-lg font-bold text-slate-900">
                  Evaluation Criteria
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Rate each criterion from 0 to
                  100.
                </p>

              </div>

              <div className="space-y-4">

                {assessment.criteria
                  .slice()
                  .sort(
                    (a, b) =>
                      a.displayOrder -
                      b.displayOrder,
                  )
                  .map(
                    (criterion) => (
                      <div
                        key={
                          criterion.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h4 className="font-semibold text-slate-900">
                                {
                                  criterion.name
                                }
                              </h4>

                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                {
                                  criterion.weightPercentage
                                }
                                %
                              </span>

                            </div>

                            {criterion.description && (
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {
                                  criterion.description
                                }
                              </p>
                            )}

                          </div>

                          <div className="w-full shrink-0 sm:w-32">

                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Score
                            </label>

                            <div className="relative mt-1">

                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  scores[
                                    criterion
                                      .id
                                  ] ??
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  handleScoreChange(
                                    criterion.id,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="0"
                                disabled={
                                  isSubmitting
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-right text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-400 disabled:bg-slate-50"
                              />

                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                %
                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="mt-4">

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-slate-900 transition-all"
                              style={{
                                width: `${Math.min(
                                  Number(
                                    scores[
                                      criterion
                                        .id
                                    ] ||
                                      0,
                                  ),
                                  100,
                                )}%`,
                              }}
                            />

                          </div>

                          <div className="mt-2 flex justify-between text-xs text-slate-400">

                            <span>
                              0%
                            </span>

                            <span>
                              Weighted:{" "}
                              {(
                                Number(
                                  scores[
                                    criterion
                                      .id
                                  ] ||
                                    0,
                                ) *
                                (criterion.weightPercentage /
                                  100)
                              ).toFixed(2)}
                            </span>

                            <span>
                              100%
                            </span>

                          </div>

                        </div>

                      </div>
                    ),
                  )}

              </div>

            </div>

            <div className="mt-6">

              <label className="block text-sm font-semibold text-slate-900">
                Trainer Remarks
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Optional comments about the participant's
                practical performance.
              </p>

              <textarea
                value={
                  trainerRemarks
                }
                onChange={(event) =>
                  setTrainerRemarks(
                    event.target.value,
                  )
                }
                disabled={
                  isSubmitting
                }
                rows={4}
                placeholder="Enter your remarks..."
                className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
              />

            </div>

            {(localError ||
              error) && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <p className="text-sm text-red-700">
                  {localError ||
                    error}
                </p>

              </div>
            )}

          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">

            <div>

              <p className="text-xs text-slate-400">
                Final practical score
              </p>

              <p className="text-lg font-bold text-slate-900">
                {weightedScore.toFixed(
                  2,
                )}
                %
              </p>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={onClose}
                disabled={
                  isSubmitting
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSubmit()
                }
                disabled={
                  isSubmitting
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Evaluation
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PRACTICAL RESULT MODAL
========================================================= */

function PracticalResultModal({
  result,
  onClose,
}: {
  result: PracticalAssessmentResult;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[700] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex min-h-full items-center justify-center">

        <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-5 sm:p-6">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Practical Assessment Result
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {result.participantName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {result.assessmentTitle}
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Practical Score
                  </p>

                  <div className="mt-2 flex items-center gap-3">

                    <p className="text-4xl font-bold text-slate-900">
                      {
                        result.percentage
                      }
                      %
                    </p>

                    <ResultBadge
                      passed={
                        result.isPassed
                      }
                    />

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Evaluated{" "}
                    {formatDateTime(
                      result.evaluatedAt,
                    )}
                  </p>

                </div>

                <div className="rounded-xl bg-white px-5 py-4 shadow-sm">

                  <p className="text-xs text-slate-400">
                    Total Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {
                      result.totalScore
                    }
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-6">

              <h3 className="text-lg font-bold text-slate-900">
                Criterion Scores
              </h3>

              <div className="mt-4 space-y-3">

                {result.criterionScores.map(
                  (criterion) => (
                    <div
                      key={
                        criterion.criterionId
                      }
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-slate-900">
                            {
                              criterion.criterionName
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Weight{" "}
                            {
                              criterion.weightPercentage
                            }
                            %
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm font-bold text-slate-900">
                            {
                              criterion.score
                            }
                            %
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Weighted{" "}
                            {
                              criterion.weightedScore
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  ),
                )}

              </div>

            </div>

            {result.trainerRemarks && (
              <div className="mt-6">

                <h3 className="text-sm font-bold text-slate-900">
                  Trainer Remarks
                </h3>

                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {
                      result.trainerRemarks
                    }
                  </p>

                </div>

              </div>
            )}

          </div>

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
   ASSESSMENT INFO
========================================================= */

function AssessmentInfoCard({
  title,
  batchCode,
  published,
  icon,
  meta,
}: {
  title: string;
  batchCode?: string | null;
  published: boolean;
  icon: ReactNode;
  meta: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assigned Assessment
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              {batchCode && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {batchCode}
                </span>
              )}

              {meta}

            </div>

          </div>

        </div>

        <span
          className={
            published
              ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
              : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
          }
        >
          {published
            ? "Published"
            : "Draft"}
        </span>

      </div>

    </div>
  );
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
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingRows() {
  return (
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

          {!isLoading &&
            !error &&
            submission && (
              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Assessment Result
                      </p>

                      <div className="mt-2 flex items-center gap-3">

                        <p className="text-3xl font-bold text-slate-900">
                          {
                            submission.percentage
                          }
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

                <div className="mt-7">

                  <h3 className="text-lg font-bold text-slate-900">
                    Answer Review
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Review the participant's
                    submitted answers.
                  </p>

                  {!submission.answers ||
                  submission.answers.length ===
                    0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center">

                      <FileText className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-medium text-slate-500">
                        No answer details available.
                      </p>

                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">

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
   SPINNER
========================================================= */

function Spinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
  );
}