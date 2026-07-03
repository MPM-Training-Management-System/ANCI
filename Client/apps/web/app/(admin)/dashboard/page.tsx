export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Drivers", value: "24", color: "bg-teal-500" },
          { label: "Active Vehicles", value: "18", color: "bg-blue-500" },
          { label: "Ongoing Trips", value: "7", color: "bg-yellow-500" },
          { label: "Shipments Today", value: "32", color: "bg-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-10 h-10 ${stat.color} rounded-lg mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}