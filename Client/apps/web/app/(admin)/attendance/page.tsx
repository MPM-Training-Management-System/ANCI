'use client'

import { Card, CardTitle, Input, Modal, StatCard, StatGrid } from "@repo/ui/index"
import { columns } from "./columns";
import { Plus, UserPlus } from "lucide-react";
import { DataTable } from "@repo/ui/Datatable/DataTable";
import { Button } from "@repo/ui/button";
import { PageHeader } from "@repo/ui/index"
import { useState } from "react";
import { UserForm } from "./UserForm";
import { AddUserModal  } from "./AddUserModal";
import { useParticipants } from "@/hooks/useParticipants";
import { participantApi } from "@/lib/api";
import { Participant } from "@repo/types";


export default function DashboardPage() {
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
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

   const {
  participants,
  count,
  refresh,
} = useParticipants();
  return (
    <div>
        <PageHeader
    title="Training Management"
    description="Manage trainings and schedules."
    actions={
        <>
            <Button onClick={()=> setOpen(true)}>
  <UserPlus size={18} className="mr-2" />
  Add New User
</Button>
        </>
    }
/>

      {/* Stats Cards */}
      <StatGrid>
        <StatCard
        title="Total Students"
        description="asdasd"
        value={"126"}
        icon={Plus}
        ></StatCard>

        <StatCard
        title="Present Today"
        description="Present Today"
        value={"126"}
        icon={Plus}
        ></StatCard>
        <StatCard
        title="Late Today"
        description="asdasd"
        value={"126"}
        icon={Plus}
        ></StatCard>
        <StatCard
        title="Absent Today"
        description="asdasd"
        value={"126"}
        icon={Plus}
        ></StatCard>
      </StatGrid>

      <DataTable
    columns={columns({
           onEdit: handleEdit,
           onDelete: handleDelete,
         })}
         data={participants}
         toolbar={ 
          <>
          <Button
          variant="outline">Filter</Button>
          </>
         }
         
/>

 <AddUserModal
    open={open}
    onClose={() => setOpen(false)}
/>

   
    </div>
  );
  
 
}