"use client"

import { participantApi } from "@/lib/api";
import { columns } from "./columns";
import { useParticipants } from "@/hooks/useParticipants";
import { Participant } from "@repo/types";
import { DataTable, PageSection, StatCard, StatGrid } from "@repo/ui/index";
import { Plus } from "lucide-react";


export default function ParticipantsPage() {


const {
  participants,
  count,
  refresh,
} = useParticipants();

console.log(count); 
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
         title="Student Progress"
         description="Here's what's happening today in the Integrated Service and Training Management System."
       >

        <StatGrid>
          <StatCard
          title="Average Completion Rate"
          value="67"
          icon={Plus}
          description="asdsad"
          >

          </StatCard>
        </StatGrid>
   <DataTable
    
      columns={columns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      })}
      data={participants}
    />
    </PageSection>
  );
}