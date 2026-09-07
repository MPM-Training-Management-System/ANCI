"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import { columns } from "./columns";

import type {
  CertificateStatus,
  CertificationRecord,
  CertificationTableMeta,
} from "./type";

/* =========================================================
   MOCK DATA
========================================================= */

const INITIAL_RECORDS: CertificationRecord[] = [
  {
    id: "CERT-001",
    participantId: "PT-001",
    participantName: "Juan Dela Cruz",

    training:
      "Computer Systems Servicing NC II",

    batch: "CSS-NCII-2026-01",

    trainer: "Maria Santos",

    assessmentScore: 92,
    assessmentResult: "Passed",

    attendance: 96,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "August 15, 2026",

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Eligible",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "Participant has completed all certification requirements.",
  },

  {
    id: "CERT-002",
    participantId: "PT-002",
    participantName: "Maria Garcia",

    training:
      "Computer Systems Servicing NC II",

    batch: "CSS-NCII-2026-01",

    trainer: "Maria Santos",

    assessmentScore: 84,
    assessmentResult: "Passed",

    attendance: 94,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "August 16, 2026",

    certificateNo: "CERT-2026-0002",
    verificationCode: "ANCI-7F42-92KM",

    certificateStatus: "Generated",

    generatedAt:
      "August 16, 2026 10:30 AM",

    issuedAt: null,

    remarks:
      "Certificate generated and awaiting issuance.",
  },

  {
    id: "CERT-003",
    participantId: "PT-003",
    participantName: "Pedro Reyes",

    training:
      "Computer Systems Servicing NC II",

    batch: "CSS-NCII-2026-01",

    trainer: "Maria Santos",

    assessmentScore: 68,
    assessmentResult: "Failed",

    attendance: 88,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 18,

    completionStatus: "Incomplete",
    completionDate: null,

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Not Eligible",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "Participant has not satisfied the assessment and completion requirements.",
  },

  {
    id: "CERT-004",
    participantId: "PT-004",
    participantName: "Ana Mendoza",

    training:
      "Computer Systems Servicing NC II",

    batch: "CSS-NCII-2026-01",

    trainer: "Maria Santos",

    assessmentScore: null,
    assessmentResult: "Pending",

    attendance: 94,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "For Review",
    completionDate: null,

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Pending Review",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "Waiting for the trainer to submit the final assessment result.",
  },

  {
    id: "CERT-005",
    participantId: "PT-005",
    participantName: "Mark Villanueva",

    training:
      "Web Development Fundamentals",

    batch: "WEB-DEV-2026-02",

    trainer: "John Cruz",

    assessmentScore: 89,
    assessmentResult: "Passed",

    attendance: 98,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "August 14, 2026",

    certificateNo: "CERT-2026-0005",
    verificationCode: "ANCI-5KD8-11QP",

    certificateStatus: "Issued",

    generatedAt:
      "August 14, 2026 03:20 PM",

    issuedAt:
      "August 14, 2026 04:10 PM",

    remarks:
      "Certificate officially issued.",
  },

  {
    id: "CERT-006",
    participantId: "PT-006",
    participantName: "Sofia Ramos",

    training:
      "Web Development Fundamentals",

    batch: "WEB-DEV-2026-02",

    trainer: "John Cruz",

    assessmentScore: 78,
    assessmentResult: "Passed",

    attendance: 93,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "August 14, 2026",

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Eligible",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "All certification requirements have been satisfied.",
  },

  {
    id: "CERT-007",
    participantId: "PT-007",
    participantName: "Daniel Flores",

    training:
      "Electrical Installation NC II",

    batch: "EIM-NCII-2026-01",

    trainer: "Kevin Santos",

    assessmentScore: null,
    assessmentResult: "Pending",

    attendance: 87,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 17,

    completionStatus: "In Progress",
    completionDate: null,

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Not Eligible",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "Training program is still in progress.",
  },

  {
    id: "CERT-008",
    participantId: "PT-008",
    participantName: "Rachel Cruz",

    training:
      "Electrical Installation NC II",

    batch: "EIM-NCII-2026-01",

    trainer: "Kevin Santos",

    assessmentScore: 81,
    assessmentResult: "Passed",

    attendance: 92,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "For Review",
    completionDate: null,

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Pending Review",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "Completion is awaiting administrative review.",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function CertificationPage() {
  const [records, setRecords] =
    useState<CertificationRecord[]>(
      INITIAL_RECORDS
    );

  const [trainingFilter, setTrainingFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | CertificateStatus
    >("All");

  const [selected, setSelected] =
    useState<CertificationRecord | null>(
      null
    );

  const [modal, setModal] = useState<
    "view" |
      "generate" |
      "certificate" |
      null
  >(null);

  /* =======================================================
     LOCK BACKGROUND SCROLL
  ======================================================= */

  useEffect(() => {
    if (!modal) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [modal]);

  /* =======================================================
     TRAININGS
  ======================================================= */

  const trainingOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          records.map(
            (record) => record.training
          )
        )
      ),
    ];
  }, [records]);

  /* =======================================================
     FILTERED RECORDS
  ======================================================= */

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const trainingMatch =
        trainingFilter === "All" ||
        record.training === trainingFilter;

      const statusMatch =
        statusFilter === "All" ||
        record.certificateStatus ===
          statusFilter;

      return (
        trainingMatch &&
        statusMatch
      );
    });
  }, [
    records,
    trainingFilter,
    statusFilter,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const total = records.length;

  const eligible = records.filter(
    (record) =>
      record.certificateStatus ===
      "Eligible"
  ).length;

  const generated = records.filter(
    (record) =>
      record.certificateStatus ===
      "Generated"
  ).length;

  const issued = records.filter(
    (record) =>
      record.certificateStatus ===
      "Issued"
  ).length;

  const pending = records.filter(
    (record) =>
      record.certificateStatus ===
      "Pending Review"
  ).length;

  /* =======================================================
     UPDATE RECORD
  ======================================================= */

  function updateRecord(
    updated: CertificationRecord
  ) {
    setRecords((current) =>
      current.map((record) =>
        record.id === updated.id
          ? updated
          : record
      )
    );

    setSelected(updated);
  }

  /* =======================================================
     VIEW
  ======================================================= */

  function handleView(
    record: CertificationRecord
  ) {
    setSelected(record);
    setModal("view");
  }

  /* =======================================================
     GENERATE
  ======================================================= */

  function handleGenerate(
    record: CertificationRecord
  ) {
    setSelected(record);
    setModal("generate");
  }

  /* =======================================================
     CERTIFICATE
  ======================================================= */

  function handleCertificate(
    record: CertificationRecord
  ) {
    setSelected(record);
    setModal("certificate");
  }

  /* =======================================================
     ELIGIBILITY
  ======================================================= */

  function isEligible(
    record: CertificationRecord
  ) {
    return (
      record.assessmentResult ===
        "Passed" &&
      record.attendance >=
        record.requiredAttendance &&
      record.completedSessions >=
        record.totalSessions &&
      record.completionStatus ===
        "Completed"
    );
  }

  /* =======================================================
     GENERATE CERTIFICATE
  ======================================================= */

  function confirmGenerate() {
    if (!selected) return;

    if (!isEligible(selected)) {
      alert(
        "This participant is not eligible for certification."
      );

      return;
    }

    const nextNumber =
      records.length + 1;

    const updated: CertificationRecord = {
      ...selected,

      certificateNo:
        selected.certificateNo ??
        `CERT-2026-${String(
          nextNumber
        ).padStart(4, "0")}`,

      verificationCode:
        selected.verificationCode ??
        `ANCI-${randomCode()}-${randomCode()}`,

      certificateStatus: "Generated",

      generatedAt: currentDateTime(),

      remarks:
        "Certificate generated by administrator.",
    };

    updateRecord(updated);

    setModal("certificate");
  }

  /* =======================================================
     ISSUE CERTIFICATE
  ======================================================= */

  function issueCertificate() {
    if (!selected) return;

    if (
      selected.certificateStatus !==
      "Generated"
    ) {
      return;
    }

    const updated: CertificationRecord = {
      ...selected,

      certificateStatus: "Issued",

      issuedAt: currentDateTime(),

      remarks:
        "Certificate officially issued by administrator.",
    };

    updateRecord(updated);

    alert(
      `${updated.certificateNo} has been issued successfully.`
    );
  }

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  function downloadCertificate() {
    if (!selected) return;

    alert(
      `Certificate for ${selected.participantName} is ready for download.`
    );
  }

  /* =======================================================
     PRINT
  ======================================================= */

  function printCertificate() {
    window.print();
  }

  /* =======================================================
     TABLE META
  ======================================================= */

  const tableMeta: CertificationTableMeta = {
    onView: handleView,
    onGenerate: handleGenerate,
    onCertificate: handleCertificate,
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Certification
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Review participant completion,
            manage certificate eligibility,
            and issue official training
            certificates.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            alert(
              "Certification report generated."
            )
          }
          className="rounded-xl bg-[#191c1e] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Export Report
        </button>

      </div>

      {/* PROCESS */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Certification Process
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Participants must satisfy all
            requirements before a certificate
            can be issued.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">

          <ProcessStep
            number="01"
            title="Assessment"
            description="Participant must pass the assessment."
          />

          <ProcessStep
            number="02"
            title="Attendance"
            description="Required attendance must be met."
          />

          <ProcessStep
            number="03"
            title="Completion"
            description="All required sessions must be completed."
          />

          <ProcessStep
            number="04"
            title="Admin Review"
            description="Administrator verifies eligibility."
          />

          <ProcessStep
            number="05"
            title="Certificate"
            description="Certificate is generated and issued."
          />

        </div>

      </div>

      {/* STATS */}

      <StatGrid>

        <StatCard
          title="Total"
          value={total}
          description="Certification records"
        />

        <StatCard
          title="Eligible"
          value={eligible}
          description="Ready to generate"
        />

        <StatCard
          title="Generated"
          value={generated}
          description="Awaiting issuance"
        />

        <StatCard
          title="Issued"
          value={issued}
          description="Officially issued"
        />

        <StatCard
          title="Pending Review"
          value={pending}
          description="Needs verification"
        />

      </StatGrid>

      {/* TABLE */}

      <DataTable
        title="Certification Records"
        description="Manage certification records and certificate issuance."
        columns={columns}
        data={filteredRecords}
        searchable
        searchPlaceholder="Search participant..."
        meta={tableMeta}
        toolbar={
          <div className="flex flex-wrap gap-3">

            <select
              value={trainingFilter}
              onChange={(event) =>
                setTrainingFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
            >
              {trainingOptions.map(
                (training) => (
                  <option
                    key={training}
                    value={training}
                  >
                    {training === "All"
                      ? "All Trainings"
                      : training}
                  </option>
                )
              )}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | CertificateStatus
                )
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending Review">
                Pending Review
              </option>

              <option value="Eligible">
                Eligible
              </option>

              <option value="Generated">
                Generated
              </option>

              <option value="Issued">
                Issued
              </option>

              <option value="Not Eligible">
                Not Eligible
              </option>
            </select>

          </div>
        }
      />

      {/* ===================================================
          VIEW MODAL
      =================================================== */}

      {modal === "view" &&
        selected && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:p-6">

            <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]">

              {/* HEADER */}

              <ModalHeader
                eyebrow="Certification Record"
                title="Participant Details"
                subtitle={
                  selected.participantId
                }
                onClose={() =>
                  setModal(null)
                }
              />

              {/* BODY */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-6 p-5 sm:p-6">

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Participant
                    </p>

                    <p className="mt-2 text-lg font-bold text-gray-900">
                      {
                        selected.participantName
                      }
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {
                        selected.participantId
                      }
                    </p>
                  </div>

                  <div>
                    <SectionTitle title="Training Information" />

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <InfoCard
                        label="Training Program"
                        value={
                          selected.training
                        }
                      />

                      <InfoCard
                        label="Batch"
                        value={
                          selected.batch
                        }
                      />

                      <InfoCard
                        label="Trainer"
                        value={
                          selected.trainer
                        }
                      />

                      <InfoCard
                        label="Completion"
                        value={
                          selected.completionStatus
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Certification Requirements" />

                    <div className="mt-3 space-y-3">

                      <Requirement
                        title="Assessment"
                        value={
                          selected.assessmentScore !==
                          null
                            ? `${selected.assessmentScore}/100 — ${selected.assessmentResult}`
                            : "Pending"
                        }
                        passed={
                          selected.assessmentResult ===
                          "Passed"
                        }
                      />

                      <Requirement
                        title="Attendance"
                        value={`${selected.attendance}% / ${selected.requiredAttendance}% required`}
                        passed={
                          selected.attendance >=
                          selected.requiredAttendance
                        }
                      />

                      <Requirement
                        title="Training Sessions"
                        value={`${selected.completedSessions}/${selected.totalSessions}`}
                        passed={
                          selected.completedSessions >=
                          selected.totalSessions
                        }
                      />

                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Certificate Information" />

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">

                      <InfoCard
                        label="Certificate Number"
                        value={
                          selected.certificateNo ??
                          "Not generated"
                        }
                      />

                      <InfoCard
                        label="Verification Code"
                        value={
                          selected.verificationCode ??
                          "Not generated"
                        }
                      />

                      <InfoCard
                        label="Generated At"
                        value={
                          selected.generatedAt ??
                          "—"
                        }
                      />

                      <InfoCard
                        label="Issued At"
                        value={
                          selected.issuedAt ??
                          "—"
                        }
                      />

                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Remarks" />

                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-sm leading-6 text-gray-600">
                        {selected.remarks ||
                          "No remarks available."}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* FOOTER */}

              <ModalFooter>

                <button
                  type="button"
                  onClick={() =>
                    setModal(null)
                  }
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>

                {selected.certificateStatus ===
                  "Eligible" && (
                  <button
                    type="button"
                    onClick={() =>
                      setModal("generate")
                    }
                    className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Generate Certificate
                  </button>
                )}

                {(selected.certificateStatus ===
                  "Generated" ||
                  selected.certificateStatus ===
                    "Issued") && (
                  <button
                    type="button"
                    onClick={() =>
                      setModal("certificate")
                    }
                    className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    View Certificate
                  </button>
                )}

              </ModalFooter>

            </div>

          </div>
        )}

      {/* ===================================================
          GENERATE MODAL
      =================================================== */}

      {modal === "generate" &&
        selected && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:p-6">

            <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]">

              <ModalHeader
                eyebrow="Certificate Generation"
                title="Generate Certificate"
                subtitle={
                  selected.participantName
                }
                onClose={() =>
                  setModal(null)
                }
              />

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-5 p-5 sm:p-6">

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">
                      Eligibility Check
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      All certification
                      requirements must be
                      satisfied before the
                      certificate can be
                      generated.
                    </p>
                  </div>

                  <div className="space-y-3">

                    <Requirement
                      title="Assessment"
                      value={
                        selected.assessmentScore !==
                        null
                          ? `${selected.assessmentScore}/100 — ${selected.assessmentResult}`
                          : "Pending"
                      }
                      passed={
                        selected.assessmentResult ===
                        "Passed"
                      }
                    />

                    <Requirement
                      title="Attendance"
                      value={`${selected.attendance}% — minimum ${selected.requiredAttendance}%`}
                      passed={
                        selected.attendance >=
                        selected.requiredAttendance
                      }
                    />

                    <Requirement
                      title="Training Completion"
                      value={`${selected.completedSessions}/${selected.totalSessions} sessions`}
                      passed={
                        selected.completedSessions >=
                        selected.totalSessions
                      }
                    />

                    <Requirement
                      title="Completion Status"
                      value={
                        selected.completionStatus
                      }
                      passed={
                        selected.completionStatus ===
                        "Completed"
                      }
                    />

                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      isEligible(selected)
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex gap-3">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${
                          isEligible(selected)
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isEligible(selected)
                          ? "✓"
                          : "×"}
                      </div>

                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isEligible(selected)
                              ? "text-emerald-800"
                              : "text-red-800"
                          }`}
                        >
                          {isEligible(
                            selected
                          )
                            ? "Participant is eligible"
                            : "Participant is not eligible"}
                        </p>

                        <p className="mt-1 text-sm leading-5 text-gray-600">
                          {isEligible(
                            selected
                          )
                            ? "All requirements have been satisfied and a certificate can be generated."
                            : "Complete the remaining requirements before generating a certificate."}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              <ModalFooter>

                <button
                  type="button"
                  onClick={() =>
                    setModal(null)
                  }
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    !isEligible(selected)
                  }
                  onClick={
                    confirmGenerate
                  }
                  className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Generate Certificate
                </button>

              </ModalFooter>

            </div>

          </div>
        )}

      {/* ===================================================
          CERTIFICATE MODAL
      =================================================== */}

      {modal === "certificate" &&
        selected && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 p-3 backdrop-blur-[2px] sm:p-6">

            <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">

              <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}

                <ModalHeader
                  eyebrow="Certificate"
                  title="Certificate Preview"
                  subtitle={
                    selected.certificateNo ??
                    "Certificate"
                  }
                  onClose={() =>
                    setModal(null)
                  }
                />

                {/* PREVIEW */}

                <div className="min-h-0 max-h-[calc(100dvh-180px)] overflow-y-auto bg-gray-100 p-3 sm:p-6">

                  <div className="mx-auto w-full max-w-5xl">

                    <div
                      id="certificate"
                      className="bg-white p-2 shadow-xl sm:p-4"
                    >

                      <div className="border-4 border-double border-gray-800 p-4 sm:border-8 sm:p-10">

                        <div className="border border-gray-300 p-5 text-center sm:p-10">

                          <p className="text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.4em]">
                            ANCI TRAINING SYSTEM
                          </p>

                          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-gray-500 sm:mt-12">
                            Certificate of Completion
                          </p>

                          <h1 className="mt-4 font-serif text-3xl font-bold sm:text-5xl">
                            Certificate
                          </h1>

                          <p className="mx-auto mt-6 max-w-lg text-xs leading-6 text-gray-500 sm:text-sm">
                            This certificate is
                            proudly presented
                            to
                          </p>

                          <h2 className="mt-3 text-2xl font-bold sm:text-4xl">
                            {
                              selected.participantName
                            }
                          </h2>

                          <div className="mx-auto mt-4 h-px max-w-md bg-gray-300" />

                          <p className="mx-auto mt-6 max-w-2xl text-xs leading-6 text-gray-600 sm:text-sm sm:leading-7">
                            has successfully
                            completed the
                            required training
                            program and
                            satisfied the
                            prescribed
                            assessment and
                            attendance
                            requirements.
                          </p>

                          <p className="mt-5 text-lg font-bold sm:text-xl">
                            {selected.training}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Batch:{" "}
                            {selected.batch}
                          </p>

                          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-3">

                            <CertificateInfo
                              label="Certificate No."
                              value={
                                selected.certificateNo ??
                                "—"
                              }
                            />

                            <CertificateInfo
                              label="Assessment"
                              value={
                                selected.assessmentScore !==
                                null
                                  ? `${selected.assessmentScore}/100`
                                  : "—"
                              }
                            />

                            <CertificateInfo
                              label="Attendance"
                              value={`${selected.attendance}%`}
                            />

                          </div>

                          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-16">

                            <Signature
                              name={
                                selected.trainer
                              }
                              role="Training Instructor"
                            />

                            <Signature
                              name="Training Administrator"
                              role="Authorized Administrator"
                            />

                          </div>

                          <div className="mt-8">

                            <p className="text-[9px] uppercase tracking-wider text-gray-400">
                              Verification Code
                            </p>

                            <p className="mt-1 break-all font-mono text-xs font-bold">
                              {selected.verificationCode ??
                                "—"}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">

                  <button
                    type="button"
                    onClick={
                      downloadCertificate
                    }
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={
                      printCertificate
                    }
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Print
                  </button>

                  {selected.certificateStatus ===
                    "Generated" && (
                    <button
                      type="button"
                      onClick={
                        issueCertificate
                      }
                      className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Issue Certificate
                    </button>
                  )}

                  {selected.certificateStatus ===
                    "Issued" && (
                    <span className="rounded-xl bg-emerald-50 px-5 py-2.5 text-center text-sm font-semibold text-emerald-700">
                      ✓ Certificate Issued
                    </span>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

/* =========================================================
   MODAL HEADER
========================================================= */

function ModalHeader({
  eyebrow,
  title,
  subtitle,
  onClose,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

      <div className="min-w-0">

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 truncate text-sm text-gray-500">
          {subtitle}
        </p>

      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
      >
        ×
      </button>

    </div>
  );
}

/* =========================================================
   MODAL FOOTER
========================================================= */

function ModalFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
      {children}
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <h3 className="text-sm font-bold text-gray-900">
      {title}
    </h3>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">

      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   REQUIREMENT
========================================================= */

function Requirement({
  title,
  value,
  passed,
}: {
  title: string;
  value: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">

      <div className="min-w-0">

        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-1 break-words text-xs text-gray-500">
          {value}
        </p>

      </div>

      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${
          passed
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {passed ? "✓" : "×"}
      </span>

    </div>
  );
}

/* =========================================================
   CERTIFICATE INFO
========================================================= */

function CertificateInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[9px] uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   SIGNATURE
========================================================= */

function Signature({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  return (
    <div className="text-center">

      <div className="mx-auto w-32 border-b border-gray-900" />

      <p className="mt-2 text-xs font-semibold">
        {name}
      </p>

      <p className="text-[10px] text-gray-500">
        {role}
      </p>

    </div>
  );
}

/* =========================================================
   PROCESS STEP
========================================================= */

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">

      <div className="flex items-center gap-3">

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
          {number}
        </span>

        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

      </div>

      <p className="mt-3 text-xs leading-5 text-gray-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function randomCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return Array.from(
    { length: 4 },
    () =>
      characters[
        Math.floor(
          Math.random() *
            characters.length
        )
      ]
  ).join("");
}

function currentDateTime() {
  return new Date().toLocaleString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}