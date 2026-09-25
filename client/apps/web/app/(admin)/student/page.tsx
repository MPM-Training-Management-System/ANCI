"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Trophy,
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

import {
  DataTable,
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import { columns } from "./columns";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type GradeMap = Record<
  string,
  TrainingGrade
>;

/* -------------------------------------------------------------------------- */
/*                                  Page                                      */
/* -------------------------------------------------------------------------- */

export default function StudentProgress() {
  /* ------------------------------------------------------------------------ */
  /*                              ENROLLMENTS                                 */
  /* ------------------------------------------------------------------------ */

  const {
    trainerEnrollments,
    loadTrainerEnrollments,
    isLoading: enrollmentsLoading,
  } = useEnrollments(
    enrollmentApi,
  );

  /* ------------------------------------------------------------------------ */
  /*                              TRAINING GRADE                              */
  /* ------------------------------------------------------------------------ */

  const {
    grade,
    isLoading: gradeLoading,
    loadGrade,
  } = useTrainingGrade(
    apiClient,
  );

  /* ------------------------------------------------------------------------ */
  /*                                  STATE                                   */
  /* ------------------------------------------------------------------------ */

  const [
    grades,
    setGrades,
  ] = useState<GradeMap>({});

  const [
    selectedBatch,
    setSelectedBatch,
  ] = useState("all");

  /* ------------------------------------------------------------------------ */
  /*                       LOAD TRAINER ENROLLMENTS                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    loadTrainerEnrollments().catch(() => {
      // Hook handles the error.
    });
  }, [
    loadTrainerEnrollments,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                              LOAD GRADES                                 */
  /* ------------------------------------------------------------------------ */

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
            (enrollment) =>
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
        (result) => {
          if (
            result.status ===
            "fulfilled"
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
        (current) => ({
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

  /* ------------------------------------------------------------------------ */
  /*                           CURRENT GRADE                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!grade) {
      return;
    }

    setGrades(
      (current) => ({
        ...current,
        [grade.enrollmentId]: grade,
      }),
    );
  }, [
    grade,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                            BATCH OPTIONS                                 */
  /* ------------------------------------------------------------------------ */

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
        (item) => {
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

  /* ------------------------------------------------------------------------ */
  /*                           FILTERED GRADES                                */
  /* ------------------------------------------------------------------------ */

  const filteredGrades =
    useMemo(() => {
      return Object.values(
        grades,
      ).filter(
        (item) => {
          return (
            selectedBatch ===
              "all" ||
            item.trainingBatchId ===
              selectedBatch
          );
        },
      );
    }, [
      grades,
      selectedBatch,
    ]);

  /* ------------------------------------------------------------------------ */
  /*                         DATATABLE DATA                                   */
  /* ------------------------------------------------------------------------ */

  const tableData =
    useMemo(() => {
      return filteredGrades.map(
        (item) => ({
          ...item,

          searchValue: [
            item.participantName,
            item.batchCode,
            item.overallGrade,
            item.isPassed
              ? "passed"
              : "failed",
          ]
            .filter(Boolean)
            .join(" "),
        }),
      );
    }, [
      filteredGrades,
    ]);

  /* ------------------------------------------------------------------------ */
  /*                                  STATS                                   */
  /* ------------------------------------------------------------------------ */

  const totalParticipants =
    filteredGrades.length;

  const completedParticipants =
    filteredGrades.filter(
      (item) =>
        item.attendancePercentage >=
          100 &&
        item.participationPercentage >=
          100 &&
        item.examPercentage >=
          100 &&
        item.practicalPercentage >=
          100,
    ).length;

  const inProgressParticipants =
    filteredGrades.filter(
      (item) =>
        !(
          item.attendancePercentage >=
            100 &&
          item.participationPercentage >=
            100 &&
          item.examPercentage >=
            100 &&
          item.practicalPercentage >=
            100
        ),
    ).length;

  const passedParticipants =
    filteredGrades.filter(
      (item) => item.isPassed,
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

  const highestGrade =
    filteredGrades.length > 0
      ? Math.max(
          ...filteredGrades.map(
            (item) =>
              item.overallGrade,
          ),
        )
      : 0;

  /* ------------------------------------------------------------------------ */
  /*                                  LOADING                                 */
  /* ------------------------------------------------------------------------ */

  const isLoading =
    enrollmentsLoading ||
    (gradeLoading &&
      Object.keys(grades).length ===
        0);

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen space-y-3 p-8">

      {/* ------------------------------------------------------------------ */}
      {/* PAGE HEADER                                                        */}
      {/* ------------------------------------------------------------------ */}

      <PageSection
        title="Student Progress"
        description="Monitor participant progress, completion, and calculated grades."
      />

      {/* ------------------------------------------------------------------ */}
      {/* STATISTICS                                                         */}
      {/* ------------------------------------------------------------------ */}

      <StatGrid>

        {/* Total Participants */}
        <StatCard
          title="Total Participants"
          value={totalParticipants}
          description="Enrolled participants"
          variant="primary"
          icon={Users}
        />

        {/* Completed */}
        <StatCard
          title="Completed"
          value={completedParticipants}
          description="Completed all requirements"
          variant="success"
          icon={CheckCircle2}
        />

        {/* In Progress */}
        <StatCard
          title="In Progress"
          value={inProgressParticipants}
          description="Still completing requirements"
          variant="warning"
          icon={Clock3}
        />

        {/* Passed */}
        <StatCard
          title="Passed"
          value={passedParticipants}
          description="Participants who passed"
          variant="success"
          icon={Trophy}
        />

        {/* Average Grade */}
        <StatCard
          title="Average Grade"
          value={`${averageGrade.toFixed(2)}%`}
          description="Overall average grade"
          variant="primary"
          icon={Award}
        />

        {/* Highest Grade */}
        <StatCard
          title="Highest Grade"
          value={`${highestGrade.toFixed(2)}%`}
          description="Highest overall grade"
          variant="primary"
          icon={TrendingUp}
        />

      </StatGrid>



      <div className="mx-auto max-w-400">

        <DataTable
          title="Participant Grades"
          description="Monitor attendance, participation, examination, practical assessment, and overall grades."
          columns={columns}
          data={tableData}
          searchable
          searchPlaceholder="Search participant or batch..."
          showPagination
          emptyTitle={
            isLoading
              ? "Loading grades..."
              : "No grade records found"
          }
          emptyDescription={
            isLoading
              ? "Please wait while participant grades are being calculated."
              : "Grade records will appear once participants have assessment data."
          }
          toolbar={
            <div className="flex flex-wrap items-center gap-2">

              {/* Batch Filter */}
              <select
                value={selectedBatch}
                onChange={(event) =>
                  setSelectedBatch(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300 focus:bg-white"
              >
                <option value="all">
                  All Batches
                </option>

                {batchOptions.map(
                  (batch) => (
                    <option
                      key={batch.id}
                      value={batch.id}
                    >
                      {batch.code}
                    </option>
                  ),
                )}
              </select>

              {/* Record Count */}
              <div className="flex h-10 items-center rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-500">
                {filteredGrades.length}{" "}
                {filteredGrades.length ===
                1
                  ? "participant"
                  : "participants"}
              </div>

            </div>
          }
        />

        {/* ---------------------------------------------------------------- */}
        {/* GRADE FORMULA                                                    */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Grade Formula
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Attendance × 20% +
                Participation × 20% +
                Exam × 30% +
                Practical × 30%
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