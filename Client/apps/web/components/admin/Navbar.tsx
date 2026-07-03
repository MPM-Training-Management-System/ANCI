"use client";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0">
      {/* Left - Page Title (pwede mong i-dynamic later) */}
      <h2 className="font-semibold text-gray-700 text-lg">Dashboard</h2>

      {/* Right - User Info */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Ralph Joed</span>
        <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
          R
        </div>
      </div>
    </header>
  );
}