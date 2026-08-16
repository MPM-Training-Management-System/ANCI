export interface Participant {
  id: string;

  fullName: string;

  username: string;

  email: string;

  profileImage?: string;

  status: "Active" | "Pending" | "Inactive";

  progress?: number;

  programName?: string;
}