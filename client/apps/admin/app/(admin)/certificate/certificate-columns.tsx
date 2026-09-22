"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  EligibleCertificate,
} from "@repo/types";

import {
  Badge,
} from "@repo/ui/index";

import {
  Play,
} from "lucide-react";

export interface EligibleCertificateTableMeta {
  onGenerate: (
    enrollmentId: string
  ) => void;

  generatingEnrollmentId:
    | string
    | null;
}

export const certificatecolumns: ColumnDef<EligibleCertificate>[] = [
  /*
   * ============================================================
   * PARTICIPANT
   * ============================================================
   */

  {
    accessorKey: "participantName",

    header: "Participant",

    cell: ({ row }) => {
      return (
        <div className="min-w-0">
          <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
            {row.original.participantName ||
              "Unknown Participant"}
          </p>
        </div>
      );
    },
  },

  /*
   * ============================================================
   * TRAINING
   * ============================================================
   */

  {
    accessorKey: "trainingName",

    header: "Training",

    cell: ({ row }) => {
      return (
        <p className="max-w-[220px] truncate text-sm text-gray-700">
          {row.original.trainingName ||
            "Unknown Training"}
        </p>
      );
    },
  },

  /*
   * ============================================================
   * BATCH
   * ============================================================
   */

  {
    accessorKey: "batchCode",

    header: "Batch",

    cell: ({ row }) => {
      return (
        <span className="whitespace-nowrap font-mono text-xs text-gray-600">
          {row.original.batchCode ||
            "Not specified"}
        </span>
      );
    },
  },

  /*
   * ============================================================
   * OVERALL GRADE
   * ============================================================
   */

  {
    accessorKey: "overallGrade",

    header: "Overall Grade",

    cell: ({ row }) => {
      return (
        <span className="font-semibold text-gray-900">
          {row.original.overallGrade.toFixed(
            2
          )}
          %
        </span>
      );
    },
  },

  /*
   * ============================================================
   * RESULT
   * ============================================================
   */

  {
    accessorKey: "isPassed",

    header: "Result",

    cell: ({ row }) => {
      return row.original.isPassed ? (
        <Badge variant="success">
          Passed
        </Badge>
      ) : (
        <Badge variant="error">
          Not Passed
        </Badge>
      );
    },
  },

  /*
   * ============================================================
   * CERTIFICATES
   * ============================================================
   */

  {
    id: "certificates",

    header: "Certificates",

    enableSorting: false,

    cell: ({ row }) => {
      const participant =
        row.original;

      const hasParticipation =
        participant.hasParticipationCertificate;

      const hasCompletion =
        participant.hasCompletionCertificate;

      return (
        <div className="flex min-w-[220px] flex-wrap gap-1.5">
          {hasParticipation ? (
            <Badge variant="neutral">
              Participation ✓
            </Badge>
          ) : (
            <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
              Participation
            </span>
          )}

          {participant.isPassed &&
            (hasCompletion ? (
              <Badge variant="success">
                Completion ✓
              </Badge>
            ) : (
              <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                Completion
              </span>
            ))}
        </div>
      );
    },
  },

  /*
   * ============================================================
   * ACTIONS
   * ============================================================
   */

  {
    id: "actions",

    header: "Actions",

    enableSorting: false,
    enableColumnFilter: false,

    cell: ({ row, table }) => {
      const participant =
        row.original;

      const meta =
        table.options.meta as
          | EligibleCertificateTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      const hasParticipation =
        participant.hasParticipationCertificate;

      const hasCompletion =
        participant.hasCompletionCertificate;

      const isFullyGenerated =
        participant.isPassed
          ? hasParticipation &&
            hasCompletion
          : hasParticipation;

      const isGenerating =
        meta.generatingEnrollmentId ===
        participant.enrollmentId;

      if (isFullyGenerated) {
        return (
          <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
            Already Generated
          </span>
        );
      }

      return (
        <div
          className="flex justify-end"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => {
              meta.onGenerate(
                participant.enrollmentId
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />

            {isGenerating
              ? "Generating..."
              : participant.isPassed
                ? "Generate 2"
                : "Generate"}
          </button>
        </div>
      );
    },
  },
];