"use client";

import {
  Scale,
  Landmark,
  Trophy,
} from "lucide-react";

import {
  StatsGrid,
  StatCard,
} from "@repo/ui/index";

const pillars = [
  {
    title: "Total Programs",
    value: "12",
    description: "Active Tracks",
    icon: Scale ,
    trend: 5,
    trendLabel: "+2 this month",
  },
  {
    title: "Active Trainers",
    value: "8",
    description: "asf",
    icon: Landmark,
    trend: 4, 
    trendLabel: "+1 this month",
  },
  {
    title: "Pending Enrollments",
    value: "15",
    description: "Active Tracks",
    icon: Trophy,
    trend: 4,
    trendLabel: "+4 this month",
  },
];

export default function TrainingPillarOverview() {
  return (
    <StatsGrid columns={3}>
      {pillars.map((pillar) => (
        <StatCard
        variant="primary"
          key={pillar.title}
          title={pillar.title}
          value={pillar.value}
          description={pillar.description}
          icon={pillar.icon}
          // trend={pillar.trend}
          // trendLabel={pillar.trendLabel}
        />
      ))}
    </StatsGrid>
  );
}