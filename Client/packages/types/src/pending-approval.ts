import type {
  ParticipantApplication,
} from "./participant";

import type {
  TrainerApplicationResponse,
} from "./trainer";

export type PendingApproval =
  | {
      role: "Participant";
      application: ParticipantApplication;
    }
  | {
      role: "Trainer";
      application: TrainerApplicationResponse;
    };