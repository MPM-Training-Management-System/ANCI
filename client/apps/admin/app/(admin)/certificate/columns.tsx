"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  Certificate,
} from "@repo/types";

import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

import {
  Eye,
  ExternalLink,
  Download,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| TABLE META
|--------------------------------------------------------------------------
*/

export interface CertificateTableMeta {
  onView: (certificate: Certificate) => void;
  onOpenPdf: (certificate: Certificate) => void;
  onDownload: (certificate: Certificate) => void;
}

/*
|--------------------------------------------------------------------------
| COLUMNS
|--------------------------------------------------------------------------
*/

export const columns: ColumnDef<Certificate>[] = [
  /*
   * ============================================================
   * PARTICIPANT
   * ============================================================
   */

  {
    accessorKey: "participantName",

    header: "Participant",

    cell: ({ row }) => {
      const certificate = row.original;

      return (
        <div className="min-w-0">
          <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
            {certificate.participantName ||
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
      const certificate = row.original;

      return (
        <div className="min-w-0">
          <p className="max-w-[220px] truncate text-sm text-gray-700">
            {certificate.trainingName ||
              "Unknown Training"}
          </p>
        </div>
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
      const batchCode =
        row.original.batchCode;

      return (
        <span className="whitespace-nowrap font-mono text-xs text-gray-600">
          {batchCode || "Not specified"}
        </span>
      );
    },
  },

  /*
   * ============================================================
   * CERTIFICATE TYPE
   * ============================================================
   */

  {
    accessorKey: "type",

    header: "Certificate",

    cell: ({ row }) => {
      return (
        <CertificateTypeBadge
          type={row.original.type}
        />
      );
    },
  },

  /*
   * ============================================================
   * CERTIFICATE NUMBER
   * ============================================================
   */

  {
    accessorKey: "certificateNumber",

    header: "Certificate No.",

    cell: ({ row }) => {
      const certificateNumber =
        row.original.certificateNumber;

      return (
        <span className="whitespace-nowrap font-mono text-xs text-gray-600">
          {certificateNumber || "—"}
        </span>
      );
    },
  },

  /*
   * ============================================================
   * ISSUED
   * ============================================================
   */

  {
    accessorKey: "issuedAt",

    header: "Issued",

    cell: ({ row }) => {
      return (
        <span className="whitespace-nowrap text-xs text-gray-500">
          {formatDate(
            row.original.issuedAt
          )}
        </span>
      );
    },
  },

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  {
    accessorKey: "isRevoked",

    header: "Status",

    cell: ({ row }) => {
      return (
        <CertificateStatusBadge
          isRevoked={
            row.original.isRevoked
          }
        />
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
      const certificate = row.original;

      const meta =
        table.options.meta as
          | CertificateTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      return (
        <div
          className="flex items-center justify-end"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                aria-label={`Actions for ${
                  certificate.participantName ||
                  "certificate"
                }`}
              >
                <span className="text-lg leading-none">
                  ⋯
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {/* VIEW */}

              <DropdownMenuItem
                disabled={!certificate.pdfUrl}
                onSelect={() => {
                  meta.onView(
                    certificate
                  );
                }}
              >
                <Eye className="mr-2 h-4 w-4" />

                View Certificate
              </DropdownMenuItem>

              {/* OPEN PDF */}

              <DropdownMenuItem
                disabled={!certificate.pdfUrl}
                onSelect={() => {
                  meta.onOpenPdf(
                    certificate
                  );
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />

                Open PDF
              </DropdownMenuItem>

              {/* DOWNLOAD */}

              <DropdownMenuItem
                disabled={!certificate.pdfUrl}
                onSelect={() => {
                  meta.onDownload(
                    certificate
                  );
                }}
              >
                <Download className="mr-2 h-4 w-4" />

                Download
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* CERTIFICATE STATUS */}

              {certificate.isRevoked ? (
                <DropdownMenuItem disabled>
                  Certificate Revoked
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  Certificate Active
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

/*
|--------------------------------------------------------------------------
| CERTIFICATE TYPE BADGE
|--------------------------------------------------------------------------
*/

function CertificateTypeBadge({
  type,
}: {
  type: Certificate["type"];
}) {
  switch (type) {
    case "Completion":
      return (
        <Badge variant="success">
          Completion
        </Badge>
      );

    case "Participation":
      return (
        <Badge variant="neutral">
          Participation
        </Badge>
      );

    default:
      return (
        <Badge variant="neutral">
          {type}
        </Badge>
      );
  }
}

/*
|--------------------------------------------------------------------------
| CERTIFICATE STATUS BADGE
|--------------------------------------------------------------------------
*/

function CertificateStatusBadge({
  isRevoked,
}: {
  isRevoked: boolean;
}) {
  if (isRevoked) {
    return (
      <Badge variant="error">
        Revoked
      </Badge>
    );
  }

  return (
    <Badge variant="success">
      Active
    </Badge>
  );
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(
  value: string
) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}