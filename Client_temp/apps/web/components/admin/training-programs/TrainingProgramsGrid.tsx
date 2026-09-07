"use client";

import {
  EmptyActionCard,
  ProgramCard,
} from "@repo/ui/index";

const programs = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200",
    title: "Advanced Conflict Resolution & ADR",
    description:
      "Comprehensive certification program focusing on alternative dispute resolution techniques for community leaders.",
    category: "Peace & Mediation",
    reference: "PM-2024-001",
    status: "Active",
    statusColor: "success" as const,
    enrolled: 142,
    capacity: 200,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
    title: "Ethical Governance in Public Office",
    description:
      "Deep dive into ethics, transparency, accountability, and governance standards.",
    category: "Leadership",
    reference: "LG-2024-042",
    status: "Enrolling",
    statusColor: "warning" as const,
    enrolled: 88,
    capacity: 100,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200",
    title: "Youth Athletic Leadership Program",
    description:
      "Developing next-generation athletes through discipline-focused training and leadership modules.",
    category: "Sports Development",
    reference: "SD-2024-015",
    status: "Active",
    statusColor: "success" as const,
    enrolled: 245,
    capacity: 300,
  },
];

export default function TrainingProgramsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          image={program.image}
          title={program.title}
          description={program.description}
          category={program.category}
          reference={program.reference}
          status={program.status}
          statusColor={program.statusColor}
          enrolled={program.enrolled}
          capacity={program.capacity}
          onView={() => console.log("View", program.id)}
          onEdit={() => console.log("Edit", program.id)}
        />
      ))}

      <EmptyActionCard
        title="Create New Program"
        description="Define a new institutional development program."
        buttonLabel="New Program"
        onClick={() => console.log("Create")}
      />
    </div>
  );
}