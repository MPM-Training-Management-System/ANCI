'use client'

import { Card, CardTitle, Input, Modal } from "@repo/ui/index"
import { columns } from "./columns";
import { UserPlus } from "lucide-react";
import { DataTable } from "@repo/ui/Datatable/DataTable";
import { Button } from "@repo/ui/button";
import { PageHeader } from "@repo/ui/index"
import { useState } from "react";
import { UserForm } from "./UserForm";
import { AddUserModal  } from "./AddUserModal";
export const users = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    email: "juan@gmail.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@gmail.com",
    role: "Staff",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Pedro Reyes",
    email: "pedro@gmail.com",
    role: "Coach",
    status: "Active",
  },
];
export default function DashboardPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
  return (
    <div>
        <PageHeader
    title="Training Management"
    description="Manage trainings and schedules."
    actions={
        <>
            <Button>
  <UserPlus size={18} className="mr-2" />
  Add New User
</Button>


        </>
    }
/>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Services", value: "24", color: "bg-teal-500" },
          { label: "Upcoming Trainings", value: "18", color: "bg-blue-500" },
          { label: "Total Participants", value: "7", color: "bg-yellow-500" },
          { label: "Pending Certificates", value: "32", color: "bg-green-500" },
        ].map((stat) => (
          <Card key={stat.label} >
            <p className={`w-10 h-10 ${stat.color} rounded-lg mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <CardTitle className="text-sm text-gray-500">{stat.label}</CardTitle>
          </Card>
        ))}
      </div>

      <DataTable
    title="User Management"
    description="Manage all registered users."
    columns={columns}
    data={users}
   toolbar={

<>
<Button variant="outline">

Export

</Button>

<Button variant="outline">

Filter

</Button>

<Button>

Add User

</Button>

</>


}
    addButton={{
        label: "Add User",
        icon: <UserPlus size={18} />,
        onClick: () => setOpen(true),

    }}
/>
 <AddUserModal
    open={open}
    onClose={() => setOpen(false)}
/>
   
    </div>
  );
  
 
}