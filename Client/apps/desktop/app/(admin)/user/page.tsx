"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { useParticipants } from "@/hooks/useParticipants";
import { participantApi } from "@/lib/api";
import AddUserModal from "./AddUserModal";

import {
  PageSection,
  StatGrid,
  StatCard,
  StatCardSkeleton,
  DataTable,
  FilterDropdown,
} from "@repo/ui/index";

import { Participant } from "@repo/types";
import { columns } from "./columns";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({
  role: "",
  status: "",
  createdAt: undefined as Date | undefined,
});
const [openAddModal, setOpenAddModal] = useState(false);
const [appliedFilters, setAppliedFilters] = useState({
  role: "",
  status: "",
  createdAt: undefined as Date | undefined,
});
 

  const {
    participants,
    count,
    refresh,
  } = useParticipants();


 const filteredParticipants = participants.filter((participant) => {
  const matchRole =
    !appliedFilters.role ||
    participant.role.toLowerCase() ===
      appliedFilters.role.toLowerCase();

  const matchStatus =
    !appliedFilters.status ||
    (appliedFilters.status === "active"
      ? participant.isActive
      : !participant.isActive);

  const matchDate =
    !appliedFilters.createdAt ||
    new Date(participant.createdAt).toDateString() ===
      appliedFilters.createdAt.toDateString();

  return matchRole && matchStatus && matchDate;
});

  const handleEdit = async (participant: Participant) => {
    await participantApi.update(participant.id, {
      fullName: participant.fullname,
      email: participant.email,
      username: "",
    });

    refresh();
  };

  const handleDelete = async (participant: Participant) => {
    if (!confirm("Delete participant?")) return;

    await participantApi.delete(participant.id);

    refresh();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PageSection
      title="User"
      description="Manage administrator, trainer, and participant accounts, including registration, roles, and account status."
    >
      <StatGrid>
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              description="Registered users"
              value={count}
              variant="primary"
            />

            <StatCard
              title="Active Trainer"
              description="Currently active"
              value={75}
              variant="success"
            />

            <StatCard
              title="Pending"
              description="Awaiting approval"
              value={10}
              variant="warning"
            />

            <StatCard
              title="Inactive"
              description="Disabled accounts"
              value={4}
              variant="primary"
            />
          </>
        )}
      </StatGrid>

      <DataTable
        columns={columns({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        data={filteredParticipants}
        addButton={{
          label: "Add User",
          icon: <Plus size={18} />,
          onClick: () => setOpenAddModal(true),
        }}
        toolbar={
          <FilterDropdown
            fields={[
  {
    key: "role",
    label: "Role",
    type: "select",
    value: filters.role,
    options: [
      { label: "All Roles", value: "" },
      { label: "Admin", value: "Admin" },
      { label: "Trainer", value: "Trainer" },
      { label: "Participant", value: "Participant" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    value: filters.status,
    options: [
      { label: "All Status", value: "" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    key: "createdAt",
    label: "Registration Date",
    type: "date",
    value: filters.createdAt,
  },
]}
           onChange={(key, value) =>
  setFilters((prev) => ({
    ...prev,
    [key]: value,
  }))
}
            onApply={() => {
  setAppliedFilters(filters);
  console.log(filters);
}}
           onReset={() => {
  const reset = {
    role: "",
    status: "",
    createdAt: undefined,
  };

  setFilters(reset);
  setAppliedFilters(reset);
}}
          />
          
        }
      />
      <AddUserModal
  open={openAddModal}
  onClose={() => setOpenAddModal(false)}
/>
    </PageSection>
  );
}