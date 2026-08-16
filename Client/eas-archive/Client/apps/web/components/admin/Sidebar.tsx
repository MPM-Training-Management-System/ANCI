"use client";

import { SidebarProps } from "./sidebar/types";

import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarMenu from "./sidebar/SidebarMenu";
import SidebarFooter from "./sidebar/SidebarFooter";

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed
        left-4
        top-4
        bottom-4
        z-50
        flex
        flex-col
        overflow-hidden
        rounded-3xl
        bg-[#002B5C]
        text-white
        shadow-2xl
        transition-all
        duration-300
        ${collapsed ? "w-24" : "w-72"}
      `}
    >
      {/* Header */}
      <SidebarHeader
        collapsed={collapsed}
      />

      {/* Divider */}
      <div className="mx-4 border-b border-white/10" />

      {/* Menu */}
      <SidebarMenu
        collapsed={collapsed}
      />

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Footer */}
      <SidebarFooter
        collapsed={collapsed}
      />
    </aside>
  );
}