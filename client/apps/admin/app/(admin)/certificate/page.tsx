
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";

import { useCertificates } from "@repo/hooks";

import type { Certificate } from "@repo/types";

import {
  Button,
  DataTable,
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  Award,
  BadgeCheck,
  GraduationCap,
  RotateCcw,
  User2Icon,
  FilePlus2,
  Files,
} from "lucide-react";

import {
  columns as certificateColumns,
  type CertificateTableMeta,
} from "./columns";

import {
  certificatecolumns as eligibleCertificateColumns,
  type EligibleCertificateTableMeta,
} from "./certificate-columns";

type CertificateTab = "generation" | "issued";

export default function CertificatesPage() {
  const {
    certificates,
    eligibleParticipants,
    isLoading,
    error,
    loadCertificates,
    loadEligibleParticipants,
    generateCertificates,
    reset,
  } = useCertificates(api);

  /*
   * ============================================================
   * TABS
   * ============================================================
   */

  const [activeTab, setActiveTab] =
    useState<CertificateTab>("generation");

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const handleRefresh = useCallback(async () => {
    reset();

    await Promise.all([
      loadCertificates(),
      loadEligibleParticipants(),
    ]);
  }, [
    reset,
    loadCertificates,
    loadEligibleParticipants,
  ]);

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
  ] = useState<Certificate | null>(null);

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
          (batch): batch is string =>
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

  const filteredCertificates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return certificates.filter((certificate) => {
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
        certificate.type === typeFilter;

      const matchesBatch =
        batchFilter === "all" ||
        certificate.batchCode === batchFilter;

      return (
        Boolean(matchesSearch) &&
        matchesType &&
        matchesBatch
      );
    });
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

  const filteredEligibleParticipants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return eligibleParticipants.filter((participant) => {
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
        participant.batchCode === batchFilter;

      return (
        Boolean(matchesSearch) &&
        matchesBatch
      );
    });
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

  const participationCount = certificates.filter(
    (certificate) =>
      certificate.type === "Participation"
  ).length;

  const completionCount = certificates.filter(
    (certificate) =>
      certificate.type === "Completion"
  ).length;

  const activeCount = certificates.filter(
    (certificate) =>
      !certificate.isRevoked
  ).length;


 
const handleGenerate = useCallback(
  async (enrollmentId: string) => {
    if (generatingEnrollmentId !== null) {
      return;
    }

    setGeneratingEnrollmentId(enrollmentId);
    setGenerationMessage(null);

    try {
      await generateCertificates(enrollmentId);

      setGenerationMessage(
        "Certificate(s) generated successfully."
      );

      // Refresh data in the background.
      const results = await Promise.allSettled([
        loadCertificates({ background: true }),
        loadEligibleParticipants({ background: true }),
      ]);

      if (results.some((result) => result.status === "rejected")) {
        setGenerationMessage(
          "Certificate(s) generated, but refreshing the list failed. Please use Refresh to update the data."
        );
      }
    } catch {
      setGenerationMessage(
        "Failed to generate certificate(s). Please try again."
      );
    } finally {
      setGeneratingEnrollmentId(null);
    }
  },
  [
    generatingEnrollmentId,
    generateCertificates,
    loadCertificates,
    loadEligibleParticipants,
  ]
);



  const handleViewCertificate = useCallback(
    (certificate: Certificate) => {
      if (!certificate.pdfUrl) {
        return;
      }

      setSelectedCertificate(certificate);
    },
    []
  );

  /*
   * ============================================================
   * CLOSE PREVIEW
   * ============================================================
   */

  const handleClosePreview = useCallback(() => {
    setSelectedCertificate(null);
  }, []);

  /*
   * ============================================================
   * OPEN PDF
   * ============================================================
   */

  const handleOpenPdf = useCallback(
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

  const handleDownload = useCallback(
    (certificate: Certificate) => {
      if (!certificate.pdfUrl) {
        return;
      }

      const link = document.createElement("a");

      link.href = certificate.pdfUrl;
      link.download =
        `${certificate.certificateNumber}.pdf`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        onView: handleViewCertificate,
        onOpenPdf: handleOpenPdf,
        onDownload: handleDownload,
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
        onGenerate: handleGenerate,
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

  const certificateToolbar = useMemo(() => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {/* CERTIFICATE TYPE */}

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
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
            setBatchFilter(event.target.value)
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
        >
          <option value="all">
            All Batches
          </option>

          {batches.map((batch) => (
            <option
              key={batch}
              value={batch}
            >
              {batch}
            </option>
          ))}
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
   * TAB CONFIGURATION
   * ============================================================
   */

  const tabs = [
    {
      id: "generation" as const,
      label: "Certificate Generation",
      description: "Generate certificates",
      icon: FilePlus2,
      count: eligibleParticipants.length,
    },
    {
      id: "issued" as const,
      label: "Issued Certificates",
      description: "Manage generated certificates",
      icon: Files,
      count: certificates.length,
    },
  ];

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
        actions={
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RotateCcw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        }
      />

      <div className="space-y-8">
        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <StatGrid className="pt-4">
          <StatCard
            title="Total Certificate"
            value={certificates.length}
            icon={Award}
            variant="primary"
          />

          <StatCard
            title="Participation"
            value={participationCount}
            icon={User2Icon}
            variant="primary"
          />

          <StatCard
            title="Completion"
            value={completionCount}
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
            ERROR MESSAGE
        ====================================================== */}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            GENERATION MESSAGE
        ====================================================== */}

        {generationMessage && (
          <div
            role="status"
            className={`rounded-xl border p-4 ${
              generationMessage.startsWith("Failed")
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                generationMessage.startsWith("Failed")
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {generationMessage}
            </p>
          </div>
        )}

        {/* =====================================================
            TABS
        ====================================================== */}

        <div className="border-b border-slate-200">
          <div
            role="tablist"
            aria-label="Certificate management sections"
            className="flex flex-wrap gap-2 sm:gap-6"
          >
            {tabs.map((tab) => {
              const isActive =
                activeTab === tab.id;

              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  id={`certificate-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`certificate-panel-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setGenerationMessage(null);
                  }}
                  className={`group relative flex items-center gap-3 border-b-2 px-2 py-4 text-left transition ${
                    isActive
                      ? "border-[#002b5c] text-[#002b5c]"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-[#002b5c]/10 text-[#002b5c]"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="flex min-w-0 flex-col">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {tab.label}

                      <span
                        className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isActive
                            ? "bg-[#002b5c] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </span>

                    <span
                      className={`mt-1 text-xs ${
                        isActive
                          ? "text-[#002b5c]/70"
                          : "text-slate-400"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            TAB 1: CERTIFICATE GENERATION
        ====================================================== */}

        {activeTab === "generation" && (
          <section
            id="certificate-panel-generation"
            role="tabpanel"
            aria-labelledby="certificate-tab-generation"
            className="space-y-4"
          >
            <DataTable
              title="Certificate Generation"
              description="Generate certificates for eligible participants according to their final training results."
              columns={eligibleCertificateColumns}
              data={filteredEligibleParticipants}
              loading={isLoading}
              searchable
              searchPlaceholder="Search participant, training, or batch..."
              showPagination
              meta={eligibleCertificateTableMeta}
              emptyTitle="No eligible participants"
              emptyDescription="There are currently no participants eligible for certificate generation."
            />
          </section>
        )}

        {/* =====================================================
            TAB 2: ISSUED CERTIFICATES
        ====================================================== */}

        {activeTab === "issued" && (
          <section
            id="certificate-panel-issued"
            role="tabpanel"
            aria-labelledby="certificate-tab-issued"
            className="space-y-4"
          >
            <DataTable
              title="Issued Certificates"
              description="View, preview, open, and download certificates that have already been generated."
              columns={certificateColumns}
              data={filteredCertificates}
              loading={isLoading}
              searchable
              searchPlaceholder="Search participant, training, or certificate number..."
              showPagination
              toolbar={certificateToolbar}
              meta={certificateTableMeta}
              emptyTitle="No certificates found"
              emptyDescription="There are currently no issued certificates matching your filters."
            />
          </section>
        )}
      </div>

      {/* =======================================================
          CERTIFICATE PREVIEW MODAL
      ======================================================== */}

      {selectedCertificate && (
        <CertificatePreviewModal
          certificate={selectedCertificate}
          onClose={handleClosePreview}
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
  const pdfUrl = certificate.pdfUrl;

  if (!pdfUrl) {
    return null;
  }

  /*
   * Cloudinary PDF -> JPG preview
   *
   * Example:
   * /image/upload/anci/certificates/file.pdf
   *
   * becomes:
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
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl">
        {/* MODAL HEADER */}

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
              className="rounded-lg bg-primary px-3 py-2 text-xs text-white font-medium text-primary-foreground transition hover:opacity-90"
            >
              Download
            </a>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate preview"
              className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-lg transition hover:bg-muted"
            >
              ×
            </button>
          </div>
        </div>

        {/* CERTIFICATE IMAGE */}

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
