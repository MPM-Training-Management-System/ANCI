// src/data/participant.ts

// ============================================================
// PARTICIPANT
// ============================================================

export interface MockParticipant {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  profileImageUrl: string | null;
  status: "Pending" | "Active" | "Inactive" | "Suspended" | "Rejected";

  training: ParticipantTraining;

  learningModules: LearningModule[];

  attendance: ParticipantAttendance[];

  statistics: ParticipantStatistics;
}


// ============================================================
// TRAINING
// ============================================================

export type TrainingStatus =
  | "Not Started"
  | "In Progress"
  | "Completed";

export interface ParticipantTraining {
  id: string;
  code: string;
  title: string;
  description: string;
  trainerName: string;
  trainerSpecialization: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: TrainingStatus;
}


// ============================================================
// LEARNING MODULE
// ============================================================

export type LearningStatus =
  | "Completed"
  | "In Progress"
  | "Available"
  | "Locked";

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  status: LearningStatus;
  progress: number;
  duration: string;
  lessons: number;
  completedLessons: number;
}


// ============================================================
// ATTENDANCE
// ============================================================

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Not Recorded";

export type AttendanceMode =
  | "Online"
  | "Face-to-Face";

export interface ParticipantAttendance {
  id: string;
  trainingId: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: AttendanceMode;

  status: AttendanceStatus;

  timeIn: string | null;
  timeOut: string | null;

  qrEnabled: boolean;
  attendanceOpen: boolean;
}


// ============================================================
// PARTICIPANT STATISTICS
// ============================================================

export interface ParticipantStatistics {
  trainingProgress: number;
  attendanceRate: number;
  completedModules: number;
  totalModules: number;
  completedAssessments: number;
  totalAssessments: number;
  averageAssessmentScore: number;
}


// ============================================================
// MOCK PARTICIPANT
// ============================================================

export const mockParticipant: MockParticipant = {
  id: "720b97e0-2cea-49c1-b909-e45196725616",

  userCode: "PAR-000003",

  fullName: "Ralph Joed Nagal Gerente",

  email: "ralphjoedg@gmail.com",

  mobileNumber: "09171234567",

  profileImageUrl: null,

  status: "Pending",

  training: {
    id: "TRN-001",

    code: "TRN-CSS-001",

    title: "Computer Systems Servicing NC II",

    description:
      "A competency-based training program focused on computer hardware, software installation, configuration, maintenance, and basic troubleshooting.",

    trainerName: "Juan Dela Cruz",

    trainerSpecialization:
      "Computer Systems Servicing",

    startDate: "August 10, 2026",

    endDate: "November 30, 2026",

    progress: 68,

    status: "In Progress",
  },

  learningModules: [
    {
      id: "MOD-001",

      title: "Introduction to Training",

      description:
        "Learn the fundamentals, objectives, expectations, and structure of the training program.",

      status: "Completed",

      progress: 100,

      duration: "45 min",

      lessons: 4,

      completedLessons: 4,
    },

    {
      id: "MOD-002",

      title: "Safety Fundamentals",

      description:
        "Understand workplace safety procedures, hazard identification, and proper safety practices.",

      status: "In Progress",

      progress: 65,

      duration: "1 hr 20 min",

      lessons: 6,

      completedLessons: 4,
    },

    {
      id: "MOD-003",

      title: "Basic Computer Operations",

      description:
        "Learn the basic operations, components, and proper use of computer systems.",

      status: "Available",

      progress: 0,

      duration: "1 hr 40 min",

      lessons: 8,

      completedLessons: 0,
    },

    {
      id: "MOD-004",

      title: "Computer Hardware Installation",

      description:
        "Learn how to properly install, remove, and configure computer hardware components.",

      status: "Locked",

      progress: 0,

      duration: "2 hrs",

      lessons: 10,

      completedLessons: 0,
    },

    {
      id: "MOD-005",

      title: "Operating System Installation",

      description:
        "Learn the basic procedures for operating system installation and configuration.",

      status: "Locked",

      progress: 0,

      duration: "2 hrs 15 min",

      lessons: 8,

      completedLessons: 0,
    },
  ],

  attendance: [
    {
      id: "ATT-001",

      trainingId: "TRN-001",

      sessionTitle: "Introduction to Training",

      date: "August 20, 2026",

      startTime: "08:00 AM",

      endTime: "12:00 PM",

      mode: "Face-to-Face",

      status: "Present",

      timeIn: "07:54 AM",

      timeOut: "12:03 PM",

      qrEnabled: true,

      attendanceOpen: false,
    },

    {
      id: "ATT-002",

      trainingId: "TRN-001",

      sessionTitle: "Safety Fundamentals",

      date: "August 21, 2026",

      startTime: "08:00 AM",

      endTime: "12:00 PM",

      mode: "Online",

      status: "Present",

      timeIn: "07:59 AM",

      timeOut: "12:01 PM",

      qrEnabled: false,

      attendanceOpen: false,
    },

    {
      id: "ATT-003",

      trainingId: "TRN-001",

      sessionTitle: "Basic Computer Operations",

      date: "August 24, 2026",

      startTime: "08:00 AM",

      endTime: "12:00 PM",

      mode: "Online",

      status: "Not Recorded",

      timeIn: null,

      timeOut: null,

      qrEnabled: false,

      attendanceOpen: true,
    },

    {
      id: "ATT-004",

      trainingId: "TRN-001",

      sessionTitle: "Computer Hardware",

      date: "August 25, 2026",

      startTime: "08:00 AM",

      endTime: "12:00 PM",

      mode: "Face-to-Face",

      status: "Not Recorded",

      timeIn: null,

      timeOut: null,

      qrEnabled: true,

      attendanceOpen: false,
    },

    {
      id: "ATT-005",

      trainingId: "TRN-001",

      sessionTitle: "Hardware Installation",

      date: "August 26, 2026",

      startTime: "08:00 AM",

      endTime: "12:00 PM",

      mode: "Face-to-Face",

      status: "Not Recorded",

      timeIn: null,

      timeOut: null,

      qrEnabled: true,

      attendanceOpen: false,
    },
  ],

  statistics: {
    trainingProgress: 68,

    attendanceRate: 92,

    completedModules: 1,

    totalModules: 5,

    completedAssessments: 1,

    totalAssessments: 3,

    averageAssessmentScore: 90,
  },
};


// ============================================================
// ASSESSMENTS
// ============================================================

export type AssessmentStatus =
  | "Available"
  | "In Progress"
  | "Completed"
  | "Locked";


export interface AssessmentQuestion {
  id: string;

  question: string;

  options: string[];

  correctAnswer: number;
}


export interface ParticipantAssessment {
  id: string;

  title: string;

  description: string;

  moduleId: string;

  moduleTitle: string;

  questions: AssessmentQuestion[];

  durationMinutes: number;

  passingScore: number;

  status: AssessmentStatus;

  score?: number;

  completedAt?: string;
}


// ============================================================
// MOCK ASSESSMENTS
// ============================================================

export const mockAssessments: ParticipantAssessment[] = [
  {
    id: "ASM-001",

    title: "Module 1 Knowledge Assessment",

    description:
      "Test your understanding of the basic concepts discussed in Module 1.",

    moduleId: "MOD-001",

    moduleTitle: "Introduction to Training",

    durationMinutes: 20,

    passingScore: 75,

    status: "Completed",

    score: 90,

    completedAt: "August 20, 2026",

    questions: [
      {
        id: "Q1",

        question:
          "What is the primary purpose of a training program?",

        options: [
          "To provide structured learning and skill development",
          "To replace all workplace activities",
          "To eliminate assessments",
          "To reduce participant interaction",
        ],

        correctAnswer: 0,
      },

      {
        id: "Q2",

        question:
          "Which is an important part of effective learning?",

        options: [
          "Ignoring feedback",
          "Continuous practice and evaluation",
          "Skipping lessons",
          "Avoiding assessments",
        ],

        correctAnswer: 1,
      },

      {
        id: "Q3",

        question:
          "Why is progress tracking important?",

        options: [
          "It prevents participants from learning",
          "It removes the need for trainers",
          "It helps monitor participant development",
          "It automatically completes modules",
        ],

        correctAnswer: 2,
      },

      {
        id: "Q4",

        question:
          "What should a participant do when they do not understand a lesson?",

        options: [
          "Skip the entire training",
          "Ask for clarification or assistance",
          "Submit the assessment immediately",
          "Ignore the lesson",
        ],

        correctAnswer: 1,
      },

      {
        id: "Q5",

        question:
          "What is one purpose of an assessment?",

        options: [
          "To measure learning and understanding",
          "To prevent learning",
          "To remove training modules",
          "To disable participant accounts",
        ],

        correctAnswer: 0,
      },
    ],
  },

  {
    id: "ASM-002",

    title: "Safety and Workplace Practices",

    description:
      "Evaluate your knowledge of safety procedures and proper workplace practices.",

    moduleId: "MOD-002",

    moduleTitle: "Safety Fundamentals",

    durationMinutes: 25,

    passingScore: 75,

    status: "Available",

    questions: [
      {
        id: "Q1",

        question:
          "What should you do before starting a task involving potential hazards?",

        options: [
          "Ignore the hazards",
          "Identify and assess the risks",
          "Start immediately",
          "Wait until the task is finished",
        ],

        correctAnswer: 1,
      },

      {
        id: "Q2",

        question:
          "Why should safety procedures be followed?",

        options: [
          "To reduce unnecessary risks",
          "To make tasks slower",
          "To avoid training",
          "To eliminate teamwork",
        ],

        correctAnswer: 0,
      },

      {
        id: "Q3",

        question:
          "What is an example of good workplace practice?",

        options: [
          "Ignoring instructions",
          "Keeping the work area organized",
          "Leaving hazards unattended",
          "Skipping required procedures",
        ],

        correctAnswer: 1,
      },

      {
        id: "Q4",

        question:
          "When should a safety concern be reported?",

        options: [
          "Only after an accident",
          "Never",
          "As soon as it is identified",
          "At the end of the year",
        ],

        correctAnswer: 2,
      },

      {
        id: "Q5",

        question:
          "Personal protective equipment is used to:",

        options: [
          "Increase workplace hazards",
          "Reduce exposure to certain risks",
          "Replace all safety procedures",
          "Avoid communication",
        ],

        correctAnswer: 1,
      },
    ],
  },

  {
    id: "ASM-003",

    title: "Final Training Assessment",

    description:
      "Final assessment covering the major topics of your current training.",

    moduleId: "MOD-003",

    moduleTitle: "Final Training Module",

    durationMinutes: 30,

    passingScore: 80,

    status: "Locked",

    questions: [
      {
        id: "Q1",

        question:
          "Which statement best describes successful training?",

        options: [
          "Completing activities without understanding",
          "Demonstrating knowledge and skills",
          "Skipping assessments",
          "Avoiding practical activities",
        ],

        correctAnswer: 1,
      },
    ],
  },
];