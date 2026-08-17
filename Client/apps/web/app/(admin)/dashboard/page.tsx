"use client";

import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Excused";

type Participant = {
  id: string;
  name: string;
  status: AttendanceStatus;
};

type Activity = {
  id: string;
  title: string;
  description: string;
  time: string;
  type:
    | "attendance"
    | "assessment"
    | "exam"
    | "enrollment";
};

type ActionModal =
  | "attendance"
  | "qr"
  | "assessment"
  | "exam"
  | null;

/* =========================================================
   MOCK DATA
========================================================= */

const training = {
  code: "CSS-NCII",
  name: "Computer Systems Servicing NC II",
  schedule: "August 04 – September 30, 2026",
  location: "ANCI Training Room 01",
};

const initialParticipants: Participant[] = [
  {
    id: "P-001",
    name: "Angela Bautista",
    status: "Present",
  },
  {
    id: "P-002",
    name: "Juan Dela Cruz",
    status: "Present",
  },
  {
    id: "P-003",
    name: "Maria Santos",
    status: "Late",
  },
  {
    id: "P-004",
    name: "Pedro Garcia",
    status: "Absent",
  },
  {
    id: "P-005",
    name: "Carlo Mendoza",
    status: "Present",
  },
  {
    id: "P-006",
    name: "Sofia Reyes",
    status: "Present",
  },
  {
    id: "P-007",
    name: "Daniel Flores",
    status: "Excused",
  },
  {
    id: "P-008",
    name: "Rafael Navarro",
    status: "Present",
  },
  {
    id: "P-009",
    name: "Andrea Ramos",
    status: "Present",
  },
  {
    id: "P-010",
    name: "Mark Villanueva",
    status: "Late",
  },
];

const initialActivities: Activity[] = [
  {
    id: "ACT-001",
    title: "Attendance submitted",
    description:
      "Today's attendance was submitted successfully.",
    time: "Today, 8:42 AM",
    type: "attendance",
  },
  {
    id: "ACT-002",
    title: "Assessment submitted",
    description:
      "Angela Bautista submitted Practical Assessment 03.",
    time: "Today, 10:18 AM",
    type: "assessment",
  },
  {
    id: "ACT-003",
    title: "New participant enrolled",
    description:
      "Andrea Ramos enrolled in your training.",
    time: "Yesterday, 3:26 PM",
    type: "enrollment",
  },
  {
    id: "ACT-004",
    title: "Exam completed",
    description:
      "Maria Santos completed the final examination.",
    time: "Yesterday, 1:12 PM",
    type: "exam",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TrainerDashboardPage() {
  const [participants, setParticipants] =
    useState<Participant[]>(
      initialParticipants,
    );

  const [activities, setActivities] =
    useState<Activity[]>(
      initialActivities,
    );

  const [attendanceOpen, setAttendanceOpen] =
    useState(false);

  const [actionModal, setActionModal] =
    useState<ActionModal>(null);

  const [selectedParticipant, setSelectedParticipant] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [scanResult, setScanResult] =
    useState<string | null>(null);

  const [assessmentTitle, setAssessmentTitle] =
    useState("");

  const [assessmentDescription, setAssessmentDescription] =
    useState("");

  const [examTitle, setExamTitle] =
    useState("");

  const [examDuration, setExamDuration] =
    useState("60");

  const [showAllActivities, setShowAllActivities] =
    useState(false);

  const [notificationCount, setNotificationCount] =
    useState(3);

  /* =======================================================
     CURRENT DATE
  ======================================================= */

  const today = new Date();

  const formattedDate =
    today.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );

  /* =======================================================
     ATTENDANCE COUNTS
  ======================================================= */

  const attendanceCounts = useMemo(() => {
    return {
      present: participants.filter(
        (p) =>
          p.status === "Present",
      ).length,

      late: participants.filter(
        (p) =>
          p.status === "Late",
      ).length,

      absent: participants.filter(
        (p) =>
          p.status === "Absent",
      ).length,

      excused: participants.filter(
        (p) =>
          p.status === "Excused",
      ).length,
    };
  }, [participants]);

  const attendanceRate = Math.round(
    ((attendanceCounts.present +
      attendanceCounts.late) /
      participants.length) *
      100,
  );

  /* =======================================================
     SEARCH PARTICIPANTS
  ======================================================= */

  const filteredParticipants =
    useMemo(() => {
      const query =
        search.toLowerCase().trim();

      return participants
        .filter((participant) => {
          if (!query) {
            return true;
          }

          return (
            participant.name
              .toLowerCase()
              .includes(query) ||
            participant.id
              .toLowerCase()
              .includes(query)
          );
        })
        .sort((a, b) =>
          getLastName(
            a.name,
          ).localeCompare(
            getLastName(
              b.name,
            ),
          ),
        );
    }, [
      participants,
      search,
    ]);

  /* =======================================================
     UPDATE ATTENDANCE
  ======================================================= */

  function updateAttendance(
    participantId: string,
    status: AttendanceStatus,
  ) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id ===
        participantId
          ? {
              ...participant,
              status,
            }
          : participant,
      ),
    );
  }

  /* =======================================================
     OPEN ATTENDANCE
  ======================================================= */

  function openAttendance() {
    setAttendanceOpen(true);

    addActivity(
      "Attendance opened",
      "Today's attendance is now open for participants.",
      "attendance",
    );
  }

  /* =======================================================
     CLOSE ATTENDANCE
  ======================================================= */

  function closeAttendance() {
    setAttendanceOpen(false);

    addActivity(
      "Attendance closed",
      "Today's attendance session has been closed.",
      "attendance",
    );
  }

  /* =======================================================
     SAVE ATTENDANCE
  ======================================================= */

  function saveAttendance() {
    addActivity(
      "Attendance saved",
      "Today's attendance records were saved successfully.",
      "attendance",
    );

    setAttendanceOpen(false);
  }

  /* =======================================================
     QR SCAN
  ======================================================= */

  function simulateQrScan() {
    const randomParticipant =
      participants[
        Math.floor(
          Math.random() *
            participants.length,
        )
      ];

    if (!randomParticipant) {
      return;
    }

    updateAttendance(
      randomParticipant.id,
      "Present",
    );

    setScanResult(
      `${randomParticipant.name} was marked Present.`,
    );

    addActivity(
      "QR attendance scanned",
      `${randomParticipant.name} was marked present through QR.`,
      "attendance",
    );
  }

  /* =======================================================
     CREATE ASSESSMENT
  ======================================================= */

  function createAssessment() {
    if (
      !assessmentTitle.trim()
    ) {
      return;
    }

    addActivity(
      "Assessment created",
      `${assessmentTitle} is now available for participants.`,
      "assessment",
    );

    setAssessmentTitle("");
    setAssessmentDescription("");

    setActionModal(null);
  }

  /* =======================================================
     CREATE EXAM
  ======================================================= */

  function createExam() {
    if (!examTitle.trim()) {
      return;
    }

    addActivity(
      "Exam created",
      `${examTitle} was created with a ${examDuration}-minute duration.`,
      "exam",
    );

    setExamTitle("");
    setExamDuration("60");

    setActionModal(null);
  }

  /* =======================================================
     ACTIVITY
  ======================================================= */

  function addActivity(
    title: string,
    description: string,
    type: Activity["type"],
  ) {
    const newActivity: Activity = {
      id: `ACT-${Date.now()}`,
      title,
      description,
      time: "Just now",
      type,
    };

    setActivities((current) => [
      newActivity,
      ...current,
    ]);
  }

  /* =======================================================
     CLEAR NOTIFICATIONS
  ======================================================= */

  function clearNotifications() {
    setNotificationCount(0);
  }

  /* =======================================================
     DISPLAY ACTIVITIES
  ======================================================= */

  const displayedActivities =
    showAllActivities
      ? activities
      : activities.slice(0, 4);

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">

            <span>
              Trainer
            </span>

            <span>/</span>

            <span className="font-medium text-gray-600">
              Dashboard
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Good morning, Trainer
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Here is your training overview for
            today.
          </p>

        </div>

        {/* NOTIFICATION */}

        <button
          type="button"
          onClick={
            clearNotifications
          }
          className="relative flex h-10 w-10 items-center justify-center self-start rounded-xl border border-[#e7e9ec] bg-white text-sm text-gray-500 transition hover:bg-gray-50 lg:self-auto"
          title="Notifications"
        >
          ♢

          {notificationCount >
            0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#191c1e] px-1 text-[8px] font-bold text-white">
              {
                notificationCount
              }
            </span>
          )}
        </button>

      </div>

      {/* =================================================
          CURRENT TRAINING
      ================================================= */}

      <section className="overflow-hidden rounded-2xl bg-[#191c1e] p-5 text-white sm:p-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold text-white/80">
                {training.code}
              </span>

              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-bold text-emerald-300">
                Active
              </span>

            </div>

            <h2 className="mt-3 text-xl font-bold sm:text-2xl">
              {training.name}
            </h2>

            <div className="mt-3 flex flex-col gap-2 text-[10px] text-white/60 sm:flex-row sm:flex-wrap sm:gap-5">

              <span>
                ◷{" "}
                {training.schedule}
              </span>

              <span>
                ◉{" "}
                {training.location}
              </span>

            </div>

          </div>

          <div className="shrink-0">

            <button
              type="button"
              onClick={() =>
                setActionModal(
                  "attendance",
                )
              }
              className="rounded-xl bg-white px-4 py-2.5 text-[10px] font-bold text-[#191c1e] transition hover:bg-gray-100"
            >
              Manage Attendance
            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          OVERVIEW CARDS
      ================================================= */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <DashboardCard
          label="Total Participants"
          value={
            participants.length
          }
          description="Enrolled in training"
          icon="people"
        />

        <DashboardCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          description="Today"
          icon="attendance"
          success
        />

        <DashboardCard
          label="Pending Assessments"
          value="4"
          description="Need your review"
          icon="assessment"
        />

        <DashboardCard
          label="Exam Pending"
          value="3"
          description="Participants"
          icon="exam"
        />

      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section>

        <div className="mb-4">

          <h2 className="text-sm font-bold">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Frequently used trainer actions.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <QuickAction
            icon="✓"
            title="Open Attendance"
            description={
              attendanceOpen
                ? "Currently open"
                : "Start today's attendance"
            }
            active={
              attendanceOpen
            }
            onClick={() =>
              setActionModal(
                "attendance",
              )
            }
          />

          <QuickAction
            icon="▣"
            title="Scan QR"
            description="Mark participant attendance"
            onClick={() =>
              setActionModal(
                "qr",
              )
            }
          />

          <QuickAction
            icon="＋"
            title="Create Assessment"
            description="Add a new assessment"
            onClick={() =>
              setActionModal(
                "assessment",
              )
            }
          />

          <QuickAction
            icon="▤"
            title="Create Exam"
            description="Create a final examination"
            onClick={() =>
              setActionModal(
                "exam",
              )
            }
          />

        </div>

      </section>

      {/* =================================================
          TODAY'S ATTENDANCE
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">

        <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

          <div className="flex flex-col gap-4 border-b border-[#eef0f2] p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Today's Attendance
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {formattedDate}
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                if (
                  attendanceOpen
                ) {
                  closeAttendance();
                } else {
                  openAttendance();
                }
              }}
              className={`rounded-xl px-4 py-2 text-[10px] font-bold transition ${
                attendanceOpen
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-[#191c1e] text-white hover:opacity-90"
              }`}
            >
              {attendanceOpen
                ? "Close Attendance"
                : "Open Attendance"}
            </button>

          </div>

          {/* ATTENDANCE SUMMARY */}

          <div className="grid grid-cols-4 border-b border-[#eef0f2]">

            <MiniAttendance
              label="Present"
              value={
                attendanceCounts.present
              }
              type="present"
            />

            <MiniAttendance
              label="Late"
              value={
                attendanceCounts.late
              }
              type="late"
            />

            <MiniAttendance
              label="Absent"
              value={
                attendanceCounts.absent
              }
              type="absent"
            />

            <MiniAttendance
              label="Excused"
              value={
                attendanceCounts.excused
              }
              type="excused"
            />

          </div>

          {/* SEARCH */}

          <div className="border-b border-[#eef0f2] p-4">

            <div className="relative">

              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search participant..."
                className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

          </div>

          {/* PARTICIPANTS */}

          <div className="divide-y divide-[#eef0f2]">

            {filteredParticipants
              .slice(0, 6)
              .map(
                (
                  participant,
                ) => (
                  <div
                    key={
                      participant.id
                    }
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[9px] font-bold text-gray-600">
                        {getInitials(
                          participant.name,
                        )}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-semibold">
                          {
                            participant.name
                          }
                        </p>

                        <p className="mt-0.5 text-[9px] text-gray-400">
                          {
                            participant.id
                          }
                        </p>

                      </div>

                    </div>

                    <AttendanceStatus
                      status={
                        participant.status
                      }
                    />

                  </div>
                ),
              )}

          </div>

          <div className="border-t border-[#eef0f2] px-5 py-3">

            <button
              type="button"
              onClick={() =>
                setActionModal(
                  "attendance",
                )
              }
              className="text-[10px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-800"
            >
              View full attendance
            </button>

          </div>

        </section>

        {/* =================================================
            SCHEDULE
        ================================================= */}

        <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Upcoming Schedule
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Your next training activities.
              </p>

            </div>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-bold text-gray-500">
              3 upcoming
            </span>

          </div>

          <div className="mt-5 space-y-3">

            <ScheduleItem
              date="18"
              month="AUG"
              title="Hardware Troubleshooting"
              time="8:00 AM – 12:00 PM"
              type="Training"
            />

            <ScheduleItem
              date="20"
              month="AUG"
              title="Practical Assessment"
              time="9:00 AM – 11:00 AM"
              type="Assessment"
            />

            <ScheduleItem
              date="25"
              month="AUG"
              title="Final Examination"
              time="8:00 AM – 10:00 AM"
              type="Exam"
            />

          </div>

        </section>

      </div>

      {/* =================================================
          ASSESSMENT / EXAM OVERVIEW
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ASSESSMENTS */}

        <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Assessment Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Recent assessment activity.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setActionModal(
                  "assessment",
                )
              }
              className="text-[10px] font-semibold text-gray-500 hover:text-gray-900"
            >
              + Create
            </button>

          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">

            <SmallMetric
              label="Total"
              value="5"
            />

            <SmallMetric
              label="Pending"
              value="4"
              type="warning"
            />

            <SmallMetric
              label="Completed"
              value="1"
              type="success"
            />

          </div>

          <div className="mt-5 rounded-xl bg-[#f8f9fa] p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold">
                  Practical Assessment 03
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  8 submissions waiting for review
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setActionModal(
                    "assessment",
                  )
                }
                className="rounded-lg bg-white px-3 py-2 text-[9px] font-bold text-gray-600 shadow-sm"
              >
                Review
              </button>

            </div>

          </div>

        </section>

        {/* EXAM */}

        <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Examination
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Final examination progress.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setActionModal(
                  "exam",
                )
              }
              className="text-[10px] font-semibold text-gray-500 hover:text-gray-900"
            >
              + Create
            </button>

          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">

            <SmallMetric
              label="Scheduled"
              value="1"
            />

            <SmallMetric
              label="Pending"
              value="3"
              type="warning"
            />

            <SmallMetric
              label="Completed"
              value="7"
              type="success"
            />

          </div>

          <div className="mt-5 rounded-xl bg-[#f8f9fa] p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold">
                  Final Examination
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  August 25, 2026 · 8:00 AM
                </p>

              </div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
                Upcoming
              </span>

            </div>

          </div>

        </section>

      </div>

      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white">

        <div className="flex items-center justify-between border-b border-[#eef0f2] p-5">

          <div>

            <h2 className="text-sm font-bold">
              Recent Activity
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Latest activity from your training.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setShowAllActivities(
                !showAllActivities,
              )
            }
            className="text-[10px] font-semibold text-gray-500 hover:text-gray-900"
          >
            {showAllActivities
              ? "Show Less"
              : "View All"}
          </button>

        </div>

        <div className="divide-y divide-[#eef0f2]">

          {displayedActivities.map(
            (activity) => (
              <ActivityRow
                key={
                  activity.id
                }
                activity={
                  activity
                }
              />
            ),
          )}

        </div>

      </section>

      {/* =================================================
          ATTENDANCE MODAL
      ================================================= */}

      {actionModal ===
        "attendance" && (
        <AttendanceModal
          participants={
            participants
          }
          attendanceOpen={
            attendanceOpen
          }
          onClose={() =>
            setActionModal(
              null,
            )
          }
          onOpen={
            openAttendance
          }
          onCloseAttendance={
            closeAttendance
          }
          onSave={
            saveAttendance
          }
          onUpdate={
            updateAttendance
          }
          selectedParticipant={
            selectedParticipant
          }
          setSelectedParticipant={
            setSelectedParticipant
          }
        />
      )}

      {/* =================================================
          QR MODAL
      ================================================= */}

      {actionModal ===
        "qr" && (
        <Modal
          title="Scan Participant QR"
          description="Scan a participant QR code to record attendance."
          onClose={() =>
            setActionModal(
              null,
            )
          }
        >

          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">

            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl bg-[#f8f9fa] text-6xl text-gray-300">
              ▦
            </div>

            <p className="mt-5 text-sm font-bold">
              QR Scanner
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Point the camera at the
              participant's QR code.
            </p>

            <button
              type="button"
              onClick={
                simulateQrScan
              }
              className="mt-5 rounded-xl bg-[#191c1e] px-5 py-2.5 text-[10px] font-bold text-white"
            >
              Simulate QR Scan
            </button>

            {scanResult && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-[10px] font-semibold text-emerald-700">
                ✓ {scanResult}
              </div>
            )}

          </div>

        </Modal>
      )}

      {/* =================================================
          ASSESSMENT MODAL
      ================================================= */}

      {actionModal ===
        "assessment" && (
        <Modal
          title="Create Assessment"
          description="Create a trainer assessment for your participants."
          onClose={() =>
            setActionModal(
              null,
            )
          }
        >

          <div className="space-y-4">

            <Input
              label="Assessment Title"
              placeholder="e.g. Practical Assessment 04"
              value={
                assessmentTitle
              }
              onChange={
                setAssessmentTitle
              }
            />

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Description
              </label>

              <textarea
                rows={5}
                value={
                  assessmentDescription
                }
                onChange={(event) =>
                  setAssessmentDescription(
                    event.target.value,
                  )
                }
                placeholder="Describe the assessment..."
                className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs outline-none focus:border-gray-300 focus:bg-white"
              />

            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef0f2] pt-4">

              <button
                type="button"
                onClick={() =>
                  setActionModal(
                    null,
                  )
                }
                className="rounded-xl border border-[#e7e9ec] px-4 py-2.5 text-[10px] font-semibold text-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  createAssessment
                }
                disabled={
                  !assessmentTitle.trim()
                }
                className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Assessment
              </button>

            </div>

          </div>

        </Modal>
      )}

      {/* =================================================
          EXAM MODAL
      ================================================= */}

      {actionModal ===
        "exam" && (
        <Modal
          title="Create Examination"
          description="Create a final examination for your training participants."
          onClose={() =>
            setActionModal(
              null,
            )
          }
        >

          <div className="space-y-4">

            <Input
              label="Exam Title"
              placeholder="e.g. CSS NC II Final Examination"
              value={
                examTitle
              }
              onChange={
                setExamTitle
              }
            />

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Duration
              </label>

              <select
                value={
                  examDuration
                }
                onChange={(event) =>
                  setExamDuration(
                    event.target
                      .value,
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:border-gray-300 focus:bg-white"
              >

                <option value="30">
                  30 minutes
                </option>

                <option value="45">
                  45 minutes
                </option>

                <option value="60">
                  60 minutes
                </option>

                <option value="90">
                  90 minutes
                </option>

                <option value="120">
                  120 minutes
                </option>

              </select>

            </div>

            <div className="rounded-xl bg-[#f8f9fa] p-4">

              <p className="text-xs font-semibold">
                Examination Reminder
              </p>

              <p className="mt-1 text-[10px] leading-5 text-gray-500">
                The exam will be associated
                with this training and its
                results will be included in the
                participant's final training
                evaluation.
              </p>

            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef0f2] pt-4">

              <button
                type="button"
                onClick={() =>
                  setActionModal(
                    null,
                  )
                }
                className="rounded-xl border border-[#e7e9ec] px-4 py-2.5 text-[10px] font-semibold text-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  createExam
                }
                disabled={
                  !examTitle.trim()
                }
                className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Exam
              </button>

            </div>

          </div>

        </Modal>
      )}

    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  label,
  value,
  description,
  icon,
  success = false,
}: {
  label: string;
  value: string | number;
  description: string;
  icon:
    | "people"
    | "attendance"
    | "assessment"
    | "exam";
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-medium text-gray-500">
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              success
                ? "text-emerald-600"
                : "text-[#191c1e]"
            }`}
          >
            {value}
          </p>

        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
          {icon === "people"
            ? "●"
            : icon ===
                "attendance"
              ? "✓"
              : icon ===
                  "assessment"
                ? "▤"
                : "▥"}
        </div>

      </div>

      <p className="mt-2 text-[9px] text-gray-400">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  description,
  onClick,
  active = false,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-4 text-left transition ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-[#e7e9ec] bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm ${
          active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-bold">
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-gray-400">
        {description}
      </p>

    </button>
  );
}

/* =========================================================
   MINI ATTENDANCE
========================================================= */

function MiniAttendance({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type:
    | "present"
    | "late"
    | "absent"
    | "excused";
}) {
  const styles = {
    present:
      "text-emerald-600",

    late:
      "text-amber-600",

    absent:
      "text-red-500",

    excused:
      "text-blue-600",
  };

  return (
    <div className="border-r border-[#eef0f2] px-3 py-4 text-center last:border-r-0">

      <p
        className={`text-lg font-bold ${styles[type]}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[8px] font-medium text-gray-400">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   ATTENDANCE STATUS
========================================================= */

function AttendanceStatus({
  status,
}: {
  status: AttendanceStatus;
}) {
  const styles = {
    Present:
      "bg-emerald-50 text-emerald-700",

    Late:
      "bg-amber-50 text-amber-700",

    Absent:
      "bg-red-50 text-red-600",

    Excused:
      "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   SCHEDULE ITEM
========================================================= */

function ScheduleItem({
  date,
  month,
  title,
  time,
  type,
}: {
  date: string;
  month: string;
  title: string;
  time: string;
  type: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#e7e9ec] p-3">

      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gray-100">

        <span className="text-[8px] font-bold text-gray-400">
          {month}
        </span>

        <span className="text-sm font-bold">
          {date}
        </span>

      </div>

      <div className="min-w-0">

        <p className="truncate text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[9px] text-gray-400">
          {time}
        </p>

        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-[8px] font-semibold text-gray-500">
          {type}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   SMALL METRIC
========================================================= */

function SmallMetric({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type?:
    | "success"
    | "warning"
    | "danger";
}) {
  const styles = {
    success:
      "text-emerald-600",

    warning:
      "text-amber-600",

    danger:
      "text-red-500",
  };

  return (
    <div className="rounded-xl bg-[#f8f9fa] p-3">

      <p className="text-[9px] text-gray-400">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-bold ${
          type
            ? styles[type]
            : "text-[#191c1e]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   ACTIVITY ROW
========================================================= */

function ActivityRow({
  activity,
}: {
  activity: Activity;
}) {
  const icons = {
    attendance: "✓",
    assessment: "▤",
    exam: "▥",
    enrollment: "＋",
  };

  return (
    <div className="flex gap-3 p-4 sm:p-5">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        {icons[activity.type]}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs font-bold">
            {activity.title}
          </p>

          <span className="text-[9px] text-gray-400">
            {activity.time}
          </span>

        </div>

        <p className="mt-1 text-[10px] leading-5 text-gray-500">
          {activity.description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-5 py-4">

          <div>

            <h2 className="text-base font-bold">
              {title}
            </h2>

            <p className="mt-1 text-[10px] leading-5 text-gray-500">
              {description}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {children}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ATTENDANCE MODAL
========================================================= */

function AttendanceModal({
  participants,
  attendanceOpen,
  onClose,
  onOpen,
  onCloseAttendance,
  onSave,
  onUpdate,
  selectedParticipant,
  setSelectedParticipant,
}: {
  participants: Participant[];
  attendanceOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onCloseAttendance: () => void;
  onSave: () => void;
  onUpdate: (
    id: string,
    status: AttendanceStatus,
  ) => void;
  selectedParticipant: string | null;
  setSelectedParticipant: (
    id: string | null,
  ) => void;
}) {
  const sortedParticipants =
    [...participants].sort(
      (a, b) =>
        getLastName(
          a.name,
        ).localeCompare(
          getLastName(
            b.name,
          ),
        ),
    );

  return (
    <Modal
      title="Today's Attendance"
      description="Record and manage attendance for your training participants."
      onClose={onClose}
    >

      {/* STATUS */}

      <div className="mb-5 flex items-center justify-between rounded-xl bg-[#f8f9fa] p-4">

        <div>

          <p className="text-xs font-bold">
            Attendance Session
          </p>

          <p className="mt-1 text-[10px] text-gray-400">
            {attendanceOpen
              ? "Participants can submit their attendance."
              : "Attendance is currently closed."}
          </p>

        </div>

        {attendanceOpen ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
            Open
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-bold text-gray-500">
            Closed
          </span>
        )}

      </div>

      {/* ACTIONS */}

      <div className="mb-5 flex gap-2">

        {!attendanceOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[10px] font-bold text-white"
          >
            Open Attendance
          </button>
        ) : (
          <button
            type="button"
            onClick={
              onCloseAttendance
            }
            className="rounded-xl bg-red-50 px-4 py-2.5 text-[10px] font-bold text-red-600"
          >
            Close Attendance
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          className="rounded-xl border border-[#e7e9ec] px-4 py-2.5 text-[10px] font-semibold text-gray-600"
        >
          Save
        </button>

      </div>

      {/* PARTICIPANTS */}

      <div className="overflow-hidden rounded-xl border border-[#e7e9ec]">

        <div className="grid grid-cols-[1fr_auto] border-b border-[#eef0f2] bg-[#fafbfc] px-4 py-3">

          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
            Participant
          </p>

          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
            Status
          </p>

        </div>

        <div className="divide-y divide-[#eef0f2]">

          {sortedParticipants.map(
            (participant) => (
              <div
                key={
                  participant.id
                }
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3"
              >

                <div className="min-w-0">

                  <p className="truncate text-xs font-semibold">
                    {
                      participant.name
                    }
                  </p>

                  <p className="mt-0.5 text-[9px] text-gray-400">
                    {
                      participant.id
                    }
                  </p>

                </div>

                <div className="flex flex-wrap justify-end gap-1">

                  {(
                    [
                      "Present",
                      "Late",
                      "Absent",
                      "Excused",
                    ] as AttendanceStatus[]
                  ).map(
                    (status) => (
                      <button
                        key={
                          status
                        }
                        type="button"
                        onClick={() => {
                          onUpdate(
                            participant.id,
                            status,
                          );

                          setSelectedParticipant(
                            participant.id,
                          );
                        }}
                        className={`rounded-lg px-2 py-1.5 text-[8px] font-bold transition ${
                          participant.status ===
                          status
                            ? status ===
                              "Present"
                              ? "bg-emerald-100 text-emerald-700"
                              : status ===
                                  "Late"
                                ? "bg-amber-100 text-amber-700"
                                : status ===
                                    "Absent"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ),
                  )}

                </div>

              </div>
            ),
          )}

        </div>

      </div>

      {selectedParticipant && (
        <p className="mt-3 text-[9px] text-gray-400">
          Last updated:
          {" "}
          {
            selectedParticipant
          }
        </p>
      )}

    </Modal>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
      />

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getLastName(
  fullName: string,
) {
  const parts =
    fullName
      .trim()
      .split(/\s+/);

  return (
    parts[
      parts.length - 1
    ] ?? ""
  );
}

function getInitials(
  fullName: string,
) {
  const parts =
    fullName
      .trim()
      .split(/\s+/);

  if (parts.length === 1) {
    return (
      parts[0]?.charAt(0) ??
      "?"
    ).toUpperCase();
  }

  const first =
    parts[0]?.charAt(0) ??
    "";

  const last =
    parts[
      parts.length - 1
    ]?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase();
}