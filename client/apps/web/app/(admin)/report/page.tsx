"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
} from "lucide-react";

import {
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

import { Button } from "@repo/ui/button";

import { useTrainerReportRequests } from "@repo/hooks";

import { trainerReportRequestApi } from "@/lib/api";

import type {
  CreateTrainerReportRequest,
  TrainerReportType,
} from "@repo/types";

const REPORT_TYPES: TrainerReportType[] = [
  "Training Completion",
  "Enrollment",
  "Attendance",
  "Assessment Results",
  "Certificates",
  "Trainer Report",
];

export default function TrainerReportsPage() {
  const {
    requests,
    loading,
    submitting,
    error,
    createRequest,
  } = useTrainerReportRequests(
    trainerReportRequestApi
  );

  const [showForm, setShowForm] =
    useState(false);

  const [reportType, setReportType] =
    useState<TrainerReportType>(
      "Training Completion"
    );

  const [reason, setReason] =
    useState("");

  const [trainingBatchId, setTrainingBatchId] =
    useState("");

  const pendingCount = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "Pending"
      ).length,
    [requests]
  );

  const approvedCount = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "Approved" ||
          request.status === "Completed"
      ).length,
    [requests]
  );

  const rejectedCount = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "Rejected"
      ).length,
    [requests]
  );

  const handleSubmit = async () => {
    const payload: CreateTrainerReportRequest = {
      reportType,
      reason:
        reason.trim().length > 0
          ? reason.trim()
          : null,
      trainingBatchId:
        trainingBatchId || null,
    };

    await createRequest(payload);

    setReason("");
    setTrainingBatchId("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageSection
        title="Reports"
        description="Request training and performance reports from the administrator."
        actions={
          <Button
            onClick={() =>
              setShowForm((value) => !value)
            }
            className="rounded-xl bg-[#002b5c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2142]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Request Report
          </Button>
        }
      />

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <StatGrid>
        <StatCard
          title="Total Requests"
          value={requests.length}
          icon={FileText}
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock3}
          variant="warning"
        />

        <StatCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle2}
          variant="success"
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
        />
      </StatGrid>

      {/* =====================================================
          REQUEST FORM
      ===================================================== */}

      {showForm && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[#0d2142]">
              Request a Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the report you need. The administrator
              will review your request.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* REPORT TYPE */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Report Type
              </label>

              <Select
                value={reportType}
                onValueChange={(value) =>
                  setReportType(
                    value as TrainerReportType
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BATCH */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Training Batch
              </label>

              <Select
                value={trainingBatchId}
                onValueChange={setTrainingBatchId}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="All assigned batches" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="">
                    All assigned batches
                  </SelectItem>

                  {/* 
                    Later:
                    Load trainer assigned batches here.
                  */}

                </SelectContent>
              </Select>
            </div>

            {/* REASON */}

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Reason / Additional Details
              </label>

              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Tell the administrator why you need this report..."
                rows={4}
                className="w-full resize-none rounded-xl bg-[#f7f9fb] px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#6FD1D7]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="rounded-xl bg-[#002b5c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2142]"
            >
              {submitting
                ? "Submitting..."
                : "Submit Request"}
            </Button>
          </div>
        </section>
      )}

      {/* =====================================================
          REQUEST HISTORY
      ===================================================== */}

      <PageSection
        title="My Report Requests"
        description="Track the reports you have requested from the administrator."
      />

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading report requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />

            <p className="font-medium text-slate-700">
              No report requests yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Request a report when you need one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f7f9fb] text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">
                    Report
                  </th>

                  <th className="px-6 py-4">
                    Requested
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Remarks
                  </th>

                  <th className="px-6 py-4 text-right">
                    File
                  </th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0d2142]">
                        {request.reportType}
                      </div>

                      {request.reason && (
                        <div className="mt-1 max-w-md truncate text-xs text-slate-500">
                          {request.reason}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {new Date(
                        request.requestedAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={request.status}
                      />
                    </td>

                    <td className="max-w-xs px-6 py-4 text-slate-600">
                      {request.adminRemarks ||
                        "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {request.reportFileUrl ? (
                        <a
                          href={
                            request.reportFileUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#002b5c] hover:bg-[#f7f9fb]"
                        >
                          <Download className="h-4 w-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    Pending:
      "bg-amber-50 text-amber-700",
    Approved:
      "bg-blue-50 text-blue-700",
    Completed:
      "bg-emerald-50 text-emerald-700",
    Rejected:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ??
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}