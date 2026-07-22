"use client";

import { useState } from "react";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F7FB]">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Main Content */}
        <div
          className={`transition-all duration-300 ${
            collapsed ? "ml-32" : "ml-80"
          }`}
        >
          <div className="flex min-h-screen flex-col p-4">
            {/* Navbar */}
            <Navbar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />

            {/* Page Content */}
            <main className="mt-25 flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}