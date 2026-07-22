"use client";

import {
  Button,
  SearchInput,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
} from "@repo/ui/index";

import { Plus } from "lucide-react";
import { TrainingCard } from "./TrainingCard";
export default function TrainingPage() {
  return (
    <div className="space-y-8">

      <PageHeader
  title="Training Programs"
  description="Manage and monitor all training programs, courses, workshops, and institutional development tracks."
  actions={
    <Button>
      New Program
    </Button>
  }
/>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Programs"
          icon={Plus}
          value="25"
          description="Registered training programs"
        />

        <StatCard
          title="Active Programs"
          icon={Plus}
          value="18"
          description="Currently accepting participants"
        />

        <StatCard
          title="Participants"
          icon={Plus}
          value="1,240"
          description="Total enrolled participants"
        />

        <StatCard
          title="Completion Rate"
          icon={Plus}
          value="94%"
          description="Average completion"
        />

      </section>

      {/* Search & Filters */}
      <section className="rounded-lg border bg-card p-4">

        <div className="grid gap-4 md:grid-cols-4">

          <SearchInput
            placeholder="Search program..."
          />

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="leadership">
                Leadership
              </SelectItem>

              <SelectItem value="technical">
                Technical
              </SelectItem>

              <SelectItem value="softskills">
                Soft Skills
              </SelectItem>

              <SelectItem value="sports">
                Sports
              </SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="draft">
                Draft
              </SelectItem>

              <SelectItem value="open">
                Open
              </SelectItem>

              <SelectItem value="ongoing">
                Ongoing
              </SelectItem>

              <SelectItem value="completed">
                Completed
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            Apply Filters
          </Button>

        </div>

      </section>

      {/* Program Cards */}

     <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

  <TrainingCard
    code="TR-001"
    title="Leadership Development Program"
    category="Leadership"
    description="Develop leadership competencies for supervisors and future managers."
    trainer="John Doe"
    participants={82}
    capacity={100}
    startDate="July 20, 2026"
    endDate="July 25, 2026"
    status="Open"
  />

  <TrainingCard
    code="TR-002"
    title="Customer Service Excellence"
    category="Soft Skills"
    description="Improve communication, professionalism, and customer handling skills."
    trainer="Jane Smith"
    participants={45}
    capacity={60}
    startDate="August 1, 2026"
    endDate="August 3, 2026"
    status="Ongoing"
  />

</div>

    </div>
  );
}