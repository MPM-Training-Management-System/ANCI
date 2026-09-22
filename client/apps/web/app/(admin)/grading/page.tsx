"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";

import type {
  TrainingGrade,
} from "@repo/types";

import {
  useEnrollments,
  useTrainingGrade,
} from "@repo/hooks";

import {
  apiClient,
  enrollmentApi,
} from "@/lib/api";

// =========================================================
// TYPES
// =========================================================

type GradeMap = Record<
  string,
  TrainingGrade
>;

// =========================================================
// HELPERS
// =========================================================

function formatPercentage(
  value: number,
) {
  return `${value.toFixed(2)}%`;
}


// =========================================================
// PROGRESS CELL
// =========================================================

function ProgressCell({
  percentage,
  weight,
  weightedScore,
}: {
  percentage: number;
  weight: number;
  weightedScore: number;
}) {
  const progress = Math.min(
    Math.max(percentage, 0),
    100,
  );

  return (
    <div className="min-w-[145px]">

      <div className="mb-1.5 flex items-center justify-between gap-2">

        <span className="text-sm font-semibold text-gray-900">
          {formatPercentage(percentage)}
        </span>

        <span className="text-[11px] text-gray-400">
          {weight}%
        </span>

      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">

        <div
          className="h-full rounded-full bg-gray-800 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <p className="mt-1 text-[11px] text-gray-400">
        Contribution: {weightedScore.toFixed(2)}
      </p>

    </div>
  );
}


// =========================================================
// GRADE STATUS
// =========================================================

function GradeStatus({
  grade,
}: {
  grade: TrainingGrade;
}) {
  const complete =
    grade.attendancePercentage >= 100 &&
    grade.participationPercentage >= 100 &&
    grade.examPercentage >= 100 &&
    grade.practicalPercentage >= 100;

  if (complete) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Complete
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      In Progress
    </span>
  );
}


// =========================================================
// MAIN PAGE
// =========================================================

export default function TrainingGradePage() {

  // =======================================================
  // ENROLLMENTS
  // =======================================================

  const {
    trainerEnrollments,
    loadTrainerEnrollments,
    isLoading: enrollmentsLoading,
  } = useEnrollments(
    enrollmentApi,
  );


  // =======================================================
  // TRAINING GRADE HOOK
  // =======================================================

  const {
    grade,
    isLoading: gradeLoading,
    error: gradeError,
    loadGrade,
  } = useTrainingGrade(
    apiClient,
  );


  // =======================================================
  // STATE
  // =======================================================

  const [
    grades,
    setGrades,
  ] = useState<GradeMap>({});

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedBatch,
    setSelectedBatch,
  ] = useState("all");


  // =======================================================
  // LOAD TRAINER ENROLLMENTS
  // =======================================================

  useEffect(() => {

    loadTrainerEnrollments().catch(() => {
      // Hook handles the error.
    });

  }, [
    loadTrainerEnrollments,
  ]);


  // =======================================================
  // LOAD GRADES
  // =======================================================

  useEffect(() => {

    if (
      trainerEnrollments.length === 0
    ) {
      return;
    }

    let cancelled = false;

    const loadAllGrades = async () => {

      const results =
        await Promise.allSettled(
          trainerEnrollments.map(
            enrollment =>
              loadGrade(
                enrollment.id,
              ),
          ),
        );

      if (cancelled) {
        return;
      }

      const nextGrades: GradeMap = {};

      results.forEach(
        result => {

          if (
            result.status === "fulfilled"
          ) {

            const data =
              result.value;

            nextGrades[
              data.enrollmentId
            ] = data;

          }

        },
      );

      setGrades(
        current => ({
          ...current,
          ...nextGrades,
        }),
      );

    };

    loadAllGrades();

    return () => {
      cancelled = true;
    };

  }, [
    trainerEnrollments,
    loadGrade,
  ]);


  // =======================================================
  // CURRENT GRADE
  //
  // useTrainingGrade keeps the latest loaded grade.
  // Keep it synchronized into the table.
  // =======================================================

  useEffect(() => {

    if (!grade) {
      return;
    }

    setGrades(
      current => ({
        ...current,
        [grade.enrollmentId]: grade,
      }),
    );

  }, [
    grade,
  ]);


  // =======================================================
  // BATCH OPTIONS
  // =======================================================

  const batchOptions =
    useMemo(() => {

      const unique =
        new Map<
          string,
          string
        >();

      Object.values(
        grades,
      ).forEach(
        item => {

          if (
            item.trainingBatchId
          ) {

            unique.set(
              item.trainingBatchId,
              item.batchCode,
            );

          }

        },
      );

      return Array.from(
        unique.entries(),
      ).map(
        ([id, code]) => ({
          id,
          code,
        }),
      );

    }, [
      grades,
    ]);


  // =======================================================
  // FILTERED GRADES
  // =======================================================

  const filteredGrades =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return Object.values(
        grades,
      ).filter(
        item => {

          const matchesSearch =
            !query ||
            item.participantName
              .toLowerCase()
              .includes(query) ||
            item.batchCode
              .toLowerCase()
              .includes(query);

          const matchesBatch =
            selectedBatch === "all" ||
            item.trainingBatchId ===
              selectedBatch;

          return (
            matchesSearch &&
            matchesBatch
          );

        },
      );

    }, [
      grades,
      search,
      selectedBatch,
    ]);


  // =======================================================
  // STATS
  // =======================================================

  const totalParticipants =
    filteredGrades.length;

  const completedParticipants =
    filteredGrades.filter(
      item =>
        item.attendancePercentage >= 100 &&
        item.participationPercentage >= 100 &&
        item.examPercentage >= 100 &&
        item.practicalPercentage >= 100,
    ).length;

  const averageGrade =
    filteredGrades.length > 0
      ? filteredGrades.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.overallGrade,
          0,
        ) /
        filteredGrades.length
      : 0;


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-[1600px] px-6 py-6">

          <div className="flex flex-col gap-1">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">

                <Calculator className="h-5 w-5" />

              </div>

              <div>

                <h1 className="text-xl font-bold text-gray-900">
                  Grade Calculation
                </h1>

                <p className="text-sm text-gray-500">
                  Monitor participant progress and calculated grades.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1600px] px-6 py-6">


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-xl border border-gray-200 bg-white p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Participants
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {totalParticipants}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Users className="h-5 w-5 text-gray-500" />
              </div>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="rounded-xl border border-gray-200 bg-white p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Completed
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {completedParticipants}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <CheckCircle2 className="h-5 w-5 text-gray-500" />
              </div>

            </div>

          </div>


          {/* AVERAGE */}

          <div className="rounded-xl border border-gray-200 bg-white p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Average Grade
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {averageGrade.toFixed(2)}%
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Award className="h-5 w-5 text-gray-500" />
              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            TABLE CARD
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">


          {/* TABLE HEADER */}

          <div className="border-b border-gray-200 p-4">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="font-semibold text-gray-900">
                  Participant Grades
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Attendance 20% · Participation 20% · Exam 30% · Practical 30%
                </p>

              </div>


              <div className="flex flex-col gap-2 sm:flex-row">


                {/* SEARCH */}

                <div className="relative">

                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={event =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search participant..."
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white sm:w-64"
                  />

                </div>


                {/* BATCH */}

                <select
                  value={selectedBatch}
                  onChange={event =>
                    setSelectedBatch(
                      event.target.value,
                    )
                  }
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400"
                >

                  <option value="all">
                    All Batches
                  </option>

                  {batchOptions.map(
                    batch => (

                      <option
                        key={batch.id}
                        value={batch.id}
                      >
                        {batch.code}
                      </option>

                    ),
                  )}

                </select>

              </div>

            </div>

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px] border-collapse">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50">

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Participant
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Attendance
                    <span className="ml-1 font-normal">
                      20%
                    </span>
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Participation
                    <span className="ml-1 font-normal">
                      20%
                    </span>
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Exam
                    <span className="ml-1 font-normal">
                      30%
                    </span>
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Practical
                    <span className="ml-1 font-normal">
                      30%
                    </span>
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Overall
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
  Status
</th>

                </tr>

              </thead>


              <tbody>

                {enrollmentsLoading ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />

                        <p className="mt-3 text-sm text-gray-500">
                          Loading participants...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : gradeLoading &&
                  Object.keys(grades).length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />

                        <p className="mt-3 text-sm text-gray-500">
                          Calculating grades...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : filteredGrades.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >

                      <Calculator className="mx-auto h-8 w-8 text-gray-300" />

                      <p className="mt-3 text-sm font-medium text-gray-700">
                        No grade records found
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Grade records will appear once participants have assessment data.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredGrades.map(
                    item => (

                      <tr
                        key={
                          item.enrollmentId
                        }
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >

                        {/* PARTICIPANT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">

                              <Users className="h-4 w-4 text-gray-500" />

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-gray-900">
                                {item.participantName}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {item.batchCode}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* ATTENDANCE */}

                        <td className="px-5 py-4">

                          <ProgressCell
                            percentage={
                              item.attendancePercentage
                            }
                            weight={
                              item.attendanceWeight
                            }
                            weightedScore={
                              item.attendanceWeightedScore
                            }
                          />

                        </td>


                        {/* PARTICIPATION */}

                        <td className="px-5 py-4">

                          <ProgressCell
                            percentage={
                              item.participationPercentage
                            }
                            weight={
                              item.participationWeight
                            }
                            weightedScore={
                              item.participationWeightedScore
                            }
                          />

                        </td>


                        {/* EXAM */}

                        <td className="px-5 py-4">

                          <ProgressCell
                            percentage={
                              item.examPercentage
                            }
                            weight={
                              item.examWeight
                            }
                            weightedScore={
                              item.examWeightedScore
                            }
                          />

                        </td>


                        {/* PRACTICAL */}

                        <td className="px-5 py-4">

                          <ProgressCell
                            percentage={
                              item.practicalPercentage
                            }
                            weight={
                              item.practicalWeight
                            }
                            weightedScore={
                              item.practicalWeightedScore
                            }
                          />

                        </td>


                       {/* OVERALL */}

<td className="px-5 py-4 text-right">

  <span className="text-lg font-bold text-gray-900">
    {item.overallGrade.toFixed(2)}
  </span>

  <span className="text-sm text-gray-400">
    %
  </span>

</td>


{/* STATUS */}

<td className="px-5 py-4">

  {item.isPassed ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Failed
    </span>
  )}

</td>

                      </tr>

                    ),
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* =================================================
              TABLE FOOTER
          ================================================= */}

          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3">

            <p className="text-xs text-gray-500">

              Showing{" "}
              <span className="font-medium text-gray-700">
                {filteredGrades.length}
              </span>{" "}
              participant
              {filteredGrades.length !== 1
                ? "s"
                : ""}

            </p>

            <div className="flex items-center gap-4 text-xs text-gray-400">

              <span className="inline-flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Attendance
              </span>

              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                Participation
              </span>

              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Exam
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" />
                Practical
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            GRADE FORMULA
        ================================================= */}

        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Grade Formula
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Attendance × 20% + Participation × 20% + Exam × 30% + Practical × 30%
              </p>

            </div>

            <div className="text-xs text-gray-400">
              Total Weight: 100%
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}