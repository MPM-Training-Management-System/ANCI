"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, Skeleton, Progress} from "@repo/ui/index";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Active Services", value: "24", color: "bg-teal-500" },
    { label: "Upcoming Trainings", value: "18", color: "bg-blue-500" },
    { label: "Total Participants", value: "7", color: "bg-yellow-500" },
    { label: "Pending Certificates", value: "32", color: "bg-green-500" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, index) => (
              <Card key={index}>
                <Skeleton className="mb-3 h-10 w-10 rounded-lg" />

                <Skeleton className="mb-2 h-8 w-16" />

                <Skeleton className="h-4 w-32" />
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label}>
                <p
                  className={`mb-3 h-10 w-10 rounded-lg ${stat.color}`}
                />

                <p className="text-2xl font-bold">
                  {stat.value}
                </p>

                <CardTitle className="text-sm text-gray-500">
                  {stat.label}
                </CardTitle>
              </Card>
            ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">

  <Card>
    <CardTitle className="mb-4">
      Training Capacity
    </CardTitle>

    <div className="space-y-5">

      <div>
        <div className="mb-2 flex justify-between">
          <span className="text-sm">
            Cyber Security
          </span>

          <span className="text-sm font-semibold">
            42 / 50
          </span>
        </div>

        <Progress
          value={42}
          max={50}
          showLabel
        />
      </div>

      <div>
        <div className="mb-2 flex justify-between">
          <span className="text-sm">
            Leadership Training
          </span>

          <span className="text-sm font-semibold">
            25 / 40
          </span>
        </div>

        <Progress
          value={25}
          max={40}
          showLabel
        />
      </div>

      <div>
        <div className="mb-2 flex justify-between">
          <span className="text-sm">
            IT Fundamentals
          </span>

          <span className="text-sm font-semibold">
            15 / 20
          </span>
        </div>

        <Progress
          value={90}
          max={200}
          showLabel
        />
      </div>

    </div>

  </Card>

</div>
    </div>
  );
}