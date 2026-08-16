"use client";

import { Modal } from "@repo/ui/index";
import { UserForm } from "./UserForm";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddUserModal({
  open,
  onClose,
}: AddUserModalProps) {

  const handleSubmit = () => {
    console.log("Saving User...");

    // API dito

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add User"
      description="Create a new system user."
    >
      <UserForm
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}