"use client";

import {
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
  Assessment,
  AssessmentResult,
  AssessmentTableMeta,
} from "./types";

/* =========================================================
   MOCK DATA
========================================================= */

const initialAssessments: Assessment[] = [
  {
    id: "ASM-001",
    participantId: "PT-001",
    participantName: "Juan Dela Cruz",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment:
      "CSS NC II Final Assessment",
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
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment:
      "CSS NC II Final Assessment",
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
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment:
      "CSS NC II Final Assessment",
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
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    assessment:
      "CSS NC II Final Assessment",
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
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    trainer: "John Cruz",
    assessment:
      "Web Development Final Project",
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
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    trainer: "John Cruz",
    assessment:
      "Web Development Final Project",
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
    retakeVenue:
      "Computer Laboratory 1",
    remarks:
      "Retake scheduled after initial failed assessment.",
  },

  {
    id: "ASM-007",
    participantId: "PT-007",
    participantName: "Daniel Flores",
    training:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Kevin Santos",
    assessment:
      "EIM NC II Final Assessment",
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
    training:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Kevin Santos",
    assessment:
      "EIM NC II Final Assessment",
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

/* =========================================================
   PAGE
========================================================= */

export default function AssessmentPage() {
  const [records, setRecords] =
    useState<Assessment[]>(
      initialAssessments
    );

  const [search, setSearch] =
    useState("");

  const [training, setTraining] =
    useState("All");

  const [result, setResult] =
    useState<"All" | AssessmentResult>(
      "All"
    );

  const [selected, setSelected] =
    useState<Assessment | null>(
      null
    );

  const [modal, setModal] =
    useState<
      | "view"
      | "manage"
      | "retake"
      | "followup"
      | null
    >(null);

  const [retakeDate, setRetakeDate] =
    useState("");

  const [retakeTime, setRetakeTime] =
    useState("09:00");

  const [retakeVenue, setRetakeVenue] =
    useState("Training Room 1");

  const [remarks, setRemarks] =
    useState("");

  /* =======================================================
     STATS
  ======================================================= */

  const total = records.length;

  const passed = records.filter(
    (item) =>
      item.result === "Passed"
  ).length;

  const failed = records.filter(
    (item) =>
      item.result === "Failed"
  ).length;

  const pending = records.filter(
    (item) =>
      item.result === "Pending"
  ).length;

  const retakes = records.filter(
    (item) =>
      item.status ===
        "Retake Required" ||
      item.status ===
        "Retake Scheduled"
  ).length;

  const passRate =
    total > 0
      ? Math.round(
          (passed / total) * 100
        )
      : 0;

  /* =======================================================
     TRAININGS
  ======================================================= */

  const trainings = [
    "All",
    ...Array.from(
      new Set(
        records.map(
          (item) => item.training
        )
      )
    ),
  ];

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return records.filter(
        (item) => {
          const matchesSearch =
            !query ||
            item.participantName
              .toLowerCase()
              .includes(query) ||
            item.participantId
              .toLowerCase()
              .includes(query) ||
            item.training
              .toLowerCase()
              .includes(query) ||
            item.assessment
              .toLowerCase()
              .includes(query);

          const matchesTraining =
            training === "All" ||
            item.training ===
              training;

          const matchesResult =
            result === "All" ||
            item.result === result;

          return (
            matchesSearch &&
            matchesTraining &&
            matchesResult
          );
        }
      );
    }, [
      records,
      search,
      training,
      result,
    ]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  function openView(
    assessment: Assessment
  ) {
    setSelected(assessment);
    setModal("view");
  }

  function openManage(
    assessment: Assessment
  ) {
    setSelected(assessment);
    setRemarks(
      assessment.remarks
    );
    setModal("manage");
  }

  function openRetake(
    assessment: Assessment
  ) {
    setSelected(assessment);

    setRetakeDate(
      assessment.retakeDate ??
        ""
    );

    setRetakeTime(
      assessment.retakeTime ??
        "09:00"
    );

    setRetakeVenue(
      assessment.retakeVenue ??
        "Training Room 1"
    );

    setRemarks(
      assessment.remarks
    );

    setModal("retake");
  }

  function updateRecord(
    updated: Assessment
  ) {
    setRecords(
      (current) =>
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
      alert(
        "Please select a retake date."
      );
      return;
    }

    const updated: Assessment = {
      ...selected,

      status:
        "Retake Scheduled",

      retakeDate,

      retakeTime,

      retakeVenue,

      remarks:
        remarks ||
        "Retake examination scheduled by administrator.",
    };

    updateRecord(updated);

    setModal(null);

    alert(
      `Retake scheduled for ${selected.participantName}.`
    );
  }

  function cancelRetake() {
    if (!selected) return;

    const confirmed =
      window.confirm(
        `Cancel the scheduled retake for ${selected.participantName}?`
      );

    if (!confirmed) return;

    const updated: Assessment = {
      ...selected,

      status:
        "Retake Required",

      retakeDate: null,

      retakeTime: null,

      retakeVenue: null,

      remarks:
        "Retake schedule cancelled by administrator.",
    };

    updateRecord(updated);

    setModal(null);
  }

  function markRetakeRequired() {
    if (!selected) return;

    const updated: Assessment = {
      ...selected,

      status:
        "Retake Required",

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

  function followUpTrainer() {
    if (!selected) return;

    const updated: Assessment = {
      ...selected,

      remarks:
        remarks ||
        "Follow-up request sent to the assigned trainer.",
    };

    updateRecord(updated);

    setModal(null);

    alert(
      `Follow-up sent to ${selected.trainer}.`
    );
  }

  /* =======================================================
     TABLE META
  ======================================================= */

  const tableMeta: AssessmentTableMeta = {
    onView: openView,
    onManage: openManage,
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6 p-6">

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
            Monitor participant assessment
            results and manage administrative
            actions.
          </p>
        </div>

        <button
          type="button"
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

      {/* INFO */}

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
              Trainers conduct assessments and
              submit scores. Administrators manage
              retakes, schedules, and follow-ups.
            </p>
          </div>

        </div>

      </div>

      {/* STATS */}

      <StatGrid>

        <StatCard
          title="Total Assessments"
          value={total}
          description="All records"
        />

        <StatCard
          title="Passed"
          value={passed}
          description={`${passRate}% pass rate`}
        />

        <StatCard
          title="Failed"
          value={failed}
          description="Below passing score"
        />

        <StatCard
          title="Pending"
          value={pending}
          description="Awaiting result"
        />

        <StatCard
          title="Retake Cases"
          value={retakes}
          description="Requires action"
        />

      </StatGrid>

      {/* TABLE */}

      <DataTable
        title="Exam Results"
        description="View results and manage assessment lifecycle actions."
        columns={columns}
        data={filteredRecords}
        searchable
        searchPlaceholder="Search participant..."
        meta={tableMeta}
        toolbar={
          <div className="flex flex-wrap gap-3">

            <select
              value={training}
              onChange={(event) =>
                setTraining(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm"
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
              value={result}
              onChange={(event) =>
                setResult(
                  event.target
                    .value as
                    | "All"
                    | AssessmentResult
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
        }
        emptyTitle="No assessment records found"
        emptyDescription="Try changing your search or filters."
      />

      {/* VIEW */}

      {selected &&
        modal === "view" && (
          <ViewModal
            item={selected}
            onClose={() =>
              setModal(null)
            }
          />
        )}

      {/* MANAGE */}

      {selected &&
        modal === "manage" && (
          <ManageModal
            item={selected}
            onClose={() =>
              setModal(null)
            }
            onSchedule={() =>
              openRetake(selected)
            }
            onMarkRetake={
              markRetakeRequired
            }
            onFollowUp={() =>
              setModal("followup")
            }
            onCancelRetake={
              cancelRetake
            }
            onReschedule={() =>
              openRetake(selected)
            }
          />
        )}

      {/* RETAKE */}

      {selected &&
        modal === "retake" && (
          <RetakeModal
            item={selected}
            date={retakeDate}
            time={retakeTime}
            venue={retakeVenue}
            remarks={remarks}
            setDate={setRetakeDate}
            setTime={setRetakeTime}
            setVenue={setRetakeVenue}
            setRemarks={setRemarks}
            onClose={() =>
              setModal(null)
            }
            onSubmit={
              scheduleRetake
            }
          />
        )}

      {/* FOLLOW UP */}

      {selected &&
        modal === "followup" && (
          <FollowUpModal
            item={selected}
            remarks={remarks}
            setRemarks={setRemarks}
            onClose={() =>
              setModal(null)
            }
            onSubmit={
              followUpTrainer
            }
          />
        )}

    </div>
  );
}

/* =========================================================
   VIEW MODAL
========================================================= */

function ViewModal({
  item,
  onClose,
}: {
  item: Assessment;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <ModalHeader
        title="Assessment Details"
        subtitle={item.id}
        onClose={onClose}
      />

      <div className="mt-6 space-y-4">

        <Detail
          label="Participant"
          value={item.participantName}
        />

        <Detail
          label="Participant ID"
          value={item.participantId}
        />

        <Detail
          label="Training"
          value={item.training}
        />

        <Detail
          label="Batch"
          value={item.batch}
        />

        <Detail
          label="Assessment"
          value={item.assessment}
        />

        <Detail
          label="Trainer"
          value={item.trainer}
        />

        <Detail
          label="Score"
          value={
            item.score !== null
              ? `${item.score} / 100`
              : "Pending"
          }
        />

        <Detail
          label="Passing Score"
          value={`${item.passingScore} / 100`}
        />

        <Detail
          label="Result"
          value={item.result}
        />

        <Detail
          label="Status"
          value={item.status}
        />

        <Detail
          label="Attempts"
          value={`${item.attempts} / ${item.maxAttempts}`}
        />

        <Detail
          label="Remarks"
          value={item.remarks}
        />

      </div>

    </Modal>
  );
}

/* =========================================================
   MANAGE MODAL
========================================================= */

function ManageModal({
  item,
  onClose,
  onSchedule,
  onMarkRetake,
  onFollowUp,
  onCancelRetake,
  onReschedule,
}: {
  item: Assessment;
  onClose: () => void;
  onSchedule: () => void;
  onMarkRetake: () => void;
  onFollowUp: () => void;
  onCancelRetake: () => void;
  onReschedule: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <ModalHeader
        title="Manage Assessment"
        subtitle={item.participantName}
        onClose={onClose}
      />

      <div className="mt-6 space-y-3">

        {item.status ===
          "Retake Required" && (
          <>
            <ActionButton
              title="Schedule Retake"
              description="Set the date, time, and venue."
              onClick={onSchedule}
            />

            <ActionButton
              title="Confirm Retake Requirement"
              description="Keep this participant in the retake queue."
              onClick={onMarkRetake}
            />
          </>
        )}

        {item.status ===
          "Retake Scheduled" && (
          <>
            <ActionButton
              title="Reschedule Retake"
              description="Change the current retake schedule."
              onClick={onReschedule}
            />

            <ActionButton
              title="Cancel Retake"
              description="Remove the current retake schedule."
              onClick={onCancelRetake}
              danger
            />
          </>
        )}

        {item.status === "Pending" && (
          <ActionButton
            title="Follow Up Trainer"
            description="Request the trainer to submit the result."
            onClick={onFollowUp}
          />
        )}

      </div>

    </Modal>
  );
}

/* =========================================================
   RETAKE MODAL
========================================================= */

function RetakeModal({
  item,
  date,
  time,
  venue,
  remarks,
  setDate,
  setTime,
  setVenue,
  setRemarks,
  onClose,
  onSubmit,
}: {
  item: Assessment;
  date: string;
  time: string;
  venue: string;
  remarks: string;
  setDate: (value: string) => void;
  setTime: (value: string) => void;
  setVenue: (value: string) => void;
  setRemarks: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <ModalHeader
        title={
          item.status ===
          "Retake Scheduled"
            ? "Reschedule Retake"
            : "Schedule Retake"
        }
        subtitle={item.participantName}
        onClose={onClose}
      />

      <div className="mt-6 space-y-5">

        <Field
          label="Retake Date"
          type="date"
          value={date}
          onChange={setDate}
        />

        <Field
          label="Time"
          type="time"
          value={time}
          onChange={setTime}
        />

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Venue
          </label>

          <select
            value={venue}
            onChange={(event) =>
              setVenue(
                event.target.value
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
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Remarks
          </label>

          <textarea
            value={remarks}
            onChange={(event) =>
              setRemarks(
                event.target.value
              )
            }
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />
        </div>

      </div>

      <div className="mt-6 flex gap-3">

        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 rounded-xl bg-[#191c1e] py-3 text-sm font-semibold text-white"
        >
          Save
        </button>

      </div>

    </Modal>
  );
}

/* =========================================================
   FOLLOW UP MODAL
========================================================= */

function FollowUpModal({
  item,
  remarks,
  setRemarks,
  onClose,
  onSubmit,
}: {
  item: Assessment;
  remarks: string;
  setRemarks: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <ModalHeader
        title="Follow Up Trainer"
        subtitle={item.participantName}
        onClose={onClose}
      />

      <div className="mt-6">

        <textarea
          value={remarks}
          onChange={(event) =>
            setRemarks(
              event.target.value
            )
          }
          rows={5}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm"
          placeholder="Write your follow-up message..."
        />

      </div>

      <div className="mt-6 flex gap-3">

        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 rounded-xl bg-[#191c1e] py-3 text-sm font-semibold text-white"
        >
          Send Follow-up
        </button>

      </div>

    </Modal>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ActionButton({
  title,
  description,
  onClick,
  danger = false,
}: {
  title: string;
  description: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
        danger
          ? "border-red-200 hover:bg-red-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div>
        <p
          className={
            danger
              ? "font-semibold text-red-700"
              : "font-semibold"
          }
        >
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <span>→</span>
    </button>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: "date" | "time";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
      />
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
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
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
      >
        ×
      </button>

    </div>
  );
}