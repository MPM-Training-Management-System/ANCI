"use client";

import { Modal } from "@repo/ui/index";
import { TrainingForm } from "./TrainingForm";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function TrainingModal({
  open,
  onClose,
}: AddUserModalProps) {
  return (
    <Modal
      open={open}
       onClose={onClose}
      title="Create Training Program"
      description="Fill in the details below to create a new training program."
      size="xl"
    >
      <TrainingForm
        onCancel={() => onClose()}
        onSubmit={() => {
          console.log("Submit");
          onClose();
        }}
      />
    </Modal>
  );
}