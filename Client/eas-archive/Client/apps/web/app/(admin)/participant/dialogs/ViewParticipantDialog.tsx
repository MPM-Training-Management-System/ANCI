"use client";

import type { Participant } from "@repo/types";

interface ViewParticipantDialogProps {
  participant: Participant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewParticipantDialog({
  participant,
  open,
  onOpenChange,
}: ViewParticipantDialogProps) {
  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Participant Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Username
            </p>
            <p>{participant.username}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Full Name
            </p>
            <p>{participant.fullName}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>
            <p>{participant.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Role
            </p>
            <p>{participant.role}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Created At
            </p>
            <p>
              {new Date(
                participant.create_at
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}