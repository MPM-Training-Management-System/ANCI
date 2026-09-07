export interface MockTrainer {
  id: string;
  name: string;
  specialization: string;
  status: "Active" | "Inactive";
}

export interface MockTraining {
  id: string;
  title: string;
  category: "Mediation" | "Governance" | "Sports";
  enrolled: number;
  capacity: number;
  startDate: string;
  endDate: string;
  status: boolean;
  trainerId: string | null;
  trainerName: string | null;
}

export const mockTrainers: MockTrainer[] = [
  {
    id: "TRN-001",
    name: "Juan Dela Cruz",
    specialization: "Sports Development",
    status: "Active",
  },
  {
    id: "TRN-002",
    name: "Maria Santos",
    specialization: "Conflict Mediation",
    status: "Active",
  },
  {
    id: "TRN-003",
    name: "Ahmed Rahman",
    specialization: "Governance & Leadership",
    status: "Active",
  },
  {
    id: "TRN-004",
    name: "Sarah Garcia",
    specialization: "Sports Coaching",
    status: "Active",
  },
  {
    id: "TRN-005",
    name: "Michael Reyes",
    specialization: "Community Development",
    status: "Inactive",
  },
];

export const mockTrainings: MockTraining[] = [
  {
    id: "MED-2026-001",
    title: "Advanced Conflict Mediation",
    category: "Mediation",
    enrolled: 42,
    capacity: 50,
    startDate: "2026-10-12",
    endDate: "2026-10-30",
    status: true,
    trainerId: "TRN-002",
    trainerName: "Maria Santos",
  },
  {
    id: "SPR-2026-045",
    title: "National Coach Certification",
    category: "Sports",
    enrolled: 18,
    capacity: 30,
    startDate: "2026-11-05",
    endDate: "2026-11-30",
    status: true,
    trainerId: "TRN-001",
    trainerName: "Juan Dela Cruz",
  },
  {
    id: "GOV-2026-012",
    title: "Ethical Leadership in Public Service",
    category: "Governance",
    enrolled: 120,
    capacity: 120,
    startDate: "2026-08-20",
    endDate: "2026-09-15",
    status: false,
    trainerId: null,
    trainerName: null,
  },
  {
    id: "MED-2026-009",
    title: "Community Dialogue Facilitation",
    category: "Mediation",
    enrolled: 25,
    capacity: 40,
    startDate: "2026-12-01",
    endDate: "2026-12-20",
    status: true,
    trainerId: null,
    trainerName: null,
  },
  {
    id: "SPR-2026-052",
    title: "Sports Development Fundamentals",
    category: "Sports",
    enrolled: 36,
    capacity: 50,
    startDate: "2027-01-15",
    endDate: "2027-02-10",
    status: true,
    trainerId: "TRN-004",
    trainerName: "Sarah Garcia",
  },
  {
    id: "GOV-2026-018",
    title: "Governance and Public Accountability",
    category: "Governance",
    enrolled: 28,
    capacity: 40,
    startDate: "2027-02-10",
    endDate: "2027-03-05",
    status: true,
    trainerId: "TRN-003",
    trainerName: "Ahmed Rahman",
  },
];