"use client";

import { Button, PageSection } from "@repo/ui/index";

interface ServiceHeaderProps {
  onCreate: () => void;
}

export function ServiceHeader({
  onCreate,
}: ServiceHeaderProps) {
  return (

      <PageSection
      title="Service Management"
      description="Manage services, review client requests,
          and handle consultation schedules from one
          place."
          actions={
            <Button onClick={onCreate}> <span className="text-base leading-none">
          +
        </span>

        Add Service</Button>
          }
          >

      </PageSection>
      
       
  );
}