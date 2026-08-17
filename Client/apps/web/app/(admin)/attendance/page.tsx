"use client";

import { useMemo, useState } from "react";

type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Excused";

type AttendanceSessionStatus =
  | "Draft"
  | "Open"
  | "Closed"
  | "Submitted";

type AttendanceMethod =
  | "Manual"
  | "QR"
  | "Participant";

type TrainingOption = {
  name: string;
  code: string;
};

type Participant = {
  id: string;
  participantId: string;
  name: string;
  email: string;
  training: string;
};

type AttendanceRecord = {
  status: AttendanceStatus;
  timeIn: string;
  timeOut: string;
  timeInMethod: AttendanceMethod | null;
  timeOutMethod: AttendanceMethod | null;
  remarks: string;
};

type HistoryRecord = {
  id: string;
  participantId: string;
  name: string;
  training: string;
  session: string;
  date: string;
  status: AttendanceStatus;
  timeIn: string;
  timeOut: string;
  remarks: string;
};

/* =========================================================
   TRAINING OPTIONS
========================================================= */

const trainingOptions: TrainingOption[] = [
  {
    name: "Computer Systems Servicing NC II",
    code: "CSS-NCII",
  },
  {
    name: "Web Development Fundamentals",
    code: "WEB-DEV",
  },
  {
    name: "Electrical Installation and Maintenance NC II",
    code: "EIM-NCII",
  },
];

/* =========================================================
   PARTICIPANTS
========================================================= */

const mockParticipants: Participant[] = [
  {
    id: "P-001",
    participantId: "PT-2026-001",
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    training: "Computer Systems Servicing NC II",
  },
  {
    id: "P-002",
    participantId: "PT-2026-002",
    name: "Maria Garcia",
    email: "maria@example.com",
    training: "Computer Systems Servicing NC II",
  },
  {
    id: "P-003",
    participantId: "PT-2026-003",
    name: "Pedro Santos",
    email: "pedro@example.com",
    training: "Computer Systems Servicing NC II",
  },
  {
    id: "P-004",
    participantId: "PT-2026-004",
    name: "Ana Reyes",
    email: "ana@example.com",
    training: "Computer Systems Servicing NC II",
  },
  {
    id: "P-005",
    participantId: "PT-2026-005",
    name: "Mark Villanueva",
    email: "mark@example.com",
    training: "Computer Systems Servicing NC II",
  },
  {
    id: "P-006",
    participantId: "PT-2026-006",
    name: "Kevin Ramos",
    email: "kevin@example.com",
    training: "Web Development Fundamentals",
  },
  {
    id: "P-007",
    participantId: "PT-2026-007",
    name: "Sarah Mendoza",
    email: "sarah@example.com",
    training: "Web Development Fundamentals",
  },
];

/* =========================================================
   INITIAL RECORDS
========================================================= */

const initialAttendance: Record<
  string,
  AttendanceRecord
> = {
  "P-001": {
    status: "Present",
    timeIn: "07:52 AM",
    timeOut: "04:30 PM",
    timeInMethod: "Participant",
    timeOutMethod: "Participant",
    remarks: "",
  },

  "P-002": {
    status: "Late",
    timeIn: "08:18 AM",
    timeOut: "04:30 PM",
    timeInMethod: "QR",
    timeOutMethod: "Participant",
    remarks: "Arrived late.",
  },

  "P-003": {
    status: "Absent",
    timeIn: "-",
    timeOut: "-",
    timeInMethod: "Manual",
    timeOutMethod: null,
    remarks: "No show.",
  },

  "P-004": {
    status: "Present",
    timeIn: "07:55 AM",
    timeOut: "04:28 PM",
    timeInMethod: "QR",
    timeOutMethod: "Participant",
    remarks: "",
  },

  "P-005": {
    status: "Excused",
    timeIn: "-",
    timeOut: "-",
    timeInMethod: "Manual",
    timeOutMethod: null,
    remarks: "Approved excuse.",
  },
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const statusConfig: Record<
  AttendanceStatus,
  {
    active: string;
    inactive: string;
    dot: string;
  }
> = {
  Present: {
    active:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50",
    dot: "bg-emerald-500",
  },

  Late: {
    active:
      "border-amber-200 bg-amber-50 text-amber-700",
    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-amber-200 hover:bg-amber-50",
    dot: "bg-amber-500",
  },

  Absent: {
    active:
      "border-red-200 bg-red-50 text-red-700",
    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50",
    dot: "bg-red-500",
  },

  Excused: {
    active:
      "border-blue-200 bg-blue-50 text-blue-700",
    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-blue-50",
    dot: "bg-blue-500",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function TrainerAttendancePage() {
  const [selectedTraining, setSelectedTraining] =
    useState(
      "Computer Systems Servicing NC II",
    );

  const [attendanceDate, setAttendanceDate] =
    useState("2026-08-17");

  const [selectedSession, setSelectedSession] =
    useState("Session 25");

  const [search, setSearch] = useState("");

  const [attendance, setAttendance] =
    useState<Record<string, AttendanceRecord>>(
      initialAttendance,
    );

  const [sessionStatus, setSessionStatus] =
    useState<AttendanceSessionStatus>("Draft");

  const [openedAt, setOpenedAt] =
    useState<string | null>(null);

  const [closedAt, setClosedAt] =
    useState<string | null>(null);

  const [submittedAt, setSubmittedAt] =
    useState<string | null>(null);

  const [showOpenModal, setShowOpenModal] =
    useState(false);

  const [showCloseModal, setShowCloseModal] =
    useState(false);

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const [showQRModal, setShowQRModal] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const [history, setHistory] =
    useState<HistoryRecord[]>([]);

  const [
    selectedParticipant,
    setSelectedParticipant,
  ] = useState<Participant | null>(null);

  const [
    showParticipantModal,
    setShowParticipantModal,
  ] = useState(false);

  /* =========================================================
     PARTICIPANTS
  ========================================================= */

  const participants = useMemo(() => {
    return mockParticipants
      .filter(
        (participant) =>
          participant.training ===
          selectedTraining,
      )
      .sort((a, b) =>
        getLastName(a.name).localeCompare(
          getLastName(b.name),
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );
  }, [selectedTraining]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredParticipants = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return participants;
    }

    return participants.filter(
      (participant) =>
        participant.name
          .toLowerCase()
          .includes(query) ||
        participant.participantId
          .toLowerCase()
          .includes(query),
    );
  }, [participants, search]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const records = participants.map(
    (participant) =>
      attendance[participant.id],
  );

  const presentCount = records.filter(
    (record) =>
      record?.status === "Present",
  ).length;

  const lateCount = records.filter(
    (record) =>
      record?.status === "Late",
  ).length;

  const absentCount = records.filter(
    (record) =>
      record?.status === "Absent",
  ).length;

  const excusedCount = records.filter(
    (record) =>
      record?.status === "Excused",
  ).length;

  /* =========================================================
     GET RECORD
  ========================================================= */

  function getRecord(
    participantId: string,
  ): AttendanceRecord {
    return (
      attendance[participantId] ?? {
        status: "Absent",
        timeIn: "-",
        timeOut: "-",
        timeInMethod: null,
        timeOutMethod: null,
        remarks: "",
      }
    );
  }

  /* =========================================================
     MANUAL STATUS
  ========================================================= */

  function setStatus(
    participantId: string,
    status: AttendanceStatus,
  ) {
    if (
      sessionStatus === "Submitted"
    ) {
      return;
    }

    setAttendance((current) => ({
      ...current,

      [participantId]: {
        ...getRecordFromState(
          current,
          participantId,
        ),

        status,

        timeInMethod:
          getRecordFromState(
            current,
            participantId,
          ).timeInMethod ?? "Manual",
      },
    }));
  }

  /* =========================================================
     REMARKS
  ========================================================= */

  function setRemarks(
    participantId: string,
    remarks: string,
  ) {
    if (
      sessionStatus === "Submitted"
    ) {
      return;
    }

    setAttendance((current) => ({
      ...current,

      [participantId]: {
        ...getRecordFromState(
          current,
          participantId,
        ),
        remarks,
      },
    }));
  }

  /* =========================================================
     OPEN PARTICIPANT ATTENDANCE
  ========================================================= */

  function openAttendance() {
    if (
      sessionStatus === "Submitted"
    ) {
      return;
    }

    setSessionStatus("Open");

    setOpenedAt(
      getCurrentDateTime(),
    );

    setShowOpenModal(false);
  }

  /* =========================================================
     CLOSE PARTICIPANT ATTENDANCE
  ========================================================= */

  function closeAttendance() {
    setSessionStatus("Closed");

    setClosedAt(
      getCurrentDateTime(),
    );

    setShowCloseModal(false);
  }

  /* =========================================================
     QR SCAN
     
     IMPORTANT:
     QR DOES NOT DEPEND ON OPEN ATTENDANCE.
  ========================================================= */

  function scanParticipantQR(
    participantId: string,
  ) {
    if (
      sessionStatus === "Submitted"
    ) {
      return;
    }

    const participant =
      participants.find(
        (item) =>
          item.id === participantId,
      );

    if (!participant) {
      return;
    }

    const record =
      getRecord(participantId);

    /*
      FIRST SCAN = TIME IN
    */

    if (record.timeIn === "-") {
      const now =
        getCurrentTime();

      const status =
        calculateStatus(now);

      setAttendance((current) => ({
        ...current,

        [participantId]: {
          ...getRecordFromState(
            current,
            participantId,
          ),

          status,

          timeIn: now,

          timeInMethod: "QR",
        },
      }));

      return;
    }

    /*
      SECOND SCAN = TIME OUT
    */

    if (record.timeOut === "-") {
      const now =
        getCurrentTime();

      setAttendance((current) => ({
        ...current,

        [participantId]: {
          ...getRecordFromState(
            current,
            participantId,
          ),

          timeOut: now,

          timeOutMethod: "QR",
        },
      }));

      return;
    }

    /*
      BOTH ALREADY RECORDED
    */

    alert(
      `${participant.name} already has Time In and Time Out recorded.`,
    );
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  function submitAttendance() {
    if (
      sessionStatus !== "Closed"
    ) {
      return;
    }

    const newRecords: HistoryRecord[] =
      participants.map(
        (participant, index) => {
          const record =
            getRecord(
              participant.id,
            );

          return {
            id: `ATT-${String(
              index + 1,
            ).padStart(3, "0")}`,

            participantId:
              participant.participantId,

            name: participant.name,

            training:
              participant.training,

            session:
              selectedSession,

            date: formatDate(
              attendanceDate,
            ),

            status:
              record.status,

            timeIn:
              record.timeIn,

            timeOut:
              record.timeOut,

            remarks:
              record.remarks,
          };
        },
      );

    setHistory((current) => [
      ...newRecords,
      ...current,
    ]);

    setSubmittedAt(
      getCurrentDateTime(),
    );

    setSessionStatus(
      "Submitted",
    );

    setShowSubmitModal(false);
  }

  /* =========================================================
     RESET
  ========================================================= */

  function resetAttendance() {
    if (
      sessionStatus !== "Submitted"
    ) {
      setAttendance({});
      setSessionStatus("Draft");
      setOpenedAt(null);
      setClosedAt(null);
      setSubmittedAt(null);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>Trainer</span>
            <span>/</span>
            <span className="font-medium text-gray-600">
              Attendance
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Manage participant attendance through
            manual marking, QR scanning, or optional
            participant self-attendance.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            setShowHistory(true)
          }
          className="h-10 rounded-xl border border-[#e7e9ec] bg-white px-4 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          Attendance History
        </button>

      </div>

      {/* SESSION CONTROL */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-start gap-4">

            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                sessionStatus === "Open"
                  ? "bg-emerald-100 text-emerald-700"
                  : sessionStatus === "Submitted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {sessionStatus === "Open"
                ? "●"
                : sessionStatus ===
                    "Submitted"
                  ? "✓"
                  : "◷"}
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-sm font-bold">
                  Attendance Session
                </h2>

                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-600">
                  {sessionStatus}
                </span>

              </div>

              <p className="mt-1 text-xs text-gray-500">
                {selectedTraining}
                {" · "}
                {selectedSession}
                {" · "}
                {formatDate(
                  attendanceDate,
                )}
              </p>

              {openedAt && (
                <p className="mt-2 text-[10px] text-gray-400">
                  Participant attendance opened:
                  {" "}
                  <span className="font-semibold text-gray-600">
                    {openedAt}
                  </span>
                </p>
              )}

              {closedAt && (
                <p className="mt-1 text-[10px] text-gray-400">
                  Participant attendance closed:
                  {" "}
                  <span className="font-semibold text-gray-600">
                    {closedAt}
                  </span>
                </p>
              )}

              {submittedAt && (
                <p className="mt-1 text-[10px] text-gray-400">
                  Submitted:
                  {" "}
                  <span className="font-semibold text-gray-600">
                    {submittedAt}
                  </span>
                </p>
              )}

            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            {/* QR IS ALWAYS AVAILABLE */}

            {sessionStatus !==
              "Submitted" && (
              <button
                type="button"
                onClick={() =>
                  setShowQRModal(
                    true,
                  )
                }
                className="h-11 rounded-xl border border-[#dfe3e7] bg-white px-5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Scan QR
              </button>
            )}

            {/* OPTIONAL OPEN ATTENDANCE */}

            {sessionStatus ===
              "Draft" && (
              <button
                type="button"
                onClick={() =>
                  setShowOpenModal(
                    true,
                  )
                }
                className="h-11 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Open Attendance
              </button>
            )}

            {sessionStatus ===
              "Open" && (
              <button
                type="button"
                onClick={() =>
                  setShowCloseModal(
                    true,
                  )
                }
                className="h-11 rounded-xl bg-amber-500 px-5 text-xs font-semibold text-white hover:bg-amber-600"
              >
                Close Attendance
              </button>
            )}

            {sessionStatus ===
              "Closed" && (
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    true,
                  )
                }
                className="h-11 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Submit Attendance
              </button>
            )}

            {sessionStatus ===
              "Submitted" && (
              <span className="flex h-11 items-center rounded-xl border border-blue-200 bg-blue-50 px-5 text-xs font-semibold text-blue-700">
                ✓ Submitted to Admin
              </span>
            )}

          </div>

        </div>

      </section>

      {/* INFORMATION */}

      <div
        className={`rounded-2xl border p-4 ${
          sessionStatus === "Open"
            ? "border-emerald-100 bg-emerald-50"
            : "border-gray-200 bg-white"
        }`}
      >

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
            i
          </div>

          <div>

            <p className="text-sm font-semibold">
              QR scanning is always available
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Trainer can scan participant QR codes
              even when participant self-attendance is
              closed. Opening attendance only enables
              participants to record their own Time In
              and Time Out.
            </p>

          </div>

        </div>

      </div>

      {/* FILTERS */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Training Program
            </label>

            <select
              disabled={
                sessionStatus ===
                  "Open" ||
                sessionStatus ===
                  "Submitted"
              }
              value={selectedTraining}
              onChange={(event) => {
                setSelectedTraining(
                  event.target.value,
                );

                setSearch("");
              }}
              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none disabled:opacity-50"
            >
              {trainingOptions.map(
                (training) => (
                  <option
                    key={training.code}
                    value={training.name}
                  >
                    {training.name}
                  </option>
                ),
              )}
            </select>

          </div>

          <div>

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Attendance Date
            </label>

            <input
              type="date"
              disabled={
                sessionStatus ===
                  "Open" ||
                sessionStatus ===
                  "Submitted"
              }
              value={attendanceDate}
              onChange={(event) =>
                setAttendanceDate(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none disabled:opacity-50"
            />

          </div>

          <div>

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Training Session
            </label>

            <select
              disabled={
                sessionStatus ===
                  "Open" ||
                sessionStatus ===
                  "Submitted"
              }
              value={selectedSession}
              onChange={(event) =>
                setSelectedSession(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none disabled:opacity-50"
            >
              <option>
                Session 25
              </option>
              <option>
                Session 26
              </option>
              <option>
                Session 27
              </option>
              <option>
                Session 28
              </option>
            </select>

          </div>

        </div>

      </section>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

        <SummaryCard
          label="Participants"
          value={participants.length}
        />

        <SummaryCard
          label="Present"
          value={presentCount}
          type="success"
        />

        <SummaryCard
          label="Late"
          value={lateCount}
          type="warning"
        />

        <SummaryCard
          label="Absent"
          value={absentCount}
          type="danger"
        />

      </div>

      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

        {/* TABLE HEADER */}

        <div className="border-b border-[#eef0f2] p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Daily Attendance
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Sorted alphabetically by last name.
              </p>

            </div>

            {/* SEARCH */}

            <div className="relative w-full sm:w-72">

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search participant..."
                className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-8 text-xs outline-none focus:bg-white"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400"
                >
                  ×
                </button>
              )}

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Participant
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Time In
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Time Out
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Remarks
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#eef0f2]">

              {filteredParticipants.map(
                (participant) => {
                  const record =
                    getRecord(
                      participant.id,
                    );

                  return (
                    <tr
                      key={
                        participant.id
                      }
                      className="transition hover:bg-[#fafbfc]"
                    >

                      {/* PARTICIPANT */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
                            {getInitials(
                              participant.name,
                            )}
                          </div>

                          <div>

                            <p className="text-xs font-semibold">
                              {
                                participant.name
                              }
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-gray-400">
                              {
                                participant.participantId
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <div className="flex flex-wrap gap-1.5">

                          {(
                            [
                              "Present",
                              "Late",
                              "Absent",
                              "Excused",
                            ] as AttendanceStatus[]
                          ).map(
                            (status) => {
                              const config =
                                statusConfig[
                                  status
                                ];

                              const active =
                                record.status ===
                                status;

                              return (
                                <button
                                  key={
                                    status
                                  }
                                  type="button"
                                  disabled={
                                    sessionStatus ===
                                    "Submitted"
                                  }
                                  onClick={() =>
                                    setStatus(
                                      participant.id,
                                      status,
                                    )
                                  }
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold transition ${
                                    active
                                      ? config.active
                                      : config.inactive
                                  } ${
                                    sessionStatus ===
                                    "Submitted"
                                      ? "cursor-not-allowed opacity-50"
                                      : ""
                                  }`}
                                >

                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      active
                                        ? config.dot
                                        : "bg-gray-300"
                                    }`}
                                  />

                                  {status}

                                </button>
                              );
                            },
                          )}

                        </div>

                      </td>

                      {/* TIME IN */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-2">

                          <span className="inline-flex h-9 min-w-[88px] items-center rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] font-semibold text-gray-600">
                            {record.timeIn ===
                            "-"
                              ? "—"
                              : record.timeIn}
                          </span>

                          {record.timeInMethod && (
                            <span className="text-[9px] text-gray-400">
                              {
                                record.timeInMethod
                              }
                            </span>
                          )}

                        </div>

                      </td>

                      {/* TIME OUT */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-2">

                          <span className="inline-flex h-9 min-w-[88px] items-center rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] font-semibold text-gray-600">
                            {record.timeOut ===
                            "-"
                              ? "—"
                              : record.timeOut}
                          </span>

                          {record.timeOutMethod && (
                            <span className="text-[9px] text-gray-400">
                              {
                                record.timeOutMethod
                              }
                            </span>
                          )}

                        </div>

                      </td>

                      {/* REMARKS */}

                      <td className="px-5 py-5">

                        <input
                          disabled={
                            sessionStatus ===
                            "Submitted"
                          }
                          value={
                            record.remarks
                          }
                          onChange={(event) =>
                            setRemarks(
                              participant.id,
                              event.target
                                .value,
                            )
                          }
                          placeholder="Optional..."
                          className="h-9 w-44 rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] outline-none focus:bg-white disabled:opacity-50"
                        />

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-5">

                        <div className="flex justify-end">

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedParticipant(
                                participant,
                              );

                              setShowParticipantModal(
                                true,
                              );
                            }}
                            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            View
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

        </div>

        {filteredParticipants.length ===
          0 && (
          <div className="px-6 py-16 text-center">

            <p className="text-sm font-semibold text-gray-700">
              No participants found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try searching using another name or
              participant ID.
            </p>

          </div>
        )}

        {/* FOOTER */}

        <div className="flex flex-col gap-3 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] text-gray-400">
            QR scanning remains available regardless
            of participant attendance status.
          </p>

          <div className="flex gap-2">

            {sessionStatus ===
              "Closed" && (
              <button
                type="button"
                onClick={() =>
                  setShowSubmitModal(
                    true,
                  )
                }
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-[11px] font-semibold text-white hover:bg-blue-700"
              >
                Submit Attendance
              </button>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          OPEN ATTENDANCE MODAL
      ===================================================== */}

      {showOpenModal && (
        <ConfirmModal
          title="Open Participant Attendance?"
          description="Participants will be allowed to submit their own Time In and Time Out. Trainer QR scanning will remain available."
          confirmText="Open Attendance"
          buttonClass="bg-emerald-600 hover:bg-emerald-700"
          onCancel={() =>
            setShowOpenModal(false)
          }
          onConfirm={
            openAttendance
          }
        />
      )}

      {/* =====================================================
          CLOSE ATTENDANCE MODAL
      ===================================================== */}

      {showCloseModal && (
        <ConfirmModal
          title="Close Participant Attendance?"
          description="Participants will no longer be able to submit their own Time In and Time Out. Trainer QR scanning remains available."
          confirmText="Close Attendance"
          buttonClass="bg-amber-500 hover:bg-amber-600"
          onCancel={() =>
            setShowCloseModal(false)
          }
          onConfirm={
            closeAttendance
          }
        />
      )}

      {/* =====================================================
          SUBMIT MODAL
      ===================================================== */}

      {showSubmitModal && (
        <ConfirmModal
          title="Submit Attendance?"
          description="The attendance records will be finalized and submitted to Admin for review."
          confirmText="Submit Attendance"
          buttonClass="bg-blue-600 hover:bg-blue-700"
          onCancel={() =>
            setShowSubmitModal(false)
          }
          onConfirm={
            submitAttendance
          }
        />
      )}

      {/* =====================================================
          QR MODAL
      ===================================================== */}

      {showQRModal && (
        <QRScannerModal
          participants={
            participants
          }
          attendance={attendance}
          onScan={
            scanParticipantQR
          }
          onClose={() =>
            setShowQRModal(false)
          }
        />
      )}

      {/* =====================================================
          PARTICIPANT MODAL
      ===================================================== */}

      {showParticipantModal &&
        selectedParticipant && (
          <ParticipantModal
            participant={
              selectedParticipant
            }
            record={getRecord(
              selectedParticipant.id,
            )}
            onClose={() => {
              setShowParticipantModal(
                false,
              );

              setSelectedParticipant(
                null,
              );
            }}
          />
        )}

      {/* =====================================================
          HISTORY MODAL
      ===================================================== */}

      {showHistory && (
        <HistoryModal
          records={history}
          onClose={() =>
            setShowHistory(false)
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type?:
    | "success"
    | "warning"
    | "danger";
}) {
  const textClass =
    type === "success"
      ? "text-emerald-700"
      : type === "warning"
        ? "text-amber-700"
        : type === "danger"
          ? "text-red-700"
          : "text-[#191c1e]";

  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-4">

      <p className="text-[11px] font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${textClass}`}
      >
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   CONFIRM MODAL
========================================================= */

function ConfirmModal({
  title,
  description,
  confirmText,
  buttonClass,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmText: string;
  buttonClass: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onCancel();
        }
      }}
    >

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex items-start justify-between">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 font-bold text-gray-600">
            !
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        <h2 className="mt-5 text-lg font-bold">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-xs font-semibold text-white ${buttonClass}`}
          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   QR SCANNER MODAL
========================================================= */

function QRScannerModal({
  participants,
  attendance,
  onScan,
  onClose,
}: {
  participants: Participant[];
  attendance: Record<
    string,
    AttendanceRecord
  >;
  onScan: (
    participantId: string,
  ) => void;
  onClose: () => void;
}) {
  const [
    selectedParticipant,
    setSelectedParticipant,
  ] = useState("");

  const record =
    selectedParticipant
      ? attendance[
          selectedParticipant
        ]
      : undefined;

  let scanAction =
    "Scan QR Code";

  if (
    record &&
    record.timeIn !== "-" &&
    record.timeOut === "-"
  ) {
    scanAction =
      "Scan for Time Out";
  }

  if (
    record &&
    record.timeIn !== "-" &&
    record.timeOut !== "-"
  ) {
    scanAction =
      "Attendance Complete";
  }

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              Trainer QR Scanner
            </p>

            <h2 className="mt-1 text-lg font-bold">
              Scan Participant QR
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Available even when participant attendance
              is closed.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">

          {/* CAMERA MOCK */}

          <div className="rounded-2xl bg-[#111315] p-8">

            <div className="mx-auto flex aspect-square max-w-[240px] items-center justify-center rounded-2xl border-2 border-dashed border-white/60">

              <div className="text-center">

                <div className="text-6xl text-white/80">
                  ▦
                </div>

                <p className="mt-3 text-xs font-medium text-white/80">
                  QR Scanner
                </p>

                <p className="mt-1 text-[10px] text-white/40">
                  Trainer Mode
                </p>

              </div>

            </div>

          </div>

          {/* FLOW INFO */}

          <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                First Scan
              </p>

              <p className="mt-1 text-xs font-bold text-gray-700">
                Time In
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Records actual current time
              </p>

            </div>

            <div className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Second Scan
              </p>

              <p className="mt-1 text-xs font-bold text-gray-700">
                Time Out
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Records actual current time
              </p>

            </div>

          </div>

          {/* MOCK SELECT */}

          <div className="mt-5 rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-5">

            <p className="text-xs font-bold">
              Simulate QR Scan
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              For the mock UI, select a participant to
              simulate the scanner.
            </p>

            <select
              value={
                selectedParticipant
              }
              onChange={(event) =>
                setSelectedParticipant(
                  event.target.value,
                )
              }
              className="mt-4 h-11 w-full rounded-xl border border-[#e7e9ec] bg-white px-3 text-xs outline-none"
            >

              <option value="">
                Select participant...
              </option>

              {participants.map(
                (participant) => (
                  <option
                    key={
                      participant.id
                    }
                    value={
                      participant.id
                    }
                  >
                    {participant.name}
                  </option>
                ),
              )}

            </select>

            {record && (
              <div className="mt-4 rounded-xl bg-white p-4">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] text-gray-400">
                    Current Time In
                  </span>

                  <span className="text-xs font-bold">
                    {record.timeIn ===
                    "-"
                      ? "Not recorded"
                      : record.timeIn}
                  </span>

                </div>

                <div className="mt-2 flex items-center justify-between">

                  <span className="text-[10px] text-gray-400">
                    Current Time Out
                  </span>

                  <span className="text-xs font-bold">
                    {record.timeOut ===
                    "-"
                      ? "Not recorded"
                      : record.timeOut}
                  </span>

                </div>

              </div>
            )}

            <button
              type="button"
              disabled={
                !selectedParticipant ||
                scanAction ===
                  "Attendance Complete"
              }
              onClick={() => {
                onScan(
                  selectedParticipant,
                );
              }}
              className="mt-4 h-11 w-full rounded-xl bg-[#191c1e] text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {scanAction}
            </button>

          </div>

        </div>

        {/* FOOTER */}

        <div className="shrink-0 border-t border-[#eef0f2] px-6 py-4 text-right">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PARTICIPANT MODAL
========================================================= */

function ParticipantModal({
  participant,
  record,
  onClose,
}: {
  participant: Participant;
  record: AttendanceRecord;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <p className="font-mono text-[10px] text-gray-400">
              {
                participant.participantId
              }
            </p>

            <h2 className="mt-1 text-lg font-bold">
              {participant.name}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">

          <div className="rounded-2xl bg-[#f8f9fa] p-5">

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Attendance Status
            </p>

            <StatusPill
              status={record.status}
            />

          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

            <InfoBox
              label="Time In"
              value={
                record.timeIn ===
                "-"
                  ? "Not recorded"
                  : record.timeIn
              }
            />

            <InfoBox
              label="Time Out"
              value={
                record.timeOut ===
                "-"
                  ? "Not recorded"
                  : record.timeOut
              }
            />

            <InfoBox
              label="Time In Method"
              value={
                record.timeInMethod ??
                "—"
              }
            />

            <InfoBox
              label="Time Out Method"
              value={
                record.timeOutMethod ??
                "—"
              }
            />

            <InfoBox
              label="Email"
              value={
                participant.email
              }
            />

            <InfoBox
              label="Remarks"
              value={
                record.remarks ||
                "No remarks"
              }
            />

          </div>

        </div>

        <div className="shrink-0 border-t border-[#eef0f2] px-6 py-4 text-right">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   HISTORY MODAL
========================================================= */

function HistoryModal({
  records,
  onClose,
}: {
  records: HistoryRecord[];
  onClose: () => void;
}) {
  const [search, setSearch] =
    useState("");

  const filtered = records
    .filter((record) => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return true;
      }

      return (
        record.name
          .toLowerCase()
          .includes(query) ||
        record.participantId
          .toLowerCase()
          .includes(query)
      );
    })
    .sort((a, b) =>
      getLastName(
        a.name,
      ).localeCompare(
        getLastName(b.name),
        undefined,
        {
          sensitivity: "base",
        },
      ),
    );

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Trainer Records
            </p>

            <h2 className="mt-1 text-lg font-bold">
              Attendance History
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        <div className="shrink-0 border-b border-[#eef0f2] p-5">

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search participant..."
            className="h-10 w-full max-w-sm rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none"
          />

        </div>

        <div className="min-h-0 flex-1 overflow-auto">

          <table className="w-full min-w-[850px]">

            <thead className="sticky top-0 bg-[#fafbfc]">

              <tr className="border-b border-[#eef0f2]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Participant
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Date
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Time In
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Time Out
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#eef0f2]">

              {filtered.map(
                (record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-[#fafbfc]"
                  >

                    <td className="px-5 py-4">

                      <p className="text-xs font-semibold">
                        {record.name}
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-gray-400">
                        {
                          record.participantId
                        }
                      </p>

                    </td>

                    <td className="px-5 py-4 text-xs text-gray-600">
                      {record.date}
                    </td>

                    <td className="px-5 py-4">
                      <StatusPill
                        status={
                          record.status
                        }
                      />
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                      {
                        record.timeIn
                      }
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                      {
                        record.timeOut
                      }
                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

          {filtered.length ===
            0 && (
            <div className="px-6 py-16 text-center text-xs text-gray-400">
              No attendance history found.
            </div>
          )}

        </div>

        <div className="shrink-0 border-t border-[#eef0f2] px-6 py-4 text-right">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
  status,
}: {
  status: AttendanceStatus;
}) {
  const config =
    statusConfig[status];

  return (
    <span
      className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${config.active}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {status}
    </span>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-4">

      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xs font-semibold text-gray-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getRecordFromState(
  state: Record<
    string,
    AttendanceRecord
  >,
  participantId: string,
): AttendanceRecord {
  return (
    state[participantId] ?? {
      status: "Absent",
      timeIn: "-",
      timeOut: "-",
      timeInMethod: null,
      timeOutMethod: null,
      remarks: "",
    }
  );
}

function getLastName(
  name: string,
): string {
  const parts =
    name.trim().split(/\s+/);

  return (
    parts[parts.length - 1] ??
    ""
  );
}

function getInitials(
  name: string,
): string {
  return name
    .split(" ")
    .map(
      (part) =>
        part.charAt(0),
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    },
  );
}

function getCurrentDateTime(): string {
  return new Date().toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    },
  );
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

/* =========================================================
   AUTO PRESENT / LATE
========================================================= */

function calculateStatus(
  time: string,
): AttendanceStatus {
  const parts =
    time
      .replace(" AM", "")
      .replace(" PM", "")
      .split(":");

  let hour = Number(
    parts[0] ?? 0,
  );

  const minute = Number(
    parts[1] ?? 0,
  );

  const isPM =
    time.includes("PM");

  if (isPM && hour !== 12) {
    hour += 12;
  }

  if (!isPM && hour === 12) {
    hour = 0;
  }

  const totalMinutes =
    hour * 60 + minute;

  /*
    Training starts at 8:00 AM.
    15-minute grace period.
  */

  const gracePeriod =
    8 * 60 + 15;

  return totalMinutes <=
    gracePeriod
    ? "Present"
    : "Late";
}