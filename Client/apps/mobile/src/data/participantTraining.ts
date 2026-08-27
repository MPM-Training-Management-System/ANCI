export type TrainingMode =
  | "Online"
  | "Face-to-Face"
  | "Hybrid";

export interface ParticipantTraining {
  id: string;
  code: string;

  title: string;
  description: string;

  trainer: string;

  mode: TrainingMode;

  duration: string;

  schedule: string;
  time: string;

  location: string;

  slots: number;
  enrolled: number;

  requirements: string[];

  startDate: string;
  endDate: string;
}

export const mockParticipantTrainings: ParticipantTraining[] = [
  {
    id: "TRN-001",
    code: "TRN-WEB-001",

    title: "Web Development Fundamentals",

    description:
      "Learn the fundamentals of modern web development including HTML, CSS, JavaScript, responsive design, and basic frontend development.",

    trainer: "Juan Dela Cruz",

    mode: "Hybrid",

    duration: "3 Months",

    schedule: "Monday & Wednesday",

    time: "9:00 AM – 12:00 PM",

    location: "ANCE Training Center",

    slots: 25,

    enrolled: 18,

    requirements: [
      "Valid Government ID",
      "Basic computer knowledge",
      "Active email address",
      "Willingness to complete the training",
    ],

    startDate: "September 1, 2026",

    endDate: "November 30, 2026",
  },

  {
    id: "TRN-002",
    code: "TRN-DIG-002",

    title: "Digital Productivity Essentials",

    description:
      "Develop practical digital productivity skills using common workplace applications, collaboration tools, and digital workflows.",

    trainer: "Maria Santos",

    mode: "Online",

    duration: "2 Months",

    schedule: "Tuesday & Thursday",

    time: "1:00 PM – 4:00 PM",

    location: "Online",

    slots: 30,

    enrolled: 21,

    requirements: [
      "Valid Government ID",
      "Active email address",
      "Stable internet connection",
    ],

    startDate: "September 8, 2026",

    endDate: "October 30, 2026",
  },

  {
    id: "TRN-003",
    code: "TRN-CS-003",

    title: "Computer Systems Servicing",

    description:
      "Introduction to computer hardware, software installation, troubleshooting, maintenance, and basic networking.",

    trainer: "Carlos Reyes",

    mode: "Face-to-Face",

    duration: "4 Months",

    schedule: "Saturday",

    time: "8:00 AM – 4:00 PM",

    location: "ANCE Computer Laboratory",

    slots: 20,

    enrolled: 20,

    requirements: [
      "Valid Government ID",
      "Basic computer knowledge",
      "Commitment to attend practical sessions",
    ],

    startDate: "September 12, 2026",

    endDate: "December 19, 2026",
  },

  {
    id: "TRN-004",
    code: "TRN-UI-004",

    title: "UI/UX Design Fundamentals",

    description:
      "Learn user interface and user experience fundamentals, wireframing, prototyping, design systems, and usability principles.",

    trainer: "Andrea Garcia",

    mode: "Online",

    duration: "2 Months",

    schedule: "Friday",

    time: "6:00 PM – 9:00 PM",

    location: "Online",

    slots: 25,

    enrolled: 12,

    requirements: [
      "Valid Government ID",
      "Active email address",
      "Basic computer knowledge",
    ],

    startDate: "September 4, 2026",

    endDate: "October 30, 2026",
  },
];