import { participantApi } from "@/lib/api";
import { createUseParticipants } from "@repo/hooks";

export const useParticipants =
  createUseParticipants(participantApi);