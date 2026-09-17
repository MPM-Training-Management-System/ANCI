"use client";

import { useEffect, useState } from "react";
import type {
  ServiceConsultation,
  ServiceConsultationStatus,
} from "@repo/types";

interface ServiceConsultationModalProps {
  open: boolean;
  consultation: ServiceConsultation | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    scheduledAt: string,
    meetingLink: string,
    notes: string,
    status: ServiceConsultationStatus,
  ) => Promise<void>;
}

function getStatusStyle(
  status: ServiceConsultationStatus,
) {
  switch (status) {
    case "Scheduled":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "InProgress":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Cancelled":
      return "border-gray-200 bg-gray-50 text-gray-600";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

/**
 * Returns the current browser-local date/time
 * in the format required by datetime-local:
 *
 * YYYY-MM-DDTHH:mm
 */
function getCurrentDateTimeLocal() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    now.getDate(),
  ).padStart(2, "0");
  const hours = String(
    now.getHours(),
  ).padStart(2, "0");
  const minutes = String(
    now.getMinutes(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ServiceConsultationModal({
  open,
  consultation,
  isSubmitting,
  onClose,
  onSubmit,
}: ServiceConsultationModalProps) {
  const [scheduledAt, setScheduledAt] =
    useState("");

  const [meetingLink, setMeetingLink] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [status, setStatus] =
    useState<ServiceConsultationStatus>(
      "Scheduled",
    );

  const [error, setError] =
    useState("");

  const [minDateTime, setMinDateTime] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    setMinDateTime(
      getCurrentDateTimeLocal(),
    );

    if (consultation) {
      const date = new Date(
        consultation.scheduledAt,
      );

      if (!Number.isNaN(date.getTime())) {
        /**
         * Convert stored UTC datetime
         * into browser-local datetime-local value.
         */
        const localDate = new Date(
          date.getTime() -
            date.getTimezoneOffset() *
              60000,
        )
          .toISOString()
          .slice(0, 16);

        setScheduledAt(localDate);
      } else {
        setScheduledAt("");
      }

      setMeetingLink(
        consultation.meetingLink ?? "",
      );

      setNotes(
        consultation.notes ?? "",
      );

      setStatus(
        consultation.status,
      );
    } else {
      setScheduledAt("");
      setMeetingLink("");
      setNotes("");
      setStatus("Scheduled");
    }
  }, [open, consultation]);

  if (!open) {
    return null;
  }

  const isEdit =
    consultation !== null;

  const isCompleted =
    status === "Completed";

  const isCancelled =
    status === "Cancelled";

  const handleScheduledAtChange = (
    value: string,
  ) => {
    setScheduledAt(value);
    setError("");
  };

  const handleMeetingLinkChange = (
    value: string,
  ) => {
    setMeetingLink(value);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!scheduledAt.trim()) {
      setError(
        "Please select a consultation date and time.",
      );
      return;
    }

    if (!meetingLink.trim()) {
      setError(
        "Please enter the meeting link.",
      );
      return;
    }

    const selectedDate =
      new Date(scheduledAt);

    if (
      Number.isNaN(
        selectedDate.getTime(),
      )
    ) {
      setError(
        "The selected date and time is invalid.",
      );
      return;
    }

    /**
     * Only Scheduled consultations
     * must be in the future.
     *
     * Completed/Cancelled consultations
     * may have a previous schedule.
     */
    if (
      status === "Scheduled" &&
      selectedDate.getTime() <=
        Date.now()
    ) {
      setError(
        "Please select a future date and time.",
      );
      return;
    }

    /**
     * datetime-local is browser-local time.
     *
     * Convert it to UTC before sending
     * it to the ASP.NET backend.
     */
    const utcDate =
      selectedDate.toISOString();

    console.log(
      "================================",
    );
    console.log(
      "CONSULTATION SCHEDULE",
    );
    console.log(
      "Input:",
      scheduledAt,
    );
    console.log(
      "Selected Local:",
      selectedDate.toString(),
    );
    console.log(
      "UTC:",
      utcDate,
    );
    console.log(
      "Browser Now:",
      new Date().toString(),
    );
    console.log(
      "Browser Now UTC:",
      new Date().toISOString(),
    );
    console.log(
      "================================",
    );

    await onSubmit(
      utcDate,
      meetingLink.trim(),
      notes.trim(),
      status,
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* =========================
            HEADER
        ========================== */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#17191c]">
              {isEdit
                ? "Edit Consultation"
                : "Schedule Consultation"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {isEdit
                ? "Update the consultation schedule and status."
                : "Schedule a consultation for the approved service request."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-2 py-1 text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ×
          </button>
        </div>

        {/* =========================
            CONTENT
        ========================== */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 px-6 py-6">

            {/* Applicant */}
            {consultation && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium text-gray-400">
                  Applicant
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {consultation.applicantName ||
                    "Unknown Applicant"}
                </p>

                {consultation.applicantEmail && (
                  <p className="mt-1 text-xs text-gray-400">
                    {
                      consultation.applicantEmail
                    }
                  </p>
                )}

                {consultation.serviceName && (
                  <p className="mt-2 text-xs text-gray-500">
                    Service:{" "}
                    <span className="font-medium text-gray-700">
                      {
                        consultation.serviceName
                      }
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Schedule */}
            <div>
              <label
                htmlFor="consultation-scheduled-at"
                className="text-xs font-semibold text-gray-600"
              >
                Date & Time
              </label>

              <input
                id="consultation-scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                min={
                  status === "Scheduled"
                    ? minDateTime
                    : undefined
                }
                onChange={(event) =>
                  handleScheduledAtChange(
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                className={`mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  error
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-gray-300"
                }`}
              />

              <p className="mt-1 text-[11px] text-gray-400">
                Select a future date and time for
                the consultation.
              </p>
            </div>

            {/* Meeting Link */}
            <div>
              <label
                htmlFor="consultation-meeting-link"
                className="text-xs font-semibold text-gray-600"
              >
                Meeting Link
              </label>

              <input
                id="consultation-meeting-link"
                type="url"
                value={meetingLink}
                onChange={(event) =>
                  handleMeetingLinkChange(
                    event.target.value,
                  )
                }
                placeholder="https://meet.google.com/..."
                disabled={isSubmitting}
                className={`mt-2 w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  error &&
                  !meetingLink.trim()
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-gray-300"
                }`}
              />

              <p className="mt-1 text-[11px] text-gray-400">
                Enter the meeting link that will be
                sent to the applicant.
              </p>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="consultation-status"
                className="text-xs font-semibold text-gray-600"
              >
                Status
              </label>

              <select
                id="consultation-status"
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target
                      .value as ServiceConsultationStatus,
                  );

                  setError("");
                }}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="Scheduled">
                  Scheduled
                </option>

                <option value="InProgress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>

              <span
                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${getStatusStyle(
                  status,
                )}`}
              >
                {status === "InProgress"
                  ? "In Progress"
                  : status}
              </span>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="consultation-notes"
                className="text-xs font-semibold text-gray-600"
              >
                Notes
              </label>

              <textarea
                id="consultation-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Add consultation notes..."
                disabled={isSubmitting}
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Completed Warning */}
            {isCompleted && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                This consultation will be
                marked as{" "}
                <strong>Completed</strong>.
              </div>
            )}

            {/* Cancelled Warning */}
            {isCancelled && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                This consultation will be
                marked as{" "}
                <strong>Cancelled</strong>.
              </div>
            )}
          </div>
        </div>

        {/* =========================
            FOOTER
        ========================== */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !scheduledAt ||
              !meetingLink.trim()
            }
            className="rounded-xl bg-[#17191c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Schedule Consultation"}
          </button>
        </div>
      </div>
    </div>
  );
}