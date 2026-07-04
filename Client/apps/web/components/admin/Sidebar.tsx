
"use client"
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/button";
import {  LayoutDashboard,
  BriefcaseBusiness,
  GraduationCap,
  Users,
  ClipboardCheck,
  FileBarChart,
 }  from "lucide-react";
import {  sidebarStyles } from "@repo/token";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Service Management", href: "/admin/users", icon: <BriefcaseBusiness size={20} /> },
  { name: "Training Programs", href: "/admin/training", icon: <GraduationCap size={20} /> },
  { name: "Participant Hub", href: "/admin/participants", icon: <Users size={20} /> },
  { name: "Exam center", href: "/admin/exam-center", icon: <ClipboardCheck size={20} /> },
  { name: "Reports", href: "/admin/reports", icon: <FileBarChart size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={sidebarStyles.container}>
      
      <div className={sidebarStyles.header}>
        <Image
        src="/logo.svg"
        alt="ACE NextGen"
        width={40}
        height={40}
      />
        <h1 className={sidebarStyles.title}>ACE NextGen</h1>
      </div>

      {/* Menu Items */}
      <nav className={sidebarStyles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${sidebarStyles.item} ${
  isActive
    ? sidebarStyles.active
    : sidebarStyles.inactive
}`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom - Logout */}
      <div className="px-4 py-4 border-t ">
        <Button variant="primary" className="w-full flex items-center justify-center gap-2">
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
