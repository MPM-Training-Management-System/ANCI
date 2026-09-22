"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";

import { useCertificates } from "@repo/hooks";

import type {
  Certificate,
} from "@repo/types";

import {
  DataTable,
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  Award,
  BadgeCheck,
  GraduationCap,
  User2Icon,
} from "lucide-react";

import {
  columns as certificateColumns,
  type CertificateTableMeta,
} from "./columns";

import {
  certificatecolumns as eligibleCertificateColumns,
  type EligibleCertificateTableMeta,
} from "./certificate-columns";

export default function CertificatesPage() {
  const {
    certificates,
    eligibleParticipants,
    isLoading,
    error,
    loadCertificates,
    loadEligibleParticipants,
    generateCertificates,
  } = useCertificates(api);

  /*
   * ============================================================
   * FILTERS
   * ============================================================
   */

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [batchFilter, setBatchFilter] =
    useState("all");

  /*
   * ============================================================
   * GENERATION
   * ============================================================
   */

  const [
    generatingEnrollmentId,
    setGeneratingEnrollmentId,
  ] = useState<string | null>(null);

  const [
    generationMessage,
    setGenerationMessage,
  ] = useState<string | null>(null);

  /*
   * ============================================================
   * CERTIFICATE PREVIEW
   * ============================================================
   */

  const [
    selectedCertificate,
    setSelectedCertificate,
  ] = useState<Certificate | null>(
    null
  );

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  useEffect(() => {
    void loadCertificates();

    void loadEligibleParticipants();
  }, [
    loadCertificates,
    loadEligibleParticipants,
  ]);

  /*
   * ============================================================
   * ESC TO CLOSE MODAL
   * ============================================================
   */

  useEffect(() => {
    if (!selectedCertificate) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setSelectedCertificate(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedCertificate]);

  /*
   * ============================================================
   * BATCH OPTIONS
   * ============================================================
   */

  const batches = useMemo(() => {
    return Array.from(
      new Set(
        [
          ...certificates.map(
            (certificate) =>
              certificate.batchCode
          ),

          ...eligibleParticipants.map(
            (participant) =>
              participant.batchCode
          ),
        ].filter(
          (
            batch
          ): batch is string =>
            Boolean(batch)
        )
      )
    ).sort();
  }, [
    certificates,
    eligibleParticipants,
  ]);

  /*
   * ============================================================
   * FILTER CERTIFICATES
   * ============================================================
   */

  const filteredCertificates =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      return certificates.filter(
        (certificate) => {
          const matchesSearch =
            !keyword ||
            certificate.participantName
              ?.toLowerCase()
              .includes(keyword) ||
            certificate.trainingName
              ?.toLowerCase()
              .includes(keyword) ||
            certificate.certificateNumber
              .toLowerCase()
              .includes(keyword);

          const matchesType =
            typeFilter === "all" ||
            certificate.type ===
              typeFilter;

          const matchesBatch =
            batchFilter === "all" ||
            certificate.batchCode ===
              batchFilter;

          return (
            Boolean(matchesSearch) &&
            matchesType &&
            matchesBatch
          );
        }
      );
    }, [
      certificates,
      search,
      typeFilter,
      batchFilter,
    ]);

  /*
   * ============================================================
   * FILTER ELIGIBLE PARTICIPANTS
   * ============================================================
   */

  const filteredEligibleParticipants =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      return eligibleParticipants.filter(
        (participant) => {
          const matchesSearch =
            !keyword ||
            participant.participantName
              ?.toLowerCase()
              .includes(keyword) ||
            participant.trainingName
              ?.toLowerCase()
              .includes(keyword) ||
            participant.batchCode
              ?.toLowerCase()
              .includes(keyword);

          const matchesBatch =
            batchFilter === "all" ||
            participant.batchCode ===
              batchFilter;

          return (
            Boolean(matchesSearch) &&
            matchesBatch
          );
        }
      );
    }, [
      eligibleParticipants,
      search,
      batchFilter,
    ]);

  /*
   * ============================================================
   * SUMMARY COUNTS
   * ============================================================
   */

  const participationCount =
    certificates.filter(
      (certificate) =>
        certificate.type ===
        "Participation"
    ).length;

  const completionCount =
    certificates.filter(
      (certificate) =>
        certificate.type ===
        "Completion"
    ).length;

  const activeCount =
    certificates.filter(
      (certificate) =>
        !certificate.isRevoked
    ).length;

  /*
   * ============================================================
   * GENERATE CERTIFICATES
   * ============================================================
   */

  const handleGenerate =
    useCallback(
      async (
        enrollmentId: string
      ) => {
        try {
          setGeneratingEnrollmentId(
            enrollmentId
          );

          setGenerationMessage(null);

          await generateCertificates(
            enrollmentId
          );

          setGenerationMessage(
            "Certificate(s) generated successfully."
          );
        } catch {
          setGenerationMessage(
            "Failed to generate certificate(s). Please try again."
          );
        } finally {
          setGeneratingEnrollmentId(
            null
          );
        }
      },
      [generateCertificates]
    );

  /*
   * ============================================================
   * VIEW CERTIFICATE
   * ============================================================
   */

  const handleViewCertificate =
    useCallback(
      (certificate: Certificate) => {
        if (!certificate.pdfUrl) {
          return;
        }

        setSelectedCertificate(
          certificate
        );
      },
      []
    );

  /*
   * ============================================================
   * CLOSE PREVIEW
   * ============================================================
   */

  const handleClosePreview =
    useCallback(() => {
      setSelectedCertificate(null);
    }, []);

  /*
   * ============================================================
   * OPEN PDF
   * ============================================================
   */

  const handleOpenPdf =
    useCallback(
      (certificate: Certificate) => {
        if (!certificate.pdfUrl) {
          return;
        }

        window.open(
          certificate.pdfUrl,
          "_blank",
          "noopener,noreferrer"
        );
      },
      []
    );

  /*
   * ============================================================
   * DOWNLOAD PDF
   * ============================================================
   */

  const handleDownload =
    useCallback(
      (certificate: Certificate) => {
        if (!certificate.pdfUrl) {
          return;
        }

        const link =
          document.createElement(
            "a"
          );

        link.href =
          certificate.pdfUrl;

        link.download =
          `${certificate.certificateNumber}.pdf`;

        link.target = "_blank";

        link.rel =
          "noopener noreferrer";

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );
      },
      []
    );

  /*
   * ============================================================
   * CERTIFICATE TABLE META
   * ============================================================
   */

  const certificateTableMeta =
    useMemo<CertificateTableMeta>(
      () => ({
        onView:
          handleViewCertificate,

        onOpenPdf:
          handleOpenPdf,

        onDownload:
          handleDownload,
      }),
      [
        handleViewCertificate,
        handleOpenPdf,
        handleDownload,
      ]
    );

  /*
   * ============================================================
   * ELIGIBLE CERTIFICATE TABLE META
   * ============================================================
   */

  const eligibleCertificateTableMeta =
    useMemo<EligibleCertificateTableMeta>(
      () => ({
        onGenerate:
          handleGenerate,

        generatingEnrollmentId,
      }),
      [
        handleGenerate,
        generatingEnrollmentId,
      ]
    );

  /*
   * ============================================================
   * GLOBAL TABLE TOOLBAR
   * ============================================================
   */

  const certificateToolbar =
    useMemo(() => {
      return (
        <div className="flex flex-wrap items-center gap-2">
          {/* TYPE */}

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
          >
            <option value="all">
              All Certificate Types
            </option>

            <option value="Participation">
              Participation
            </option>

            <option value="Completion">
              Completion
            </option>
          </select>

          {/* BATCH */}

          <select
            value={batchFilter}
            onChange={(event) =>
              setBatchFilter(
                event.target.value
              )
            }
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
          >
            <option value="all">
              All Batches
            </option>

            {batches.map(
              (batch) => (
                <option
                  key={batch}
                  value={batch}
                >
                  {batch}
                </option>
              )
            )}
          </select>
        </div>
      );
    }, [
      typeFilter,
      batchFilter,
      batches,
    ]);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      <PageSection
        title="Certificate Management"
        description="Manage participant certificates based on their final training results."
      />

      <div className="space-y-8">
        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <StatGrid className="pt-4">
          <StatCard
            title="Total Certificate"
            value={
              certificates.length
            }
            icon={Award}
            variant="primary"
          />

          <StatCard
            title="Participation"
            value={
              participationCount
            }
            icon={User2Icon}
            variant="primary"
          />

          <StatCard
            title="Completion"
            value={
              completionCount
            }
            icon={GraduationCap}
            variant="success"
          />

          <StatCard
            title="Active Certificates"
            value={activeCount}
            icon={BadgeCheck}
            variant="success"
          />
        </StatGrid>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {generationMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              {generationMessage}
            </p>
          </div>
        )}

        {/* =====================================================
            CERTIFICATE GENERATION
        ====================================================== */}

        <DataTable
          title="Certificate Generation"
          description="Generate certificates for approved participants according to their final training result."
          columns={
            eligibleCertificateColumns
          }
          data={
            filteredEligibleParticipants
          }
          loading={isLoading}
          searchable
          searchPlaceholder="Search participant, training, or batch..."
          showPagination
          meta={
            eligibleCertificateTableMeta
          }
          emptyTitle="No eligible participants"
          emptyDescription="There are currently no participants eligible for certificate generation."
        />

        {/* =====================================================
            ISSUED CERTIFICATES
        ====================================================== */}

        <DataTable
          title="Issued Certificates"
          description="View certificates that have already been generated."
          columns={
            certificateColumns
          }
          data={
            filteredCertificates
          }
          loading={isLoading}
          searchable
          searchPlaceholder="Search participant, training, or certificate number..."
          showPagination
          toolbar={
            certificateToolbar
          }
          meta={
            certificateTableMeta
          }
          emptyTitle="No certificates found"
          emptyDescription="There are currently no issued certificates matching your filters."
        />
      </div>

      {/* =======================================================
          CERTIFICATE PREVIEW MODAL
      ======================================================== */}

      {selectedCertificate && (
        <CertificatePreviewModal
          certificate={
            selectedCertificate
          }
          onClose={
            handleClosePreview
          }
        />
      )}
    </>
  );
}

/*
|--------------------------------------------------------------------------
| CERTIFICATE PREVIEW MODAL
|--------------------------------------------------------------------------
*/

function CertificatePreviewModal({
  certificate,
  onClose,
}: {
  certificate: Certificate;
  onClose: () => void;
}) {
  const pdfUrl =
    certificate.pdfUrl;

  if (!pdfUrl) {
    return null;
  }

  /*
   * Cloudinary PDF → JPG preview
   *
   * Example:
   *
   * /image/upload/anci/certificates/file.pdf
   *
   * becomes:
   *
   * /image/upload/f_jpg,q_auto/anci/certificates/file.jpg
   */

  const previewUrl = pdfUrl
    .replace(
      "/image/upload/",
      "/image/upload/f_jpg,q_auto/"
    )
    .replace(
      /\.pdf(\?.*)?$/i,
      ".jpg$1"
    );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl">
        {/* =====================================================
            MODAL HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b bg-background px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">
              Certificate Preview
            </h2>

            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {certificate.participantName ??
                "Unknown Participant"}

              {" • "}

              {certificate.type}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* OPEN PDF */}

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg border bg-background px-3 py-2 text-xs font-medium transition hover:bg-muted sm:inline-flex"
            >
              Open PDF
            </a>

            {/* DOWNLOAD */}

            <a
              href={pdfUrl}
              download={`${certificate.certificateNumber}.pdf`}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              Download
            </a>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-lg transition hover:bg-muted"
            >
              ×
            </button>
          </div>
        </div>

        {/* =====================================================
            CERTIFICATE IMAGE
        ====================================================== */}

        <div className="min-h-0 flex-1 overflow-auto bg-neutral-200 p-4 sm:p-8">
          <div className="flex min-h-full items-start justify-center">
            <div className="w-full max-w-[1100px]">
              <img
                src={previewUrl}
                alt={`Certificate for ${
                  certificate.participantName ??
                  "participant"
                }`}
                className="mx-auto block h-auto w-full rounded-sm bg-white shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}