"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  RefreshCw,
  Users,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  CircleAlert,
  X,
} from "lucide-react";

import type {
  TrainingBatch,
  TrainerAssignment,
  TrainingSession,
} from "@repo/types";

import {
  trainerAssignmentApi,
  trainingBatchApi,
} from "@/lib/api";

import { useTrainerAssignments } from "@repo/hooks";

type TrainingDetails = {
  batch: TrainingBatch;
  assignment: TrainerAssignment;
  sessions: TrainingSession[];
};

/* =========================================================
   DATE HELPERS
========================================================= */

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(String(date));

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(
  startDate: string,
  endDate: string,
) {
  if (!startDate && !endDate) {
    return "Schedule not set";
  }

  if (startDate && endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }

  return formatDate(startDate || endDate);
}

function getSessionTime(
  startTime?: string | null,
  endTime?: string | null,
) {
  if (!startTime && !endTime) {
    return "Time not set";
  }

  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }

  return startTime || endTime || "Time not set";
}

function getStatusConfig(status: string) {
  switch (status) {
    case "Published":
      return {
        label: "Published",
        className:
          "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle2,
      };

    case "Ongoing":
      return {
        label: "Ongoing",
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: PlayCircle,
      };

    case "Completed":
      return {
        label: "Completed",
        className:
          "bg-slate-100 text-slate-700 border-slate-200",
        icon: CheckCircle2,
      };

    case "Cancelled":
      return {
        label: "Cancelled",
        className:
          "bg-red-50 text-red-700 border-red-200",
        icon: CircleAlert,
      };

    default:
      return {
        label: status || "Draft",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
        icon: CircleAlert,
      };
  }
}

/* =========================================================
   CALENDAR HELPERS
========================================================= */

function toDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSessionDateKey(
  sessionDate: string,
) {
  if (!sessionDate) {
    return "";
  }

  const value = String(sessionDate);

  /*
   * Handles normal ISO/API date strings such as:
   * 2026-09-05
   * 2026-09-05T00:00:00
   */
  const datePart = value.slice(0, 10);

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      datePart,
    )
  ) {
    return datePart;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return toDateKey(date);
}

function isSameDate(
  first: Date,
  second: Date,
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function getCalendarDays(
  currentMonth: Date,
) {
  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay = new Date(
    year,
    month,
    1,
  );

  const startDay =
    firstDay.getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0,
    ).getDate();

  const previousMonthDays =
    new Date(
      year,
      month,
      0,
    ).getDate();

  const days: {
    date: Date;
    isCurrentMonth: boolean;
  }[] = [];

  for (
    let index = startDay - 1;
    index >= 0;
    index--
  ) {
    days.push({
      date: new Date(
        year,
        month - 1,
        previousMonthDays -
          index,
      ),
      isCurrentMonth: false,
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push({
      date: new Date(
        year,
        month,
        day,
      ),
      isCurrentMonth: true,
    });
  }

  let nextDay = 1;

  while (days.length < 42) {
    days.push({
      date: new Date(
        year,
        month + 1,
        nextDay,
      ),
      isCurrentMonth: false,
    });

    nextDay++;
  }

  return days;
}

function formatMonthYear(
  date: Date,
) {
  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );
}

function formatSelectedDate(
  date: Date,
) {
  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerMyTrainingPage() {
  const {
    myAssignments,
    isLoadingMyAssignments,
    error: assignmentError,
    loadMyAssignments,
  } = useTrainerAssignments(
    trainerAssignmentApi,
    {
      loadAll: false,
    },
  );

  const [
    trainingBatches,
    setTrainingBatches,
  ] = useState<TrainingBatch[]>([]);

  const [
    isLoadingBatches,
    setIsLoadingBatches,
  ] = useState(false);

  const [
    batchError,
    setBatchError,
  ] = useState<string | null>(
    null,
  );

  const [
    selectedTraining,
    setSelectedTraining,
  ] = useState<TrainingDetails | null>(
    null,
  );

  const [
    isLoadingDetails,
    setIsLoadingDetails,
  ] = useState(false);

  const [
    detailsError,
    setDetailsError,
  ] = useState<string | null>(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState("");

  /* =======================================================
     CALENDAR STATE
  ======================================================= */

  const [
    currentMonth,
    setCurrentMonth,
  ] = useState<Date>(
    new Date(),
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<Date>(
    new Date(),
  );

  /* =======================================================
     LOAD TRAINING BATCHES
  ======================================================= */

  const loadTrainingBatches =
    useCallback(async () => {
      try {
        setIsLoadingBatches(true);
        setBatchError(null);

        const result =
          await trainingBatchApi.getAssigned();

        const normalized =
          Array.isArray(result)
            ? result
            : [];

        setTrainingBatches(
          normalized,
        );
      } catch (error) {
        console.error(
          "LOAD TRAINING BATCHES ERROR:",
          error,
        );

        setBatchError(
          error instanceof Error
            ? error.message
            : "Unable to load training batches.",
        );

        setTrainingBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    }, []);

  /* =======================================================
     LOAD PAGE
  ======================================================= */

  const loadPage =
    useCallback(async () => {
      await Promise.all([
        loadMyAssignments(),
        loadTrainingBatches(),
      ]);
    }, [
      loadMyAssignments,
      loadTrainingBatches,
    ]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  /* =======================================================
     MY TRAININGS
  ======================================================= */

  const myTrainings =
    useMemo(() => {
      if (
        !myAssignments.length ||
        !trainingBatches.length
      ) {
        return [];
      }

      const assignedBatchIds =
        new Set(
          myAssignments
            .filter(
              (assignment) =>
                assignment.isActive,
            )
            .map(
              (assignment) =>
                assignment.trainingBatchId,
            ),
        );

      return trainingBatches
        .filter((batch) =>
          assignedBatchIds.has(
            batch.id,
          ),
        )
        .map((batch) => {
          const assignment =
            myAssignments.find(
              (item) =>
                item.trainingBatchId ===
                  batch.id &&
                item.isActive,
            );

          return {
            batch,
            assignment: assignment!,
          };
        })
        .filter(
          (item) =>
            item.assignment,
        );
    }, [
      myAssignments,
      trainingBatches,
    ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTrainings =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return myTrainings;
      }

      return myTrainings.filter(
        ({ batch }) =>
          batch.programName
            ?.toLowerCase()
            .includes(keyword) ||
          batch.batchCode
            ?.toLowerCase()
            .includes(keyword) ||
          batch.location
            ?.toLowerCase()
            .includes(keyword) ||
          batch.status
            ?.toLowerCase()
            .includes(keyword),
      );
    }, [
      myTrainings,
      search,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const assigned =
        myTrainings.length;

      const ongoing =
        myTrainings.filter(
          ({ batch }) =>
            batch.status ===
            "Ongoing",
        ).length;

      const upcoming =
        myTrainings.filter(
          ({ batch }) =>
            batch.status ===
            "Published",
        ).length;

      const completed =
        myTrainings.filter(
          ({ batch }) =>
            batch.status ===
            "Completed",
        ).length;

      return {
        assigned,
        ongoing,
        upcoming,
        completed,
      };
    }, [myTrainings]);

  /* =======================================================
     OPEN TRAINING
  ======================================================= */

  const openTraining =
    useCallback(
      async (
        batch: TrainingBatch,
        assignment: TrainerAssignment,
      ) => {
        try {
          setSelectedTraining({
            batch,
            assignment,
            sessions: [],
          });

          setIsLoadingDetails(
            true,
          );

          setDetailsError(null);

          const sessions =
            await trainingBatchApi.getSchedule(
              batch.id,
            );

          const normalizedSessions =
            Array.isArray(sessions)
              ? sessions
              : [];

          setSelectedTraining({
            batch,
            assignment,
            sessions:
              normalizedSessions,
          });

          /*
           * FIX:
           * Convert sessionDate safely
           * before passing it to Date.
           */
          const firstSession = normalizedSessions[0];

if (firstSession) {
  const firstSessionDate = String(
    firstSession.sessionDate,
  );

  const parsedFirstSessionDate = new Date(
    firstSessionDate,
  );

  if (!Number.isNaN(parsedFirstSessionDate.getTime())) {
    setCurrentMonth(
      new Date(
        parsedFirstSessionDate.getFullYear(),
        parsedFirstSessionDate.getMonth(),
        1,
      ),
    );

    setSelectedDate(parsedFirstSessionDate);
  }
} else {
  const today = new Date();

  setCurrentMonth(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ),
  );

  setSelectedDate(today);
}
        } catch (error) {
          console.error(
            "LOAD TRAINING DETAILS ERROR:",
            error,
          );

          setDetailsError(
            error instanceof Error
              ? error.message
              : "Unable to load training schedule.",
          );

          setSelectedTraining({
            batch,
            assignment,
            sessions: [],
          });
        } finally {
          setIsLoadingDetails(
            false,
          );
        }
      },
      [],
    );

  /* =======================================================
     CLOSE
  ======================================================= */

  const closeDetails =
    useCallback(() => {
      setSelectedTraining(null);
      setDetailsError(null);
    }, []);

  /* =======================================================
     CALENDAR
  ======================================================= */

  const calendarDays =
    useMemo(
      () =>
        getCalendarDays(
          currentMonth,
        ),
      [currentMonth],
    );

  const sessionsByDate =
    useMemo(() => {
      const map =
        new Map<
          string,
          TrainingSession[]
        >();

      if (
        !selectedTraining
      ) {
        return map;
      }

      selectedTraining.sessions.forEach(
        (session) => {
          const key =
            getSessionDateKey(
              String(
                session.sessionDate,
              ),
            );

          if (!key) {
            return;
          }

          const existing =
            map.get(key) ?? [];

          existing.push(
            session,
          );

          map.set(
            key,
            existing,
          );
        },
      );

      return map;
    }, [
      selectedTraining,
    ]);

  const selectedDateKey =
    toDateKey(selectedDate);

  const selectedDaySessions =
    sessionsByDate.get(
      selectedDateKey,
    ) ?? [];

  /* =======================================================
     CALENDAR NAVIGATION
  ======================================================= */

  const goToPreviousMonth =
    () => {
      setCurrentMonth(
        (current) =>
          new Date(
            current.getFullYear(),
            current.getMonth() - 1,
            1,
          ),
      );
    };

  const goToNextMonth =
    () => {
      setCurrentMonth(
        (current) =>
          new Date(
            current.getFullYear(),
            current.getMonth() + 1,
            1,
          ),
      );
    };

  const goToToday = () => {
    const today =
      new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

    setSelectedDate(
      today,
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  const isLoading =
    isLoadingMyAssignments ||
    isLoadingBatches;

  const pageError =
    assignmentError ||
    batchError;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="h-screen overflow-y-auto bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 pb-10">

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

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              View and manage the training batches assigned to you.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadPage()
            }
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {pageError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load your trainings
              </p>

              <p className="mt-1">
                {pageError}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Assigned"
            value={stats.assigned}
            icon={
              <BookOpen className="h-5 w-5" />
            }
          />

          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            icon={
              <CalendarDays className="h-5 w-5" />
            }
          />

          <StatCard
            label="Ongoing"
            value={stats.ongoing}
            icon={
              <PlayCircle className="h-5 w-5" />
            }
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
          />
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                My Assigned Trainings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                These are the training batches assigned specifically to you.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search training..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {isLoading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ),
            )}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!isLoading &&
          filteredTrainings.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <BookOpen className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No assigned trainings
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                You currently don't have any active training batches assigned
                to you. Trainings assigned by an administrator will appear
                here.
              </p>
            </div>
          )}

        {/* =================================================
            TRAINING CARDS
        ================================================= */}

        {!isLoading &&
          filteredTrainings.length >
            0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTrainings.map(
                ({
                  batch,
                  assignment,
                }) => {
                  const status =
                    getStatusConfig(
                      batch.status,
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <div
                      key={batch.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="border-b border-slate-100 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Training Program
                            </p>

                            <h3 className="mt-1 line-clamp-2 text-lg font-bold text-slate-900">
                              {
                                batch.programName
                              }
                            </h3>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />

                            {status.label}
                          </span>
                        </div>

                        <div className="mt-3 inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Batch{" "}
                          {
                            batch.batchCode
                          }
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 p-5">
                        <InfoRow
                          icon={
                            <CalendarDays className="h-4 w-4" />
                          }
                          label="Training Period"
                          value={formatDateRange(
                            batch.startDate,
                            batch.endDate,
                          )}
                        />

                        <InfoRow
                          icon={
                            <MapPin className="h-4 w-4" />
                          }
                          label="Location"
                          value={
                            batch.location ||
                            "Location not set"
                          }
                        />

                        <InfoRow
                          icon={
                            <Users className="h-4 w-4" />
                          }
                          label="Participants"
                          value={`${batch.enrolledCount} / ${batch.capacity}`}
                        />

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-medium text-slate-400">
                            Assigned
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatDate(
                              assignment.assignedAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 p-4">
                        <button
                          type="button"
                          onClick={() =>
                            void openTraining(
                              batch,
                              assignment,
                            )
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          View Training

                          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
      </div>

      {/* ===================================================
          TRAINING DETAILS MODAL
      =================================================== */}

      {selectedTraining && (
        <div className="fixed inset-0 z-500 overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex min-h-full items-center justify-center py-4 sm:py-6">
            <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-4 sm:p-6">
                <div className="min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      Batch{" "}
                      {
                        selectedTraining
                          .batch
                          .batchCode
                      }
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        getStatusConfig(
                          selectedTraining
                            .batch
                            .status,
                        ).className
                      }`}
                    >
                      {
                        selectedTraining
                          .batch
                          .status
                      }
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                    {
                      selectedTraining
                        .batch
                        .programName
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Assigned on{" "}
                    {formatDate(
                      selectedTraining
                        .assignment
                        .assignedAt,
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeDetails
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close training details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL BODY */}

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">

                {/* SUMMARY */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailCard
                    icon={
                      <CalendarDays className="h-5 w-5" />
                    }
                    label="Training Period"
                    value={formatDateRange(
                      selectedTraining
                        .batch
                        .startDate,
                      selectedTraining
                        .batch
                        .endDate,
                    )}
                  />

                  <DetailCard
                    icon={
                      <MapPin className="h-5 w-5" />
                    }
                    label="Location"
                    value={
                      selectedTraining
                        .batch
                        .location ||
                      "Not set"
                    }
                  />

                  <DetailCard
                    icon={
                      <Users className="h-5 w-5" />
                    }
                    label="Participants"
                    value={`${selectedTraining.batch.enrolledCount} / ${selectedTraining.batch.capacity}`}
                  />

                  <DetailCard
                    icon={
                      <BookOpen className="h-5 w-5" />
                    }
                    label="Assignment"
                    value="Active"
                  />
                </div>

                {/* =================================================
                    TRAINING SCHEDULE
                ================================================= */}

                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Training Schedule
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Calendar view of the approved training sessions.
                    </p>
                  </div>

                  {isLoadingDetails && (
                    <div className="space-y-3">
                      {[1, 2, 3].map(
                        (item) => (
                          <div
                            key={item}
                            className="h-20 animate-pulse rounded-xl bg-slate-100"
                          />
                        ),
                      )}
                    </div>
                  )}

                  {!isLoadingDetails &&
                    detailsError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {detailsError}
                      </div>
                    )}

                  {!isLoadingDetails &&
                    !detailsError && (
                      <>
                        {/* CALENDAR */}

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                          {/* CALENDAR HEADER */}

                          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">
                                {formatMonthYear(
                                  currentMonth,
                                )}
                              </h4>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Click a date to view its training session.
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={
                                  goToPreviousMonth
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                                aria-label="Previous month"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={
                                  goToToday
                                }
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Today
                              </button>

                              <button
                                type="button"
                                onClick={
                                  goToNextMonth
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                                aria-label="Next month"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* CALENDAR GRID */}

                          <div className="overflow-x-auto">
                            <div className="min-w-[680px]">

                              {/* WEEKDAYS */}

                              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                                {[
                                  "Sun",
                                  "Mon",
                                  "Tue",
                                  "Wed",
                                  "Thu",
                                  "Fri",
                                  "Sat",
                                ].map(
                                  (
                                    day,
                                  ) => (
                                    <div
                                      key={
                                        day
                                      }
                                      className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
                                    >
                                      {
                                        day
                                      }
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* DAYS */}

                              <div className="grid grid-cols-7">
                                {calendarDays.map(
                                  ({
                                    date,
                                    isCurrentMonth,
                                  }) => {
                                    const key =
                                      toDateKey(
                                        date,
                                      );

                                    const daySessions =
                                      sessionsByDate.get(
                                        key,
                                      ) ??
                                      [];

                                    const hasSessions =
                                      daySessions.length >
                                      0;

                                    const isSelected =
                                      isSameDate(
                                        date,
                                        selectedDate,
                                      );

                                    const isToday =
                                      isSameDate(
                                        date,
                                        new Date(),
                                      );

                                    return (
                                      <button
                                        key={
                                          key
                                        }
                                        type="button"
                                        onClick={() =>
                                          setSelectedDate(
                                            date,
                                          )
                                        }
                                        className={`relative min-h-[92px] border-b border-r border-slate-200 p-2 text-left transition sm:min-h-[105px] ${
                                          isCurrentMonth
                                            ? "bg-white"
                                            : "bg-slate-50/70"
                                        } ${
                                          isSelected
                                            ? "bg-slate-100"
                                            : "hover:bg-slate-50"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                              isToday
                                                ? "bg-slate-900 text-white"
                                                : isCurrentMonth
                                                  ? "text-slate-700"
                                                  : "text-slate-400"
                                            }`}
                                          >
                                            {
                                              date.getDate()
                                            }
                                          </span>

                                          {hasSessions && (
                                            <span className="hidden text-[10px] font-semibold text-slate-400 sm:block">
                                              {
                                                daySessions.length
                                              }{" "}
                                              {daySessions.length ===
                                              1
                                                ? "session"
                                                : "sessions"}
                                            </span>
                                          )}
                                        </div>

                                        {hasSessions && (
                                          <div className="mt-2 space-y-1">
                                            {daySessions
                                              .slice(
                                                0,
                                                2,
                                              )
                                              .map(
                                                (
                                                  session,
                                                ) => (
                                                  <div
                                                    key={
                                                      session.id
                                                    }
                                                    className={`rounded-md px-2 py-1 ${
                                                      isSelected
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-blue-50 text-blue-700"
                                                    }`}
                                                  >
                                                    <p className="truncate text-[10px] font-bold sm:text-xs">
                                                      Session{" "}
                                                      {
                                                        session.sessionNumber
                                                      }
                                                    </p>

                                                    <p
                                                      className={`truncate text-[9px] sm:text-[10px] ${
                                                        isSelected
                                                          ? "text-slate-300"
                                                          : "text-blue-600"
                                                      }`}
                                                    >
                                                      {
                                                        session.startTime
                                                      }{" "}
                                                      –
                                                      {
                                                        session.endTime
                                                      }
                                                    </p>
                                                  </div>
                                                ),
                                              )}

                                            {daySessions.length >
                                              2 && (
                                              <p className="px-1 text-[9px] font-semibold text-slate-400">
                                                +
                                                {daySessions.length -
                                                  2}{" "}
                                                more
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </div>

                          {/* LEGEND */}

                          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-blue-500" />

                              <span className="text-xs text-slate-500">
                                Training session
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                                {
                                  new Date().getDate()
                                }
                              </span>

                              <span className="text-xs text-slate-500">
                                Today
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* SELECTED DATE */}

                        <div className="mt-5">
                          <div className="mb-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Selected Date
                            </p>

                            <h4 className="mt-1 text-lg font-bold text-slate-900">
                              {formatSelectedDate(
                                selectedDate,
                              )}
                            </h4>
                          </div>

                          {selectedDaySessions.length ===
                            0 && (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                              <CalendarDays className="mx-auto h-7 w-7 text-slate-400" />

                              <p className="mt-2 text-sm font-semibold text-slate-700">
                                No training session
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                There is no scheduled training on this date.
                              </p>
                            </div>
                          )}

                          {selectedDaySessions.length >
                            0 && (
                            <div className="space-y-3">
                              {selectedDaySessions.map(
                                (
                                  session,
                                ) => (
                                  <div
                                    key={
                                      session.id
                                    }
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                  >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                                          {
                                            session.sessionNumber
                                          }
                                        </div>

                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-900">
                                            Session{" "}
                                            {
                                              session.sessionNumber
                                            }
                                          </p>

                                          <p className="mt-1 text-sm text-slate-500">
                                            {formatDate(
                                              String(
                                                session.sessionDate,
                                              ),
                                            )}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                                          <Clock3 className="h-3.5 w-3.5" />

                                          {getSessionTime(
                                            session.startTime,
                                            session.endTime,
                                          )}
                                        </span>

                                        <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                                          {
                                            session.durationHours
                                          }{" "}
                                          hrs
                                        </span>

                                        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                          {
                                            session.status
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        {/* SUMMARY */}

                        {selectedTraining
                          .sessions
                          .length > 0 && (
                          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                  Schedule Summary
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {
                                    selectedTraining
                                      .sessions
                                      .length
                                  }{" "}
                                  training{" "}
                                  {selectedTraining
                                    .sessions
                                    .length ===
                                  1
                                    ? "session"
                                    : "sessions"}{" "}
                                  approved
                                </p>
                              </div>

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                                <CalendarDays className="h-5 w-5" />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}