"use client";

import {
  ChevronRight,
  Filter,
  Plus,
} from "lucide-react";

import {
  Button,
  PageSection,
} from "@repo/ui/index";

export default function TrainingHeader() {
  return (
    <PageSection
      title="Training Programs"
      description="Manage training programs, monitor enrollment, and organize institutional development tracks."
      actions={
        <div className="flex items-center gap-3">

          <Button
            variant="outline"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Button>

        </div>
      }
    >

    </PageSection>
  );
}