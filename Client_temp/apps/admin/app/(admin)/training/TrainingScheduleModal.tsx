"use client";

import { useEffect, useState } from "react";

import type {
  TrainingBatch,
  TrainingScheduleRecommendation,
  GenerateTrainingScheduleRequest,
  TrainingSession,
} from "@repo/types";

type TrainingScheduleModalProps = {
  batch: TrainingBatch | null;
  recommendation: TrainingScheduleRecommendation | null;
  sessions: TrainingSession[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  onLoadRecommendation: (
    trainingBatchId: string,
  ) => Promise<TrainingScheduleRecommendation | null>;

  onGenerate: (
    trainingBatchId: string,
    request: GenerateTrainingScheduleRequest,
  ) => Promise<TrainingSession[] | null>;

  onGetSchedule: (
    trainingBatchId: string,
  ) => Promise<TrainingSession[] | null>;


onApprove: (
  trainingBatchId: string,
  sessions: TrainingSession[],
) => Promise<boolean>;

  onClose: () => void;
};

function formatDate(value: string | undefined | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value: string | undefined | null) {
  if (!value) return "-";

  return value.length >= 5
    ? value.slice(0, 5)
    : value;
}

export default function TrainingScheduleModal({
  batch,
  recommendation,
  sessions,
  isLoading,
  isGenerating,
  error,
  onLoadRecommendation,
  onGenerate,
  onGetSchedule,
  onApprove,
  onClose,
}: TrainingScheduleModalProps) {
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [includeWeekends, setIncludeWeekends] = useState(false);

  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (!batch?.id) return;

    void onLoadRecommendation(batch.id);
    void onGetSchedule(batch.id);
  }, [batch?.id, onLoadRecommendation, onGetSchedule]);

  useEffect(() => {
    if (!recommendation) return;

    setSessionsPerWeek(
      Math.max(
        1,
        Math.min(
          7,
          recommendation.recommendedSessionsPerWeek || 3,
        ),
      ),
    );
  }, [recommendation]);

  if (!batch) return null;

  const handleGenerate = async () => {
    if (sessionsPerWeek < 1 || sessionsPerWeek > 7) {
      alert("Sessions per week must be between 1 and 7.");
      return;
    }

    if (!startTime || !endTime) {
      alert("Start time and end time are required.");
      return;
    }

    if (endTime <= startTime) {
      alert("End time must be later than start time.");
      return;
    }

    await onGenerate(batch.id, {
      sessionsPerWeek,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      includeWeekends,
    });
  };

  const handleApprove = async () => {
    if (sessions.length === 0) {
      alert("Generate a schedule first.");
      return;
    }

    const confirmed = window.confirm(
      "Approve this training schedule? This will mark the schedule as approved.",
    );

    if (!confirmed) return;

    setIsApproving(true);

    try {
      const success = await onApprove(batch.id, sessions)

      if (success) {
        alert("Training schedule approved successfully.");
      }
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-[#e7e9ec] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
              Training Schedule
            </p>

            <h2 className="mt-1 truncate text-lg font-bold text-[#17191c] sm:text-xl">
              {batch.batchCode}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {batch.programName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-5">
            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* RECOMMENDATION */}
            <section className="rounded-2xl border border-[#e7e9ec] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Schedule Recommendation
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Recommended schedule based on the batch training
                    duration and available dates.
                  </p>
                </div>

                {isLoading && (
                  <span className="text-[10px] font-semibold text-gray-400">
                    Loading...
                  </span>
                )}
              </div>

              {recommendation ? (
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <InfoCard
                    label="Required Hours"
                    value={`${recommendation.requiredHours} hrs`}
                  />

                  <InfoCard
                    label="Available Weeks"
                    value={String(recommendation.availableWeeks)}
                  />

                  <InfoCard
                    label="Sessions / Week"
                    value={String(
                      recommendation.recommendedSessionsPerWeek,
                    )}
                  />

                  <InfoCard
                    label="Hours / Session"
                    value={`${recommendation.recommendedHoursPerSession} hrs`}
                  />

                  <InfoCard
                    label="Weekly Hours"
                    value={`${recommendation.estimatedWeeklyHours} hrs`}
                  />

                  <InfoCard
                    label="Estimated Sessions"
                    value={String(
                      recommendation.estimatedSessionCount,
                    )}
                  />

                  <InfoCard
                    label="Start Date"
                    value={formatDate(recommendation.startDate)}
                  />

                  <InfoCard
                    label="End Date"
                    value={formatDate(recommendation.endDate)}
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-gray-50 p-5 text-center text-xs text-gray-500">
                  No schedule recommendation available.
                </div>
              )}
            </section>

            {/* GENERATOR */}
            <section className="rounded-2xl border border-[#e7e9ec] p-4 sm:p-5">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Generate Schedule
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Set the training frequency and daily training hours.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Sessions per Week">
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={sessionsPerWeek}
                    onChange={(event) =>
                      setSessionsPerWeek(
                        Number(event.target.value),
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field label="Start Time">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(event.target.value)
                    }
                    className="input"
                  />
                </Field>

                <Field label="End Time">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) =>
                      setEndTime(event.target.value)
                    }
                    className="input"
                  />
                </Field>

                <label className="flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border border-[#e7e9ec] px-3 py-3">
                  <input
                    type="checkbox"
                    checked={includeWeekends}
                    onChange={(event) =>
                      setIncludeWeekends(
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span>
                    <span className="block text-xs font-semibold text-gray-700">
                      Include weekends
                    </span>

                    <span className="block text-[10px] text-gray-400">
                      Allow Saturday and Sunday sessions
                    </span>
                  </span>
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => void handleGenerate()}
                  className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating
                    ? "Generating..."
                    : "Generate Schedule"}
                </button>
              </div>
            </section>

            {/* GENERATED SCHEDULE */}
            <section className="rounded-2xl border border-[#e7e9ec] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Generated Schedule
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {sessions.length} session
                    {sessions.length === 1 ? "" : "s"} generated.
                  </p>
                </div>

                {sessions.length > 0 && (
                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => void handleApprove()}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isApproving
                      ? "Approving..."
                      : "Approve Schedule"}
                  </button>
                )}
              </div>

              {sessions.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <p className="text-xs font-semibold text-gray-600">
                    No generated sessions
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Configure the schedule above and click Generate
                    Schedule.
                  </p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-xl border border-[#e7e9ec]">
                  <table className="w-full min-w-[700px] text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>Session</Th>
                        <Th>Date</Th>
                        <Th>Start</Th>
                        <Th>End</Th>
                        <Th>Duration</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>

                    <tbody>
                      {sessions.map((session) => (
                        <tr
                          key={session.id}
                          className="border-t border-[#eef0f2]"
                        >
                          <Td>
                            #{session.sessionNumber}
                          </Td>

                          <Td>
                            {formatDate(
                              session.sessionDate,
                            )}
                          </Td>

                          <Td>
                            {formatTime(
                              session.startTime,
                            )}
                          </Td>

                          <Td>
                            {formatTime(
                              session.endTime,
                            )}
                          </Td>

                          <Td>
                            {session.durationHours} hrs
                          </Td>

                          <Td>
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-600">
                              {session.status}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end border-t border-[#e7e9ec] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          height: 42px;
          border-radius: 0.75rem;
          border: 1px solid #e7e9ec;
          background: #f8f9fa;
          padding: 0 0.75rem;
          font-size: 0.75rem;
          outline: none;
        }

        .input:focus {
          border-color: #cfd3d8;
          background: white;
        }
      `}</style>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f7f8fa] p-3">
      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      {children}
    </label>
  );
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
      {children}
    </th>
  );
}

function Td({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-4 py-3 text-xs text-gray-700">
      {children}
    </td>
  );
}
