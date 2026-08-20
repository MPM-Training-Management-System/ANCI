"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  UserCell,
} from "@repo/ui/index";

import type {
  CertificationRecord,
  CertificationTableMeta,
} from "./type";

export const columns: ColumnDef<CertificationRecord>[] =
  [
    {
      accessorKey: "participantName",

      header: "Participant",

      cell: ({ row }) => {
        const record = row.original;

        return (
          <UserCell
            name={record.participantName}
            email={record.participantId}
          />
        );
      },
    },

    {
      accessorKey: "training",

      header: "Training",

      cell: ({ row }) => {
        const record = row.original;

        return (
          <div className="min-w-[190px]">
            <p className="font-medium text-gray-900">
              {record.training}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {record.batch}
            </p>
          </div>
        );
      },
    },

    {
      id: "assessment",

      header: "Assessment",

      cell: ({ row }) => {
        const record = row.original;

        let variant:
          | "success"
          | "error"
          | "warning";

        if (
          record.assessmentResult ===
          "Passed"
        ) {
          variant = "success";
        } else if (
          record.assessmentResult ===
          "Failed"
        ) {
          variant = "error";
        } else {
          variant = "warning";
        }

        return (
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">
              {record.assessmentScore !== null
                ? `${record.assessmentScore}/100`
                : "Pending"}
            </p>

            <Badge variant={variant}>
              {record.assessmentResult}
            </Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "attendance",

      header: "Attendance",

      cell: ({ row }) => {
        const record = row.original;

        const percentage = Math.min(
          Math.max(record.attendance, 0),
          100
        );

        return (
          <div className="w-[130px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">
                {record.attendance}%
              </span>

              <span className="text-[10px] text-gray-400">
                Min. {record.requiredAttendance}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#191c1e]"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      },
    },

    {
      id: "completion",

      header: "Completion",

      cell: ({ row }) => {
        const record = row.original;

        return (
          <div className="min-w-[120px]">
            <p className="text-sm font-semibold">
              {record.completedSessions}/
              {record.totalSessions}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {record.completionStatus}
            </p>
          </div>
        );
      },
    },

    {
      id: "certificate",

      header: "Certificate",

      cell: ({ row }) => {
        const record = row.original;

        if (!record.certificateNo) {
          return (
            <span className="text-sm text-gray-400">
              Not generated
            </span>
          );
        }

        return (
          <div className="min-w-[140px]">
            <p className="font-mono text-xs font-semibold">
              {record.certificateNo}
            </p>

            <p className="mt-1 font-mono text-[10px] text-gray-400">
              {record.verificationCode}
            </p>
          </div>
        );
      },
    },

    {
      accessorKey: "certificateStatus",

      header: "Status",

      cell: ({ row }) => {
        const status =
          row.original.certificateStatus;

        let variant:
          | "trainer"
          | "active"
          | "inactive"
          | "warning"
          | "success"
          | "error"
          | "neutral"
          | "admin"
          | "participant"
          | "pending";

        switch (status) {
          case "Issued":
            variant = "success";
            break;

          case "Generated":
            variant = "neutral";
            break;

          case "Eligible":
            variant = "participant";
            break;

          case "Pending Review":
            variant = "pending";
            break;

          default:
            variant = "error";
        }

        return (
          <Badge variant={variant}>
            {status}
          </Badge>
        );
      },
    },

    {
      id: "actions",

      header: "Actions",

      cell: ({ row, table }) => {
        const record = row.original;

        const meta =
          table.options.meta as
            | CertificationTableMeta
            | undefined;

        return (
          <div className="flex min-w-[180px] items-center gap-2">

            <button
              type="button"
              onClick={() =>
                meta?.onView?.(record)
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View
            </button>

            {record.certificateStatus ===
              "Eligible" && (
              <button
                type="button"
                onClick={() =>
                  meta?.onGenerate?.(record)
                }
                className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Generate
              </button>
            )}

            {(record.certificateStatus ===
              "Generated" ||
              record.certificateStatus ===
                "Issued") && (
              <button
                type="button"
                onClick={() =>
                  meta?.onCertificate?.(record)
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                View
              </button>
            )}

          </div>
        );
      },
    },
  ];