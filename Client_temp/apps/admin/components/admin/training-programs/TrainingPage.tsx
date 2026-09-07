"use client";

import  TrainingHeader  from "./TrainingHeader"


import { TrainingCard } from "./TrainingCard";
import { useTraining } from "@/hooks/useTraining";
import TrainingPillarOverview from "./TrainingPillarOverview";

import TrainingProgramsGrid from "./TrainingProgramsGrid";
import { columns } from "@/app/(admin)/training/columns";
import { ActivityList, Button, ActivityItem, DataTable } from "@repo/ui/index";


export default function TrainingPage() {
   const { trainings, loading, error } = useTraining();
  return (

    
    <div className="space-y-8">
<TrainingHeader />
<TrainingPillarOverview />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8">
          <DataTable
            title="Training Programs"
            description="Manage your training programs"
            columns={columns}
            data={trainings}
          />
        </div>

        {/* Right */}
        <div className="lg:col-span-4">
          <ActivityList
  title="Pending Queue"
  badge="15 New"
  footer={
    <Button variant="ghost" className="w-full">
      View All Applications
    </Button>
  }
>
  <ActivityItem
    avatar="MA"
    title="Marcus Aurelius"
    description="Conflict Resolution"
    time="Applied 2 hours ago"
    actions={
      <>
        <Button className="flex-1">
          Approve
        </Button>

        <Button variant="outline">
          Reject
        </Button>
      </>
    }
  />

  <ActivityItem
    avatar="SJ"
    title="Sarah Jenkins"
    description="Governance Ethics"
    time="Applied 5 hours ago"
    actions={
      <>
        <Button className="flex-1">
          Approve
        </Button>

        <Button variant="outline">
          Reject
        </Button>
      </>
    }
  />
</ActivityList>
        </div>
      </div>

<TrainingProgramsGrid />
</div>


  );
}