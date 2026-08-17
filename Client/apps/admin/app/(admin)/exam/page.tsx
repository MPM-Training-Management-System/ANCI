"use client";

import { useMemo, useState } from "react";

type AssessmentResult = "Passed" | "Failed" | "Pending";

type CompletionStatus =
  | "Completed"
  | "In Progress"
  | "For Review"
  | "Incomplete";

type CertificateStatus =
  | "Not Eligible"
  | "Pending Review"
  | "Eligible"
  | "Generated"
  | "Issued";

type CertificationRecord = {
  id: string;

  participantId: string;
  participantName: string;

  training: string;
  batch: string;
  trainer: string;

  assessmentScore: number | null;
  assessmentResult: AssessmentResult;

  attendance: number;
  requiredAttendance: number;

  totalSessions: number;
  completedSessions: number;

  completionStatus: CompletionStatus;
  completionDate: string | null;

  certificateNo: string | null;
  verificationCode: string | null;

  certificateStatus: CertificateStatus;

  generatedAt: string | null;
  issuedAt: string | null;

  remarks: string;
};

const initialRecords: CertificationRecord[] = [
  {
    id: "CERT-REC-001",

    participantId: "PT-001",
    participantName: "Juan Dela Cruz",

    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",

    assessmentScore: 92,
    assessmentResult: "Passed",

    attendance: 96,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "2026-08-15",

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Eligible",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "Participant has completed all certification requirements.",
  },

  {
    id: "CERT-REC-002",

    participantId: "PT-002",
    participantName: "Maria Garcia",

    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",

    assessmentScore: 84,
    assessmentResult: "Passed",

    attendance: 94,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "2026-08-16",

    certificateNo: "CERT-2026-0002",
    verificationCode: "ANCI-7F42-92KM",

    certificateStatus: "Generated",

    generatedAt: "August 16, 2026 10:30 AM",
    issuedAt: null,

    remarks:
      "Certificate generated and awaiting issuance.",
  },

  {
    id: "CERT-REC-003",

    participantId: "PT-003",
    participantName: "Pedro Reyes",

    training: "Computer Systems Servicing NC II",
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
    id: "CERT-REC-004",

    participantId: "PT-004",
    participantName: "Ana Mendoza",

    training: "Computer Systems Servicing NC II",
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
    id: "CERT-REC-005",

    participantId: "PT-005",
    participantName: "Mark Villanueva",

    training: "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    trainer: "John Cruz",

    assessmentScore: 89,
    assessmentResult: "Passed",

    attendance: 98,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "2026-08-14",

    certificateNo: "CERT-2026-0005",
    verificationCode: "ANCI-5KD8-11QP",

    certificateStatus: "Issued",

    generatedAt: "August 14, 2026 03:20 PM",
    issuedAt: "August 14, 2026 04:10 PM",

    remarks:
      "Certificate officially issued.",
  },

  {
    id: "CERT-REC-006",

    participantId: "PT-006",
    participantName: "Sofia Ramos",

    training: "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    trainer: "John Cruz",

    assessmentScore: 78,
    assessmentResult: "Passed",

    attendance: 93,
    requiredAttendance: 80,

    totalSessions: 20,
    completedSessions: 20,

    completionStatus: "Completed",
    completionDate: "2026-08-14",

    certificateNo: null,
    verificationCode: null,

    certificateStatus: "Eligible",

    generatedAt: null,
    issuedAt: null,

    remarks:
      "All certification requirements have been satisfied.",
  },

  {
    id: "CERT-REC-007",

    participantId: "PT-007",
    participantName: "Daniel Flores",

    training: "Electrical Installation NC II",
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
    id: "CERT-REC-008",

    participantId: "PT-008",
    participantName: "Rachel Cruz",

    training: "Electrical Installation NC II",
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

const certificateStatusStyle: Record<
  CertificateStatus,
  string
> = {
  "Not Eligible":
    "bg-red-50 text-red-700 border-red-200",

  "Pending Review":
    "bg-amber-50 text-amber-700 border-amber-200",

  Eligible:
    "bg-blue-50 text-blue-700 border-blue-200",

  Generated:
    "bg-purple-50 text-purple-700 border-purple-200",

  Issued:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const assessmentStyle: Record<
  AssessmentResult,
  string
> = {
  Passed:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  Failed:
    "bg-red-50 text-red-700 border-red-200",

  Pending:
    "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ExamPage() {
  const [records, setRecords] =
    useState<CertificationRecord[]>(
      initialRecords
    );

  const [search, setSearch] = useState("");

  const [training, setTraining] =
    useState("All");

  const [status, setStatus] =
    useState<"All" | CertificateStatus>(
      "All"
    );

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

  const trainings = [
    "All",
    ...Array.from(
      new Set(
        records.map(
          (record) => record.training
        )
      )
    ),
  ];

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        record.participantName
          .toLowerCase()
          .includes(query) ||
        record.participantId
          .toLowerCase()
          .includes(query) ||
        record.training
          .toLowerCase()
          .includes(query) ||
        (record.certificateNo ?? "")
          .toLowerCase()
          .includes(query);

      const matchesTraining =
        training === "All" ||
        record.training === training;

      const matchesStatus =
        status === "All" ||
        record.certificateStatus === status;

      return (
        matchesSearch &&
        matchesTraining &&
        matchesStatus
      );
    });
  }, [
    records,
    search,
    training,
    status,
  ]);

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

  function openView(
    record: CertificationRecord
  ) {
    setSelected(record);
    setModal("view");
  }

  function openGenerate(
    record: CertificationRecord
  ) {
    setSelected(record);
    setModal("generate");
  }

  function openCertificate(
    record: CertificationRecord
  ) {
    setSelected(record);
    setModal("certificate");
  }

  function checkEligibility(
    record: CertificationRecord
  ) {
    const assessmentPassed =
      record.assessmentResult ===
      "Passed";

    const attendanceComplete =
      record.attendance >=
      record.requiredAttendance;

    const sessionsComplete =
      record.completedSessions >=
      record.totalSessions;

    const trainingComplete =
      record.completionStatus ===
      "Completed";

    return (
      assessmentPassed &&
      attendanceComplete &&
      sessionsComplete &&
      trainingComplete
    );
  }

  function generateCertificate() {
    if (!selected) return;

    const eligible =
      checkEligibility(selected);

    if (!eligible) {
      alert(
        "This participant is not eligible for certification."
      );

      return;
    }

    const certificateNumber =
      selected.certificateNo ??
      generateCertificateNumber();

    const verificationCode =
      selected.verificationCode ??
      generateVerificationCode();

    const updated: CertificationRecord =
      {
        ...selected,

        certificateNo:
          certificateNumber,

        verificationCode:
          verificationCode,

        certificateStatus:
          "Generated",

        generatedAt:
          getCurrentDateTime(),

        remarks:
          "Certificate generated by administrator.",
      };

    updateRecord(updated);

    setModal("certificate");
  }

  function issueCertificate() {
    if (!selected) return;

    if (
      selected.certificateStatus !==
      "Generated"
    ) {
      alert(
        "Certificate must be generated before it can be issued."
      );

      return;
    }

    const updated: CertificationRecord =
      {
        ...selected,

        certificateStatus: "Issued",

        issuedAt:
          getCurrentDateTime(),

        remarks:
          "Certificate officially issued by administrator.",
      };

    updateRecord(updated);

    setModal("certificate");

    alert(
      `Certificate ${updated.certificateNo} has been officially issued.`
    );
  }

  function downloadCertificate() {
    if (!selected) return;

    alert(
      `MOCK DOWNLOAD\n\nCertificate: ${
        selected.certificateNo
      }\nParticipant: ${
        selected.participantName
      }\nTraining: ${
        selected.training
      }\n\nIn the production version, this will generate/download the actual PDF certificate.`
    );
  }

  function printCertificate() {
    window.print();
  }

  return (
    <div>

      <div className="mx-auto space-y-3 p-3">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm font-medium text-gray-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Certification
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review participant completion
              requirements and manage the certificate
              generation and issuance process.
            </p>

          </div>

          <button
            onClick={() =>
              alert(
                "Mock certification report generated."
              )
            }
            className="rounded-xl bg-[#191c1e] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Export Report
          </button>

        </div>

        {/* ============================================
            CERTIFICATION FLOW
        ============================================ */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-2">

            <h2 className="text-lg font-semibold">
              Certification Process
            </h2>

            <p className="text-sm text-gray-500">
              Certificate issuance follows the
              participant's verified training completion.
            </p>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">

            <ProcessStep
              number="01"
              title="Assessment"
              description="Participant must pass the assessment."
            />

            <ProcessStep
              number="02"
              title="Attendance"
              description="Required attendance percentage must be met."
            />

            <ProcessStep
              number="03"
              title="Completion"
              description="All required training sessions must be completed."
            />

            <ProcessStep
              number="04"
              title="Admin Review"
              description="Administrator verifies certification eligibility."
            />

            <ProcessStep
              number="05"
              title="Certificate"
              description="Admin generates and officially issues the certificate."
            />

          </div>

        </div>

        {/* ============================================
            SUMMARY
        ============================================ */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <SummaryCard
            title="Total"
            value={total}
            description="Certification records"
            icon="C"
          />

          <SummaryCard
            title="Eligible"
            value={eligible}
            description="Ready to generate"
            icon="✓"
          />

          <SummaryCard
            title="Generated"
            value={generated}
            description="Awaiting issuance"
            icon="G"
          />

          <SummaryCard
            title="Issued"
            value={issued}
            description="Officially issued"
            icon="✓"
          />

          <SummaryCard
            title="Pending Review"
            value={pending}
            description="Needs verification"
            icon="!"
          />

        </div>

        {/* ============================================
            FILTERS
        ============================================ */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <h2 className="text-lg font-semibold">
                Certification Records
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage certificate eligibility,
                generation, and issuance.
              </p>

            </div>

            <div className="flex flex-col gap-3 md:flex-row">

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search participant..."
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-gray-100 md:w-64"
              />

              <select
                value={training}
                onChange={(event) =>
                  setTraining(
                    event.target.value
                  )
                }
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none"
              >

                {trainings.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "All"
                        ? "All Trainings"
                        : item}
                    </option>
                  )
                )}

              </select>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "All"
                      | CertificateStatus
                  )
                }
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none"
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

          </div>

        </div>

        {/* ============================================
            TABLE
        ============================================ */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1450px] text-left">

              <thead className="bg-gray-50">

                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">

                  <th className="px-6 py-4">
                    Participant
                  </th>

                  <th className="px-6 py-4">
                    Training
                  </th>

                  <th className="px-6 py-4">
                    Assessment
                  </th>

                  <th className="px-6 py-4">
                    Attendance
                  </th>

                  <th className="px-6 py-4">
                    Completion
                  </th>

                  <th className="px-6 py-4">
                    Certificate
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredRecords.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* PARTICIPANT */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <Avatar
                            name={
                              record.participantName
                            }
                          />

                          <div>

                            <p className="font-semibold">
                              {
                                record.participantName
                              }
                            </p>

                            <p className="text-xs text-gray-500">
                              {
                                record.participantId
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* TRAINING */}

                      <td className="px-6 py-4">

                        <p className="max-w-[190px] text-sm font-semibold">
                          {
                            record.training
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {record.batch}
                        </p>

                      </td>

                      {/* ASSESSMENT */}

                      <td className="px-6 py-4">

                        <p className="text-sm font-bold">

                          {record.assessmentScore !==
                          null
                            ? `${record.assessmentScore}/100`
                            : "Pending"}

                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${assessmentStyle[record.assessmentResult]}`}
                        >
                          {
                            record.assessmentResult
                          }
                        </span>

                      </td>

                      {/* ATTENDANCE */}

                      <td className="px-6 py-4">

                        <div className="w-32">

                          <div className="flex items-center justify-between">

                            <span className="text-sm font-semibold">
                              {
                                record.attendance
                              }
                              %
                            </span>

                            <span className="text-[10px] text-gray-400">
                              Min.{" "}
                              {
                                record.requiredAttendance
                              }%
                            </span>

                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">

                            <div
                              className="h-full rounded-full bg-[#191c1e]"
                              style={{
                                width: `${Math.min(
                                  record.attendance,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      {/* COMPLETION */}

                      <td className="px-6 py-4">

                        <p className="text-sm font-semibold">

                          {
                            record.completedSessions
                          }{" "}
                          /{" "}
                          {
                            record.totalSessions
                          }{" "}
                          sessions

                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            record.completionStatus
                          }
                        </p>

                      </td>

                      {/* CERTIFICATE */}

                      <td className="px-6 py-4">

                        {record.certificateNo ? (
                          <>
                            <p className="font-mono text-xs font-semibold">
                              {
                                record.certificateNo
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-gray-400">
                              {
                                record.verificationCode
                              }
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not generated
                          </span>
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${certificateStatusStyle[record.certificateStatus]}`}
                        >
                          {
                            record.certificateStatus
                          }
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openView(
                                record
                              )
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold transition hover:bg-gray-50"
                          >
                            View
                          </button>

                          {record.certificateStatus ===
                            "Eligible" && (
                            <button
                              onClick={() =>
                                openGenerate(
                                  record
                                )
                              }
                              className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              Generate
                            </button>
                          )}

                          {record.certificateStatus ===
                            "Generated" && (
                            <>
                              <button
                                onClick={() =>
                                  openCertificate(
                                    record
                                  )
                                }
                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold transition hover:bg-gray-50"
                              >
                                Preview
                              </button>

                              <button
                                onClick={() => {
                                  setSelected(
                                    record
                                  );

                                  setModal(
                                    "certificate"
                                  );
                                }}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Issue
                              </button>
                            </>
                          )}

                          {record.certificateStatus ===
                            "Issued" && (
                            <button
                              onClick={() =>
                                openCertificate(
                                  record
                                )
                              }
                              className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              Certificate
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

            {filteredRecords.length ===
              0 && (
              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                  ?
                </div>

                <p className="mt-4 font-semibold">
                  No certification records found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>

              </div>
            )}

          </div>

          <div className="border-t border-gray-200 px-6 py-4">

            <p className="text-sm text-gray-500">

              Showing{" "}

              <strong>
                {
                  filteredRecords.length
                }
              </strong>

              {" "}of{" "}

              <strong>{total}</strong>

              {" "}certification records

            </p>

          </div>

        </div>

      </div>

      {/* ============================================
          VIEW MODAL
      ============================================ */}

      {selected &&
        modal === "view" && (
          <Modal
            onClose={() =>
              setModal(null)
            }
          >

            <ModalHeader
              title="Certification Details"
              subtitle={
                selected.participantId
              }
              onClose={() =>
                setModal(null)
              }
            />

            <div className="mt-6 space-y-4">

              <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">

                <Avatar
                  name={
                    selected.participantName
                  }
                  large
                />

                <div>

                  <p className="text-lg font-bold">
                    {
                      selected.participantName
                    }
                  </p>

                  <p className="text-sm text-gray-500">
                    {
                      selected.participantId
                    }
                  </p>

                </div>

              </div>

              <Detail
                label="Training"
                value={
                  selected.training
                }
              />

              <Detail
                label="Batch"
                value={selected.batch}
              />

              <Detail
                label="Trainer"
                value={
                  selected.trainer
                }
              />

              <div className="border-b border-gray-100 pb-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-gray-500">
                    Assessment
                  </span>

                  <div className="text-right">

                    <p className="font-bold">

                      {selected.assessmentScore !==
                      null
                        ? `${selected.assessmentScore}/100`
                        : "Pending"}

                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${assessmentStyle[selected.assessmentResult]}`}
                    >
                      {
                        selected.assessmentResult
                      }
                    </span>

                  </div>

                </div>

              </div>

              <Detail
                label="Attendance"
                value={`${selected.attendance}%`}
              />

              <Detail
                label="Required Attendance"
                value={`${selected.requiredAttendance}%`}
              />

              <Detail
                label="Sessions"
                value={`${selected.completedSessions} / ${selected.totalSessions}`}
              />

              <Detail
                label="Completion"
                value={
                  selected.completionStatus
                }
              />

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">

                <span className="text-sm text-gray-500">
                  Certificate Status
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${certificateStatusStyle[selected.certificateStatus]}`}
                >
                  {
                    selected.certificateStatus
                  }
                </span>

              </div>

              <Detail
                label="Certificate No."
                value={
                  selected.certificateNo ??
                  "Not generated"
                }
              />

              <Detail
                label="Verification Code"
                value={
                  selected.verificationCode ??
                  "Not generated"
                }
              />

              <Detail
                label="Generated"
                value={
                  selected.generatedAt ??
                  "—"
                }
              />

              <Detail
                label="Issued"
                value={
                  selected.issuedAt ??
                  "—"
                }
              />

              <Detail
                label="Remarks"
                value={
                  selected.remarks
                }
              />

            </div>

            <div className="mt-6 flex gap-3">

              {selected.certificateStatus ===
                "Eligible" && (
                <button
                  onClick={() =>
                    setModal("generate")
                  }
                  className="flex-1 rounded-xl bg-[#191c1e] py-3 text-sm font-semibold text-white"
                >
                  Generate Certificate
                </button>
              )}

              {(selected.certificateStatus ===
                "Generated" ||
                selected.certificateStatus ===
                  "Issued") && (
                <button
                  onClick={() =>
                    setModal("certificate")
                  }
                  className="flex-1 rounded-xl bg-[#191c1e] py-3 text-sm font-semibold text-white"
                >
                  Open Certificate
                </button>
              )}

            </div>

          </Modal>
        )}

      {/* ============================================
          GENERATE MODAL
      ============================================ */}

      {selected &&
        modal === "generate" && (
          <Modal
            onClose={() =>
              setModal(null)
            }
          >

            <ModalHeader
              title="Generate Certificate"
              subtitle={
                selected.participantName
              }
              onClose={() =>
                setModal(null)
              }
            />

            <div className="mt-6 space-y-5">

              <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">

                <Avatar
                  name={
                    selected.participantName
                  }
                  large
                />

                <div>

                  <p className="font-bold">
                    {
                      selected.participantName
                    }
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {
                      selected.training
                    }
                  </p>

                </div>

              </div>

              <div className="rounded-xl border border-gray-200 p-4">

                <p className="font-semibold">
                  Eligibility Verification
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  The system will verify the
                  participant's completion requirements
                  before generating the certificate.
                </p>

                <div className="mt-5 space-y-4">

                  <Requirement
                    label="Assessment Passed"
                    description={`Score: ${
                      selected.assessmentScore ??
                      "Pending"
                    } / 100`}
                    passed={
                      selected.assessmentResult ===
                      "Passed"
                    }
                  />

                  <Requirement
                    label="Attendance Requirement"
                    description={`${selected.attendance}% attendance / ${selected.requiredAttendance}% required`}
                    passed={
                      selected.attendance >=
                      selected.requiredAttendance
                    }
                  />

                  <Requirement
                    label="Training Sessions Completed"
                    description={`${selected.completedSessions} / ${selected.totalSessions} sessions`}
                    passed={
                      selected.completedSessions >=
                      selected.totalSessions
                    }
                  />

                  <Requirement
                    label="Training Completion"
                    description={
                      selected.completionStatus
                    }
                    passed={
                      selected.completionStatus ===
                      "Completed"
                    }
                  />

                </div>

              </div>

              {checkEligibility(
                selected
              ) ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                  <p className="font-semibold text-emerald-900">
                    Participant is Eligible
                  </p>

                  <p className="mt-1 text-sm leading-5 text-emerald-800">
                    All certification requirements
                    have been satisfied. The
                    certificate can now be generated.
                  </p>

                </div>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                  <p className="font-semibold text-red-900">
                    Participant is Not Eligible
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-800">
                    The participant must complete
                    all required conditions before a
                    certificate can be generated.
                  </p>

                </div>
              )}

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setModal(null)
                }
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  generateCertificate
                }
                disabled={
                  !checkEligibility(
                    selected
                  )
                }
                className="flex-1 rounded-xl bg-[#191c1e] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Generate Certificate
              </button>

            </div>

          </Modal>
        )}

      {/* ============================================
          CERTIFICATE PREVIEW
      ============================================ */}

      {selected &&
        modal === "certificate" && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">

            <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-2xl">

              <ModalHeader
                title="Certificate Preview"
                subtitle={
                  selected.certificateNo ??
                  "Certificate Preview"
                }
                onClose={() =>
                  setModal(null)
                }
              />

              {/* CERTIFICATE */}

              <div className="mt-6 rounded-2xl bg-gray-100 p-4 sm:p-8">

                <div
                  id="certificate-preview"
                  className="mx-auto aspect-[1.414/1] max-w-5xl border-[8px] border-double border-gray-900 bg-white p-3 sm:p-6"
                >

                  <div className="flex h-full flex-col items-center justify-between border-2 border-gray-300 p-4 text-center sm:p-8">

                    {/* LOGO */}

                    <div>

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-900 text-xl font-bold">
                        A
                      </div>

                      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.35em] sm:text-xs">
                        ANCI TRAINING SYSTEM
                      </p>

                      <p className="mt-1 text-[7px] uppercase tracking-[0.2em] text-gray-400 sm:text-[9px]">
                        Training and Certification
                      </p>

                    </div>

                    {/* MAIN CONTENT */}

                    <div className="w-full">

                      <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 sm:text-xs">
                        Certificate of Completion
                      </p>

                      <h2 className="mt-2 font-serif text-3xl font-bold sm:mt-4 sm:text-5xl">
                        Certificate
                      </h2>

                      <p className="mt-3 text-[9px] text-gray-500 sm:mt-5 sm:text-sm">
                        This certificate is proudly
                        presented to
                      </p>

                      <h3 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
                        {
                          selected.participantName
                        }
                      </h3>

                      <div className="mx-auto mt-3 h-px w-48 bg-gray-300 sm:mt-4 sm:w-72" />

                      <p className="mx-auto mt-3 max-w-2xl text-[8px] leading-4 text-gray-600 sm:mt-5 sm:text-sm sm:leading-6">
                        has successfully completed the
                        required training program and
                        has satisfied the prescribed
                        attendance and assessment
                        requirements.
                      </p>

                      <p className="mt-3 text-sm font-bold sm:mt-4 sm:text-xl">
                        {
                          selected.training
                        }
                      </p>

                      <p className="mt-1 text-[8px] text-gray-500 sm:text-xs">
                        Batch:{" "}
                        {selected.batch}
                      </p>

                    </div>

                    {/* DETAILS */}

                    <div className="w-full">

                      <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-3 sm:gap-6 sm:pt-5">

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

                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-200 pt-3 sm:mt-6 sm:gap-6 sm:pt-5">

                        <CertificateInfo
                          label="Trainer"
                          value={
                            selected.trainer
                          }
                        />

                        <CertificateInfo
                          label="Date Completed"
                          value={
                            selected.completionDate
                              ? formatDate(
                                  selected.completionDate
                                )
                              : "—"
                          }
                        />

                        <CertificateInfo
                          label="Date Issued"
                          value={
                            selected.issuedAt ??
                            selected.generatedAt ??
                            "—"
                          }
                        />

                      </div>

                      {/* SIGNATURES */}

                      <div className="mt-5 grid grid-cols-2 gap-8 sm:mt-8 sm:gap-16">

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

                      {/* VERIFICATION */}

                      <div className="mt-4 text-center sm:mt-6">

                        <p className="text-[7px] uppercase tracking-wider text-gray-400 sm:text-[9px]">
                          Verification Code
                        </p>

                        <p className="mt-1 font-mono text-[8px] font-bold sm:text-xs">
                          {
                            selected.verificationCode ??
                            "—"
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  onClick={
                    downloadCertificate
                  }
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-50"
                >
                  Download PDF
                </button>

                <button
                  onClick={
                    printCertificate
                  }
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-50"
                >
                  Print
                </button>

                {selected.certificateStatus ===
                  "Generated" && (
                  <button
                    onClick={
                      issueCertificate
                    }
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Issue Certificate
                  </button>
                )}

                {selected.certificateStatus ===
                  "Issued" && (
                  <div className="flex items-center rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                    ✓ Certificate Issued
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 font-bold">
          {icon}
        </div>

      </div>

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

        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold">
          {number}
        </span>

        <p className="text-sm font-semibold">
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
   REQUIREMENT
========================================================= */

function Requirement({
  label,
  description,
  passed,
}: {
  label: string;
  description: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <div>

        <p className="text-sm font-semibold">
          {label}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>

      </div>

      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          passed
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {passed ? "✓" : "×"}
      </div>

    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold ${
        large
          ? "h-14 w-14 text-sm"
          : "h-10 w-10 text-xs"
      }`}
    >
      {initials}
    </div>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-gray-100 pb-3">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold">
        {value}
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
    <div className="text-center">

      <p className="text-[7px] uppercase tracking-wider text-gray-400 sm:text-[9px]">
        {label}
      </p>

      <p className="mt-1 break-words text-[8px] font-semibold sm:text-xs">
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

      <div className="mx-auto w-24 border-b border-gray-900 sm:w-36" />

      <p className="mt-2 text-[8px] font-semibold sm:text-xs">
        {name}
      </p>

      <p className="text-[7px] text-gray-500 sm:text-[9px]">
        {role}
      </p>

    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">

        {children}

      </div>

    </div>
  );
}

/* =========================================================
   MODAL HEADER
========================================================= */

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between">

      <div>

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          {subtitle}
        </p>

      </div>

      <button
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
      >
        ×
      </button>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCurrentDateTime() {
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

function generateCertificateNumber() {
  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `CERT-2026-${random}`;
}

function generateVerificationCode() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "ANCI-";

  for (let i = 0; i < 4; i++) {
    code +=
      chars[
        Math.floor(
          Math.random() * chars.length
        )
      ];
  }

  code += "-";

  for (let i = 0; i < 4; i++) {
    code +=
      chars[
        Math.floor(
          Math.random() * chars.length
        )
      ];
  }

  return code;
}