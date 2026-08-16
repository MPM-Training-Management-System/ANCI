"use client";

import Image from "next/image";
import Link from "next/link";

import Logo from "@/assets/image/ANCILOGO.png";

import { SidebarHeaderProps } from "./types";

export default function SidebarHeader({
  collapsed,
}: SidebarHeaderProps) {
  return (
    <Link
      href="/dashboard"
      className={`
        flex items-center
        ${collapsed ? "justify-center" : "gap-3"}
        px-4 py-6
      `}
    >
      {/* Logo */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow">
        <Image
          src={Logo}
          alt="ACE NextGen"
          width={36}
          height={36}
          priority
          className="object-contain"
        />
      </div>

      {/* Company Name */}
      {!collapsed && (
        <div className="overflow-hidden">
          <h1 className="truncate text-lg font-bold tracking-tight text-white">
            ACE NEXTGEN
          </h1>

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Consultancy Inc.
          </p>
        </div>
      )}
    </Link>
  );
}