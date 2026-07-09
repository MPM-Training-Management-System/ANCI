

import { Card, CardTitle } from "@repo/ui/card"




export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

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
    </div>
  );
}