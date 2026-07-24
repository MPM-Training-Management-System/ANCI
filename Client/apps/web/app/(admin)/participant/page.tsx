"use client"

import { participantApi } from "@repo/api";
import { columns } from "./columns";
import { useParticipants } from "@repo/hooks";
import { Participant } from "@repo/types";
import { DataTable, PageSection } from "@repo/ui/index";

export default function ParticipantsPage() {

  const { participants, refresh } = useParticipants();

  const handleEdit = async (participant: Participant) => {

    await participantApi.update(participant.id, {
      fullName: participant.fullName,
      email: participant.email,
      username: ""
    });

    refresh();
  };

  const handleDelete = async (participant: Participant) => {

    if (!confirm("Delete participant?")) {
      return;
    }

    await participantApi.delete(participant.id);

    refresh();
  };

  return (
    
   <PageSection
         title="Welcome back, John Dela Cruz! 👋"
         description="Here's what's happening today in the Integrated Service and Training Management System."
       >
   <DataTable
      title="asd"
      description="asd"
      columns={columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      })}
      data={participants}
    />
    </PageSection>
  );
}