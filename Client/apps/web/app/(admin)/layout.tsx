'use client'



import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    
    <ProtectedRoute>
    <div className="flex h-screen overflow-hidden">
      <Sidebar  collapsed={collapsed}
        setCollapsed={setCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar  collapsed={collapsed}
          setCollapsed={setCollapsed}/>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}