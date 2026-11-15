
"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@repo/ui/index";
import type {
  AdminUserDetails,
  UserStatus,
} from "@repo/types";

type StatusModalProps = {
  user: AdminUserDetails | null;
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (status: UserStatus) => Promise<void>;
};

export function StatusModal({
  user,
  isLoading,
  isSaving,
  onClose,
  onSave,
}: StatusModalProps) {
  const [status, setStatus] = useState<UserStatus>("Pending");

  useEffect(() => {
    if (user) {
      setStatus(user.status);
    }
  }, [user]);

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Update Status"
      description="Change the user's account status"
      size="sm"
      closeOnOverlayClick={!isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => void onSave(status)}
            disabled={isSaving || isLoading || !user}
          >
            {isSaving ? "Updating..." : "Update Status"}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      ) : !user ? (
        <div className="flex min-h-48 items-center justify-center">
          <p className="text-sm text-gray-500">
            User details are unavailable.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={user.fullName}
                imageUrl={
                  user.participantProfile?.profileImageUrl ??
                  user.trainerProfile?.profileImageUrl ??
                  null
                }
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {user.userCode}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="user-status"
              className="mb-1.5 block text-xs font-semibold text-gray-600"
            >
              Account Status
            </label>

            <select
              id="user-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as UserStatus)
              }
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            >
              <option value="Pending">Pending</option>
              <option value="Active">Approved</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Avatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}
