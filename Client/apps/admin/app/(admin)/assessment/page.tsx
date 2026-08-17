"use client";

import { useMemo, useState } from "react";

type Result = "Passed" | "Failed" | "Pending";

type ExamStatus =
  | "Completed"
  | "Pending"
  | "Retake Scheduled"
  | "Retake Required";

type Assessment = {
  id: string;
  participantId: string;
  participantName: string;
  training: string;
  batch: string;
  trainer: string;
  assessment: string;
  type: string;

  date: string;
  score: number | null;
  passingScore: number;

  result: Result;
  status: ExamStatus;

  attempts: number;
  maxAttempts: number;

  retakeDate: string | null;
  retakeTime: string | null;
  retakeVenue: string | null;

  remarks: string;
};

const initialAssessments: Assessment[] = [
  {
    id: "ASM-001",
    participantId: "PT-001",
    participantName: "Juan Dela Cruz",
    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment: "CSS NC II Final Assessment",
    type: "Final Assessment",
    date: "2026-08-15",
    score: 92,
    passingScore: 75,
    result: "Passed",
    status: "Completed",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: null,
    retakeTime: null,
    retakeVenue: null,
    remarks:
      "Successfully completed the final assessment.",
  },

  {
    id: "ASM-002",
    participantId: "PT-002",
    participantName: "Maria Garcia",
    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment: "CSS NC II Final Assessment",
    type: "Final Assessment",
    date: "2026-08-15",
    score: 84,
    passingScore: 75,
    result: "Passed",
    status: "Completed",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: null,
    retakeTime: null,
    retakeVenue: null,
    remarks:
      "Participant met the passing requirement.",
  },

  {
    id: "ASM-003",
    participantId: "PT-003",
    participantName: "Pedro Reyes",
    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment: "CSS NC II Final Assessment",
    type: "Final Assessment",
    date: "2026-08-15",
    score: 68,
    passingScore: 75,
    result: "Failed",
    status: "Retake Required",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: null,
    retakeTime: null,
    retakeVenue: null,
    remarks:
      "Participant did not meet the passing score.",
  },

  {
    id: "ASM-004",
    participantId: "PT-004",
    participantName: "Ana Mendoza",
    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment: "CSS NC II Final Assessment",
    type: "Final Assessment",
    date: "2026-08-16",
    score: null,
    passingScore: 75,
    result: "Pending",
    status: "Pending",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: null,
    retakeTime: null,
    retakeVenue: null,
    remarks:
      "Result is awaiting trainer submission.",
  },

  {
    id: "ASM-005",
    participantId: "PT-005",
    participantName: "Mark Villanueva",
    training: "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    trainer: "John Cruz",
    assessment: "Web Development Final Project",
    type: "Final Project",
    date: "2026-08-14",
    score: 89,
    passingScore: 75,
    result: "Passed",
    status: "Completed",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: null,
    retakeTime: null,
    retakeVenue: null,
    remarks:
      "Final project successfully completed.",
  },

  {
    id: "ASM-006",
    participantId: "PT-006",
    participantName: "Sofia Ramos",
    training: "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    trainer: "John Cruz",
    assessment: "Web Development Final Project",
    type: "Final Project",
    date: "2026-08-14",
    score: 72,
    passingScore: 75,
    result: "Failed",
    status: "Retake Scheduled",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: "2026-08-25",
    retakeTime: "09:00",
    retakeVenue: "Computer Laboratory 1",
    remarks:
      "Retake scheduled after initial failed assessment.",
  },

  {
    id: "ASM-007",
    participantId: "PT-007",
    participantName: "Daniel Flores",
    training: "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Kevin Santos",
    assessment: "EIM NC II Final Assessment",
    type: "Final Assessment",
    date: "2026-08-16",
    score: null,
    passingScore: 75,
    result: "Pending",
    status: "Pending",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: null,
    retakeTime: null,
    retakeVenue: null,
    remarks:
      "Assessment is currently in progress.",
  },

  {
    id: "ASM-008",
    participantId: "PT-008",
    participantName: "Rachel Cruz",
    training: "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Kevin Santos",
    assessment: "EIM NC II Final Assessment",
    type: "Final Assessment",
    date: "2026-08-16",
    score: 81,
    passingScore: 75,
    result: "Passed",
    status: "Completed",
    attempts: 1,
    maxAttempts: 3,
    retakeDate: null,
    retakeTime: null,
    retakeVenue: null,
    remarks:
      "Passed and submitted by trainer.",
  },
];

const resultStyle: Record<Result, string> = {
  Passed:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  Failed:
    "bg-red-50 text-red-700 border-red-200",

  Pending:
    "bg-amber-50 text-amber-700 border-amber-200",
};

const statusStyle: Record<ExamStatus, string> = {
  Completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  Pending:
    "bg-amber-50 text-amber-700 border-amber-200",

  "Retake Required":
    "bg-red-50 text-red-700 border-red-200",

  "Retake Scheduled":
    "bg-blue-50 text-blue-700 border-blue-200",
};

export default function AssessmentPage() {
  const [records, setRecords] =
    useState<Assessment[]>(initialAssessments);

  const [search, setSearch] = useState("");

  const [training, setTraining] =
    useState("All");

  const [result, setResult] =
    useState<"All" | Result>("All");

  const [selected, setSelected] =
    useState<Assessment | null>(null);

  const [modal, setModal] = useState<
    "view" |
    "manage" |
    "retake" |
    "followup" |
    null
  >(null);

  const [retakeDate, setRetakeDate] =
    useState("");

  const [retakeTime, setRetakeTime] =
    useState("09:00");

  const [retakeVenue, setRetakeVenue] =
    useState("Training Room 1");

  const [manageRemarks, setManageRemarks] =
    useState("");

  const trainings = [
    "All",
    ...Array.from(
      new Set(records.map((item) => item.training))
    ),
  ];

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const q = search.toLowerCase();

      const matchesSearch =
        item.participantName
          .toLowerCase()
          .includes(q) ||
        item.participantId
          .toLowerCase()
          .includes(q) ||
        item.training
          .toLowerCase()
          .includes(q) ||
        item.assessment
          .toLowerCase()
          .includes(q);

      const matchesTraining =
        training === "All" ||
        item.training === training;

      const matchesResult =
        result === "All" ||
        item.result === result;

      return (
        matchesSearch &&
        matchesTraining &&
        matchesResult
      );
    });
  }, [
    records,
    search,
    training,
    result,
  ]);

  const total = records.length;

  const passed = records.filter(
    (item) => item.result === "Passed"
  ).length;

  const failed = records.filter(
    (item) => item.result === "Failed"
  ).length;

  const pending = records.filter(
    (item) => item.result === "Pending"
  ).length;

  const retakes = records.filter(
    (item) =>
      item.status === "Retake Required" ||
      item.status === "Retake Scheduled"
  ).length;

  const passRate =
    total > 0
      ? Math.round((passed / total) * 100)
      : 0;

  function openView(item: Assessment) {
    setSelected(item);
    setModal("view");
  }

  function openManage(item: Assessment) {
    setSelected(item);
    setManageRemarks("");
    setModal("manage");
  }

  function openRetake(item: Assessment) {
    setSelected(item);

    setRetakeDate("");
    setRetakeTime("09:00");
    setRetakeVenue("Training Room 1");

    setManageRemarks("");

    setModal("retake");
  }

  function updateRecord(updated: Assessment) {
    setRecords((current) =>
      current.map((item) =>
        item.id === updated.id
          ? updated
          : item
      )
    );

    setSelected(updated);
  }

  function scheduleRetake() {
    if (!selected) return;

    if (!retakeDate) {
      alert("Please select a retake date.");
      return;
    }

    const updated: Assessment = {
      ...selected,

      status: "Retake Scheduled",

      retakeDate,
      retakeTime,
      retakeVenue,

      remarks:
        manageRemarks ||
        "Retake examination scheduled by administrator.",
    };

    updateRecord(updated);

    setModal(null);

    alert(
      `Retake scheduled for ${updated.participantName}.`
    );
  }

  function rescheduleRetake() {
    if (!selected) return;

    setRetakeDate(
      selected.retakeDate ?? ""
    );

    setRetakeTime(
      selected.retakeTime ?? "09:00"
    );

    setRetakeVenue(
      selected.retakeVenue ??
        "Training Room 1"
    );

    setManageRemarks(
      selected.remarks
    );

    setModal("retake");
  }

  function cancelRetake() {
    if (!selected) return;

    const confirmed = window.confirm(
      `Cancel the scheduled retake for ${selected.participantName}?`
    );

    if (!confirmed) return;

    const updated: Assessment = {
      ...selected,

      status: "Retake Required",

      retakeDate: null,
      retakeTime: null,
      retakeVenue: null,

      remarks:
        "Retake schedule cancelled by administrator.",
    };

    updateRecord(updated);

    setModal(null);

    alert("Retake schedule cancelled.");
  }

  function followUp() {
    if (!selected) return;

    const updated: Assessment = {
      ...selected,

      remarks:
        manageRemarks ||
        "Follow-up request sent to the assigned trainer.",
    };

    updateRecord(updated);

    setModal(null);

    alert(
      `Follow-up sent to ${selected.trainer}.`
    );
  }

  function markRetakeRequired() {
    if (!selected) return;

    const updated: Assessment = {
      ...selected,

      status: "Retake Required",

      retakeDate: null,
      retakeTime: null,
      retakeVenue: null,

      remarks:
        "Participant marked for assessment retake.",
    };

    updateRecord(updated);

    setModal(null);

    alert(
      `${selected.participantName} is now marked for retake.`
    );
  }

  return (
    <div >

      <div className="mx-auto space-y-3 p-3">

        {/* HEADER */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Assessment / Exam Results
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Monitor participant assessment results
              and manage administrative actions such as
              retake scheduling and trainer follow-ups.
            </p>
          </div>

          <button
            onClick={() =>
              alert(
                "Mock assessment report generated."
              )
            }
            className="rounded-xl bg-[#191c1e] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Export Results
          </button>

        </div>

        {/* ROLE INFORMATION */}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              i
            </div>

            <div>

              <p className="font-semibold text-blue-900">
                Administrative Assessment Management
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Trainers are responsible for conducting
                assessments and submitting scores.
                Administrators manage the assessment
                process after submission, including
                retake scheduling, rescheduling,
                cancellation, and trainer follow-ups.
              </p>

            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <SummaryCard
            title="Total Assessments"
            value={total}
            description="All records"
            icon="A"
          />

          <SummaryCard
            title="Passed"
            value={passed}
            description={`${passRate}% pass rate`}
            icon="✓"
          />

          <SummaryCard
            title="Failed"
            value={failed}
            description="Below passing score"
            icon="!"
          />

          <SummaryCard
            title="Pending"
            value={pending}
            description="Awaiting trainer result"
            icon="?"
          />

          <SummaryCard
            title="Retake Cases"
            value={retakes}
            description="Requires admin action"
            icon="R"
          />

        </div>

        {/* FILTER */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Exam Results
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View results and manage assessment
                lifecycle actions.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search participant..."
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:bg-white md:w-64"
              />

              <select
                value={training}
                onChange={(e) =>
                  setTraining(e.target.value)
                }
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm"
              >
                {trainings.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "All"
                      ? "All Trainings"
                      : item}
                  </option>
                ))}
              </select>

              <select
                value={result}
                onChange={(e) =>
                  setResult(
                    e.target.value as
                      | "All"
                      | Result
                  )
                }
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm"
              >
                <option value="All">
                  All Results
                </option>

                <option value="Passed">
                  Passed
                </option>

                <option value="Failed">
                  Failed
                </option>

                <option value="Pending">
                  Pending
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1400px] text-left">

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
                    Score
                  </th>

                  <th className="px-6 py-4">
                    Result
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Trainer
                  </th>

                  <th className="px-6 py-4">
                    Attempts
                  </th>

                  <th className="px-6 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filtered.map((item) => (

                  <tr
                    key={item.id}
                    className="hover:bg-gray-50"
                  >

                    {/* PARTICIPANT */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <Avatar
                          name={
                            item.participantName
                          }
                        />

                        <div>

                          <p className="font-semibold">
                            {item.participantName}
                          </p>

                          <p className="text-xs text-gray-500">
                            {item.participantId}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* TRAINING */}

                    <td className="px-6 py-4">

                      <p className="max-w-[180px] text-sm font-semibold">
                        {item.training}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.batch}
                      </p>

                    </td>

                    {/* ASSESSMENT */}

                    <td className="px-6 py-4">

                      <p className="max-w-[220px] text-sm">
                        {item.assessment}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.type}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(item.date)}
                      </p>

                    </td>

                    {/* SCORE */}

                    <td className="px-6 py-4">

                      {item.score !== null ? (
                        <span className="text-lg font-bold">

                          {item.score}

                          <span className="text-xs font-normal text-gray-400">
                            {" "}
                            / 100
                          </span>

                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Pending
                        </span>
                      )}

                    </td>

                    {/* RESULT */}

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${resultStyle[item.result]}`}
                      >
                        {item.result}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}
                      >
                        {item.status}
                      </span>

                      {item.retakeDate && (
                        <p className="mt-2 text-xs text-gray-500">
                          Retake:{" "}
                          {formatDate(
                            item.retakeDate
                          )}
                        </p>
                      )}

                    </td>

                    {/* TRAINER */}

                    <td className="px-6 py-4">

                      <p className="text-sm font-medium">
                        {item.trainer}
                      </p>

                    </td>

                    {/* ATTEMPTS */}

                    <td className="px-6 py-4">

                      <span className="text-sm font-semibold">
                        {item.attempts}
                      </span>

                      <span className="text-xs text-gray-400">
                        {" "}
                        / {item.maxAttempts}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openView(item)
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                        >
                          View
                        </button>

                        {item.result ===
                          "Failed" &&
                          item.status ===
                            "Retake Required" && (
                            <button
                              onClick={() =>
                                openManage(item)
                              }
                              className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                            >
                              Manage
                            </button>
                          )}

                        {item.status ===
                          "Retake Scheduled" && (
                          <button
                            onClick={() =>
                              openManage(item)
                            }
                            className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                          >
                            Manage
                          </button>
                        )}

                        {item.status ===
                          "Pending" && (
                          <button
                            onClick={() =>
                              openManage(item)
                            }
                            className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                          >
                            Manage
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {filtered.length === 0 && (
              <div className="px-6 py-20 text-center">

                <p className="font-semibold">
                  No assessment records found
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
                {filtered.length}
              </strong>{" "}
              of{" "}
              <strong>{total}</strong>{" "}
              assessment records
            </p>

          </div>

        </div>

      </div>

      {/* VIEW MODAL */}

      {selected &&
        modal === "view" && (
          <Modal
            onClose={() =>
              setModal(null)
            }
          >

            <ModalHeader
              title="Assessment Details"
              subtitle={selected.id}
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
                    {selected.participantId}
                  </p>

                </div>

              </div>

              <Detail
                label="Training"
                value={selected.training}
              />

              <Detail
                label="Batch"
                value={selected.batch}
              />

              <Detail
                label="Assessment"
                value={selected.assessment}
              />

              <Detail
                label="Assessment Type"
                value={selected.type}
              />

              <Detail
                label="Trainer"
                value={selected.trainer}
              />

              <Detail
                label="Assessment Date"
                value={formatDate(
                  selected.date
                )}
              />

              <Detail
                label="Score"
                value={
                  selected.score !== null
                    ? `${selected.score} / 100`
                    : "Pending"
                }
              />

              <Detail
                label="Passing Score"
                value={`${selected.passingScore} / 100`}
              />

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">

                <span className="text-sm text-gray-500">
                  Result
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${resultStyle[selected.result]}`}
                >
                  {selected.result}
                </span>

              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">

                <span className="text-sm text-gray-500">
                  Assessment Status
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle[selected.status]}`}
                >
                  {selected.status}
                </span>

              </div>

              <Detail
                label="Attempts"
                value={`${selected.attempts} / ${selected.maxAttempts}`}
              />

              {selected.retakeDate && (
                <>
                  <Detail
                    label="Retake Date"
                    value={formatDate(
                      selected.retakeDate
                    )}
                  />

                  <Detail
                    label="Retake Time"
                    value={
                      selected.retakeTime ??
                      "—"
                    }
                  />

                  <Detail
                    label="Retake Venue"
                    value={
                      selected.retakeVenue ??
                      "—"
                    }
                  />
                </>
              )}

              <Detail
                label="Remarks"
                value={selected.remarks}
              />

            </div>

          </Modal>
        )}

      {/* MANAGE MODAL */}

      {selected &&
        modal === "manage" && (
          <Modal
            onClose={() =>
              setModal(null)
            }
          >

            <ModalHeader
              title="Manage Assessment"
              subtitle={
                selected.participantName
              }
              onClose={() =>
                setModal(null)
              }
            />

            <div className="mt-6">

              {/* STATUS */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Current Result
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {selected.score !==
                      null
                        ? `${selected.score}/100`
                        : "Pending"}
                    </p>

                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${resultStyle[selected.result]}`}
                  >
                    {selected.result}
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Attempts
                    </p>

                    <p className="mt-1 font-semibold">
                      {selected.attempts} /{" "}
                      {selected.maxAttempts}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Trainer
                    </p>

                    <p className="mt-1 font-semibold">
                      {selected.trainer}
                    </p>
                  </div>

                </div>

              </div>

              {/* FAILED */}

              {selected.status ===
                "Retake Required" && (
                <div className="mt-5 space-y-3">

                  <p className="text-sm font-semibold">
                    Available Actions
                  </p>

                  <button
                    onClick={() =>
                      openRetake(
                        selected
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
                  >

                    <div>

                      <p className="font-semibold">
                        Schedule Retake
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Set the date, time, venue,
                        and retake details.
                      </p>

                    </div>

                    <span>
                      →
                    </span>

                  </button>

                  <button
                    onClick={
                      markRetakeRequired
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
                  >

                    <div>

                      <p className="font-semibold">
                        Confirm Retake Requirement
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Keep the participant in the
                        retake queue.
                      </p>

                    </div>

                    <span>
                      ✓
                    </span>

                  </button>

                </div>
              )}

              {/* RETAKE SCHEDULED */}

              {selected.status ===
                "Retake Scheduled" && (
                <div className="mt-5 space-y-3">

                  <p className="text-sm font-semibold">
                    Retake Management
                  </p>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                    <p className="font-semibold text-blue-900">
                      Retake Scheduled
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-blue-800">

                      <p>
                        Date:{" "}
                        <strong>
                          {selected.retakeDate
                            ? formatDate(
                                selected.retakeDate
                              )
                            : "—"}
                        </strong>
                      </p>

                      <p>
                        Time:{" "}
                        <strong>
                          {
                            selected.retakeTime
                          }
                        </strong>
                      </p>

                      <p>
                        Venue:{" "}
                        <strong>
                          {
                            selected.retakeVenue
                          }
                        </strong>
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      rescheduleRetake()
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
                  >

                    <div>

                      <p className="font-semibold">
                        Reschedule Retake
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Change the scheduled date,
                        time, or venue.
                      </p>

                    </div>

                    <span>
                      →
                    </span>

                  </button>

                  <button
                    onClick={() =>
                      cancelRetake()
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-red-200 p-4 text-left hover:bg-red-50"
                  >

                    <div>

                      <p className="font-semibold text-red-700">
                        Cancel Retake Schedule
                      </p>

                      <p className="mt-1 text-xs text-red-500">
                        Return the participant to
                        Retake Required status.
                      </p>

                    </div>

                    <span className="text-red-600">
                      ×
                    </span>

                  </button>

                </div>
              )}

              {/* PENDING */}

              {selected.status ===
                "Pending" && (
                <div className="mt-5 space-y-3">

                  <p className="text-sm font-semibold">
                    Available Actions
                  </p>

                  <button
                    onClick={() =>
                      setModal("followup")
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
                  >

                    <div>

                      <p className="font-semibold">
                        Follow Up Trainer
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Request the trainer to submit
                        the assessment result.
                      </p>

                    </div>

                    <span>
                      →
                    </span>

                  </button>

                </div>
              )}

            </div>

          </Modal>
        )}

      {/* RETAKE MODAL */}

      {selected &&
        modal === "retake" && (
          <Modal
            onClose={() =>
              setModal(null)
            }
          >

            <ModalHeader
              title={
                selected.status ===
                "Retake Scheduled"
                  ? "Reschedule Retake"
                  : "Schedule Retake"
              }
              subtitle={
                selected.participantName
              }
              onClose={() =>
                setModal(null)
              }
            />

            <div className="mt-6 space-y-5">

              <div className="rounded-xl bg-gray-50 p-4">

                <p className="font-semibold">
                  {
                    selected.participantName
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selected.training}
                </p>

                <div className="mt-3 flex gap-4 text-sm">

                  <span>
                    Previous Score:{" "}
                    <strong>
                      {selected.score}
                      /100
                    </strong>
                  </span>

                  <span>
                    Attempt:{" "}
                    <strong>
                      {selected.attempts + 1}
                    </strong>
                  </span>

                </div>

              </div>

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Retake Date
                </label>

                <input
                  type="date"
                  value={retakeDate}
                  onChange={(e) =>
                    setRetakeDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                />

              </div>

              {/* TIME */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Time
                </label>

                <input
                  type="time"
                  value={retakeTime}
                  onChange={(e) =>
                    setRetakeTime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                />

              </div>

              {/* VENUE */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Venue
                </label>

                <select
                  value={retakeVenue}
                  onChange={(e) =>
                    setRetakeVenue(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                >

                  <option>
                    Training Room 1
                  </option>

                  <option>
                    Training Room 2
                  </option>

                  <option>
                    Computer Laboratory 1
                  </option>

                  <option>
                    Computer Laboratory 2
                  </option>

                  <option>
                    Workshop Area
                  </option>

                </select>

              </div>

              {/* TRAINER */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Assigned Trainer
                </label>

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                  {selected.trainer}
                </div>

              </div>

              {/* REMARKS */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Remarks
                </label>

                <textarea
                  value={manageRemarks}
                  onChange={(e) =>
                    setManageRemarks(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Add instructions or remarks..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                />

              </div>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setModal(null)
                }
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={
                  scheduleRetake
                }
                className="flex-1 rounded-xl bg-[#191c1e] py-3 text-sm font-semibold text-white"
              >
                {selected.status ===
                "Retake Scheduled"
                  ? "Save Changes"
                  : "Schedule Retake"}
              </button>

            </div>

          </Modal>
        )}

      {/* FOLLOW UP */}

      {selected &&
        modal === "followup" && (
          <Modal
            onClose={() =>
              setModal(null)
            }
          >

            <ModalHeader
              title="Follow Up Trainer"
              subtitle={
                selected.participantName
              }
              onClose={() =>
                setModal(null)
              }
            />

            <div className="mt-6">

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                <p className="font-semibold text-amber-900">
                  Assessment Result Pending
                </p>

                <p className="mt-1 text-sm text-amber-800">
                  The trainer has not submitted the
                  final assessment result yet.
                </p>

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold">
                  Message / Remarks
                </label>

                <textarea
                  value={manageRemarks}
                  onChange={(e) =>
                    setManageRemarks(
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Example: Please submit the final assessment result for this participant."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                />

              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Trainer
                </p>

                <p className="mt-1 font-semibold">
                  {selected.trainer}
                </p>

              </div>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setModal(null)
                }
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={followUp}
                className="flex-1 rounded-xl bg-[#191c1e] py-3 text-sm font-semibold text-white"
              >
                Send Follow-up
              </button>

            </div>

          </Modal>
        )}

    </div>
  );
}

/* =========================================================
   COMPONENTS
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

function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold ${
        large
          ? "h-14 w-14 text-sm"
          : "h-10 w-10 text-xs"
      }`}
    >
      {name
        .split(" ")
        .map((item) => item[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()}
    </div>
  );
}

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
      onMouseDown={(e) => {
        if (
          e.target ===
          e.currentTarget
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
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
      >
        ×
      </button>

    </div>
  );
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}