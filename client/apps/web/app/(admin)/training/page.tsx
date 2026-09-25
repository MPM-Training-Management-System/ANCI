"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  RefreshCw,
} from "lucide-react";

import type {
  TrainingBatch,
  TrainingSession,
} from "@repo/types";

import { Button, PageSection, PageSkeleton } from "@repo/ui/index";

import {
  trainerAssignmentApi,
  trainingBatchApi,
} from "@/lib/api";

import { useTrainerAssignments } from "@repo/hooks";

// ============================================================
// HELPERS
// ============================================================

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSessionDateKey = (
  value: string,
) => {
  const dateValue = String(value);

  // YYYY-MM-DD
  const dateOnlyMatch =
    dateValue.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    );

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    if (
      !Number.isNaN(year) &&
      !Number.isNaN(month) &&
      !Number.isNaN(day)
    ) {
      return `${year}-${String(month).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`;
    }
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return toDateKey(parsed);
};

const formatDate = (value: string) => {
  if (!value) {
    return "No date";
  }

  const dateValue = String(value);

  const match = dateValue.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/,
  );

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (
      !Number.isNaN(year) &&
      !Number.isNaN(month) &&
      !Number.isNaN(day)
    ) {
      const parsedDate = new Date(
        year,
        month - 1,
        day,
      );

      return parsedDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      );
    }
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
};

const getSessionTime = (
  startTime?: string | null,
  endTime?: string | null,
) => {
  if (!startTime && !endTime) {
    return "Time not set";
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime ?? endTime ?? "Time not set";
};

const getCalendarDays = (
  month: Date,
) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstDay = new Date(
    year,
    monthIndex,
    1,
  );

  const firstDayOfWeek =
    firstDay.getDay();

  const daysInMonth = new Date(
    year,
    monthIndex + 1,
    0,
  ).getDate();

  const previousMonthDays =
    new Date(
      year,
      monthIndex,
      0,
    ).getDate();

  const days: Date[] = [];

  for (
    let index = firstDayOfWeek - 1;
    index >= 0;
    index--
  ) {
    days.push(
      new Date(
        year,
        monthIndex - 1,
        previousMonthDays - index,
      ),
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(
      new Date(
        year,
        monthIndex,
        day,
      ),
    );
  }

  let nextMonthDay = 1;

  while (days.length < 42) {
    days.push(
      new Date(
        year,
        monthIndex + 1,
        nextMonthDay,
      ),
    );

    nextMonthDay++;
  }

  return days;
};

// ============================================================
// COMPONENT
// ============================================================

export default function TrainerMyTrainingPage() {
  // ============================================================
  // ASSIGNMENTS
  // ============================================================

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

  // ============================================================
  // TRAINING BATCHES
  // ============================================================

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
  ] = useState<string | null>(null);

  // ============================================================
  // SCHEDULE
  // ============================================================

  const [
    sessions,
    setSessions,
  ] = useState<TrainingSession[]>([]);

  const [
    isLoadingDetails,
    setIsLoadingDetails,
  ] = useState(false);

  const [
    detailsError,
    setDetailsError,
  ] = useState<string | null>(null);

  // ============================================================
  // CALENDAR
  // ============================================================

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

  // ============================================================
  // LOAD TRAINING BATCHES
  // ============================================================

  const loadTrainingBatches =
    useCallback(async () => {
      try {
        setIsLoadingBatches(true);
        setBatchError(null);

        const result =
          await trainingBatchApi.getAssigned();

        setTrainingBatches(
          Array.isArray(result)
            ? result
            : [],
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

  // ============================================================
  // LOAD PAGE
  // ============================================================

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

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  // ============================================================
  // CURRENT TRAINING
  // ============================================================

  const currentTraining =
    useMemo(() => {
      if (
        !myAssignments.length ||
        !trainingBatches.length
      ) {
        return null;
      }

      const activeAssignments =
        myAssignments.filter(
          (assignment) =>
            assignment.isActive,
        );

      for (
        const assignment of activeAssignments
      ) {
        const batch =
          trainingBatches.find(
            (item) =>
              item.id ===
              assignment.trainingBatchId,
          );

        if (batch) {
          return {
            batch,
            assignment,
          };
        }
      }

      return null;
    }, [
      myAssignments,
      trainingBatches,
    ]);

  // ============================================================
  // LOAD CURRENT TRAINING SCHEDULE
  // ============================================================

  const loadCurrentTrainingSchedule =
    useCallback(
      async (
        batch: TrainingBatch,
      ) => {
        try {
          setIsLoadingDetails(true);
          setDetailsError(null);

          const result =
            await trainingBatchApi.getSchedule(
              batch.id,
            );

          const normalizedSessions =
            Array.isArray(result)
              ? result
              : [];

          setSessions(
            normalizedSessions,
          );

          // Automatically open the first
          // available session date.
          const firstSession =
            normalizedSessions[0];

          if (firstSession) {
            const sessionDate =
              String(
                firstSession.sessionDate,
              );

            // Safely handle YYYY-MM-DD
            const match =
              sessionDate.match(
                /^(\d{4})-(\d{1,2})-(\d{1,2})/,
              );

            if (match) {
              const year = Number(
                match[1],
              );

              const month = Number(
                match[2],
              );

              const day = Number(
                match[3],
              );

              if (
                !Number.isNaN(year) &&
                !Number.isNaN(month) &&
                !Number.isNaN(day)
              ) {
                const parsedDate =
                  new Date(
                    year,
                    month - 1,
                    day,
                  );

                setCurrentMonth(
                  new Date(
                    year,
                    month - 1,
                    1,
                  ),
                );

                setSelectedDate(
                  parsedDate,
                );
              }
            } else {
              const parsedDate =
                new Date(
                  sessionDate,
                );

              if (
                !Number.isNaN(
                  parsedDate.getTime(),
                )
              ) {
                setCurrentMonth(
                  new Date(
                    parsedDate.getFullYear(),
                    parsedDate.getMonth(),
                    1,
                  ),
                );

                setSelectedDate(
                  parsedDate,
                );
              }
            }
          } else {
            const today =
              new Date();

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
            "LOAD TRAINING SCHEDULE ERROR:",
            error,
          );

          setDetailsError(
            error instanceof Error
              ? error.message
              : "Unable to load training schedule.",
          );

          setSessions([]);
        } finally {
          setIsLoadingDetails(false);
        }
      },
      [],
    );

  // ============================================================
  // LOAD SCHEDULE WHEN CURRENT TRAINING CHANGES
  // ============================================================

  useEffect(() => {
    if (
      isLoadingMyAssignments ||
      isLoadingBatches
    ) {
      return;
    }

    if (!currentTraining) {
      setSessions([]);
      setDetailsError(null);
      return;
    }

    void loadCurrentTrainingSchedule(
      currentTraining.batch,
    );
  }, [
    currentTraining?.batch.id,
    isLoadingMyAssignments,
    isLoadingBatches,
    loadCurrentTrainingSchedule,
  ]);

  // ============================================================
  // CALENDAR DATA
  // ============================================================

  const calendarDays = useMemo(
    () =>
      getCalendarDays(
        currentMonth,
      ),
    [currentMonth],
  );

  const sessionsByDate = useMemo(() => {
    const map = new Map<
      string,
      TrainingSession[]
    >();

    sessions.forEach(
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

        existing.push(session);

        map.set(
          key,
          existing,
        );
      },
    );

    return map;
  }, [sessions]);

  const selectedDateKey =
    toDateKey(selectedDate);

  const selectedDaySessions =
    sessionsByDate.get(
      selectedDateKey,
    ) ?? [];

  // ============================================================
  // CALENDAR NAVIGATION
  // ============================================================

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

    setSelectedDate(today);
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh =
    async () => {
      setSessions([]);
      setDetailsError(null);

      await loadPage();
    };

  // ============================================================
  // ERRORS
  // ============================================================

  const pageError =
    assignmentError ??
    batchError;

  // ============================================================
  // LOADING
  // ============================================================

  if (
    isLoadingMyAssignments &&
    trainingBatches.length === 0 &&
    myAssignments.length === 0
  ) {
    return (
      <PageSkeleton
        statCards={0}
        showHeader
        showTable={false}
      />
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
       <PageSection
       title=" My Training Schedule"
       description=" View your current training
              sessions and schedule."
        actions={
              <Button
            type="button"
            onClick={handleRefresh}
            disabled={
              isLoadingMyAssignments ||
              isLoadingBatches ||
              isLoadingDetails
            }
        
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoadingMyAssignments ||
                isLoadingBatches ||
                isLoadingDetails
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </Button>
        }
       ></PageSection>

       

        
        </div>

        {/* ====================================================== */}
        {/* ERROR */}
        {/* ====================================================== */}

        {pageError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load training data
              </p>

              <p className="mt-1">
                {pageError}
              </p>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* NO CURRENT TRAINING */}
        {/* ====================================================== */}

        {!isLoadingMyAssignments &&
          !isLoadingBatches &&
          !currentTraining && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No Current Training
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                You currently do not have an
                active training assignment.
              </p>
            </div>
          )}

        {/* ====================================================== */}
        {/* SCHEDULE ONLY */}
        {/* ====================================================== */}

        {currentTraining && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Schedule Header */}
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />

                    <h2 className="text-lg font-semibold text-slate-900">
                      Training Schedule
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {currentTraining.batch.programName}

                    {currentTraining.batch.batchCode
                      ? ` • Batch ${currentTraining.batch.batchCode}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToToday}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="p-5">
              {/* ================================================== */}
              {/* SCHEDULE ERROR */}
              {/* ================================================== */}

              {detailsError && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      Unable to load schedule
                    </p>

                    <p className="mt-1">
                      {detailsError}
                    </p>
                  </div>
                </div>
              )}

              {/* ================================================== */}
              {/* LOADING */}
              {/* ================================================== */}

              {isLoadingDetails ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <RefreshCw className="h-7 w-7 animate-spin" />

                    <p className="text-sm">
                      Loading training schedule...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* ================================================= */}
                  {/* CALENDAR */}
                  {/* ================================================= */}

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                      <button
                        type="button"
                        onClick={
                          goToPreviousMonth
                        }
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-slate-900"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <h3 className="text-base font-semibold text-slate-900">
                        {currentMonth.toLocaleDateString(
                          "en-US",
                          {
                            month:
                              "long",
                            year:
                              "numeric",
                          },
                        )}
                      </h3>

                      <button
                        type="button"
                        onClick={
                          goToNextMonth
                        }
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-white hover:text-slate-900"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Week Days */}
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
                            key={day}
                            className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                      {calendarDays.map(
                        (day) => {
                          const dayKey =
                            toDateKey(
                              day,
                            );

                          const daySessions =
                            sessionsByDate.get(
                              dayKey,
                            ) ?? [];

                          const isCurrentMonth =
                            day.getMonth() ===
                              currentMonth.getMonth() &&
                            day.getFullYear() ===
                              currentMonth.getFullYear();

                          const isSelected =
                            dayKey ===
                            selectedDateKey;

                          const isToday =
                            dayKey ===
                            toDateKey(
                              new Date(),
                            );

                          return (
                            <button
                              type="button"
                              key={dayKey}
                              onClick={() =>
                                setSelectedDate(
                                  day,
                                )
                              }
                              className={`relative min-h-[95px] border-b border-r border-slate-200 p-2 text-left transition hover:bg-slate-50 ${
                                !isCurrentMonth
                                  ? "bg-slate-50/60 text-slate-300"
                                  : "bg-white"
                              } ${
                                isSelected
                                  ? "ring-2 ring-inset ring-blue-500"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                                    isToday
                                      ? "bg-blue-600 text-white"
                                      : isCurrentMonth
                                        ? "text-slate-700"
                                        : "text-slate-300"
                                  }`}
                                >
                                  {day.getDate()}
                                </span>

                                {daySessions.length >
                                  0 && (
                                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                                    {
                                      daySessions.length
                                    }
                                  </span>
                                )}
                              </div>

                              {daySessions.length >
                                0 && (
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
                                          className="truncate rounded bg-blue-50 px-1.5 py-1 text-[10px] font-medium text-blue-700"
                                        >
                                          Session{" "}
                                          {
                                            session.sessionNumber
                                          }
                                        </div>
                                      ),
                                    )}

                                  {daySessions.length >
                                    2 && (
                                    <div className="text-[10px] text-slate-400">
                                      +
                                      {daySessions.length -
                                        2}{" "}
                                      more
                                    </div>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* SELECTED DATE */}
                  {/* ================================================= */}

                  <div>
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {formatDate(
                            selectedDateKey,
                          )}
                        </h3>

                        <p className="text-sm text-slate-500">
                          Scheduled sessions
                          for this date
                        </p>
                      </div>

                      <div className="text-sm text-slate-500">
                        {selectedDaySessions.length}{" "}
                        {selectedDaySessions.length ===
                        1
                          ? "session"
                          : "sessions"}
                      </div>
                    </div>

                    {selectedDaySessions.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          No session scheduled
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Select another date
                          from the calendar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedDaySessions.map(
                          (session) => (
                            <div
                              key={
                                session.id
                              }
                              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                      <CalendarDays className="h-5 w-5" />
                                    </div>

                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        Session{" "}
                                        {
                                          session.sessionNumber
                                        }
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        {formatDate(
                                          String(
                                            session.sessionDate,
                                          ),
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Clock3 className="h-4 w-4 text-slate-400" />

                                    <span>
                                      {getSessionTime(
                                        session.startTime,
                                        session.endTime,
                                      )}
                                    </span>
                                  </div>

                                  {session.durationHours !=
                                    null && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                      {
                                        session.durationHours
                                      }{" "}
                                      hours
                                    </span>
                                  )}

                                  {session.status && (
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
                                      {
                                        session.status
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* ================================================= */}
                  {/* SCHEDULE SUMMARY */}
                  {/* ================================================= */}

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 className="h-4 w-4 text-slate-400" />

                      <span>
                        Total scheduled
                        sessions
                      </span>
                    </div>

                    <span className="font-semibold text-slate-900">
                      {sessions.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

  );
}