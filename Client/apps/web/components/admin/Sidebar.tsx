"use client";

import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, ConfirmDialog, Spinner } from "@repo/ui/index";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  GraduationCap,
  Users,
  ClipboardCheck,
  FileBarChart,
  LogOut,
} from "lucide-react";

import { sidebarStyles } from "@repo/token";
import { auth } from "@/lib/auth";
import { useState } from "react";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "User Management",
    href: "/user",
    icon: <BriefcaseBusiness size={20} />,
  },
  {
    name: "Service Management",
    href: "/services",
    icon: <BriefcaseBusiness size={20} />,
  },
  {
    name: "Training Programs",
    href: "/training",
    icon: <GraduationCap size={20} />,
  },
  {
    name: "Participant Hub",
    href: "/participants",
    icon: <Users size={20} />,
  },
  {
    name: "Exam Center",
    href: "/exam-center",
    icon: <ClipboardCheck size={20} />,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: <FileBarChart size={20} />,
  },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({
  collapsed,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      auth.logout();
      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        className={`${sidebarStyles.container} transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className={sidebarStyles.header}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Image
              src={Logo}
              alt="ACE NextGen"
              width={45}
              height={45}
              className="rounded"
            />

            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <h1 className={`${sidebarStyles.title} whitespace-nowrap`}>
                  ACE NextGen
                </h1>

                <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                  Consultancy Inc.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={sidebarStyles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : ""}
                className={`${sidebarStyles.item}
                  ${isActive ? sidebarStyles.active : sidebarStyles.inactive}
                  ${collapsed ? "justify-center px-2" : ""}
                `}
              >
                <span className="shrink-0">{item.icon}</span>

                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t px-4 py-4">
          <Button
            variant="primary"
            className={`w-full ${
              collapsed
                ? "flex justify-center"
                : "flex items-center justify-center gap-2"
            }`}
            onClick={() => setOpen(true)}
          >
            {loading ? (
              <>
                <Spinner size="md" />
                {!collapsed && <span>Loading...</span>}
              </>
            ) : (
              <>
                <LogOut size={18} />

                {!collapsed && <span>Logout</span>}
              </>
            )}
          </Button>
        </div>
      </aside>

      <ConfirmDialog
        open={open}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}